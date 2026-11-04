import assert from 'node:assert/strict';
import {shouldAutoSalvage} from '../dist/salvage-rules.js';
import {gearTier} from '../dist/loot.js';
import {BOSS_IDENTITIES,CARD_PROFILES} from '../dist/card-effects.js';

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
assert.equal(zones.length,20,'二十張地圖首領卡片皆有獨立設計');
assert.equal(new Set(zones.map(z=>BOSS_IDENTITIES[z].title)).size,20,'首領主題不可重複');
assert.equal(new Set(zones.map(z=>JSON.stringify(CARD_PROFILES[z].boss))).size,20,'首領能力組合不可重複');
for(const zone of zones){
 assert.ok(BOSS_IDENTITIES[zone].detail.length>=8,zone+' 缺少卡片介紹');
 assert.deepEqual(CARD_PROFILES[zone].boss,BOSS_IDENTITIES[zone].effects,zone+' 配置未套用');
}
console.log('all twenty boss card identities passed');
