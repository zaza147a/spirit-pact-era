import assert from 'node:assert/strict';
import {shouldAutoSalvage} from '../dist/salvage-rules.js';
import {gearTier} from '../dist/loot.js';
import {BOSS_IDENTITIES,CARD_PROFILES,CARD_SLOT_PROFILES,CARD_SLOT_ORDER,BOSS_TRAITS,bossCardDamageFactor,createWorldCards} from '../dist/card-effects.js';
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

// Every socket gets at least two graduating boss-card choices (physical/magic/pet branches).
const coverage=Object.fromEntries(CARD_SLOT_ORDER.map(slot=>[slot,0]));
for(const zone of zones){
 assert.ok(BOSS_TRAITS[zone]?.name,'首領缺少戰鬥特性：'+zone);
 assert.ok(BOSS_TRAITS[zone]?.condition,'首領特色須說明實際觸發條件：'+zone);
 for(const slot of CARD_SLOT_PROFILES[zone].boss)coverage[slot]++;
}
assert.equal(new Set(zones.map(zone=>BOSS_TRAITS[zone].name)).size,21,'21 張王卡應有各自的特性名稱');
assert.equal(new Set(zones.map(zone=>BOSS_TRAITS[zone].condition)).size,21,'21 張王卡應有各自的觸發條件');
for(const [slot,count] of Object.entries(coverage))assert.ok(count>=2,slot+' 缺少兩種畢業首領卡');
const dawnCard=createWorldCards([],{dawnrift:{id:'dawn-archon',name:'黎明裁界者',map:'dawnrift',level:210,boss:true}})['dawn-archon'];
assert.ok(dawnCard?.boss&&dawnCard.slots.includes('rightHand'),'210 首領必須有武器／副手王卡');
assert.match(dawnCard.description,/專屬特性/,'首領卡片必須顯示條件式特色');
assert.ok(bossCardDamageFactor({rightHand:'dawn-archon'},{'dawn-archon':dawnCard},{source:'owner',enemyHpFraction:1,enemyCount:1,ownerHpFraction:1})>=1,'王卡戰鬥倍率應可安全計算');
assert.equal(bossCardDamageFactor({rightHand:'dawn-archon'},{'dawn-archon':dawnCard},{source:'owner',enemyHpFraction:.2,enemyCount:1}),1.07,'210 王卡須在單體斬殺時生效');
assert.equal(bossCardDamageFactor({rightHand:'dawn-archon'},{'dawn-archon':dawnCard},{source:'pet',enemyHpFraction:.2,enemyCount:1}),1,'210 王卡不能在非自身攻擊生效');
assert.match(dawnCard.description,/生命低於 35%/,'卡面須明確顯示實際觸發條件');
const sampleBosses=Object.fromEntries(zones.map((zone,i)=>[zone+'-boss',{id:zone+'-boss',name:zone,map:zone,level:10+i*10,boss:true}]));
const sampleCards=createWorldCards([],sampleBosses);
const allSockets=Object.fromEntries(zones.map((zone,i)=>[String(i),zone+'-boss']));
for(const context of [{source:'owner',enemyHpFraction:.1,enemyCount:1,ownerHpFraction:.1,secondary:true},{source:'pet',enemyHpFraction:.9,enemyCount:2,ownerHpFraction:.9,secondary:true}])assert.ok(bossCardDamageFactor(allSockets,sampleCards,context)<=1.18,'王卡疊加必須限制在18%');
console.log('boss slot coverage, special mechanics and Lv210 card regression passed');
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
