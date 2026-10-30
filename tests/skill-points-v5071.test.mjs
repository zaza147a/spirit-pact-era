import test from 'node:test';
import assert from 'node:assert/strict';
import {runtime} from './runtime31-helper.mjs';
import {JOB_SKILLS} from '../dist/job-skills.js';
import {SECOND_JOBS} from '../dist/jobs.js';
import {reconcileSkillPoints,updateSkillPointControls} from '../dist/skill-points.js';

test('skill point labels and upgrade buttons update while an editor keeps the full panel frozen',()=>{
 const label={dataset:{skillPoints:'rebornJobPoints'},textContent:'0'},
 button={dataset:{jobup:'rebirthMain_rogue'},disabled:true},
 root={querySelectorAll:selector=>selector==='[data-skill-points]'?[label]:[button]},
 p={jobSkills:{rebirthMain_rogue:1},rebornJobPoints:1};
 updateSkillPointControls(root,p,JOB_SKILLS.rogue,true,()=>true);
 assert.equal(label.textContent,'1');assert.equal(button.disabled,false);
 p.rebornJobPoints=0;updateSkillPointControls(root,p,JOB_SKILLS.rogue,true,()=>true);
 assert.equal(label.textContent,'0');assert.equal(button.disabled,true);
});

const threshold=level=>Math.round(80+15*level**2.1);
const spent=(p,pool)=>JOB_SKILLS[p.job].filter(s=>(s.rebornOnly?'rebornJobPoints':SECOND_JOBS[p.job]&&s.branch==='first'?'firstJobPoints':'jobPoints')===pool).reduce((n,s)=>n+(p.jobSkills[s.id]||0),0);
function defeat(a,level=66){a.setEnemies([{id:'world_66',level,hp:0,maxHp:1,xp:0,gold:0,instanceId:'job-point-award'}]);a.award();}

test('every individual Job level immediately gives one point, including 50→51 and 69→70, for all ten jobs',async()=>{
 for(const job of Object.keys(SECOND_JOBS)){
  const c=await runtime(),a=c.api,p=a.normalize(a.fresh('逐級發點',job));
  p.reborn=true;p.level=99;p.location='town';a.setup(p,null);
  for(let level=1;level<70;level++){
   p.jobLevel=level;reconcileSkillPoints(p,JOB_SKILLS[job],true);
   const before=p.jobPoints+p.rebornJobPoints;
   p.jobXp=threshold(level)-10;defeat(a);
   assert.equal(p.jobLevel,level+1,`${job} Job ${level}`);
   assert.equal(p.jobPoints+p.rebornJobPoints,before+1,`${job} Job ${level+1} point`);
   assert.equal(p.jobXp,0);
  }
 }
});

test('one reward crossing five Job levels awards all five points individually',async()=>{
 const c=await runtime(),a=c.api,p=a.normalize(a.fresh('多級發點','rogue'));
 Object.assign(p,{reborn:true,level:99,jobLevel:50,location:'town'});
 reconcileSkillPoints(p,JOB_SKILLS.rogue,true);a.setup(p,null);
 p.jobXp=[50,51,52,53,54].reduce((n,l)=>n+threshold(l),0)-10;defeat(a);
 assert.equal(p.jobLevel,55);assert.equal(p.rebornJobPoints,5);assert.equal(p.jobXp,0);
});

test('all five first jobs receive one point per level and stop awarding at Job50',async()=>{
 for(const job of ['swordsman','mage','acolyte','thief','archer']){
  const c=await runtime(),a=c.api,p=a.normalize(a.fresh('一轉發點',job));
  p.level=99;p.location='town';a.setup(p,null);
  for(let level=1;level<50;level++){
   p.jobXp=threshold(level)-10;const before=p.jobPoints;defeat(a,99);
   assert.equal(p.jobLevel,level+1);assert.equal(p.jobPoints,before+1);
  }
  defeat(a);assert.equal(p.jobPoints,49);assert.equal(p.jobLevel,50);
 }
});

test('actual offline simulation grants every earned Job point and recovers the input save without mutating it',async()=>{
 const c=await runtime(),a=c.api,p=a.normalize(a.fresh('離線逐級','rogue'));
 Object.assign(p,{reborn:true,level:66,jobLevel:63,growthVersion:50,rebornJobPoints:0,location:'starter',jobXp:threshold(63)-1});
 p.jobSkills.rebirthBuff_rogue=6;p.jobSkills.rebirthMain_rogue=1;
 p.gear.rightHand=c.rollGear('rifle',66,'legendary');
 p.attributes.STR=99;p.attributes.VIT=99;p.offline={at:1000000,enabled:true};
 a.setup(p,null);p.hp=a.stat('hp');p.mp=a.stat('mp');const before=JSON.stringify(p);
 const result=await a.simulateOffline(p,1030000),after=result.player;
 assert.ok(result.summary.kills>0);assert.ok(after.jobLevel>63);
 assert.equal(after.rebornJobPoints,after.jobLevel-50-7);
 assert.equal(JSON.stringify(p),before);
});

test('Job63 screenshot save recovers six missing points without changing learned ranks or duplicating on reload',async()=>{
 const c=await runtime(),a=c.api,p=a.normalize(a.fresh('漏點修復','rogue'));
 Object.assign(p,{reborn:true,level:66,jobLevel:63,growthVersion:50,rebornJobPoints:0});
 p.jobSkills.rebirthBuff_rogue=6;p.jobSkills.rebirthMain_rogue=1;
 a.normalize(p);assert.equal(p.rebornJobPoints,6);
 for(let i=0;i<5;i++)a.normalize(p);
 assert.equal(p.rebornJobPoints,6);assert.equal(p.jobSkills.rebirthBuff_rogue,6);assert.equal(p.jobSkills.rebirthMain_rogue,1);
 a.setup(p,null);a.upgradeJobSkill('rebirthMain_rogue');
 assert.equal(p.rebornJobPoints,5);a.normalize(p);assert.equal(p.rebornJobPoints,5);
});

test('Job70 can max every first, second and rebirth skill for all ten jobs, including early Job40 transfers',async()=>{
 for(const job of Object.keys(SECOND_JOBS)){
  const c=await runtime(),a=c.api,p=a.normalize(a.fresh('全技能滿級',job));
  Object.assign(p,{reborn:true,level:99,jobLevel:70,firstJobLevel:40,growthVersion:50,location:'town',gold:1e7});
  a.normalize(p);a.setup(p,null);
  for(const skill of JOB_SKILLS[job].filter(s=>!s.thirdOnly))while((p.jobSkills[skill.id]||0)<skill.maxRank){
   const old=p.jobSkills[skill.id]||0;a.upgradeJobSkill(skill.id);
   assert.equal(p.jobSkills[skill.id],old+1,`${job} ${skill.id}`);
  }
  for(const pool of ['firstJobPoints','jobPoints','rebornJobPoints']){
   assert.equal(p[pool],0);assert.equal(spent(p,pool),pool==='rebornJobPoints'?20:50);
  }
  a.retrain('skills');const balances=[p.firstJobPoints,p.jobPoints,p.rebornJobPoints];
  a.normalize(p);assert.deepEqual([p.firstJobPoints,p.jobPoints,p.rebornJobPoints],balances);
 }
});
