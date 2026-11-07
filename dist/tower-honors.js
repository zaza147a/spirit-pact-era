// 天穹終境裝飾收藏：稱號與名稱框各只能啟用一款，且不影響戰力。
import {TOWER_SHOP_ITEMS,normalizeTowerCollection} from './tower-reward-shop.js';
export const TOWER_HONORS = Object.freeze([
  {floor:10,title:'破曉挑戰者',frame:'破曉名稱框',frameClass:'tower-frame-dawn'},
  {floor:20,title:'炎龍征服者',frame:'熾焰名稱框',frameClass:'tower-frame-flame'},
  {floor:30,title:'永凍守護者',frame:'永凍名稱框',frameClass:'tower-frame-frost'}
]);

export function unlockedTowerHonors(player) {
  const claimed=new Set(player?.towerProgress?.claimed||[]);
  // 老存檔已有首領通關但 claimed 遺漏時，不憑最高層數補發以防誤解鎖。
  return TOWER_HONORS.filter(h=>claimed.has(h.floor));
}

export function towerHonorOptions(player,type){
 const base=unlockedTowerHonors(player).map(h=>h[type]);
 if(type!=='frame')return base;
 const bought=new Set(normalizeTowerCollection(player?.towerCollection).purchases);
 return [...base,...TOWER_SHOP_ITEMS.filter(i=>i.type==='frame'&&bought.has(i.id)).map(i=>i.name)];
}

export function normalizeTowerHonorSelection(player) {
  const unlocked=unlockedTowerHonors(player);
  const titles=new Set(unlocked.map(h=>h.title));
  const frames=new Set(towerHonorOptions(player,'frame'));
  const previous=player?.towerHonorSelection||{};
  return {
    title:titles.has(previous.title)?previous.title:null,
    frame:frames.has(previous.frame)?previous.frame:null
  };
}

export function selectTowerHonor(player,type,value) {
  if(!['title','frame'].includes(type))return false;
  const selection=normalizeTowerHonorSelection(player);
  const allowed=towerHonorOptions(player,type);
  if(value!==''&&!allowed.includes(value))return false;
  selection[type]=value||null;
  player.towerHonorSelection=selection;
  return true;
}

export function towerHonorFrameClass(player) {
  const selection=normalizeTowerHonorSelection(player);
  const regular=TOWER_HONORS.find(h=>h.frame===selection.frame);
  if(regular)return regular.frameClass;
  const bought=TOWER_SHOP_ITEMS.find(i=>i.type==='frame'&&i.name===selection.frame);
  return bought?`tower-frame-collect-${bought.id.replace('frame_','')}`:'';
}
