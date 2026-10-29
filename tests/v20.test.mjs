import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';import {readFileSync} from 'node:fs';
import {playerRange,companionRange,monsterTargetWeights,chooseMonsterTarget} from '../dist/formation.js';
import {CHARACTER_SLOT_COUNT,characterSlotKey,readCharacterSlot,writeCharacterSlot,readCharacterSlots,migrateLegacyCharacter} from '../dist/character-slots.js';
import {normalizeFusionSettings,fusionStatsFor,fusionTargetMatches,fuseOne} from '../dist/fusion.js';
import {shouldAutoSalvage} from '../dist/salvage-rules.js';
class MemoryStorage{constructor(){this.data=new Map()}getItem(k){return this.data.get(k)??null}setItem(k,v){this.data.set(k,String(v))}removeItem(k){this.data.delete(k)}}
const identity=p=>p,validSimple=p=>p&&typeof p.name==='string';
test('ranged classes and pets are mapped as requested; front line has higher weight but rear remains attackable',()=>{
 for(const job of ['mage','acolyte','archer'])assert.equal(playerRange(job),'ranged');for(const job of ['swordsman','thief'])assert.equal(playerRange(job),'melee');
 for(const role of ['magic','support'])assert.equal(companionRange(role),'ranged');for(const role of ['attack','defense'])assert.equal(companionRange(role),'melee');
 const p={job:'thief',hp:100},pet={hp:100};let counts={player:0,pet:0};for(let i=0;i<1000;i++)counts[chooseMonsterTarget(p,pet,'magic',false,()=>i/1000)]++;assert.deepEqual(counts,{player:800,pet:200});
 counts={player:0,pet:0};for(let i=0;i<1000;i++)counts[chooseMonsterTarget({...p,job:'mage'},pet,'attack',false,()=>i/1000)]++;assert.deepEqual(counts,{player:200,pet:800});
 assert.equal(chooseMonsterTarget({...p,job:'mage'},null,null,false,()=>.99),'player');assert.equal(monsterTargetWeights({...p,job:'mage'},pet,'support')[1].weight,1);
 assert.equal(monsterTargetWeights(p,pet,'defense',true)[1].weight,12);assert.equal(monsterTargetWeights(p,pet,'defense',false)[1].weight,6);assert.equal(chooseMonsterTarget(p,{hp:0},'defense',true,()=>.99),'player');assert.equal(chooseMonsterTarget({hp:0},null),null);
});
test('four independent slot keys preserve legacy save once and never resurrect an intentionally emptied slot',()=>{
 const storage=new MemoryStorage(),legacy={name:'原角色',gold:123,pets:[{name:'舊寵物'}]};storage.setItem('icarus-prototype-v02',JSON.stringify({version:2,player:legacy}));assert.ok(migrateLegacyCharacter(storage,legacy));assert.equal(CHARACTER_SLOT_COUNT,4);assert.equal(readCharacterSlot(storage,0,identity,validSimple).player.gold,123);assert.ok(storage.getItem('icarus-prototype-v02'));
 for(let i=1;i<4;i++)writeCharacterSlot(storage,i,{name:'角色'+i,gold:i,pets:[]});const before=storage.getItem(characterSlotKey(0));const second=readCharacterSlot(storage,1,identity,validSimple).player;second.gold=77;writeCharacterSlot(storage,1,second);assert.equal(storage.getItem(characterSlotKey(0)),before);assert.equal(readCharacterSlot(storage,2,identity,validSimple).player.gold,2);
 assert.equal(readCharacterSlots(storage,identity,validSimple).filter(s=>s.player).length,4);assert.throws(()=>writeCharacterSlot(storage,4,legacy));assert.throws(()=>characterSlotKey(-1));
 storage.removeItem(characterSlotKey(0));assert.equal(migrateLegacyCharacter(storage,legacy),false);assert.equal(storage.getItem(characterSlotKey(0)),null);
});
test('existing or corrupted slots are not overwritten by migration; corrupt reads preserve raw bytes',()=>{
 const storage=new MemoryStorage();storage.setItem(characterSlotKey(0),'corrupt');assert.equal(migrateLegacyCharacter(storage,{name:'old'}),false);assert.ok(readCharacterSlot(storage,0,identity,validSimple).error);assert.equal(storage.getItem(characterSlotKey(0)),'corrupt');
 const json=JSON.stringify({version:2,player:{name:'導入角色',bag:[{id:'x'}]}});writeCharacterSlot(storage,2,JSON.parse(json).player);assert.equal(readCharacterSlot(storage,2,identity,validSimple).player.name,'導入角色');assert.equal(storage.getItem(characterSlotKey(0)),'corrupt');
});
test('fusion consumes exactly eight shards of selected tier, respects rolled affixes and rarity, and stays within level range',()=>{
 const p={bag:[{id:'shard_weapon_3',qty:16},{id:'shard_weapon_2',qty:999}]},config={tier:3,base:'oneStaff',stat:'matk',minimum:9,rarity:'rare'};let observed;
 const result=fuseOne(p,config,{rng:()=>.99999,roller:(id,level)=>(observed={id,level},{id,level,uid:'matched',rarity:'rare',affixes:{matk:9}})});assert.equal(observed.id,'oneStaff');assert.equal(observed.level,50);assert.equal(result.matched,true);assert.equal(p.bag.find(e=>e.id==='shard_weapon_3').qty,8);assert.equal(p.bag.find(e=>e.id==='shard_weapon_2').qty,999);
 assert.equal(fusionTargetMatches({rarity:'rare',affixes:{matk:8}},config),false);assert.equal(fusionTargetMatches({rarity:'common',affixes:{matk:90}},config),false);assert.equal(fusionTargetMatches({rarity:'mythic',affixes:{atk:90}},config),false);
 const snapshot=JSON.stringify(p.bag);assert.ok(fuseOne(p,config,{roller:()=>null}).error);assert.equal(JSON.stringify(p.bag),snapshot);assert.ok(fuseOne({bag:[]},config).error);
 const last=fuseOne({bag:[{id:'shard_armor_6',qty:8}]},{tier:6,base:'petCirclet',stat:'any'},{rng:()=>1,roller:(id,level)=>({id,level,uid:'pet',rarity:'common',affixes:{}})});assert.equal(last.gear.level,99);assert.equal(normalizeFusionSettings(null).tier,1);
});
const dist=new URL('../dist/',import.meta.url);
async function app(){const nodes=new Map(),context={console,localStorage:new MemoryStorage(),window:{scrollTo:()=>{}},document:{getElementById:id=>{if(!nodes.has(id))nodes.set(id,{style:{},hidden:false,textContent:'',innerHTML:'',inert:false});return nodes.get(id)}},confirm:()=>true};context.Math=Object.create(Math);
 let source=readFileSync(new URL('game.js',dist),'utf8');for(const match of source.matchAll(/^import \{([^}]+)\} from '([^']+)';$/gm)){const module=await import(new URL(match[2],dist));for(const name of match[1].split(',').map(n=>n.trim()))context[name]=module[name];}
 source=source.replace(/^import .*;\n/gm,'').replace(/\ninit\(\);\s*$/,'\nglobalThis.api={fresh,normalize,valid,enterCharacterSlot,returnToEntry,importSave,enemyAttack,startAutoFusion,autoFusionTick,runtime:()=>({player,activeSlot,gameRunning,autoFusionRunning,autoFusionAttempts}),setImportTarget:i=>importTargetSlot=i,setEnemy:e=>enemy=e};render=()=>{};renderSide=()=>{};renderEntry=()=>{};message=()=>{};toast=()=>{};spawn=()=>{globalThis.spawnCount=(globalThis.spawnCount||0)+1};showFusionResult=()=>{globalThis.resultShown=true};');vm.createContext(context);vm.runInContext(source,context);return context;
}
test('selecting/creating/importing saves does not start play; explicit entry and return isolate all progress',async()=>{
 const c=await app(),a=c.api;for(let i=0;i<4;i++)writeCharacterSlot(c.localStorage,i,a.normalize(a.fresh('角色'+i,i===1?'mage':'swordsman')));assert.equal(a.runtime().gameRunning,false);assert.equal(a.runtime().player,null);assert.equal(c.spawnCount,undefined);
 a.enterCharacterSlot(1);assert.equal(a.runtime().activeSlot,1);assert.equal(a.runtime().gameRunning,true);a.runtime().player.gold=777;a.returnToEntry();assert.equal(a.runtime().gameRunning,false);assert.equal(a.runtime().player,null);assert.equal(readCharacterSlot(c.localStorage,1,a.normalize,a.valid).player.gold,777);assert.equal(readCharacterSlot(c.localStorage,0,a.normalize,a.valid).player.gold,90);
 const candidate=a.normalize(a.fresh('導入第四格','archer'));a.setImportTarget(3);await a.importSave({size:100,text:async()=>JSON.stringify({version:2,player:candidate})});assert.equal(a.runtime().gameRunning,false);assert.equal(readCharacterSlot(c.localStorage,3,a.normalize,a.valid).player.name,'導入第四格');assert.equal(readCharacterSlot(c.localStorage,1,a.normalize,a.valid).player.gold,777);
 const before=c.localStorage.getItem(characterSlotKey(3));a.setImportTarget(3);await a.importSave({size:50,text:async()=>'invalid'});assert.equal(c.localStorage.getItem(characterSlotKey(3)),before);
});
test('auto fusion stops on first target, displays result, protects target from auto salvage, and does not run in entry screen',async()=>{
 const c=await app(),a=c.api,p=a.normalize(a.fresh('融合測試','mage'));p.location='town';p.bag=[{id:'shard_weapon_3',qty:24}];p.fusionSettings={tier:3,base:'oneStaff',stat:'matk',minimum:7,rarity:'rare',limit:10};writeCharacterSlot(c.localStorage,0,p);a.enterCharacterSlot(0);
 const original=c.fuseOne;c.fuseOne=(player,settings)=>original(player,settings,{roller:(id,level)=>({id,level,uid:'target',rarity:'rare',name:'稀有法杖',affixes:{matk:7}})});a.startAutoFusion();a.autoFusionTick(1000);const state=a.runtime();assert.equal(state.autoFusionRunning,false);assert.equal(state.autoFusionAttempts,1);assert.equal(c.resultShown,true);assert.equal(state.player.bag.find(e=>e.id==='shard_weapon_3').qty,16);assert.ok(state.player.bag.find(e=>e.uid==='target').fusionMatch);
 assert.equal(shouldAutoSalvage(state.player.bag.find(e=>e.uid==='target'),{autoSalvage:true,keepRarity:true,salvageMaxRarity:'mythic'}),false);a.autoFusionTick(2000);assert.equal(state.player.bag.find(e=>e.id==='shard_weapon_3').qty,16);a.returnToEntry();a.autoFusionTick(9999);assert.equal(a.runtime().gameRunning,false);
});
test('auto fusion has finite attempts and material stops, and actual ranged unit can take monster damage',async()=>{
 const c=await app(),a=c.api,p=a.normalize(a.fresh('遠程測試','mage'));p.location='town';p.bag=[{id:'shard_weapon_1',qty:24}];p.fusionSettings={tier:1,base:'oneStaff',stat:'matk',minimum:9999,rarity:'any',limit:2};writeCharacterSlot(c.localStorage,0,p);a.enterCharacterSlot(0);a.startAutoFusion();a.autoFusionTick(1000);a.autoFusionTick(1650);assert.equal(a.runtime().autoFusionRunning,false);assert.equal(a.runtime().autoFusionAttempts,2);assert.equal(a.runtime().player.bag.find(e=>e.id==='shard_weapon_1').qty,8);assert.equal(c.resultShown,undefined);
 const pet=c.makePet('fang');a.runtime().player.pets=[pet];a.runtime().player.activePetId=pet.id;const hp=a.runtime().player.hp,petHp=pet.hp;c.Math.random=()=>.1;const choose=c.chooseMonsterTarget;c.chooseMonsterTarget=(...args)=>choose(...args,()=>.1);a.setEnemy({id:'world_1',hp:1000,atk:30,hit:999,level:1});a.enemyAttack();assert.ok(a.runtime().player.hp<hp);assert.equal(pet.hp,petHp);
});
test('returning to entry mid-fusion stops further material use; in-game import never overwrites replacement with old state',async()=>{
 const c=await app(),a=c.api,p=a.normalize(a.fresh('原角色','mage'));p.location='town';p.bag=[{id:'shard_weapon_1',qty:24}];p.fusionSettings={tier:1,base:'oneStaff',stat:'matk',minimum:9999,rarity:'any',limit:10};writeCharacterSlot(c.localStorage,0,p);a.enterCharacterSlot(0);a.startAutoFusion();a.autoFusionTick(1000);assert.equal(a.runtime().autoFusionRunning,true);a.returnToEntry();const saved=c.localStorage.getItem(characterSlotKey(0));a.autoFusionTick(99999);assert.equal(c.localStorage.getItem(characterSlotKey(0)),saved);
 a.enterCharacterSlot(0);const replacement=a.normalize(a.fresh('覆蓋的新角色','archer'));replacement.gold=4321;a.setImportTarget(0);await a.importSave({size:123,text:async()=>JSON.stringify({version:2,player:replacement})});assert.equal(a.runtime().gameRunning,false);const restored=readCharacterSlot(c.localStorage,0,a.normalize,a.valid).player;assert.equal(restored.name,'覆蓋的新角色');assert.equal(restored.gold,4321);
});

test('fusion attribute options only include affixes that the chosen equipment can roll',()=>{
 assert.ok(fusionStatsFor('oneStaff').includes('matk'));assert.ok(!fusionStatsFor('oneStaff').includes('atk'));assert.ok(fusionStatsFor('blade').includes('atk'));assert.ok(!fusionStatsFor('blade').includes('matk'));assert.ok(fusionStatsFor('petArmor').includes('hp'));assert.ok(fusionStatsFor('petCirclet').includes('matk'));assert.ok(fusionStatsFor('vest').includes('hpPct'));assert.equal(normalizeFusionSettings({base:'oneStaff',stat:'atk'}).stat,'matk');
});
