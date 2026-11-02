#!/usr/bin/env python3
"""Cloud-save SQLite transaction smoke tests. Synthetic data; no cloud or user save."""
import sqlite3, tempfile, pathlib, threading, unittest

SCHEMA="""
PRAGMA foreign_keys=ON;
CREATE TABLE account(id TEXT PRIMARY KEY);
CREATE TABLE hero(id TEXT PRIMARY KEY,owner TEXT NOT NULL REFERENCES account(id),slot INTEGER NOT NULL CHECK(slot BETWEEN 0 AND 7),version INTEGER NOT NULL DEFAULT 0,gold INTEGER NOT NULL DEFAULT 0 CHECK(gold>=0),UNIQUE(owner,slot));
CREATE TABLE gear(uid TEXT PRIMARY KEY,owner TEXT NOT NULL REFERENCES account(id),hero_id TEXT REFERENCES hero(id),location TEXT NOT NULL CHECK(location IN('bag','warehouse')),CHECK((location='warehouse' AND hero_id IS NULL) OR (location='bag' AND hero_id IS NOT NULL)));
CREATE TABLE offline(id TEXT PRIMARY KEY,hero_id TEXT NOT NULL REFERENCES hero(id),reward INTEGER NOT NULL CHECK(reward>=0),claimed INTEGER NOT NULL DEFAULT 0 CHECK(claimed IN(0,1)));
CREATE TABLE events(request_key TEXT PRIMARY KEY,hero_id TEXT NOT NULL REFERENCES hero(id),kind TEXT NOT NULL,result TEXT NOT NULL);
"""
class Conflict(Exception):pass
def conn(path):
 c=sqlite3.connect(path,timeout=5,isolation_level=None,check_same_thread=False)
 c.execute('PRAGMA foreign_keys=ON');return c
def trans(c,func):
 c.execute('BEGIN IMMEDIATE')
 try:r=func();c.commit();return r
 except BaseException:c.rollback();raise
def save(c,hero,version,add,key,fail=False):
 def go():
  e=c.execute('SELECT kind,hero_id,result FROM events WHERE request_key=?',(key,)).fetchone()
  if e:
   if e[:2]!=('save',hero):raise Conflict('key collision')
   return int(e[2])
  a=c.execute('UPDATE hero SET version=version+1,gold=gold+? WHERE id=? AND version=? AND gold+?>=0',(add,hero,version,add))
  if a.rowcount!=1:raise Conflict('stale version or invalid quantity')
  if fail:raise RuntimeError('injected failure')
  c.execute('INSERT INTO events VALUES(?,?,?,?)',(key,hero,'save',str(version+1)))
  return version+1
 return trans(c,go)
def transfer(c,uid,owner,hero,source,target,key,fail=False):
 def go():
  e=c.execute('SELECT kind,hero_id,result FROM events WHERE request_key=?',(key,)).fetchone()
  if e:
   if e[:2]!=('transfer',hero):raise Conflict('key collision')
   return e[2]
  a=c.execute('UPDATE gear SET location=?,hero_id=? WHERE uid=? AND owner=? AND location=? AND (hero_id=? OR (?=\'warehouse\' AND hero_id IS NULL))',(target,None if target=='warehouse' else hero,uid,owner,source,hero,source))
  if a.rowcount!=1:raise Conflict('missing, owner mismatch or wrong source')
  if fail:raise RuntimeError('injected failure')
  c.execute('INSERT INTO events VALUES(?,?,?,?)',(key,hero,'transfer',target))
  return target
 return trans(c,go)
def claim(c,session,hero,version,key,fail=False):
 def go():
  e=c.execute('SELECT kind,hero_id,result FROM events WHERE request_key=?',(key,)).fetchone()
  if e:
   if e[:2]!=('claim',hero):raise Conflict('key collision')
   return int(e[2])
  s=c.execute('SELECT hero_id,reward,claimed FROM offline WHERE id=?',(session,)).fetchone()
  if not s or s[0]!=hero or s[2]:raise Conflict('not permitted or already claimed')
  a=c.execute('UPDATE hero SET gold=gold+?,version=version+1 WHERE id=? AND version=?',(s[1],hero,version))
  if a.rowcount!=1:raise Conflict('stale version')
  c.execute('UPDATE offline SET claimed=1 WHERE id=? AND claimed=0',(session,))
  if fail:raise RuntimeError('injected failure')
  c.execute('INSERT INTO events VALUES(?,?,?,?)',(key,hero,'claim',str(s[1])))
  return s[1]
 return trans(c,go)
