import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import vm from 'node:vm';
import {PET_ROUTES,PET_FAMILIES,PET_MUTATIONS,petRoute,petForm,petArt,evolveCompanion,synthesizeEssence} from '../dist/pet-evolution.js';
import {PET_RARITIES,PET_EVOLUTIONS,makePet,petStats} from '../dist/catalog.js';
const root=new URL('../dist/',import.meta.url);
test('all four fixed families retain their full routes; five rarities map to the correct independent art',()=>{
 assert.equal(PET_RARITIES.length,5);assert.equal(PET_RARITIES.reduce((n,r)=>n+r.weight,0),1000);
 for(const [species,role] of Object.entries(PET_FAMILIES))for(let stage=0;stage<5;stage++){
  const p={species,evolution:stage,level:99};assert.equal(petForm(p),PET_ROUTES[role][stage]);
  for(const rarity of PET_RARITIES){const art=petArt({...p,rarity:rarity.id});assert.ok(existsSync(new URL(art,root)),art);}
  assert.notEqual(petArt({...p,rarity:'common'}),petArt({...p,rarity:'uncommon'}));assert.notEqual(petArt({...p,rarity:'common'}),petArt({...p,rarity:'rare'}));assert.notEqual(petArt({...p,rarity:'rare'}),petArt({...p,rarity:'uncommon'}));
  assert.notEqual(petArt({...p,rarity:'legendary'}),petArt({...p,rarity:'mythic'}));
 }
 assert.ok(PET_ROUTES.attack.every(n=>n.includes('狼')));
 assert.ok(PET_ROUTES.defense.every(n=>n.includes('龜')));
 assert.equal(petForm({species:'fang',evolution:0,level:80}),'火狼幼獸');
});
test('all four evolutions consume exactly the required material and preserve identity, nickname, IVs, gear, skills and XP',()=>{
 const p=makePet('fang');Object.assign(p,{level:80,rarity:'common',nickname:'我的狼',xp:123,equippedSkills:['bleed','fang']});
 const snapshot=structuredClone(p),bag=PET_EVOLUTIONS.map(s=>({id:s.id,qty:s.count+1}));
 for(let i=0;i<4;i++){const before=petStats(p).atk,r=evolveCompanion(p,bag,'town',PET_EVOLUTIONS,PET_RARITIES,()=>.999);assert.ok(!r.error);assert.equal(p.evolution,i+1);assert.equal(bag[i].qty,1);assert.ok(petStats(p).atk>before);}
 assert.equal(p.rarity,'mythic');assert.equal(petForm(p),'終焉龍神');
 for(const key of ['id','nickname','iv','gear','equippedSkills','xp','level','species'])assert.deepEqual(p[key],snapshot[key]);
 const copy=JSON.stringify({p,bag});assert.ok(evolveCompanion(p,bag,'town',PET_EVOLUTIONS,PET_RARITIES).error);assert.equal(JSON.stringify({p,bag}),copy);
});
test('evolution rejects out of town, low level and missing material without mutations; mythic never changes',()=>{
 for(const [location,level,count] of [['forest',20,8],['town',19,8],['town',20,7]]){
  const p={...makePet('shell'),level},bag=[{id:'essence_1',qty:count}],copy=JSON.stringify({p,bag});
  assert.ok(evolveCompanion(p,bag,location,PET_EVOLUTIONS,PET_RARITIES).error);assert.equal(JSON.stringify({p,bag}),copy);
 }
 const p={...makePet('wisp'),level:20,rarity:'mythic'},bag=[{id:'essence_1',qty:8}];evolveCompanion(p,bag,'town',PET_EVOLUTIONS,PET_RARITIES,()=>0);assert.equal(p.rarity,'mythic');assert.equal(bag.length,0);
 const q={...makePet('sprout'),level:20,rarity:'common'};evolveCompanion(q,[{id:'essence_1',qty:8}],'town',PET_EVOLUTIONS,PET_RARITIES,()=>.5);assert.equal(q.rarity,'common');
});
test('3:1 synthesis makes the final evolution material reachable with existing maps, and enforces location and quantity',()=>{
 const bag=[{id:'essence_3',qty:60}];for(let i=0;i<20;i++)assert.equal(synthesizeEssence(bag,3,'town').id,'essence_4');assert.deepEqual(bag,[{id:'essence_4',qty:20}]);
 for(const [tier,location] of [[4,'town'],[0,'town'],[2,'forest'],[1,'town']]){const copy=JSON.stringify(bag);assert.ok(synthesizeEssence(bag,tier,location).error);assert.equal(JSON.stringify(bag),copy);}
});
test('V1.4 save migrates without losing pet evolution, mythic rarity, nickname, items or XP; roundtrip valid',async()=>{
 let source=readFileSync(new URL('game.js',root),'utf8'),context={console,document:{getElementById:()=>null}};
 const imports=[...source.matchAll(/^import \{([^}]+)\} from '([^']+)';$/gm)];
 for(const match of imports){const module=await import(new URL(match[2],root));for(const name of match[1].split(',').map(n=>n.trim()))context[name]=module[name];}
 source=source.replace(/^import .*;\n/gm,'').replace(/\ninit\(\);\s*$/,'\nglobalThis.api={fresh,normalize,valid};');
 context.canEncounterBoss=()=>false;vm.createContext(context);vm.runInContext(source,context);
 const p=context.api.fresh('存檔測試','swordsman'),pet=makePet('fang');Object.assign(pet,{nickname:'赤牙自訂',level:80,xp:321,evolution:3,rarity:'mythic'});p.pets=[pet];p.activePetId=pet.id;p.version=14;p.bag.push({id:'essence_4',qty:20});
 const q=context.api.normalize(JSON.parse(JSON.stringify(p)));assert.ok(context.api.valid(q));assert.equal(q.pets[0].evolution,3);assert.equal(q.pets[0].rarity,'mythic');assert.equal(q.pets[0].nickname,'赤牙自訂');assert.equal(q.pets[0].xp,321);assert.ok(q.bag.some(e=>e.id==='essence_4'&&e.qty===20));assert.equal(petForm(q.pets[0]),'滅世龍王');assert.ok(context.api.valid(context.api.normalize(JSON.parse(JSON.stringify(q)))));
});
test('continuous encounters spawn while another enemy remains, obey capacity, do not spawn in town, and do not reward twice',async()=>{
 let source=readFileSync(new URL('game.js',root),'utf8'),context={console,document:{getElementById:()=>({innerHTML:'',scrollHeight:0,scrollTop:0})},localStorage:{setItem:()=>{}},Date};
 for(const match of source.matchAll(/^import \{([^}]+)\} from '([^']+)';$/gm)){const module=await import(new URL(match[2],root));for(const name of match[1].split(',').map(n=>n.trim()))context[name]=module[name];}
 source=source.replace(/^import .*;\n/gm,'').replace(/\ninit\(\);\s*$/,'\nglobalThis.api={fresh,normalize,setPlayer:p=>player=p,setEnemy:e=>enemy=e,enemies:()=>enemies,setNext:n=>{nextEncounterAt=n;encounterSlots=Array.from({length:encounterLimit(player.location)},()=>n);},tickEncounters,addEncounter,award,rawStat,stat};render=()=>{};message=()=>{};');
 context.canEncounterBoss=()=>false;vm.createContext(context);vm.runInContext(source,context);const a=context.api,p=a.normalize(a.fresh('遭遇測試','swordsman'));p.location='starter';a.setPlayer(p);
 a.addEncounter(100);const first=a.enemies()[0];a.setNext(101);a.tickEncounters(101);assert.equal(a.enemies().length,2);assert.equal(a.enemies()[0],first);assert.ok(first.hp>0);
 for(let n=0;n<10;n++){a.setNext(n);a.tickEncounters(102+n);}assert.equal(a.enemies().length,2);
 const dead=a.enemies()[0];dead.hp=0;a.setEnemy(dead);a.award();assert.equal(a.enemies().length,1);const kills=p.kills;a.setEnemy(dead);a.award();assert.equal(p.kills,kills);
 a.setNext(0);a.tickEncounters(5000);assert.equal(a.enemies().length,2);assert.ok(a.enemies().includes(first)||first===dead);
 p.location='town';a.setNext(0);a.tickEncounters(6000);assert.equal(a.enemies().length,2);
 p.sockets.rightHand='fang';assert.equal(a.stat('atk'),Math.round(a.rawStat('atk')*1.04));
});
test('priority chooses absolute lowest HP or longest present, excludes dead, breaks HP ties by age',async()=>{
 const {selectEncounterTarget}=await import('../dist/encounter-rules.js');
 const old={hp:90,maxHp:100,appearedAt:10},low={hp:25,maxHp:30,appearedAt:20},dead={hp:0,appearedAt:1};
 assert.equal(selectEncounterTarget([dead,old,low],'lowestHp'),low);assert.equal(selectEncounterTarget([dead,low,old],'oldest'),old);
 const tie={hp:25,appearedAt:5};assert.equal(selectEncounterTarget([low,tie],'lowestHp'),tie);assert.equal(selectEncounterTarget([low,old],'manual',old),old);assert.equal(selectEncounterTarget([dead]),null);
});

