import test from 'node:test';
import assert from 'node:assert/strict';
import {WORLD_MONSTERS,ZONES} from '../dist/world-data.js';
import {DAWN_MONSTERS,DAWN_BOSS,DAWN_ZONE} from '../dist/dawn-world.js';
import {MAP_BOSSES} from '../dist/map-bosses.js';
import {monsterRuntimeStats} from '../dist/combat-balance.js';
import {SECOND_JOBS} from '../dist/jobs.js';
import {fusionKey} from '../dist/pet-fusion.js';
import {dawnArchonPreparationFactor,sigilBonus} from '../dist/dawn-sigil.js';

export const FUSION_KEYS=['attack-magic','attack-defense','attack-support','magic-defense','magic-support','defense-support'];
const mob191=WORLD_MONSTERS.filter(m=>m.map==='worldroot').sort((a,b)=>a.level-b.level);
const mob201=DAWN_MONSTERS.slice().sort((a,b)=>a.level-b.level);
export const MAP_SCENARIOS=[
 {level:200,map:'worldroot',label:'Lv200 未強化／191–200 界源天穹',mob:mob191,boss:MAP_BOSSES.worldroot},
 {level:210,map:'dawnrift',label:'Lv210 全 SSS／201–210 黎明斷層',mob:mob201,boss:DAWN_BOSS}
];
const runtime=m=>({...m,...monsterRuntimeStats(m)});
export const TARGETS=MAP_SCENARIOS.flatMap(s=>[
 ...s.mob.map(m=>({stage:s.level,map:s.map,type:'mob',monster:runtime(m)})),
 {stage:s.level,map:s.map,type:'boss',monster:runtime(s.boss)}
]);
export const TEST_PAIRS=MAP_SCENARIOS.flatMap(s=>Object.keys(SECOND_JOBS).flatMap(job=>FUSION_KEYS.map(fusion=>({stage:s.level,map:s.map,job,fusion,targets:[...s.mob,s.boss].map(runtime)}))));
test('only actual map monsters and map boss, never fixed invented DEF',()=>{
 assert.equal(mob191.length,10);
 assert.deepEqual(mob191.map(m=>m.level),[191,192,193,194,195,196,197,198,199,200]);
 assert.equal(MAP_BOSSES.worldroot.level,200);
 assert.equal(mob201.length,3);
 assert.deepEqual(mob201.map(m=>m.level),[201,205,209]);
 assert.equal(DAWN_BOSS.level,210);
 assert.equal(DAWN_ZONE.id,'dawnrift');
 assert.equal(ZONES.find(z=>z.id==='worldroot')?.min,191);
 assert.equal(TARGETS.length,15);
});
test('both source-linked maps contain strictly positive HP, ATK, DEF, MDEF, MATK',()=>{
 for(const {stage,map,type,monster:m} of TARGETS){
  for(const stat of ['hp','atk','def','matk','mdef','hit','flee','aspd'])assert.ok(Number.isFinite(m[stat])&&m[stat]>0,[stage,map,type,m.id,stat].join('/'));
  assert.ok(['physical','magic'].includes(m.attackType));
  assert.equal(m.map,map);
 }
});
test('120 job fusion configurations cover each map enemy and boss',()=>{
 assert.equal(TEST_PAIRS.length,120);
 for(const p of TEST_PAIRS)assert.equal(p.targets.length,p.stage===200?11:4);
 assert.equal(new Set(TEST_PAIRS.map(x=>[x.stage,x.job,x.fusion].join('|'))).size,120);
 for(const p of TEST_PAIRS){const [a,b]=p.fusion.split('-');assert.equal(fusionKey(a,b),fusionKey(b,a));}
});
test('defense and health from source remain distinct between upper and lower map stages',()=>{
 assert.ok(DAWN_BOSS.hp>MAP_BOSSES.worldroot.hp);
 assert.ok(DAWN_BOSS.atk>MAP_BOSSES.worldroot.atk);
 assert.ok(mob201[0].hp>mob191.at(-1).hp);
});

test('Archon damage gate must be checked at Sigil 0, IV and VIII',()=>{
 const prepared=[.34,.44,.54,.75,1];
 for(let rank=0;rank<=4;rank++)assert.equal(dawnArchonPreparationFactor({dawnSigil:rank}),prepared[rank]);
 assert.equal(dawnArchonPreparationFactor({dawnSigil:8}),1.1);
 assert.equal(sigilBonus({dawnSigil:4}).atk,1.08);
 assert.equal(sigilBonus({dawnSigil:8}).petDamage,1.16);
});