class Tests(unittest.TestCase):
 def setUp(self):
  self.temp=tempfile.TemporaryDirectory();self.path=str(pathlib.Path(self.temp.name)/'test.db');self.c=conn(self.path)
  self.c.executescript(SCHEMA)
  self.c.execute("INSERT INTO account VALUES('a'),('b')")
  self.c.execute("INSERT INTO hero(id,owner,slot,gold) VALUES('ha','a',0,100),('hb','b',0,100)")
  self.c.execute("INSERT INTO gear VALUES('one','a','ha','bag')")
  self.c.execute("INSERT INTO offline VALUES('s','ha',700,0)")
 def tearDown(self):self.c.close();self.temp.cleanup()
 def state(self):return self.c.execute("SELECT version,gold FROM hero WHERE id='ha'").fetchone()
 def test_stale(self):
  save(self.c,'ha',0,10,'x')
  with self.assertRaises(Conflict):save(self.c,'ha',0,10,'y')
  self.assertEqual(self.state(),(1,110))
 def test_save_retry(self):
  self.assertEqual(save(self.c,'ha',0,10,'x'),save(self.c,'ha',0,10,'x'))
  self.assertEqual(self.state(),(1,110))
 def test_save_failure(self):
  with self.assertRaises(RuntimeError):save(self.c,'ha',0,10,'x',True)
  self.assertEqual(self.state(),(0,100))
 def test_negative(self):
  with self.assertRaises(Conflict):save(self.c,'ha',0,-101,'x')
 def test_transfer(self):
  transfer(self.c,'one','a','ha','bag','warehouse','x')
  self.assertEqual(transfer(self.c,'one','a','ha','bag','warehouse','x'),'warehouse')
  transfer(self.c,'one','a','ha','warehouse','bag','y')
  self.assertEqual(self.c.execute("SELECT count(*) FROM gear WHERE uid='one'").fetchone()[0],1)
 def test_cross_owner(self):
  with self.assertRaises(Conflict):transfer(self.c,'one','b','hb','bag','warehouse','x')
 def test_transfer_failure(self):
  with self.assertRaises(RuntimeError):transfer(self.c,'one','a','ha','bag','warehouse','x',True)
  self.assertEqual(self.c.execute("SELECT location FROM gear WHERE uid='one'").fetchone()[0],'bag')
 def test_claim(self):
  self.assertEqual(claim(self.c,'s','ha',0,'x'),700)
  self.assertEqual(claim(self.c,'s','ha',0,'x'),700)
  with self.assertRaises(Conflict):claim(self.c,'s','ha',1,'y')
  self.assertEqual(self.state(),(1,800))
 def test_claim_failure(self):
  with self.assertRaises(RuntimeError):claim(self.c,'s','ha',0,'x',True)
  self.assertEqual(self.state(),(0,100))
  self.assertEqual(claim(self.c,'s','ha',0,'x'),700)
 def test_wrong_hero(self):
  with self.assertRaises(Conflict):claim(self.c,'s','hb',0,'x')
 def test_double_claim_race(self):
  barrier=threading.Barrier(2);out=[];lock=threading.Lock()
  def worker(i):
   c=conn(self.path);barrier.wait()
   try:claim(c,'s','ha',0,f'k{i}');result='ok'
   except Conflict:result='conflict'
   finally:c.close()
   with lock:out.append(result)
  ts=[threading.Thread(target=worker,args=(i,)) for i in range(2)]
  for t in ts:t.start()
  for t in ts:t.join()
  self.assertEqual(sorted(out),['conflict','ok'])
  self.assertEqual(self.state(),(1,800))
 def test_duplicate_slot(self):
  with self.assertRaises(sqlite3.IntegrityError):self.c.execute("INSERT INTO hero(id,owner,slot) VALUES('dup','a',0)")
 def test_duplicate_equipment(self):
  with self.assertRaises(sqlite3.IntegrityError):self.c.execute("INSERT INTO gear VALUES('one','a','ha','bag')")
if __name__=='__main__':unittest.main(verbosity=2)
