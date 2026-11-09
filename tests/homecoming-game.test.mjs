import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runtime} from './runtime31-helper.mjs';
import {comparisonPlayer} from './fixtures/spirit-vs-class-player.mjs';
import {HOMECOMING_ROUTES} from '../dist/homecoming-data.js';
import {HOMECOMING_ADVENTURES,adventureLocation} from '../dist/homecoming-adventures.js';
import {HOMECOMING_MAPS,homecomingEntryError,homecomingBattle} from '../dist/homecoming-runtime.js';
import {makePet} from '../dist/catalog.js';
import {isTown,homeTown} from '../dist/adventure-progression.js';
import {continentFor} from '../dist/frontier.js';
import {encounterLimit} from '../dist/encounter-rules.js';
const plans=JSON.parse(readFileSync(new URL('./homecoming-state.test.mjs',import.meta.url),'utf8').match(/const plans=(.*);\nconst pet=/)[1]);
async function setup(route,job='knight'){
 const c=await runtime(),api=c.api,p=comparisonPlayer({job,level:210});
 const [main,sub]=route.id.split('-'),pet=makePet({attack:'fang',magic:'wisp',defense:'shell',support:'sprout'}[main]);
 Object.assign(pet,{id:'home-pet',fusion:{main,sub,version:1},level:200,xp:0,rarity:'mythic',ascended:true,evolution:4,loyalty:500,trueForm:true,humanoidStage:3,iv:{hp:5,atk:5,def:5,matk:5,sp:5,aspd:5}});
 Object.assign(p,{location:'town',dawnSigil:8,pets:[pet],activePetId:pet.id});
 api.setup(api.normalize(p),{id:'town',hp:0,maxHp:1});
 for(const id of ['continentSelect','mapSelect'])c.document.getElementById(id).insertAdjacentHTML=()=>{};
 api.discoverHomecomingLetters();
 return {c,api,act:(a,choice)=>api.homecomingAction(route.id,a,choice),p:()=>api.state().player};
}
test('36 registered maps have correct town, continent and encounter capacity',()=>{
 assert.equal(Object.keys(HOMECOMING_MAPS).length,36);
 for(const r of HOMECOMING_ROUTES){assert.equal(isTown(r.townId),true);assert.equal(isTown(r.fieldId),false);assert.equal(homeTown(r.bossMapId),r.townId);assert.equal(continentFor(r.fieldId),r.continentId);assert.equal(encounterLimit(r.townId),0);assert.equal(encounterLimit(r.fieldId),1);}
 assert.equal(homeTown('dawnrift'),'dawncity');assert.equal(continentFor('worldroot'),'sky');assert.equal(encounterLimit('worldroot'),4);
});
for(const job of ['pactWarrior','spiritCommander'])test('spirit job receives retroactive invitation and completes homecoming: '+job,async()=>{
 const route=HOMECOMING_ROUTES.find(r=>r.id==='magic-attack');
 const {api,act,p}=await setup(route,job);
 assert.equal(p().homecoming.routes[route.id].phase,'letter');
 for(const action of ['begin','next','next','arrive','accept'])assert.equal(act(action),true,job+'/'+action);
 for(const key of plans[route.id]){
  const q=p().homecoming.routes[route.id],node=HOMECOMING_ADVENTURES[route.id].nodes[q.adventure.step];
  if(p().location!==adventureLocation(route,node))assert.equal(act('go'),true);
  assert.equal(act('choose',key),true,key);
 }
 assert.equal(p().homecoming.routes[route.id].phase,'ready');
 assert.equal(act('return'),true);assert.equal(act('claim'),true);
 assert.equal(p().homecoming.completedRoutes[route.id],true);
});
for(const route of HOMECOMING_ROUTES)test('game runtime complete route: '+route.id,async()=>{
 const {api,act,p}=await setup(route);
 for(const action of ['begin','next','next','arrive','accept'])assert.equal(act(action),true,action);
 assert.equal(p().location,route.townId);assert.ok(p().hp>0);
 const beforeKills=p().kills,beforeGold=p().gold;
 for(const key of plans[route.id]){
  const q=p().homecoming.routes[route.id],node=HOMECOMING_ADVENTURES[route.id].nodes[q.adventure.step];
  if(p().location!==adventureLocation(route,node))assert.equal(act('go'),true);
  if(key==='WIN'){
   const foe=api.addHomecomingEncounter();assert.ok(foe);assert.ok(api.spriteHtml(foe.id).includes(foe.artPath));
   api.addHomecomingEncounter();assert.equal(api.state().enemies.length,1);
   const stage=q.phase+':'+q.adventure.step;
   // Damage/award integration test, not a DPS or difficulty benchmark.
   api.dealDamage(foe.maxHp*100,'playerDamage');assert.equal(foe.hp,0);api.award();
   const after=p().homecoming.routes[route.id].phase+':'+p().homecoming.routes[route.id].adventure.step;
   assert.notEqual(after,stage);api.award();assert.equal(p().homecoming.routes[route.id].phase+':'+p().homecoming.routes[route.id].adventure.step,after);
  }else assert.equal(act('choose',key),true,key);
 }
 assert.equal(p().homecoming.routes[route.id].phase,'ready');assert.equal(act('return'),true);assert.equal(act('claim'),true);assert.equal(act('claim'),false);
 assert.equal(p().homecoming.completedRoutes[route.id],true);assert.equal(p().kills,beforeKills);assert.equal(p().gold,beforeGold);
 assert.equal(p().hp,api.stat('hp'));
});
test('failed save rolls back journey and first invitation; offline never advances story',async()=>{
 const r=HOMECOMING_ROUTES[0],{api,act,p}=await setup(r);api.setSaveForTest(()=>false);
 assert.equal(act('begin'),false);assert.equal(p().homecoming.routes[r.id].phase,'letter');
 p().homecoming={routes:{},completedRoutes:{}};api.discoverHomecomingLetters();assert.equal(Object.keys(p().homecoming.routes).length,0);
 const before=structuredClone(p());before.location=r.fieldId;before.offline={at:0,enabled:true};
 const result=await api.simulateOffline(before,10000000);assert.equal(result.summary,null);assert.deepEqual(result.player.homecoming,before.homecoming);
});
for(const job of ['knight','crusader','wizard','sage','assassin','rogue','priest','monk','hunter','performer'])test('banner duel finishes even when the participating pet faints: '+job,async()=>{
 const route=HOMECOMING_ROUTES.find(r=>r.id==='support-attack'),{api,act,p}=await setup(route,job);
 for(const action of ['begin','next','next','arrive','accept'])assert.equal(act(action),true,job+'/'+action);
 for(const choice of ['begin','back','side','break','take']){
  const node=HOMECOMING_ADVENTURES[route.id].nodes[p().homecoming.routes[route.id].adventure.step];
  if(p().location!==adventureLocation(route,node))assert.equal(act('go'),true);
  assert.equal(act('choose',choice),true,job+'/'+choice);
 }
 assert.equal(p().homecoming.routes[route.id].adventure.step,'duel');
 const foe=api.addHomecomingEncounter();assert.ok(foe);
 assert.equal(foe.homecomingPetId,p().activePetId);
 p().pets[0].hp=0;foe.hp=0;api.award();
 assert.equal(p().homecoming.routes[route.id].phase,'ready',job);
 assert.equal(act('return'),true);assert.equal(act('claim'),true);
 assert.equal(p().homecoming.routes[route.id].phase,'claimed');
});
test('map locks, noncombat spawn suppression and current-stage load repair',async()=>{
 const r=HOMECOMING_ROUTES[1],{api,act,p}=await setup(r);
 assert.ok(homecomingEntryError(p(),r.townId,p().pets[0]));
 for(const a of ['begin','next','next','arrive','accept'])act(a);
 act('go');assert.equal(api.addHomecomingEncounter(),undefined);assert.equal(api.state().enemies.length,0);assert.ok(homecomingEntryError(p(),r.bossMapId,p().pets[0]));
 const copy=api.normalize(structuredClone(p()));assert.equal(copy.location,r.fieldId);assert.equal(copy.homecoming.routes[r.id].adventure.step,'route');
 copy.pets[0].fusion={main:'magic',sub:'defense'};assert.equal(homecomingBattle(copy,copy.pets[0]),null);assert.equal(api.normalize(copy).location,r.townId);
});
for(const route of HOMECOMING_ROUTES.filter((_,i)=>i%2===0))test('fourth slot actual damage and pause/cooldown: '+route.id,async()=>{
 const {api,p}=await setup(route),owner=p(),pet=owner.pets[0];owner.location='dawnrift';
 owner.homecoming={routes:{[route.id]:{phase:'claimed'}},completedRoutes:{[route.id]:true}};
 const foe={id:'fang',hp:1e16,maxHp:1e16,def:1,mdef:1,level:210,flee:0,atk:1,matk:1,aspd:150,instanceId:'fourth-test'};
 api.setEnemies([foe]);api.beginReport();const initialSp=api.petStats(pet).sp;pet.sp=initialSp;const state=api.fourthState(pet,1000000);state.energy=100;
 api.tickCompanionFourth(1000000);assert.equal(state.casts,1);assert.equal(pet.sp,initialSp-20);assert.ok(foe.hp<foe.maxHp);
 assert.ok(api.state().report.metrics.homecomingDamage>0);assert.match(api.renderCompanionFourthSlot(pet),/第四格/);
 api.tickCompanionFourth(1000000);assert.equal(state.casts,1);state.energy=100;api.setAutoForTest(false);api.tickCompanionFourth(2000000);assert.equal(state.casts,1);assert.equal(state.energy,100);
});
test('inheritance affects owner damage, not pet damage, defense offense or transferred pet stats',async()=>{
 const {api,p}=await setup(HOMECOMING_ROUTES[2],'crusader'),owner=p();owner.location='dawnrift';
 const before={shield:api.offensiveSource({source:'shield',kind:'physical'}),pet:structuredClone(api.petStats(owner.pets[0]))};
 owner.homecoming={routes:Object.fromEntries(HOMECOMING_ROUTES.map(r=>[r.id,{phase:'claimed'}])),completedRoutes:Object.fromEntries(HOMECOMING_ROUTES.map(r=>[r.id,true]))};
 // Excluded stat() values are already rounded, allowing a one-point rounding difference.
 for(const k of ['hp','def','mdef'])assert.ok(Math.abs(api.stat(k)-Math.round(api.stat(k,true)*1.04))<=1);
 assert.equal(api.offensiveSource({source:'shield',kind:'physical'}),before.shield);assert.deepEqual(structuredClone(api.petStats(owner.pets[0])),before.pet);assert.ok(api.stat('damageReduction')<=40);
 const target=()=>({id:'fang',hp:1e12,maxHp:1e12,def:0,level:210});
 api.setEnemies([target()]);const ownBoost=api.dealDamage(100000,'playerDamage');api.setEnemies([target()]);const petBoost=api.dealDamage(100000,'petDamage');
 owner.homecoming={routes:{},completedRoutes:{}};
 api.setEnemies([target()]);const ownBase=api.dealDamage(100000,'playerDamage');api.setEnemies([target()]);const petBase=api.dealDamage(100000,'petDamage');
 assert.equal(ownBoost,Math.round(ownBase*1.03));assert.equal(petBoost,petBase);
});
test('owner received healing excludes leech and potions',async()=>{
 const {api,p}=await setup(HOMECOMING_ROUTES[4]),owner=p(),pet=owner.pets[0];owner.location='dawnrift';
 owner.homecoming={routes:Object.fromEntries(HOMECOMING_ROUTES.filter(r=>r.inheritance==='recovery').map(r=>[r.id,{phase:'claimed'}]))};
 pet.hp=api.petStats(pet).hp;owner.hp=100;api.healPetParty(1000);assert.equal(owner.hp,1140);
 owner.hp=100;api.healPetParty(1000,'effectiveHeal',false);assert.equal(owner.hp,1100);
 owner.bag=[{id:'red_large',qty:2}];owner.hp=100;api.useItem('red_large');const boosted=owner.hp;
 owner.homecoming={routes:{},completedRoutes:{}};owner.hp=100;api.useItem('red_large');assert.equal(owner.hp,boosted);
});
test('actual map dropdown opens only after departure and hides future battle destinations',async()=>{
 const r=HOMECOMING_ROUTES[0],{api,c,act}=await setup(r),select=c.document.getElementById('continentSelect'),maps=c.document.getElementById('mapSelect');
 api.renderMapChoices();assert.ok(!select.innerHTML.includes(r.continentId));act('begin');assert.ok(select.innerHTML.includes(r.continentId));assert.ok(!maps.innerHTML.includes(r.bossMapId));
 for(const a of ['next','next','arrive','accept'])act(a);
 assert.ok(maps.innerHTML.includes(r.fieldId));assert.ok(!maps.innerHTML.includes(r.bossMapId));
});
test('every home town shows its own NPC instead of the original village quest giver',async()=>{
 const {renderHomecomingTown}=await import('../dist/homecoming-ui.js');
 for(const r of HOMECOMING_ROUTES){const html=renderHomecomingTown({location:r.townId,homecoming:{routes:{[r.id]:{phase:'arrived'}}}});assert.ok(html.includes(r.npc));assert.ok(html.includes(r.letter));assert.ok(!html.includes('艾琳'));}
});
