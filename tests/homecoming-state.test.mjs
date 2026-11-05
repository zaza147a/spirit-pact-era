import test from 'node:test';
import assert from 'node:assert/strict';
import {HOMECOMING_ROUTES as routes} from '../dist/homecoming-data.js';
import {normalizeHomecoming,discoverHomecoming,homecomingTransition as move,recordHomecomingVictory as victory,homecomingContinents,homecomingBonuses} from '../dist/homecoming-state.js';
import {fourthUnlocked} from '../dist/companion-fourth-skill.js';
const pet=r=>({fusion:{main:r.id.split('-')[0],sub:r.id.split('-')[1]},trueForm:true,humanoidStage:3,hp:100});
const fresh=()=>({job:'knight',dawnSigil:8,location:'town'});
function finish(p,r){
 const companion=pet(r),go=(a,extra={})=>move(p,r.id,a,{pet:companion,...extra});
 p.location='town';go('begin',{town:true});go('next');go('next');go('arrive');go('accept');go('investigate',{choice:r.answer});go('field');
 for(let i=0;i<r.gates[2];i++)assert.equal(victory(p,r.id,{pet:companion,mapId:p.location}),true);
 go('node');go('node');go('node');go('boss');assert.equal(victory(p,r.id,{pet:companion,mapId:p.location,boss:true}),true);go('return');go('claim');
}
test('12 independent route, continent, town and boss identities',()=>{
 for(const field of ['id','continentId','townId','fieldId','bossMapId','bossId'])assert.equal(new Set(routes.map(r=>r[field])).size,12);
 for(const r of routes){assert.equal(r.journey.length,3);assert.equal(r.nodes.length,3);assert.equal(r.gates.length,3);}
});
test('eligibility, town and online gates; letters do not open continents',()=>{
 for(const mutate of [p=>p.dawnSigil=7,p=>p.job='pactWarrior',p=>p.job='spiritCommander']){
 const p=fresh();mutate(p);assert.equal(discoverHomecoming(p,routes.map(pet),{town:true}).length,0);}
 const p=fresh();assert.equal(discoverHomecoming(p,routes.map(pet),{town:true,offline:true}).length,0);
 assert.equal(discoverHomecoming(p,routes.map(pet),{town:false}).length,0);
 assert.equal(discoverHomecoming(p,[{...pet(routes[0]),humanoidStage:2}],{town:true}).length,0);
 assert.equal(discoverHomecoming(p,routes.map(pet),{town:true}).length,12);assert.equal(homecomingContinents(p).length,0);
});
test('first journey persists each page, requires arrival before acceptance; revisit skips travel',()=>{
 let p=fresh(),r=routes[0];discoverHomecoming(p,[pet(r)],{town:true});const go=a=>move(p,r.id,a,{pet:pet(r),town:true});
 assert.throws(()=>go('accept'));go('begin');assert.equal(homecomingContinents(p).length,1);assert.throws(()=>go('arrive'));go('next');
 p=JSON.parse(JSON.stringify(p));normalizeHomecoming(p);assert.equal(p.homecoming.routes[r.id].journeyIndex,1);
 go('next');go('arrive');assert.equal(p.location,r.townId);p.location='town';go('revisit');assert.equal(p.location,r.townId);assert.equal(p.homecoming.routes[r.id].phase,'arrived');
});
test('quest sequence, location, matching companion and offline guards',()=>{
 const p=fresh(),r=routes[0];discoverHomecoming(p,routes.map(pet),{town:true});
 assert.throws(()=>move(p,r.id,'begin',{pet:pet(routes[1]),town:true}));
 const go=(a,x={})=>move(p,r.id,a,{pet:pet(r),town:true,...x});
 go('begin');go('next');go('next');go('arrive');go('accept');
 assert.throws(()=>go('boss'));assert.throws(()=>go('investigate',{choice:2}));go('investigate',{choice:r.answer});go('field');
 assert.throws(()=>go('node'));assert.equal(victory(p,r.id,{pet:pet(r),mapId:r.fieldId,offline:true}),false);
 assert.equal(victory(p,r.id,{pet:{...pet(r),hp:0},mapId:r.fieldId}),false);
 assert.equal(victory(p,r.id,{pet:pet(routes[1]),mapId:r.fieldId}),false);
 assert.equal(victory(p,r.id,{pet:pet(r),mapId:r.townId}),false);
 assert.throws(()=>go('return',{offline:true}));
});
test('all 12 claims additive once; reverse identity progress separate, fourth slot shared',()=>{
 const p=fresh();discoverHomecoming(p,routes.map(pet),{town:true});finish(p,routes[0]);
 assert.equal(p.homecoming.routes[routes[1].id].phase,'letter');assert.equal(fourthUnlocked(p,pet(routes[1])),true);
 assert.throws(()=>move(p,routes[0].id,'claim',{pet:pet(routes[0])}));
 for(const r of routes.slice(1))finish(p,r);
 const b=homecomingBonuses(p);assert.equal(b.count,12);assert.equal(b.damage,.03);assert.equal(b.hp,.04);assert.equal(b.def,.04);assert.equal(b.recovery,.04);
 normalizeHomecoming(p);assert.equal(Object.keys(p.homecoming.completedRoutes).length,12);
 p.job='pactWarrior';assert.equal(homecomingBonuses(p).count,0);
});
test('normalization drops unknown flags and derives completion only from claimed route records',()=>{
 const p=fresh();p.homecoming={completedRoutes:{'attack-magic':true},routes:{bogus:{phase:'claimed'},'attack-defense':{phase:'traveling',journeyIndex:999,kills:NaN,nodes:-2}}};
 normalizeHomecoming(p);assert.deepEqual(p.homecoming.completedRoutes,{});assert.equal(p.homecoming.routes['attack-defense'].journeyIndex,2);
 assert.equal(p.homecoming.routes['attack-defense'].kills,0);assert.equal(p.homecoming.routes['attack-defense'].nodes,0);
});
