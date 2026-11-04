import assert from 'node:assert/strict';
import {shouldAutoSalvage} from '../dist/salvage-rules.js';
import {gearTier} from '../dist/loot.js';
import {BOSS_IDENTITIES,BOSS_SLOT_EFFECTS,CARD_PROFILES,CARD_SLOT_PROFILES,CARD_SLOT_ORDER,createWorldCards,socketCardBonus} from '../dist/card-effects.js';
import {cardDropChance} from '../dist/map-rules.js';
import {readFileSync} from 'node:fs';

// 傳說以上＋創世階以上：此案例用於防止把兩項門檻誤當作一項。
const settings={autoSalvage:true,keepRarity:true,salvageMaxRarity:'legendary',keepTier:true,salvageMaxTier:6,keepStat:false,salvageMatchMode:'all',job:'swordsman'};
const gear=(rarity,level,extra={})=>({id:'blade',rarity,level,affixes:{},...extra});
assert.equal(gearTier(91),6,'創世階起點應為 Lv91');
const cases=[
 ['傳說＋創世',gear('legendary',91),false],
 ['神話＋創世',gear('mythic',100),false],
 ['傳說＋天啟',gear('legendary',70),true],
 ['罕見＋創世',gear('rare',100),true],
 ['罕見＋天啟',gear('rare',70),true],
];
for(const [name,item,dismantle] of cases)assert.equal(shouldAutoSalvage(item,settings),dismantle,name);
// 任一項達標即保留；兩條都啟用且要求兩條時，需同時達標。
for(const mode of ['any','two']){
 const opt={...settings,salvageMatchMode:mode};
 assert.equal(shouldAutoSalvage(gear('legendary',70),opt),mode==='two',mode+' 傳說但未到創世');
 assert.equal(shouldAutoSalvage(gear('rare',100),opt),mode==='two',mode+' 創世但未到傳說');
}
assert.equal(shouldAutoSalvage(gear('legendary',91,{swapProtected:true}),settings),false,'保護裝備不得自動分解');
assert.equal(shouldAutoSalvage(gear('legendary',91,{fusionMatch:true}),settings),false,'融合目標不得自動分解');
assert.equal(shouldAutoSalvage(gear('rare',70),{...settings,keepRarity:false,keepTier:false}),false,'未啟用保留條件時不得一鍵全拆');
console.log('salvage rarity/tier combination regression passed');

const zones=Object.keys(BOSS_IDENTITIES);
assert.equal(zones.length,21,'二十張既有首領與 210 首領皆有獨立設計');
assert.equal(new Set(zones.map(z=>BOSS_IDENTITIES[z].title)).size,21,'首領主題不可重複');
assert.equal(new Set(zones.map(z=>JSON.stringify(CARD_PROFILES[z].boss))).size,21,'首領能力組合不可重複');
for(const zone of zones){
 assert.ok(BOSS_IDENTITIES[zone].detail.length>=8,zone+' 缺少卡片介紹');
 assert.deepEqual(CARD_PROFILES[zone].boss,BOSS_IDENTITIES[zone].effects,zone+' 配置未套用');
}
console.log('all twenty boss card identities passed');

