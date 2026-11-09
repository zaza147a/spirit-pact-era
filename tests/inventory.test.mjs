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
 source=source.replace(/^import .*;\n/gm,'').replace(/\ninit\(\);\s*$/,'\nglobalThis.api={fresh,normalize,setPlayer:p=>player=p,gearComparison,cardComparison,equippedCardDisplay,dismantle,renderBag,setCategory:c=>bagCategory=c,setPage:n=>bagGearPage=n};render=()=>{};message=()=>{};toast=()=>{};save=()=>{};');vm.createContext(context);vm.runInContext(source,context);return context;
}
test('new comparisons identify source and candidate unambiguously and highlight the direction of changes',async()=>{
 const c=await app(),a=c.api,p=a.normalize(a.fresh('直覺對比','mage'));a.setPlayer(p);
 const oldGear=p.gear.rightHand,preview=a.gearComparison({id:'oneStaff',name:'候選法杖',uid:'test-new',level:1,rarity:'legendary',affixes:{matk:80,INT:9}});
 assert.match(preview,/目前穿戴/);assert.match(preview,/準備穿戴/);assert.match(preview,/候選法杖/);assert.match(preview,/能力取捨/);assert.match(preview,/本職業重點/);assert.match(preview,/data-compare-content="all"/);assert.match(preview,/compare-quick-item/);assert.doesNotMatch(preview,/compare-inline-title|compare-stat|<details class="compare-details"/);
 assert.equal(p.gear.rightHand,oldGear);
 const slot='rightHand',bossId=Object.keys(c.CARDS).find(id=>c.CARDS[id].boss&&c.CARDS[id].slots.includes(slot));
 const regularId=Object.keys(c.CARDS).find(id=>!c.CARDS[id].boss&&c.CARDS[id].slots.includes(slot));
 p.sockets[slot]=regularId;
 const card=a.cardComparison(bossId,slot);
 assert.ok(card.indexOf(c.CARDS[regularId].name)<card.indexOf(c.CARDS[bossId].name));
 assert.match(card,/目前鑲嵌 · 將卸下/);assert.match(card,/背包候選 · 將鑲入/);assert.match(card,/基本能力差異/);assert.match(card,/特殊觸發/);
 assert.equal(p.sockets[slot],regularId);
});
test('player and pet comparisons include changed MATK, omit unchanged ATK/MATK, and restore equipped gear',async()=>{
 const c=await app(),a=c.api,p=a.normalize(a.fresh('比較測試','mage'));a.setPlayer(p);
 const staff={id:'oneStaff',uid:'new-staff',level:1,rarity:'common',affixes:{matk:10}};const snapshot=JSON.stringify({gear:p.gear,sockets:p.sockets});assert.match(a.gearComparison(staff),/魔法攻擊/);assert.equal(JSON.stringify({gear:p.gear,sockets:p.sockets}),snapshot);
 const neutral=a.gearComparison({id:'helm',uid:'helm',affixes:{def:1}});assert.match(neutral,/物理防禦/);assert.doesNotMatch(neutral,/物理攻擊|魔法攻擊|±0/);
 const pet=c.makePet('wisp');p.pets=[pet];p.activePetId=pet.id;const petBefore=JSON.stringify(pet.gear);assert.match(a.gearComparison({id:'petCirclet',uid:'circlet',affixes:{matk:5}}),/魔法攻擊/);assert.equal(JSON.stringify(pet.gear),petBefore);
});
test('comparison prioritizes the current job damage type, keeps mixed spell fist and exposes full details without mutating gear',async()=>{
 const c=await app(),a=c.api,p=a.normalize(a.fresh('職業相關比較','knight'));a.setPlayer(p);
 const worn=JSON.stringify(p.gear),sockets=JSON.stringify(p.sockets);
 const candidate={id:'helm',uid:'mixed-helm',level:200,rarity:'mythic',affixes:{STR:9,DEX:9,INT:9,matk:400,atk:400,damageReduction:4}};
 const character=a.gearComparison(candidate),focused=character.split('data-compare-content="all"')[0];
 assert.match(character,/本職業重點/);assert.match(character,/全部屬性/);
 assert.match(focused,/近距離物理傷害%/);assert.match(focused,/物理攻擊/);assert.match(focused,/最終減傷/);
 assert.doesNotMatch(focused,/魔法攻擊|魔法傷害%|遠距離物理傷害%/);
 assert.match(character,/魔法攻擊/);assert.match(character,/遠距離物理傷害%/);
 assert.equal(JSON.stringify(p.gear),worn);assert.equal(JSON.stringify(p.sockets),sockets);
 p.job='hunter';const ranged=a.gearComparison(candidate).split('data-compare-content="all"')[0];
 assert.match(ranged,/遠距離物理傷害%/);assert.doesNotMatch(ranged,/近距離物理傷害%|魔法傷害%/);
 p.job='wizard';const magic=a.gearComparison(candidate).split('data-compare-content="all"')[0];
 assert.match(magic,/魔法攻擊|魔法傷害%/);assert.doesNotMatch(magic,/遠距離物理傷害%|近距離物理傷害%/);
 p.job='sage';const hybrid=a.gearComparison(candidate).split('data-compare-content="all"')[0];
 assert.match(hybrid,/魔法攻擊/);assert.match(hybrid,/物理攻擊/);assert.match(hybrid,/近距離物理傷害%/);
});
test('comparison selection persists after rerender and pet mode stays visible',async()=>{
 const c=await app(),a=c.api,p=a.normalize(a.fresh('模式測試','knight'));a.setPlayer(p);
 const candidate={id:'helm',uid:'mode',level:200,rarity:'mythic',affixes:{INT:9,matk:200}};
 vm.runInContext("gearCompareMode='all'",c);
 const html=a.gearComparison(candidate);
 assert.match(html,/data-compare-mode="all" aria-pressed="true"/);
 assert.match(html,/data-compare-content="all" ><div/);
 assert.match(a.gearComparison(candidate),/data-compare-mode="all" aria-pressed="true"/);
 const pet=c.makePet('wisp');p.pets=[pet];p.activePetId=pet.id;
 assert.match(a.gearComparison({id:'petCirclet',uid:'pet-mode',affixes:{matk:5}}),/data-compare-content="relevant" ><div/);
});
test('equipment comparison localizes labels and previews capped mitigation and pet special affixes without mutations',async()=>{
 const c=await app(),a=c.api,p=a.normalize(a.fresh('減傷比較','mage'));a.setPlayer(p);
 const armor={id:'vest',uid:'mitigation-preview',level:1,rarity:'mythic',affixes:{damageReduction:25,hpPct:5}};
 const original=JSON.stringify(p.gear),preview=a.gearComparison(armor);
 assert.match(preview,/最終減傷/);assert.match(preview,/25 個百分點/);assert.match(preview,/生命值/);assert.doesNotMatch(preview,/>HP</);
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

test('large equipment bag renders only thirty comparisons while retaining original action indices',async()=>{
 const c=await app(),a=c.api,p=a.normalize(a.fresh('大量裝備','mage'));
 p.bag=Array.from({length:1200},(_,i)=>({id:'oneStaff',uid:`staff-${i}`,name:`測試杖-${i}`,level:1,rarity:'common',affixes:{matk:i%15+1}}));
 a.setPlayer(p);a.setCategory('equipment');a.setPage(0);
 const first=a.renderBag();
 assert.equal((first.match(/<section class="gear-compare /g)||[]).length,30);
 assert.match(first,/符合條件 1200 件/);
 assert.match(first,/data-use="0"/);
 assert.doesNotMatch(first,/data-use="30"/);
 a.setPage(1);const second=a.renderBag();
 assert.equal((second.match(/<section class="gear-compare /g)||[]).length,30);
 assert.match(second,/data-use="30"/);
 assert.doesNotMatch(second,/data-use="0"/);
 a.setPage(999);const last=a.renderBag();
 assert.match(last,/第 40\/40 頁/);
 assert.match(last,/data-use="1199"/);
 assert.equal(p.bag.length,1200,'paging does not mutate inventory');
});
