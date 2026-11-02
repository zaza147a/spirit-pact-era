import test from 'node:test';
import assert from 'node:assert/strict';
import {JOB_SKILLS} from '../dist/job-skills.js';
import {SECOND_JOBS} from '../dist/jobs.js';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../dist/game.js',import.meta.url),'utf8');
const budgets={first:49,second:69,rebirth:20,third:69};
const choose=(job)=>{
 const output={};
 for(const branch of Object.keys(budgets)){
  let remaining=budgets[branch];
  const arr=JOB_SKILLS[job].filter(x=>branch==='rebirth'?x.rebornOnly===true:x.branch===branch&&x.rebornOnly!==true).sort((a,b)=>
    Number(b.id==='thirdMain_'+job)-Number(a.id==='thirdMain_'+job)||
    Number(['physical','magic'].includes(b.kind))-Number(['physical','magic'].includes(a.kind))||
    Number(b.kind==='buff')-Number(a.kind==='buff')||
    Number(b.kind==='passive')-Number(a.kind==='passive'));
  for(const skill of arr){let rank=Math.min(remaining,skill.maxRank);output[skill.id]=rank;remaining-=rank;}
 }
 return output;
};
test('real combat harness keeps rebirth budget separate from normal second job skills',()=>{
 assert.match(source,/branch==='rebirth'\?x\.rebornOnly===true:x\.branch===branch&&x\.rebornOnly!==true/);
 for(const job of Object.keys(SECOND_JOBS)){
  const ranks=choose(job);
  assert.ok(ranks['rebirthMain_'+job]>0,job+' missing rebirth main');
  assert.ok(ranks['thirdMain_'+job]>0,job+' missing third main');
  for(const [branch,budget] of Object.entries(budgets)){
   const sum=JOB_SKILLS[job].filter(s=>branch==='rebirth'?s.rebornOnly:s.branch===branch&&!s.rebornOnly).reduce((n,s)=>n+(ranks[s.id]||0),0);
   assert.ok(sum<=budget,job+'/'+branch+' spent '+sum+' > '+budget);
  }
  for(const s of JOB_SKILLS[job])assert.ok((ranks[s.id]||0)<=s.maxRank,job+'/'+s.id);
 }
});
