import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import vm from 'node:vm';
import {gearHasStat,gearJobCompatible,matchesGearFilters} from '../dist/inventory-rules.js';
import {GEAR_BASE,PET_GEAR_BASE} from '../dist/loot.js';
const root=new URL('../dist/',import.meta.url),defaults={rarity:'all',tier:'all',slot:'all',stat:'all',job:'all'};
test('ATK/MATK filters include real base stats and affixes, and combine with rarity/tier/slot',()=>{
 const staff={id:'oneStaff',rarity:'rare',level:25,affixes:{matk:8}},sword={id:'blade',rarity:'rare',level:25,affixes:{atk:8}},ring={id:'ring',affixes:{}},armor={id:'vest',affixes:{matk:4}};
 assert.ok(gearHasStat(staff,GEAR_BASE.oneStaff,'matk'));assert.ok(!gearHasStat(staff,GEAR_BASE.oneStaff,'atk'));assert.ok(gearHasStat(sword,GEAR_BASE.blade,'atk'));assert.ok(gearHasStat(ring,GEAR_BASE.ring,'matk'));assert.ok(gearHasStat(armor,GEAR_BASE.vest,'matk'));
 assert.ok(matchesGearFilters(staff,GEAR_BASE.oneStaff,{...defaults,rarity:'rare',tier:'2',slot:'rightHand',stat:'matk',job:'usable'},'mage',2));
 for(const f of [{stat:'atk'},{rarity:'common'},{tier:'1'},{slot:'armor'},{job:'unusable'}])assert.ok(!matchesGearFilters(staff,GEAR_BASE.oneStaff,{...defaults,...f},'mage',2));
});
test('class eligibility includes universal gear, excludes other classes, and leaves pet gear independent',()=>{
 assert.ok(gearJobCompatible(GEAR_BASE.oneStaff,'mage'));assert.ok(!gearJobCompatible(GEAR_BASE.oneStaff,'swordsman'));assert.ok(gearJobCompatible(GEAR_BASE.vest,'mage'));
 assert.ok(matchesGearFilters({id:'oneStaff'},GEAR_BASE.oneStaff,{...defaults,job:'unusable'},'swordsman',1));
 assert.ok(matchesGearFilters({id:'petCirclet',affixes:{matk:3}},PET_GEAR_BASE.petCirclet,{...defaults,job:'unusable',stat:'matk'},'mage',1));
});
async function app(){let source=readFileSync(new URL('game.js',root),'utf8'),context={console,document:{getElementById:()=>({})},localStorage:{setItem:()=>{}}};
 for(const match of source.matchAll(/^import \{([^}]+)\} from '([^']+)';$/gm)){const module=await import(new URL(match[2],root));for(const name of match[1].split(',').map(n=>n.trim())){const[original,alias]=name.split(/\s+as\s+/);context[alias||original]=module[original];}}
 source=source.replace(/^import .*;\n/gm,'').replace(/\ninit\(\);\s*$/,'\nglobalThis.api={fresh,normalize,setPlayer:p=>player=p,gearComparison,equippedCardDisplay,dismantle,renderBag,setCategory:c=>bagCategory=c};render=()=>{};message=()=>{};toast=()=>{};save=()=>{};');vm.createContext(context);vm.runInContext(source,context);return context;
}
test('player and pet comparisons include MATK, always show ATK/MATK even when unchanged, and restore equipped gear',async()=>{
 const c=await app(),a=c.api,p=a.normalize(a.fresh('比較測試','mage'));a.setPlayer(p);
 const staff={id:'oneStaff',uid:'new-staff',level:1,rarity:'common',affixes:{matk:10}};const snapshot=JSON.stringify({gear:p.gear,sockets:p.sockets});assert.match(a.gearComparison(staff),/魔法攻擊/);assert.equal(JSON.stringify({gear:p.gear,sockets:p.sockets}),snapshot);
 const neutral=a.gearComparison({id:'helm',uid:'helm',affixes:{def:1}});assert.match(neutral,/物理攻擊/);assert.match(neutral,/魔法攻擊/);assert.match(neutral,/±0/);
 const pet=c.makePet('wisp');p.pets=[pet];p.activePetId=pet.id;const petBefore=JSON.stringify(pet.gear);assert.match(a.gearComparison({id:'petCirclet',uid:'circlet',affixes:{matk:5}}),/魔法攻擊/);assert.equal(JSON.stringify(pet.gear),petBefore);
});
test('equipment comparison localizes labels and previews capped mitigation and pet special affixes without mutations',async()=>{
 const c=await app(),a=c.api,p=a.normalize(a.fresh('減傷比較','mage'));a.setPlayer(p);
 const armor={id:'vest',uid:'mitigation-preview',level:1,rarity:'mythic',affixes:{damageReduction:25,hpPct:5}};
 const original=JSON.stringify(p.gear),preview=a.gearComparison(armor);
 assert.match(preview,/最終減傷/);assert.match(preview,/25%/);assert.match(preview,/個百分點/);assert.match(preview,/生命值/);assert.doesNotMatch(preview,/>HP</);
 assert.equal(JSON.stringify(p.gear),original);
 const pet=c.makePet('wisp');p.pets=[pet];p.activePetId=pet.id;
 const petOriginal=JSON.stringify(pet.gear),petPreview=a.gearComparison({id:'petArmor',uid:'pet-preview',level:1,rarity:'mythic',affixes:{damageReduction:12,critDmg:8,ignoreDef:5}});
 assert.match(petPreview,/最終減傷/);assert.match(petPreview,/暴擊傷害/);assert.match(petPreview,/無視防禦/);
 assert.equal(JSON.stringify(pet.gear),petOriginal);
});
test('character equipment highlights installed cards separately with a boss distinction and retains removal action',async()=>{
 const c=await app(),a=c.api,p=a.normalize(a.fresh('卡片外觀','mage'));a.setPlayer(p);
 assert.match(a.equippedCardDisplay('rightHand'),/卡片插槽 · 尚未鑲嵌/);
 const cardId=Object.keys(c.CARDS).find(id=>c.CARDS[id].boss&&c.CARDS[id].slots.includes('rightHand'));
 assert.ok(cardId);
 p.sockets.rightHand=cardId;
 const html=a.equippedCardDisplay('rightHand');
 assert.match(html,/equipped-card-boss/);assert.match(html,/首領卡片/);
 assert.match(html,/卸下卡片/);assert.match(html,/換裝保留/);
 assert.match(html,new RegExp(c.CARDS[cardId].name));
});
test('manual dismantle finds exact UID after bag reorder; character and pet equipment buttons are present; worn gear stays untouched',async()=>{
 const c=await app(),a=c.api,p=a.normalize(a.fresh('分解測試','mage'));a.setPlayer(p);const kept={id:'oneStaff',uid:'worn',level:1,rarity:'common',affixes:{matk:1}},target={id:'blade',uid:'target',level:1,rarity:'rare',affixes:{atk:8}},other={id:'ring',uid:'other',level:1,rarity:'common',affixes:{matk:1}};p.gear.rightHand=kept;p.bag=[other,{id:'red_small',qty:2},target,{id:'petCirclet',uid:'petgear',level:1,rarity:'common',affixes:{matk:5}}];
 a.setCategory('equipment');assert.match(a.renderBag(),/data-dismantle="target"[^>]*>手動分解/);a.setCategory('petEquipment');assert.match(a.renderBag(),/data-dismantle="petgear"[^>]*>手動分解/);
 p.bag.reverse();a.dismantle('target');assert.ok(!p.bag.some(g=>g.uid==='target'));assert.ok(p.bag.some(g=>g.uid==='other'));assert.equal(p.gear.rightHand,kept);assert.ok(p.bag.some(g=>g.id==='shard_weapon_1'&&g.qty>0));
 const snapshot=JSON.stringify(p.bag);a.dismantle('missing');a.dismantle('worn');assert.equal(JSON.stringify(p.bag),snapshot);
});

test('live bag keeps canonical descriptions for all seven starforge ranks and four dawn materials',async()=>{
 const c=await app(),a=c.api,p=a.normalize(a.fresh('素材說明','mage'));a.setPlayer(p);
 const {ENHANCEMENT_ITEMS,DAWN_ITEMS}=await import('../dist/sky-trials.js');
 for(const [category,items] of [['enhancements',ENHANCEMENT_ITEMS],['dawnJunk',DAWN_ITEMS]]){
  p.bag=Object.keys(items).map(id=>({id,qty:2}));const before=JSON.stringify(p.bag);a.setCategory(category);const html=a.renderBag();
  assert.doesNotMatch(html,/undefined|null/);
  for(const [id,item] of Object.entries(items)){assert.equal(c.ITEMS[id].description,item.description,id+' must retain catalog description');assert.ok(html.includes(item.description),id+' description must be visible');assert.equal(c.ITEMS[id].cost,item.cost);assert.equal(c.ITEMS[id].map,item.map);}
  assert.equal(JSON.stringify(p.bag),before,'rendering must preserve quantities');
 }
});
