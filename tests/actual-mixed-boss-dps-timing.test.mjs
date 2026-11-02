import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const game=readFileSync(new URL('../dist/game.js',import.meta.url),'utf8');
const fnStart=game.lastIndexOf('  farm({durationMs='),fnEnd=game.lastIndexOf('  fight({boss=',game.length);
const farmSource=game.slice(fnStart,fnEnd);
function seconds(spawns,kills,from,elapsedMs){
 const deaths=new Map(kills.filter(x=>x.boss).map(x=>[x.instanceId,x.at]));
 return spawns.filter(x=>x.boss).reduce((total,e)=>{
  const end=Math.min(from+elapsedMs,deaths.get(e.instanceId)??from+elapsedMs);
  return total+Math.max(0,(end-e.at)/1000);
 },0);
}
test('boss DPS counts only its living duration, not all remaining map farming',()=>{
 const spawns=[{at:10000,instanceId:'a',boss:true}],kills=[{at:25000,instanceId:'a',boss:true}];
 assert.equal(seconds(spawns,kills,0,90000),15);
 assert.equal(300000/seconds(spawns,kills,0,90000),20000);
});
test('unbeaten boss counts alive window until combat ends',()=>{
 assert.equal(seconds([{at:15000,instanceId:'boss',boss:true}],[],0,90000),75);
});
test('two real boss encounters add their independent alive windows',()=>{
 const spawns=[{at:15000,instanceId:'a',boss:true},{at:60000,instanceId:'b',boss:true}];
 const kills=[{at:20000,instanceId:'a',boss:true},{at:80000,instanceId:'b',boss:true}];
 assert.equal(seconds(spawns,kills,0,90000),25);
});
test('runtime farm calculates boss live seconds from actual spawn and kill timestamps',()=>{
 assert.match(farmSource,/bossKillTimes=new Map\(sink\.kills\.filter\(x=>x\.boss\)/);
 assert.match(farmSource,/bossSpawns\.reduce\(\(time,spawnEvent\)=>/);
 assert.match(farmSource,/bossEffectiveDps:bossSeconds>0/);
 assert.match(farmSource,/bossTotalDamage\+mobTotalDamage!==totalDamage/);
});
