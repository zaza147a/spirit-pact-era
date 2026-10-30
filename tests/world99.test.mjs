import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync,existsSync} from 'node:fs';
import {ZONES,WORLD_MONSTERS,WORLD_MAPS,worldMonsterArt} from '../dist/world-data.js';
import {noviceMonsterStats,normalMonsterStats,gearTierForLevel} from '../dist/progression.js';
import {SPECIES,CARDS,ITEMS} from '../dist/catalog.js';
import {encounterLimit} from '../dist/encounter-rules.js';
import {monsterCombatStats,incomingMonsterDamage,aspdAttackIntervalMs} from '../dist/combat-balance.js';
const dist=new URL('../dist/',import.meta.url);
async function app(){const c={console,Math:Object.create(Math)};let source=readFileSync(new URL('game.js',dist),'utf8');for(const m of source.matchAll(/^import \{([^}]+)\} from '([^']+)';$/gm)){const mod=await import(new URL(m[2],dist));for(const key of m[1].split(',').map(x=>x.trim()))c[key]=mod[key];}source=source.replace(/^import .*;\n/gm,'').replace(/\ninit\(\);\s*$/,'\nglobalThis.api={fresh,normalize,addEncounter,award,spriteHtml,state:()=>({player,enemy,enemies}),setup:p=>{player=p;enemies=[];enemy=null;report=null;activeSlot=null;}};message=()=>{};render=()=>{};renderSide=()=>{};save=()=>true;');c.canEncounterBoss=()=>false;vm.createContext(c);vm.runInContext(source,c);c.Math.random=()=>1;return c;}
test('fifteen zones cover1-99 and101-150 without overlaps; the99 zone has nine creatures',()=>{
 assert.equal(ZONES.length,15);assert.equal(WORLD_MONSTERS.length,149);assert.deepEqual(WORLD_MONSTERS.map(m=>m.level),[...Array.from({length:99},(_,i)=>i+1),...Array.from({length:50},(_,i)=>i+101)]);assert.equal(new Set(WORLD_MONSTERS.map(m=>m.name)).size,149);
 for(const z of ZONES){assert.equal(z.names.length,z.max-z.min+1);const pool=WORLD_MONSTERS.filter(m=>m.map===z.id);assert.equal(pool.length,z.names.length);assert.equal(pool.at(-1).elite,true);assert.equal(pool.filter(m=>m.elite).length,1);assert.equal(WORLD_MAPS[z.id].novice,z.max<=50);assert.equal(encounterLimit(z.id),z.min>50?4:z.max<=20?2:3);}
 assert.equal(ZONES.at(-1).max,150);assert.equal(ZONES.find(z=>z.id==='celestial').names.length,9);
});
test('novice stats remain untouched; 51 starts normal difficulty, high-level rewards and sustained enemy pressure grow',()=>{
 for(const m of WORLD_MONSTERS.filter(m=>m.level<=50)){const expected=noviceMonsterStats(m.level,m.elite);for(const k of ['hp','atk','def','xp'])assert.equal(m[k],expected[k]);}
 const novice=WORLD_MONSTERS[48],normal=WORLD_MONSTERS[50];for(const k of ['hp','atk','def','xp'])assert.ok(normal[k]>novice[k]);
 const dps=m=>incomingMonsterDamage(m.atk,80)*encounterLimit(m.map)*1000/aspdAttackIntervalMs(monsterCombatStats(m).aspd);assert.ok(dps(normal)>dps(novice));assert.ok(dps(WORLD_MONSTERS[97])>dps(normal));assert.ok(aspdAttackIntervalMs(monsterCombatStats(WORLD_MONSTERS[98]).aspd)>=600);
 for(const z of ZONES.filter(z=>z.min>50)){const mobs=WORLD_MONSTERS.filter(m=>m.map===z.id);for(let i=1;i<mobs.length;i++)for(const k of ['hp','atk','def','xp'])assert.ok(mobs[i][k]>=mobs[i-1][k]);assert.ok(mobs.at(-1).hp>normalMonsterStats(z.max).hp);}
});
test('all new monsters have real names, cards, valid drops and nonempty sprite metadata; six equipment tiers reach 99',()=>{
 for(const m of WORLD_MONSTERS){assert.equal(SPECIES[m.id].name,m.name);assert.ok(CARDS[m.id]);assert.ok(m.drops.every(id=>ITEMS[id]));const art=worldMonsterArt(m.level);assert.ok(art);assert.ok(existsSync(new URL(`assets/${art.file}.${art.format}`,dist)),m.id);assert.ok(art.index>=0&&art.index<art.cols*art.rows);}
 assert.equal(worldMonsterArt(0),null);assert.equal(worldMonsterArt(100),null);assert.equal(gearTierForLevel(51),4);assert.equal(gearTierForLevel(71),5);assert.equal(gearTierForLevel(91),6);
});
test('actual encounter spawning uses every new zone and respects its range, capacity and sprite atlas',async()=>{
 const c=await app(),a=c.api;for(const z of ZONES.filter(z=>z.min>50))for(const level of [1,z.min,z.max,99]){const p=a.normalize(a.fresh('世界驗證','archer'));p.location=z.id;p.level=level;a.setup(p);c.rand=(lo,hi)=>hi;for(let i=0;i<6;i++)a.addEncounter(100+i);assert.equal(a.state().enemies.length,4);for(const e of a.state().enemies){assert.equal(e.map,z.id);assert.ok(e.level>=z.min&&e.level<=z.max);assert.match(a.spriteHtml(e.id,'monster'),new RegExp(`monsters-${z.id}`));}}
});
test('level 99 loot awards tier VI gear and top evolution material; new-zone saves remain valid on normalization',async()=>{
 const c=await app(),a=c.api,p=a.normalize(a.fresh('高階掉落','mage'));p.level=99;p.location='celestial';a.setup(p);c.rand=(lo,hi)=>hi;a.addEncounter();const enemy=a.state().enemy;assert.equal(enemy.level,99);enemy.hp=0;c.Math.random=()=>0;a.award();assert.ok(p.bag.some(e=>e.id==='essence_4'));const gear=p.bag.filter(e=>e.uid);assert.equal(gear.length,1);for(const g of gear){assert.equal(g.level,99);assert.equal(g.tier,6);}assert.equal(a.normalize(p).location,'celestial');
});
