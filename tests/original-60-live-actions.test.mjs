import test from 'node:test';
import assert from 'node:assert/strict';
import {runtime} from './runtime31-helper.mjs';
import {runBuild} from '../scripts/balance-v24.mjs';
import {ORIGINAL_60_MECHANICS} from '../dist/original-60-mechanics.js';
import {THIRD_FUSION_RULES} from '../dist/fusion-resonance.js';
import {JOB_SKILLS} from '../dist/job-skills.js';

// This suite never calls emitEvent. Every proc must originate from a real
// player skill, monster attack, auto-spell or equipped companion ability.
for(const key of Object.keys(ORIGINAL_60_MECHANICS))test(key+' activates through real game actions',async()=>{
 const [job,pair]=key.split('/'),c=await runtime(),a=c.api;
 const p=runBuild(job,pair.split('-')[0],{level:200,gearLevel:190,seconds:0,
  scenario:'regional',reborn:true,thirdJob:true,referenceBuild:true,referenceQuality:'mythic',rarity:'mythic',fusionPair:pair,fixture:true}).fixture;
 const pet=p.pets[0],rule=THIRD_FUSION_RULES[job][pair];
 const foe={id:'world_191',map:'worldroot',level:191,hp:1e12,maxHp:1e12,atk:10000,def:0,mdef:0,hit:1e9,flee:0,instanceId:key};
 const other={...foe,instanceId:key+'-other'};
 a.setup(p,foe);a.setEnemies([foe,other]);p.hp=a.stat('hp');p.mp=a.stat('mp');
 pet.hp=c.petStats(pet).hp;pet.sp=c.petStats(pet).sp;
 c.chooseMonsterTarget=()=> 'player';c.Math.random=()=>0;
 let now=1000000;
 const advance=(ms=1000)=>{now+=ms;c.setTime(now);};
 const cast=id=>{
  const skill=JOB_SKILLS[job].find(s=>s.id===id);assert.ok(skill,'missing skill '+id);
  a.playerAttack(true,id);
  const pending=a.state().casting;
  if(pending){now=pending.until;c.setTime(now);a.finishCastForTest();}
 };
 const main=()=>cast('thirdMain_'+job);
 const shield=()=>cast(JOB_SKILLS[job].find(s=>s.kind==='shield'&&!s.rebornOnly)?.id);
 if(key==='knight/attack-defense'){
  shield();advance();foe.atk=a.stat('hp');
  for(let n=0;n<30&&p.shield>0&&p.hp>0;n++){a.enemyAttack();foe.atk*=2;}
  assert.equal(p.shield,0,'shield must really break');assert.ok(p.hp>0);advance();
 }
 if(key==='sage/defense-support'){shield();advance();}
 if(key==='hunter/attack-support'){
  pet.equippedSkills=['fusion_attack-support_1'];a.petAutoAbility(pet,c.petStats(pet),now);
  assert.ok(a.state().petEffects.blessingUntil>now,'companion must actually perform its song');
 }
 if(key==='assassin/defense-support')p.hp=Math.floor(a.stat('hp')*.3);
 if(key==='monk/defense-support')p.mp=Math.floor(a.stat('mp')*.5);
 a.beginReport();
 const event=rule.originalEvent.event;
 if(event==='damageTaken'||event==='block'){
  foe.atk=Math.max(10000,a.stat('hp')*.08);
  for(let n=0;n<(rule.originalEvent.threshold||1);n++){a.enemyAttack();advance(100);}
 }else if(event==='dodge'){
  c.Math.random=()=>1;foe.hit=1;a.enemyAttack();
 }else if(event==='autospell'){
  cast('thirdUtility_sage');advance();main();
 }else if(event==='buff'){
  // Two distinct legal songs allow the shield's two-buff prerequisite to be
  // reached inside its 8s window without bypassing either skill's cooldown.
  if((rule.originalEvent.threshold||1)>1){cast('battleSong');advance();}
  cast('thirdStance_'+job);
 }else if(event==='heal'){
  p.hp=Math.floor(a.stat('hp')*.5);cast('thirdUtility_'+job);
 }else if(event==='overheal'){
  cast('heal');
 }else if(event==='shield'){
  shield();
 }else if(event==='combo'){
  const count=job==='knight'?4:job==='rogue'?2:(rule.originalEvent.threshold||1);
  for(let n=0;n<count;n++){main();advance();}
 }else if(event.startsWith('thirdWideHit_')){
  cast('thirdWide_'+job);
 }else if(event.startsWith('thirdStance_')){
  cast('thirdStance_'+job);
 }else{
  for(let n=0;n<(rule.originalEvent.threshold||1);n++){main();advance();}
 }
 assert.ok(a.state().classBuffs.pact,key+' unreachable through its intended real action: '+event);
 assert.ok(a.state().classBuffs.pact.until>now,key+' expired during activation');
 const parts=[].concat(rule.originalEvent.payload),state=a.state();
 const immediate=new Set(['starVolley','sanctuarySplit','arcaneStrike','counterStrike','stackStrike','comboLeech','vowShieldFollowup','hunterSummon','falconVolley','starRainChain','guardianAutoChase','lowHpRiposte','siegeCounter','dragonCounter','sanctuaryChase','overhealRain']);
 if(parts.some(part=>immediate.has(part)))assert.ok(state.report.metrics.resonanceDamage>0,key+' activated without its direct combat payload');
 if(parts.includes('elementBurn'))assert.equal(state.petEffects.burnTicks,3,key+' missing fire');
 if(parts.includes('armorBreak')||parts.includes('armorExecution'))assert.ok(foe.exposedUntil>now,key+' missing armor exposure');
 if(parts.includes('manaRefund')||parts.includes('starRainChain'))assert.ok(state.report.metrics.effectiveMana>0,key+' missing effective SP refund');
 if(parts.includes('haste'))assert.ok(state.classBuffs.resonanceHaste?.until>now,key+' missing haste');
 if(parts.includes('mark'))assert.ok(state.petEffects.markHits>0,key+' missing follow-up mark');
 if(parts.includes('ward')||parts.includes('wardCharge'))assert.ok(state.petEffects.shield>0,key+' missing real companion barrier');
 if(parts.includes('soundShield'))assert.ok(p.shield>0,key+' missing real owner shield');
 if(parts.includes('guardedFollowup')){
  assert.ok(state.petEffects.shield>0,key+' must first provide real guard');
  assert.equal(state.report.metrics.resonanceDamage,0,key+' cannot fire during shield creation');
  advance(4000);main();assert.ok(state.report.metrics.resonanceDamage>0,key+' later real main hit must release follow-up');
 }
 if(parts.includes('songRainChain')){
  const wave=state.petEffects.songRain;assert.ok(wave&&wave.remaining===3,key+' missing scheduled rain');
  advance(2000);a.tickPetEffects(now);assert.ok(state.report.metrics.resonanceDamage>0,key+' actual rain must hit');
  advance(2000);main();assert.equal(state.petEffects.songRain,wave);assert.ok(wave.issued>3,'real song hit must extend rain');
 }
 if(parts.includes('storedSpellCharge')){
  assert.equal(state.report.metrics.resonanceDamage,0,'taking hits must store rather than instantly fire');
  advance();main();assert.ok(state.report.metrics.resonanceDamage>0,'later real main cast must release stored magic');
 }
 if(parts.includes('wardCharge')||parts.includes('armorExecution')){
  const before=state.report.metrics.resonanceDamage;advance(4001);main();
  assert.ok(state.report.metrics.resonanceDamage>before,key+' later real cast failed to discharge its second stage');
 }

 if(key==='performer/defense-support'){
  assert.ok(p.hp>Math.floor(a.stat('hp')*.5),'melody must actually heal');
  assert.ok(a.state().report.metrics.resonanceDamage>0,'healing must produce an actual pulse');
 }
});