// Every slot gets two boss-card options; all contributions are ordinary card
// stats, not a separately capped global boss-only multiplier.
const coverage=Object.fromEntries(CARD_SLOT_ORDER.map(slot=>[slot,0]));
const head=new Set(['STR','AGI','VIT','INT','DEX','LUK']);
const survival=new Set(['hpPct','defPct','mdefPct','damageReduction','fleePct','mpPct']);
const offence=new Set(['atkPct','matkPct','crit','critDmg','hit','magicDamage','aspdPct']);
for(const zone of zones){
 for(const slot of CARD_SLOT_PROFILES[zone].boss){
  coverage[slot]++;
  const allowed=slot.startsWith('head')?head:['armor','leftHand','garment','shoes'].includes(slot)?survival:offence;
  for(const key of Object.keys(BOSS_SLOT_EFFECTS[zone]))assert.ok(allowed.has(key),zone+' / '+slot+' 效果超出部位定位：'+key);
 }
}
for(const [slot,count] of Object.entries(coverage))assert.ok(count>=2,slot+' 缺少兩種畢業首領卡');
for(const zone of ['eclipse','sungrave','celestial','worldroot']){
 const card=BOSS_SLOT_EFFECTS[zone];
 assert.ok(card.crit>0&&card.critDmg>0,zone+' 飾品王卡必須常駐提供暴擊率和暴擊傷害');
 assert.ok(CARD_SLOT_PROFILES[zone].boss.some(slot=>slot.startsWith('accessory')),zone+' 必須是飾品王卡');
}
assert.ok(BOSS_SLOT_EFFECTS.eclipse.atkPct>0,'飾品1應保留物理專精王卡');
assert.ok(BOSS_SLOT_EFFECTS.sungrave.matkPct>0,'飾品1應有提供MATK的王卡');
const dawnCard=createWorldCards([],{dawnrift:{id:'dawn-archon',name:'黎明裁界者',map:'dawnrift',level:210,boss:true}})['dawn-archon'];
assert.deepEqual(dawnCard.slots,['rightHand'],'210 首領王卡應維持武器輸出定位');
assert.doesNotMatch(dawnCard.description,/合計上限|符合條件|生命低於 35%/,'不應保留舊的條件增傷文字');
const sampleBosses=Object.fromEntries(zones.map((zone,i)=>[zone+'-boss',{id:zone+'-boss',name:zone,map:zone,level:10+i*10,boss:true}]));
const sampleCards=createWorldCards([],sampleBosses);
const allSockets=Object.fromEntries(zones.map((zone,i)=>[String(i),zone+'-boss']));
assert.equal(socketCardBonus(allSockets,sampleCards,'hpPct'),Object.values(BOSS_SLOT_EFFECTS).reduce((sum,e)=>sum+(e.hpPct||0),0),'各張王卡生存效果應完整累加');
assert.equal(socketCardBonus(allSockets,sampleCards,'atkPct'),Object.values(BOSS_SLOT_EFFECTS).reduce((sum,e)=>sum+(e.atkPct||0),0),'各張王卡輸出效果應完整累加');
console.log('boss slot role and uncapped independent stat stacking regression passed');
// Force the drop boundary without a long simulation: only the Lv210 boss may drop in dawnrift.
assert.equal(cardDropChance('dawnrift',{id:'dawn-archon',boss:true}),.001);
for(const id of ['dawn-sentinel','dawn-watcher','dawn-minion'])assert.equal(cardDropChance('dawnrift',{id,boss:false}),0);
assert.equal(cardDropChance('dawnrift',{id:'other-boss',boss:true}),0);
assert.equal(.0009<cardDropChance('dawnrift',{id:'dawn-archon',boss:true}),true);
assert.equal(.0011<cardDropChance('dawnrift',{id:'dawn-archon',boss:true}),false);
const gameSource=readFileSync(new URL('../dist/game.js',import.meta.url),'utf8');
const dawnAward=gameSource.match(/function awardDawnMonster\(\)\{[^\n]+/ )?.[0]||'';
assert.match(dawnAward,/cardDropChance\(player\.location,defeated\)/,'曙界獨立結算必須真的判斷王卡掉落');
assert.match(dawnAward,/addCard\(defeated\.id\)/,'曙界王卡須進入背包');
assert.match(dawnAward,/queueBossCardNotice\(defeated\.id\)/,'曙界王卡須進入提示佇列');
assert.match(gameSource,/offlineSummary\.bossCards\|\|\[\]/,'離線王卡須保留順序');
assert.match(gameSource,/showNextBossCardNotice\(\);\};/,'離線報告關閉後應可繼續提示');
console.log('Lv210 boss deterministic drop and notice wiring regression passed');