test('legendary and mythic mutations have forty unique names independent from normal routes; rarity transitions update name and art without resetting the pet',()=>{
 const all=Object.values(PET_MUTATIONS).flatMap(roles=>Object.values(roles).flat());assert.equal(all.length,40);assert.equal(new Set(all).size,40);
 for(const [species,role] of Object.entries(PET_FAMILIES))for(let stage=0;stage<5;stage++){
  const p={species,evolution:stage};assert.equal(petForm({...p,rarity:'rare'}),PET_ROUTES[role][stage]);
  assert.equal(petForm({...p,rarity:'legendary'}),PET_MUTATIONS.legendary[role][stage]);
  assert.equal(petForm({...p,rarity:'mythic'}),PET_MUTATIONS.mythic[role][stage]);
  assert.notEqual(petForm({...p,rarity:'legendary'}),petForm({...p,rarity:'mythic'}));
  assert.equal(petForm(p,stage,'mythic'),PET_MUTATIONS.mythic[role][stage]);
 }
 const p={...makePet('fang'),level:80,rarity:'uncommon',evolution:2,nickname:'我的夥伴'};const old=structuredClone(p);
 evolveCompanion(p,[{id:'essence_3',qty:16}],'town',PET_EVOLUTIONS,PET_RARITIES,()=>.85);assert.equal(petForm(p),'聖翼獅鷲王');
 evolveCompanion(p,[{id:'essence_4',qty:20}],'town',PET_EVOLUTIONS,PET_RARITIES,()=>.999);assert.equal(petForm(p),'終焉龍神');
 for(const key of ['nickname','species','id','level','iv','gear'])assert.deepEqual(p[key],old[key]);
});

test('rare and uncommon use material-aware per-species images with identical species names and no global hue filter',()=>{
 const css=readFileSync(new URL('pet-evolution.css',root),'utf8');assert.ok(!css.includes('hue-rotate'));
 for(const species of Object.keys(PET_FAMILIES))for(let stage=0;stage<5;stage++){
  const p={species,evolution:stage};const normal=petForm({...p,rarity:'common'});
  for(const rarity of ['rare','uncommon']){assert.equal(petForm({...p,rarity}),normal);assert.match(petArt({...p,rarity}),new RegExp(`palette-v19-${rarity}`));}
 }
});
