import test from 'node:test';
import assert from 'node:assert/strict';
import {extremeCharacterLedger,claimExtremeCharacterStage,buyExtremeShopItem,extremeMilestoneTitles,extremeMilestoneFrames,extremeUnlockedCosmetics,syncExtremeHonorOwnership} from '../dist/extreme-trials-rewards.js';
import {towerHonorFrameClass} from '../dist/tower-honors.js';
import {selectTowerHonor,towerHonorOptions} from '../dist/tower-honors.js';
import {readFileSync} from 'node:fs';

test('角色獨立：同帳號兩個角色可以分別突破及領取自己的首次獎勵',()=>{
 const a={},b={};
 assert.equal(claimExtremeCharacterStage(a,'atk',10).coins,100);
 assert.equal(claimExtremeCharacterStage(a,'atk',10).coins,0);
 assert.equal(claimExtremeCharacterStage(b,'atk',10).coins,100);
 assert.equal(extremeCharacterLedger(a).coins,100);
 assert.equal(extremeCharacterLedger(b).coins,100);
 assert.notEqual(a.extremeProgress,b.extremeProgress);
});
test('20／25／30 階取得全部外觀，50／100 階追加稱號且不跨角色',()=>{
 const a={},b={};
 claimExtremeCharacterStage(a,'clear',20);syncExtremeHonorOwnership(a);
 assert.ok(extremeMilestoneFrames(extremeCharacterLedger(a)).includes('萬軍名稱框'));
 assert.equal(extremeUnlockedCosmetics(a,'background').length,0);
 claimExtremeCharacterStage(a,'clear',30);syncExtremeHonorOwnership(a);
 assert.ok(a.extremeBackgrounds.includes('clear_milestone'));
 claimExtremeCharacterStage(a,'clear',25);
 assert.ok(extremeUnlockedCosmetics(a,'mantle').includes('clear'));
 claimExtremeCharacterStage(a,'clear',30);
 assert.ok(extremeUnlockedCosmetics(a,'aura').includes('clear'));
 claimExtremeCharacterStage(a,'clear',50);
 assert.ok(extremeMilestoneTitles(extremeCharacterLedger(a)).includes('萬軍破限者'));
 claimExtremeCharacterStage(a,'clear',100);
 assert.ok(extremeMilestoneTitles(extremeCharacterLedger(a)).includes('千軍殲滅者'));
 assert.deepEqual(extremeUnlockedCosmetics(b,'aura'),[]);
});

test('四王35／40／45／50階及之後每5階各新增一個可選稱號，不重複疊加',()=>{
 const prefixes={atk:'破軍',matk:'冥界',hp:'血淵',clear:'萬軍'};
 for(const [kind,prefix] of Object.entries(prefixes)){
  const p={};
  claimExtremeCharacterStage(p,kind,30);
  const before=extremeMilestoneTitles(extremeCharacterLedger(p));
  const floors=Array.from({length:15},(_,i)=>35+i*5);
  for(const floor of floors){
   claimExtremeCharacterStage(p,kind,floor);
   syncExtremeHonorOwnership(p);
   const titles=extremeMilestoneTitles(extremeCharacterLedger(p));
   assert.equal(titles.length,before.length+floors.filter(f=>f<=floor).length,
    `${kind} ${floor} each five-floor step adds exactly one title`);
   if(![50,100].includes(floor))assert.ok(titles.includes(`${prefix}第${floor}階突破者`));
   const available=towerHonorOptions(p,'title');
   assert.ok(available.includes(titles.at(-1)));
   assert.equal(selectTowerHonor(p,'title',titles.at(-1)),true);
   assert.equal(p.towerHonorSelection.title,titles.at(-1));
   const size=available.length;
   assert.equal(claimExtremeCharacterStage(p,kind,floor).coins,0);
   syncExtremeHonorOwnership(p);
   assert.equal(towerHonorOptions(p,'title').length,size,'re-clear must not duplicate a title');
  }
  assert.equal(p.extremeCoins,450);
  assert.equal(towerHonorOptions(JSON.parse(JSON.stringify(p)),'title').length,towerHonorOptions(p,'title').length);
 }
});

