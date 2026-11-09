import test from 'node:test';
import assert from 'node:assert/strict';
import {extremeCharacterLedger,claimExtremeCharacterStage,EXTREME_FLOOR_COLLECTIBLES,extremeMilestoneTitles,extremeMilestoneFrames,extremeUnlockedCosmetics,syncExtremeHonorOwnership,extremeFiveFloorTitle,EXTREME_ASCENT_TITLES} from '../dist/extreme-trials-rewards.js';
import {towerHonorFrameClass} from '../dist/tower-honors.js';
import {selectTowerHonor,towerHonorOptions} from '../dist/tower-honors.js';
import {readFileSync} from 'node:fs';

test('角色獨立：同帳號兩個角色可以分別突破及領取自己的首次獎勵',()=>{
 const a={},b={};
 assert.deepEqual(claimExtremeCharacterStage(a,'atk',10).firstClears,[10]);
 assert.deepEqual(claimExtremeCharacterStage(a,'atk',10).firstClears,[]);
 assert.deepEqual(claimExtremeCharacterStage(b,'atk',10).firstClears,[10]);
 assert.equal(extremeCharacterLedger(a).progress.atk.highest,10);
 assert.equal(extremeCharacterLedger(b).progress.atk.highest,10);
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
 assert.ok(extremeMilestoneTitles(extremeCharacterLedger(a)).includes(extremeFiveFloorTitle('clear',50)));
 claimExtremeCharacterStage(a,'clear',100);
 assert.ok(extremeMilestoneTitles(extremeCharacterLedger(a)).includes(extremeFiveFloorTitle('clear',100)));
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
   assert.ok(titles.includes(extremeFiveFloorTitle(kind,floor)),`${prefix} ${floor}`);
   const available=towerHonorOptions(p,'title');
   assert.ok(available.includes(titles.at(-1)));
   assert.equal(selectTowerHonor(p,'title',titles.at(-1)),true);
   assert.equal(p.towerHonorSelection.title,titles.at(-1));
   const size=available.length;
   assert.deepEqual(claimExtremeCharacterStage(p,kind,floor).firstClears,[]);
   syncExtremeHonorOwnership(p);
   assert.equal(towerHonorOptions(p,'title').length,size,'re-clear must not duplicate a title');
  }
  assert.equal(p.extremeCoins,undefined);
  assert.equal(towerHonorOptions(JSON.parse(JSON.stringify(p)),'title').length,towerHonorOptions(p,'title').length);
 }
});

test('極高層讀取有界，500階之後每5階仍可逐次獲得新稱號',()=>{
 const p={};
 claimExtremeCharacterStage(p,'clear',505);
 syncExtremeHonorOwnership(p);
 assert.ok(p.extraHonorTitles.includes(extremeFiveFloorTitle('clear',505)));
 claimExtremeCharacterStage(p,'clear',510);
 syncExtremeHonorOwnership(p);
 assert.ok(p.extraHonorTitles.includes(extremeFiveFloorTitle('clear',510)));
 assert.ok(p.extraHonorTitles.includes(extremeFiveFloorTitle('clear',505)));
 const huge={extremeProgress:{clear:{highest:1000000000}}};
 assert.ok(extremeMilestoneTitles(extremeCharacterLedger(huge)).length<110);
 assert.equal(extremeCharacterLedger(huge).progress.clear.highest,1000000000);
});

test('四王史詩稱號不同且含階數；舊稱號與已選擇稱號可無損升級',()=>{
 for(const [kind,titles] of Object.entries(EXTREME_ASCENT_TITLES)){
  assert.equal(titles.length,14);
  assert.equal(new Set(titles).size,14);
  for(let i=0;i<titles.length;i++){
   const floor=35+i*5;
   assert.ok(extremeFiveFloorTitle(kind,floor).includes(`【${floor}階】`));
   assert.ok(extremeFiveFloorTitle(kind,floor).includes(titles[i]));
  }
 }
 const p={extremeProgress:{atk:{highest:105}},extraHonorTitles:[
  '破軍第35階突破者','破軍破限者','物理不滅者'],
  towerHonorSelection:{title:'破軍第35階突破者',frame:null}};
 syncExtremeHonorOwnership(p);
 assert.ok(p.extraHonorTitles.includes(extremeFiveFloorTitle('atk',35)));
 assert.ok(p.extraHonorTitles.includes(extremeFiveFloorTitle('atk',50)));
 assert.ok(p.extraHonorTitles.includes(extremeFiveFloorTitle('atk',100)));
 assert.ok(!p.extraHonorTitles.includes('破軍第35階突破者'));
 assert.ok(!p.extraHonorTitles.includes('破軍破限者'));
 assert.equal(p.towerHonorSelection.title,extremeFiveFloorTitle('atk',35));
 assert.equal(p.extremeCoins,undefined);
});

