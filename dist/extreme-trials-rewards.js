import {normalizeExtremeProgress,settleExtremeStage} from './extreme-trials.js';

// Every character owns their own extreme-trial records and purchases.
// No account-wide storage or cross-slot inheritance.
export const EXTREME_FLOOR_COLLECTIBLES=Object.freeze([
 {id:'atk_frame',kind:'atk',type:'frame',name:'破軍典藏名稱框',floor:20},
 {id:'matk_frame',kind:'matk',type:'frame',name:'冥界典藏名稱框',floor:20},
 {id:'hp_frame',kind:'hp',type:'frame',name:'血淵典藏名稱框',floor:20},
 {id:'clear_frame',kind:'clear',type:'frame',name:'萬軍典藏名稱框',floor:20},
 {id:'atk_background',kind:'atk',type:'background',name:'破軍戰場背景',floor:30},
 {id:'matk_background',kind:'matk',type:'background',name:'冥界法陣背景',floor:30},
 {id:'hp_background',kind:'hp',type:'background',name:'血淵龍巢背景',floor:30},
 {id:'clear_background',kind:'clear',type:'background',name:'萬軍戰場背景',floor:30}
]);

export function extremeCharacterLedger(player){
 return {progress:normalizeExtremeProgress(player?.extremeProgress)};
}

export function claimExtremeCharacterStage(player,kind,floor){
 const previous=extremeCharacterLedger(player),result=settleExtremeStage(previous.progress,kind,floor);
 player.extremeProgress=result.progress;
 // Keep every five-floor title earned during an endless run. Do not generate
 // millions of retrospective titles when importing an extreme high-floor save.
 if(floor>500&&floor>=35&&floor%5===0&&result.firstClears.includes(floor)){
  player.extraHonorTitles=[...new Set([...(player.extraHonorTitles||[]),extremeFiveFloorTitle(kind,floor)])];
 }
 return {firstClears:result.firstClears,ledger:extremeCharacterLedger(player)};
}

const extremeTitleNames={atk:'破軍',matk:'冥界',hp:'血淵',clear:'萬軍'};
// Each row is a visible ascent from an elite warrior to a transcendent ruler.
// Index 0 is floor 35; later entries advance by exactly five floors.
export const EXTREME_ASCENT_TITLES=Object.freeze({
 atk:['鐵血先鋒','百戰猛將','破陣戰侯','破限戰王','無雙戰皇','鎮域武帝','撼天戰尊','裂界武聖','星穹戰神','太初神將','萬界神皇','永劫戰主','至高武神','不滅戰神'],
 matk:['幽冥使徒','暗燼咒師','黃泉巫侯','破限法王','深淵魔皇','冥獄法帝','蝕星魔尊','虛空聖賢','星滅魔神','太初冥主','萬界咒皇','永夜神座','寂滅之源','不朽魔神'],
 hp:['鐵壁守衛','不屈戰將','浴血戰侯','破限守王','鎮岳霸皇','萬劫盾帝','撼天聖盾','不滅戰尊','星穹龍神','太初守護','萬界壁壘','永劫聖軀','無上不朽','亙古神軀'],
 clear:['獵群先鋒','百敵斬將','千軍統侯','破限統王','萬軍霸皇','無雙戰帝','鎮界統帥','滅世軍神','星穹戰主','太初兵聖','萬界征服者','永劫軍皇','寰宇主宰','終焉統神']
});
export function extremeFiveFloorTitle(kind,floor){
 const rank=Number.isSafeInteger(floor)&&floor>=35&&floor%5===0?(floor-35)/5:-1;
 if(rank<0||!EXTREME_ASCENT_TITLES[kind])return null;
 const elevated=floor<=100?EXTREME_ASCENT_TITLES[kind][rank]:
  floor<150?'超越神話':floor<200?'無上神格':floor<300?'太初神座':
  floor<400?'創世神域':floor<500?'寰宇至尊':'永恆至高';
 return `${extremeTitleNames[kind]}·${elevated}【${floor}階】`;
}
const oldNamedTitles={atk:['破軍破限者','物理不滅者'],matk:['冥界破限者','魔法不滅者'],hp:['血淵破限者','極限征服者'],clear:['萬軍破限者','千軍殲滅者']};
function upgradeOldExtremeTitle(title){
 for(const [kind,[fifty,hundred]] of Object.entries(oldNamedTitles)){
  if(title===fifty)return extremeFiveFloorTitle(kind,50);
  if(title===hundred)return extremeFiveFloorTitle(kind,100);
 }
 const match=/^(破軍|冥界|血淵|萬軍)第(\d+)階突破者$/.exec(title);
 if(!match)return title;
 const kind=Object.keys(extremeTitleNames).find(key=>extremeTitleNames[key]===match[1]);
 return extremeFiveFloorTitle(kind,Number(match[2]))||title;
}
export function extremeMilestoneTitles(ledger){
 const noviceNames={atk:'破軍挑戰者',matk:'冥界挑戰者',hp:'血戰挑戰者',clear:'萬軍挑戰者'};
 return Object.entries(noviceNames).flatMap(([kind,novice])=>{
  const highest=ledger?.progress?.[kind]?.highest||0;
  const milestones=[];
  for(let floor=35;floor<=Math.min(500,highest);floor+=5){
   milestones.push(extremeFiveFloorTitle(kind,floor));
  }
  return [...(highest>=10?[novice]:[]),...milestones];
 });
}

export const EXTREME_MILESTONE_LABELS=Object.freeze({
 atk:{frame:'破軍名稱框',mantle:'破軍戰袍',aura:'破軍戰意'},
 matk:{frame:'冥界名稱框',mantle:'冥界法袍',aura:'冥界星環'},
 hp:{frame:'血淵名稱框',mantle:'血淵龍袍',aura:'血淵龍焰'},
 clear:{frame:'萬軍名稱框',mantle:'萬軍統帥袍',aura:'萬軍魂焰'}
});
export function extremeMilestoneFrames(ledger){
 return Object.entries(EXTREME_MILESTONE_LABELS).filter(([kind])=>(ledger.progress[kind]?.highest||0)>=20).map(([,labels])=>labels.frame);
}
export function extremeUnlockedCosmetics(player,type){
 const threshold=type==='mantle'?25:type==='aura'?30:type==='background'?30:Infinity;
 const ledger=extremeCharacterLedger(player);
 return Object.keys(EXTREME_MILESTONE_LABELS).filter(kind=>ledger.progress[kind].highest>=threshold);
}

export function syncExtremeHonorOwnership(player){
 const ledger=extremeCharacterLedger(player);
 player.extraHonorTitles=[...new Set([...(player.extraHonorTitles||[]).map(upgradeOldExtremeTitle),...extremeMilestoneTitles(ledger)])];
 if(player.towerHonorSelection?.title){
  player.towerHonorSelection={...player.towerHonorSelection,
   title:upgradeOldExtremeTitle(player.towerHonorSelection.title)};
 }
 player.extremeFrames=[...extremeMilestoneFrames(ledger),...EXTREME_FLOOR_COLLECTIBLES.filter(item=>item.type==='frame'&&ledger.progress[item.kind].highest>=item.floor).map(item=>item.name)];
 player.extremeBackgrounds=[...extremeUnlockedCosmetics(player,'background').map(kind=>kind+'_milestone'),...EXTREME_FLOOR_COLLECTIBLES.filter(item=>item.type==='background'&&ledger.progress[item.kind].highest>=item.floor).map(item=>item.id)];
 // Old saves may still contain currency/purchases. Progress is now the sole source of ownership.
 delete player.extremeCoins;
 delete player.extremePurchases;
 return player;
}
