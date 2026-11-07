import test from 'node:test';
import assert from 'node:assert/strict';
import {HOMECOMING_ROUTES as routes} from '../dist/homecoming-data.js';
import {HOMECOMING_ADVENTURES as defs,adventureLocation,advanceAdventure,newHomecomingAdventure} from '../dist/homecoming-adventures.js';
import {normalizeHomecoming,discoverHomecoming,homecomingTransition as move,recordHomecomingVictory as victory,homecomingContinents,homecomingBonuses,homecomingAdventureAction as act} from '../dist/homecoming-state.js';
import {fourthUnlocked} from '../dist/companion-fourth-skill.js';
const plans={"attack-magic":["fuel","fuel","seal","ignite","WIN","elder"],"magic-attack":["feather","east","young","report"],"attack-defense":["medic","repair","cover","WIN"],"defense-attack":["duct","cut","quiet","power","cool"],"attack-support":["herb","wheel","deliver","offer","clear","share"],"support-attack":["begin","back","side","break","take","WIN"],"magic-defense":["hear","water","bell","voice","WIN"],"defense-magic":["keeper","child","record","judge","law","protect"],"magic-support":["sail","hold","reject","guide","tow","light"],"support-magic":["spring","autumn","summer","winter","weave","both","bridge"],"defense-support":["people","trunk","seed","protect","WIN","children"],"support-defense":["scout","tunnel","warm","melt","deliver"]};
const pet=r=>({fusion:{main:r.id.split('-')[0],sub:r.id.split('-')[1]},trueForm:true,humanoidStage:3,hp:100});
const fresh=()=>({job:'knight',dawnSigil:8,location:'town'});
function start(p,r){
 p.location='town';const go=a=>move(p,r.id,a,{pet:pet(r),town:true});
 go('begin');go('next');go('next');go('arrive');go('accept');
}
function step(p,r,key){
 act(p,r.id,null,{pet:pet(r),go:true});
 if(key==='WIN'){const q=p.homecoming.routes[r.id],n=defs[r.id].nodes[q.adventure.step];assert.equal(victory(p,r.id,{pet:pet(r),mapId:p.location,boss:n.location==='boss'}),true);}
 else act(p,r.id,key,{pet:pet(r)});
}
test('twelve mechanically distinct graphs with valid targets and resource names',()=>{
 assert.equal(new Set(routes.map(r=>defs[r.id].mechanic)).size,12);
 for(const r of routes){const d=defs[r.id];assert.ok(d.nodes[d.start]);
 for(const n of Object.values(d.nodes)){
 assert.ok(['town','field','boss'].includes(n.location));
 assert.equal(new Set(n.choices.map(c=>c.id)).size,n.choices.length);
 for(const c of n.choices){assert.ok(c.next==='done'||d.nodes[c.next]);for(const k of Object.keys(c.effects))assert.ok(k in d.vars);}
 if(n.combat)assert.ok(n.next==='done'||d.nodes[n.next]);
 }}
});
for(const r of routes)test(r.id+' unique walkthrough reaches reward once',()=>{
 const p=fresh();discoverHomecoming(p,routes.map(pet),{town:true});start(p,r);
 for(const key of plans[r.id]){step(p,r,key);const copy=JSON.parse(JSON.stringify(p));normalizeHomecoming(copy);assert.deepEqual(copy.homecoming.routes[r.id].adventure,p.homecoming.routes[r.id].adventure); }
 assert.equal(p.homecoming.routes[r.id].phase,'ready');
 move(p,r.id,'return',{pet:pet(r)});move(p,r.id,'claim',{pet:pet(r)});
 assert.equal(homecomingBonuses(p).count,1);assert.throws(()=>move(p,r.id,'claim',{pet:pet(r)}));
});
test('letters gate continents and eligibility; first journey survives reload',()=>{
 const p=fresh();assert.equal(discoverHomecoming(p,routes.map(pet),{town:true,offline:true}).length,0);
 for(const job of ['pactWarrior','spiritCommander'])assert.equal(discoverHomecoming({...fresh(),job},routes.map(pet),{town:true}).length,0);
 assert.equal(discoverHomecoming({...fresh(),dawnSigil:7},routes.map(pet),{town:true}).length,0);
 discoverHomecoming(p,routes.map(pet),{town:true});assert.equal(homecomingContinents(p).length,0);
 move(p,routes[0].id,'begin',{pet:pet(routes[0]),town:true});assert.equal(homecomingContinents(p).length,1);
 assert.throws(()=>move(p,routes[0].id,'arrive',{pet:pet(routes[0])}));
 move(p,routes[0].id,'next',{pet:pet(routes[0])});normalizeHomecoming(p);assert.equal(p.homecoming.routes[routes[0].id].journeyIndex,1);
});
test('no old kill-count bypass; correct battle stage, companion, map and online required',()=>{
 const p=fresh(),r=routes[0];discoverHomecoming(p,routes.map(pet),{town:true});start(p,r);
 for(const a of ['investigate','field','node','boss'])assert.throws(()=>move(p,r.id,a,{pet:pet(r)}));
 assert.equal(victory(p,r.id,{pet:pet(r),mapId:r.bossMapId,boss:true}),false);
 assert.throws(()=>act(p,r.id,'fuel',{pet:pet(r)})); // still in town
 act(p,r.id,null,{pet:pet(r),go:true});assert.throws(()=>act(p,r.id,'fuel',{pet:pet(r),offline:true}));
 assert.throws(()=>act(p,r.id,'fuel',{pet:pet(routes[1])}));
 for(const k of ['fuel','fuel','seal','ignite'])step(p,r,k);
 act(p,r.id,null,{pet:pet(r),go:true});
 assert.equal(victory(p,r.id,{pet:{...pet(r),hp:0},mapId:p.location,boss:true}),false);
 assert.equal(victory(p,r.id,{pet:pet(r),mapId:p.location,boss:true,offline:true}),false);
 assert.equal(victory(p,r.id,{pet:pet(r),mapId:p.location,boss:false}),false);
 assert.equal(victory(p,r.id,{pet:pet(r),mapId:p.location,boss:true}),true);
 assert.equal(victory(p,r.id,{pet:pet(r),mapId:p.location,boss:true}),false);
});
test('errors recover locally and scarce tree resources cannot softlock the route',()=>{
 const r=routes.find(r=>r.id==='defense-support'),a=newHomecomingAdventure(r.id);
 advanceAdventure(r,a,'luxury');advanceAdventure(r,a,'luxury');advanceAdventure(r,a,'luxury');
 assert.equal(a.vars.sap,0);assert.throws(()=>advanceAdventure(r,a,'people'));
 advanceAdventure(r,a,'recover');assert.equal(a.vars.sap,6);
 for(const c of ['seed','people','trunk','protect'])advanceAdventure(r,a,c);
 assert.equal(a.step,'defend');
 const melody=routes.find(r=>r.id==='magic-defense'),m=newHomecomingAdventure(melody.id);
 for(const c of ['hear','bell','retry'])advanceAdventure(melody,m,c);assert.equal(m.step,'first');assert.equal(m.vars.notes,0);
});
test('noncombat endings and optional combat branches stay distinct',()=>{
 for(const id of ['attack-support','defense-magic','magic-support','support-magic','support-defense'])assert.equal(Object.values(defs[id].nodes).some(n=>n.combat),false);
 const r=routes.find(r=>r.id==='defense-attack'),a=newHomecomingAdventure(r.id);
 for(const c of ['cart','smash'])advanceAdventure(r,a,c);
 assert.throws(()=>advanceAdventure(r,a,'quiet'));advanceAdventure(r,a,'fight');assert.equal(a.step,'patrol');
});
test('twelve additive rewards; reverse progress separate but fourth skill shared',()=>{
 const p=fresh();discoverHomecoming(p,routes.map(pet),{town:true});
 for(const [index,r] of routes.entries()){
 start(p,r);for(const k of plans[r.id])step(p,r,k);move(p,r.id,'return',{pet:pet(r)});move(p,r.id,'claim',{pet:pet(r)});
 if(index===0){assert.equal(p.homecoming.routes['magic-attack'].phase,'letter');assert.equal(fourthUnlocked(p,pet(routes[1])),true);}
 }
 assert.deepEqual(homecomingBonuses(p),{damage:.03,hp:.04,def:.04,recovery:.04,count:12});
});
test('late returning banner master victory credits a companion that fought but fell on the final exchange',()=>{
 const r=routes.find(route=>route.id==='support-attack');
 for(const job of ['knight','crusader','wizard','sage','assassin','rogue','priest','monk','hunter','performer']){
  const p={...fresh(),job};discoverHomecoming(p,[pet(r)],{town:true});start(p,r);
  for(const choice of ['begin','back','side','break','take'])step(p,r,choice);
  assert.equal(p.homecoming.routes[r.id].adventure.step,'duel');
  act(p,r.id,null,{pet:pet(r),go:true});
  const fallen={...pet(r),hp:0};
  assert.equal(victory(p,r.id,{pet:fallen,mapId:p.location,boss:false}),false,job+' must not accept an unverified fainted pet');
  assert.equal(victory(p,r.id,{pet:fallen,mapId:p.location,boss:false,companionPresentAtStart:true}),true,job);
  assert.equal(p.homecoming.routes[r.id].phase,'ready',job);
 }
});
test('legacy active quests migrate to their new start; claimed rewards survive normalization',()=>{
 const p=fresh();p.homecoming={version:1,completedRoutes:{'magic-attack':true},routes:{'attack-magic':{phase:'active',nodes:2},'attack-defense':{phase:'claimed'}}};
 normalizeHomecoming(p);assert.equal(p.homecoming.routes['attack-magic'].adventure.step,'valve');
 assert.deepEqual(p.homecoming.completedRoutes,{'attack-defense':true});
 assert.equal(p.homecoming.version,2);
});