test('典藏名稱框與背景只看固定層數，不用貨幣也不用購買',()=>{
 const a={},b={};
 claimExtremeCharacterStage(a,'atk',19);syncExtremeHonorOwnership(a);
 assert.ok(!a.extremeFrames.includes('破軍典藏名稱框'));
 claimExtremeCharacterStage(a,'atk',20);syncExtremeHonorOwnership(a);
 assert.ok(a.extremeFrames.includes('破軍典藏名稱框'));
 assert.ok(!a.extremeBackgrounds.includes('atk_background'));
 claimExtremeCharacterStage(a,'atk',30);syncExtremeHonorOwnership(a);
 assert.ok(a.extremeBackgrounds.includes('atk_background'));
 assert.ok(extremeMilestoneTitles(extremeCharacterLedger(a)).includes('破軍挑戰者'));
 assert.equal(extremeCharacterLedger(b).progress.atk.highest,0);
 assert.equal(a.extremeCoins,undefined);
});

test('四王每隻到30階自動解鎖全部8款典藏外觀',()=>{
 const player={};
 for(const kind of ['atk','matk','hp','clear']){
  claimExtremeCharacterStage(player,kind,30);
 }
 syncExtremeHonorOwnership(player);
 assert.equal(EXTREME_FLOOR_COLLECTIBLES.length,8);
 for(const item of EXTREME_FLOOR_COLLECTIBLES){
  assert.ok(item.type==='frame'?player.extremeFrames.includes(item.name):player.extremeBackgrounds.includes(item.id),item.id);
 }
 assert.equal(player.extremeCoins,undefined);
 assert.equal(player.extremePurchases,undefined);
 assert.deepEqual(claimExtremeCharacterStage(player,'clear',100).firstClears,[100]);
});

test('舊版本徽記與已購買紀錄自動淘汰，依歷史通關補齊獎勵',()=>{
 const previous={extremeProgress:{hp:{highest:30},atk:{highest:20}},
  extremeCoins:345,extremePurchases:['hp_frame'],extremeSelectedBackground:'hp_background'};
 syncExtremeHonorOwnership(previous);
 assert.equal(previous.extremeCoins,undefined);
 assert.equal(previous.extremePurchases,undefined);
 assert.ok(previous.extremeFrames.includes('hp_frame')===false);
 assert.ok(previous.extremeFrames.includes('血淵典藏名稱框'));
 assert.ok(previous.extremeFrames.includes('破軍典藏名稱框'));
 assert.ok(previous.extremeBackgrounds.includes('hp_background'));
 assert.ok(!previous.extremeBackgrounds.includes('atk_background'));
 assert.equal(previous.extremeSelectedBackground,'hp_background');
});

test('存檔 JSON 往返與不同角色欄位不會互相繼承極限記錄',()=>{
 const first={name:'角色甲'},second={name:'角色乙'};
 claimExtremeCharacterStage(first,'matk',30);
 syncExtremeHonorOwnership(first);
 const exported=JSON.stringify(first);
 const restored=JSON.parse(exported);
 const originalLedger=extremeCharacterLedger(first);
 assert.deepEqual(extremeCharacterLedger(restored),originalLedger);
 assert.equal(extremeCharacterLedger(second).progress.matk.highest,0);
 assert.ok(restored.extremeFrames.includes('冥界典藏名稱框'));
 assert.ok(restored.extremeBackgrounds.includes('matk_background'));
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