test('極高層讀取有界，500階之後每5階仍可逐次獲得新稱號',()=>{
 const p={};
 claimExtremeCharacterStage(p,'clear',505);
 syncExtremeHonorOwnership(p);
 assert.ok(p.extraHonorTitles.includes('萬軍第505階突破者'));
 claimExtremeCharacterStage(p,'clear',510);
 syncExtremeHonorOwnership(p);
 assert.ok(p.extraHonorTitles.includes('萬軍第510階突破者'));
 assert.ok(p.extraHonorTitles.includes('萬軍第505階突破者'));
 const huge={extremeProgress:{clear:{highest:1000000000}}};
 assert.ok(extremeMilestoneTitles(extremeCharacterLedger(huge)).length<110);
 assert.equal(extremeCharacterLedger(huge).coins,0);
});

test('商店購買、收藏及稱號都只作用於當前角色',()=>{
 const a={},b={};
 assert.match(buyExtremeShopItem(a,'atk_frame').error,/先突破/);
 claimExtremeCharacterStage(a,'atk',30);
 const before=a.extremeCoins;
 assert.equal(buyExtremeShopItem(a,'atk_frame').ledger.coins,before-150);
 assert.match(buyExtremeShopItem(a,'atk_frame').error,/已永久收藏/);
 assert.ok(extremeMilestoneTitles(extremeCharacterLedger(a)).includes('破軍挑戰者'));
 assert.equal(extremeCharacterLedger(b).purchases.length,0);
 assert.equal(extremeCharacterLedger(b).progress.atk.highest,0);
});

test('每一種王完成 30 階的徽記足夠購買該王全部商店收藏',()=>{
 const player={};
 for(const kind of ['atk','matk','hp','clear']){
  const reward=claimExtremeCharacterStage(player,kind,30);
  assert.equal(reward.coins,450);
  assert.equal(buyExtremeShopItem(player,kind+'_frame').error,undefined);
  assert.equal(buyExtremeShopItem(player,kind+'_background').error,undefined);
 }
 assert.equal(player.extremeCoins,200);
 assert.equal(claimExtremeCharacterStage(player,'clear',100).coins,0);
});

test('存檔 JSON 往返與不同角色欄位不會互相繼承極限記錄',()=>{
 const first={name:'角色甲'},second={name:'角色乙'};
 claimExtremeCharacterStage(first,'matk',30);
 buyExtremeShopItem(first,'matk_frame');
 syncExtremeHonorOwnership(first);
 const exported=JSON.stringify(first);
 const restored=JSON.parse(exported);
 const originalLedger=extremeCharacterLedger(first);
 assert.deepEqual(extremeCharacterLedger(restored),originalLedger);
 assert.equal(extremeCharacterLedger(second).progress.matk.highest,0);
 assert.equal(extremeCharacterLedger(second).coins,0);
 assert.deepEqual(extremeCharacterLedger(second).purchases,[]);
 claimExtremeCharacterStage(restored,'matk',31);
 assert.equal(extremeCharacterLedger(first).progress.matk.highest,30);
 assert.equal(extremeCharacterLedger(restored).progress.matk.highest,31);
});

test('四王普通與典藏名稱框是八種不同動態外觀，登入選角與角色欄共用樣式',()=>{
 const css=readFileSync(new URL('../dist/extreme-trials.css',import.meta.url),'utf8');
 for(const [kind,free,collector] of [
  ['atk','破軍名稱框','破軍典藏名稱框'],
  ['matk','冥界名稱框','冥界典藏名稱框'],
  ['hp','血淵名稱框','血淵典藏名稱框'],
  ['clear','萬軍名稱框','萬軍典藏名稱框']]){
  const p={extremeFrames:[free,collector],towerHonorSelection:{frame:free}};
  assert.equal(towerHonorFrameClass(p),`extreme-frame-${kind}`);
  p.towerHonorSelection.frame=collector;
  assert.equal(towerHonorFrameClass(p),`extreme-frame-${kind}-collector`);
  assert.match(css,new RegExp(`extreme-frame-${kind}-collector`));
 }
 assert.match(css,/slot-select h2\.tower-honor-name/);
 assert.match(css,/#gameShell #character \.character-name/);
 assert.match(css,/@keyframes extreme-collector-sweep/);
 assert.match(css,/@keyframes extreme-rune-hover/);
 assert.match(css,/prefers-reduced-motion/);
});
