import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {SECOND_JOBS,parentJob} from '../dist/jobs.js';
import {REBIRTH_CORE_ID,REBIRTH_ZONES,rebirthEligibility,normalizeProgression} from '../dist/adventure-progression.js';
import {PROOF_ITEMS} from '../dist/adventure-economy.js';
import {ITEMS} from '../dist/catalog.js';
import {MAP_BOSSES} from '../dist/map-bosses.js';
import {runtime} from './runtime31-helper.mjs';

assert.equal(REBIRTH_CORE_ID,'rebirth_core');
assert.equal(PROOF_ITEMS[REBIRTH_CORE_ID]?.quest,true);
assert.equal(ITEMS[REBIRTH_CORE_ID]?.name,'星宮轉生核心');
const player=()=>({job:'wizard',reborn:false,location:'town',level:99,jobLevel:50,bag:[],quests:{},
 attributes:{STR:50,AGI:10,VIT:50,INT:99,DEX:20,LUK:1},pets:[{id:'pet'}],gear:{rightHand:{id:'oneStaff'}},
 sockets:{rightHand:'world_91'},cards:[{id:'world_91',qty:1}],gold:1000,jobSkills:{old:10}});
const p=player();
for(const id of REBIRTH_ZONES)p.quests[id]={done:true,junk:'junk_world_91',proof:'proof_'+id};
assert.match(rebirthEligibility(p,SECOND_JOBS),/轉生核心/,'舊五區已完成不可取代新核心');
p.bag.push({id:REBIRTH_CORE_ID,qty:2});
assert.equal(rebirthEligibility(p,SECOND_JOBS),null);
p.level=98;assert.match(rebirthEligibility(p,SECOND_JOBS),/Base99/);p.level=99;
p.jobLevel=49;assert.match(rebirthEligibility(p,SECOND_JOBS),/Job50/);p.jobLevel=50;
p.location='celestial';assert.match(rebirthEligibility(p,SECOND_JOBS),/村莊/);p.location='town';
const normalized=normalizeProgression(structuredClone(p));
assert.equal(REBIRTH_ZONES.some(id=>Object.hasOwn(normalized.quests,id)),false,'五個舊任務應移除');
assert.equal(normalized.bag.find(e=>e.id===REBIRTH_CORE_ID).qty,2,'正規化不可刪核心');
assert.equal(normalized.gear.rightHand.id,'oneStaff');

// Execute the actual browser rebirth function, not an independent copy.
const source=readFileSync(new URL('../dist/game.js',import.meta.url),'utf8');
const start=source.indexOf('function rebirthCharacter(){');
const end=source.indexOf('\nfunction ',start+10);
assert.ok(start>0&&end>start,'未找到正式轉生函式');
assert.match(source,/enemy\.id==='boss_celestial'&&enemy\.boss/,'99級星宮首領必須被識別');
assert.match(source,/addStack\(player\.bag,REBIRTH_CORE_ID,1\)/,'99級首領需要實際發放核心');
assert.doesNotMatch(source.slice(start,end),/REBIRTH_ZONES|quest\.done/,'不能再要求五個舊任務');
const makeContext=(input,saveOk=true,accept=true)=>{
 const c={player:input,SECOND_JOBS,REBIRTH_CORE_ID,rebirthEligibility,parentJob,ATTRS:input.attributes,
  confirm:()=>accept,structuredClone,activeJobSkills:()=>[{id:'skill'}],initialJobSkills:()=>({skill:1}),
  stat:k=>k==='hp'?100:50,save:()=>saveOk,render(){},message(){},toast(){},
  classBuffs:{},jobSkillTimers:{},dirty:false};
 runInNewContext(source.slice(start,end),c);return c;
};
const successful=makeContext(structuredClone(p));
successful.rebirthCharacter();
assert.equal(successful.player.reborn,true);
assert.equal(successful.player.job,'mage');
assert.equal(successful.player.statPoints,20);
assert.equal(successful.player.bag.find(e=>e.id===REBIRTH_CORE_ID).qty,1,'只消耗1顆核心');
assert.equal(successful.player.gold,1000);
assert.equal(successful.player.pets[0].id,'pet');
assert.equal(successful.player.gear.rightHand.id,'oneStaff');
assert.equal(successful.player.sockets.rightHand,'world_91');
successful.rebirthCharacter();
assert.equal(successful.player.statPoints,20,'不能重複轉生領能力點');
assert.equal(successful.player.bag.find(e=>e.id===REBIRTH_CORE_ID).qty,1);

const canceled=makeContext(structuredClone(p),true,false);
const beforeCancel=JSON.stringify(canceled.player);canceled.rebirthCharacter();
assert.equal(JSON.stringify(canceled.player),beforeCancel,'取消不能消耗核心');
const failed=makeContext(structuredClone(p),false);
const beforeFailure=JSON.stringify(failed.player);failed.rebirthCharacter();
assert.equal(JSON.stringify(failed.player),beforeFailure,'儲存失敗必須完整回復');

console.log('rebirth: Lv99 boss core, eligibility, old quest migration, exact consumption, cancel, rollback, repeat, equipment/cards/pet ownership passed');

// Exercise the real award function, including the offline simulation code path.
for(const offline of [false,true]){
 const c=await runtime(),a=c.api,save=a.normalize(a.fresh('星宮掉落','wizard'));
 c.Math.random=()=>0.99; // Avoid unrelated boss-card UI; core must drop regardless of RNG.
 save.level=99;save.jobLevel=50;save.location='celestial';
 const boss=MAP_BOSSES.celestial;
 assert.equal(boss.id,'boss_celestial');
 a.setup(save,{...boss,hp:0,maxHp:boss.hp,instanceId:'rebirth-boss',rewarded:false});
 a.setOnlineForTest({offline});
 a.award();
 assert.equal(save.bag.find(e=>e.id===REBIRTH_CORE_ID)?.qty,1,`boss core missing; offline=${offline}`);
 a.award();
 assert.equal(save.bag.find(e=>e.id===REBIRTH_CORE_ID)?.qty,1,'reward must not repeat for same boss');
}
console.log('rebirth: real Lv99 boss reward and offline reward path passed');
