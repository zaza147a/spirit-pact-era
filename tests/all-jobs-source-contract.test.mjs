import test from 'node:test';
import assert from 'node:assert/strict';
import {GEAR_BASE, primaryAffix, affixRange, gearStatValue, rollGear} from '../dist/loot.js';
import {SECOND_JOBS,parentJob} from '../dist/jobs.js';
import {JOB_SKILLS, weaponSkillAllowed} from '../dist/job-skills.js';
import {incomingMonsterDamage,aspdAttackIntervalMs} from '../dist/combat-balance.js';

const BUILDS={
 knight:['blade+shield','oneSpear+shield','twoSword','twoSpear'],
 crusader:['blade+shield','oneSpear+shield'],
 wizard:['oneStaff+shield','twoStaff'],
 sage:['oneStaff+shield','twoStaff','spellFist'],
 assassin:['rifle+shield','rifle+offDagger','katar'],
 rogue:['rifle+shield'],
 priest:['mace+shield'],
 monk:['knuckles'],
 hunter:['shortBow','longBow','crossbow'],
 performer:['instrument','shortBow','longBow']
};
const types=combo=>{
 const [main,off]=combo.split('+');
 return [GEAR_BASE[main]?.weaponType||null,off==='offDagger'?GEAR_BASE.offDagger.weaponType:null];
};
test('full-job matrix is exactly ten jobs and 23 occupied-handed loadouts',()=>{
 assert.deepEqual(Object.keys(BUILDS).sort(),Object.keys(SECOND_JOBS).sort());
 assert.equal(Object.values(BUILDS).flat().length,23);
 for(const [job,builds] of Object.entries(BUILDS))for(const combo of builds){
  const [main,off]=combo.split('+'),item=GEAR_BASE[main];
  assert.ok(item&&item.slot==='rightHand',job+' '+combo);
  assert.ok(!item.jobs||item.jobs.includes(job)||item.jobs.includes(parentJob(job)),job+' cannot wear '+combo);
  if(item.hands===2) assert.equal(off,undefined,job+' cannot have offhand '+combo);
  else assert.ok(off&&GEAR_BASE[off]?.slot==='leftHand',job+' cannot leave offhand empty '+combo);
  if(off==='offDagger')assert.equal(item.weaponType,'dagger',combo);
 }
});
test('required two-handed occupations cannot use shield in current game',()=>{
 for(const job of ['monk','hunter','performer'])for(const combo of BUILDS[job]){
  assert.equal(GEAR_BASE[combo.split('+')[0]].hands,2,job+' '+combo);
 }
});
test('all build-specific attack skill restrictions are measured not assumed',()=>{
 const byId=id=>JOB_SKILLS.assassin.find(s=>s.id===id);
 for(const combo of BUILDS.assassin){
  const [right,left]=types(combo);
  const allowed=Object.fromEntries(['dualStrike','katarSlash','sonicBlow','venomBurst'].map(id=>[id,weaponSkillAllowed(byId(id),right,left)]));
  if(combo==='rifle+shield') assert.deepEqual(allowed,{dualStrike:false,katarSlash:false,sonicBlow:false,venomBurst:true});
  if(combo==='rifle+offDagger') assert.deepEqual(allowed,{dualStrike:true,katarSlash:false,sonicBlow:true,venomBurst:true});
  if(combo==='katar') assert.deepEqual(allowed,{dualStrike:true,katarSlash:true,sonicBlow:true,venomBurst:true});
 }
});
test('modern physical primary affix has equal one-vs-two-hand range',()=>{
 for(const rarity of ['common','uncommon','mythic'])for(const tier of [1,3,6,8,9,10,11]){
  for(const id of ['blade','twoSword','katar','rifle','offDagger'])assert.equal(primaryAffix(id),'atk');
  const bound=affixRange('atk',tier,rarity);
  assert.ok(bound[0]>0&&bound[1]>=bound[0]);
 }
});
test('all 23 live-gear combinations can generate appropriate main affix',()=>{
 for(const combo of Object.values(BUILDS).flat()){
  const id=combo.split('+')[0],item=rollGear(id,200,'mythic',()=>.5),stat=primaryAffix(id);
  assert.ok(Number.isFinite(gearStatValue(item,stat)),combo);
  assert.equal(item.powerVersion,50,combo);
 }
});
test('shield defense contribution changes incoming damage while attack speed keeps two-handed penalty',()=>{
 const shield=rollGear('shield',200,'mythic',()=>.5);
 const without=incomingMonsterDamage(15000,1000),withShield=incomingMonsterDamage(15000,1000+gearStatValue(shield,'def'));
 assert.ok(withShield<without);
 assert.equal(aspdAttackIntervalMs(193),140);
 assert.equal(aspdAttackIntervalMs(190),200);
});
