// 天穹終境：獨立於原有五連戰的固定關卡與深淵規則。
// 所有倍率均為校準起點，不代表已通過十二職業實戰驗證。
export const TOWER_NAME = '天穹終境';
export const TOWER_FIXED_FLOORS = 100;
export const TOWER_REGIONS = Object.freeze([
  {name:'破曉之階',boss:'破曉守門者・艾德蘭',enemies:['曙光士兵','聖域弓手','破曉祭司'],hp:1.1,atk:.75,bossHp:1.25,mechanic:'護衛與治療',reward:'破曉挑戰者'},
  {name:'熾焰迴廊',boss:'焚天炎龍・伊格尼斯',enemies:['熔岩獵犬','火元素','炎之祭司'],hp:1.35,atk:.85,bossHp:1.6,mechanic:'灼燒與召喚',reward:'炎龍征服者'},
  {name:'永凍王庭',boss:'永凍女皇・賽琳娜',enemies:['寒霜騎士','冰晶術士','冰霜狼'],hp:1.65,atk:1,bossHp:2.05,mechanic:'寒霜與冰晶',reward:'永凍守護者'},
  {name:'鋼鐵聖域',boss:'鋼鐵巨神・阿特拉斯',enemies:['鋼鐵守衛','符文機兵','巨神修復者'],hp:2.1,atk:1.15,bossHp:2.6,mechanic:'護盾與修復',reward:'巨神破壞者'},
  {name:'虛空裂界',boss:'虛空魔眼・諾克斯',enemies:['虛空獵手','裂界法師','吞噬之眼'],hp:2.65,atk:1.3,bossHp:3.35,mechanic:'物魔抗性交替',reward:'虛空行者'},
  {name:'血月禁城',boss:'血月君王・瓦爾德',enemies:['血月騎士','吸血眷屬','暗夜祭司'],hp:3.35,atk:1.5,bossHp:4.3,mechanic:'吸血與眷屬',reward:'血月征服者'},
  {name:'時序迴廊',boss:'時間支配者・克洛諾',enemies:['時序守衛','鐘擺魔像','時間法師'],hp:4.2,atk:1.7,bossHp:5.5,mechanic:'冷卻干擾',reward:'時之旅者'},
  {name:'靈魂深淵',boss:'靈魂收割者・莫爾甘',enemies:['亡魂騎士','靈魂術士','幽影獵犬'],hp:5.25,atk:1.9,bossHp:7.1,mechanic:'靈魂印記',reward:'靈魂解放者'},
  {name:'混沌神域',boss:'混沌雙子・光與闇',enemies:['混沌騎士','光之使徒','暗影法師'],hp:6.6,atk:2.15,bossHp:9.1,mechanic:'雙子共用生命',reward:'混沌終結者'},
  {name:'天穹終境',boss:'終焉之主・阿斯特雷恩',enemies:['天穹裁決者','終境護衛','星界使徒'],hp:8.2,atk:2.4,bossHp:11.8,mechanic:'複合階段',reward:'天穹征服者'}
]);

// Ten-step difficulty ladder: first appearance teaches each mechanic; later
// repetitions require progressively better damage timing and survivability.
export const TOWER_CHALLENGE_CURVE = Object.freeze([
  {huntMobs:2,huntHp:1,huntSeconds:25,cast:24,delay:14,surviveSeconds:18},
  {huntMobs:2,huntHp:1.3,huntSeconds:30,cast:23,delay:13,surviveSeconds:23},
  {huntMobs:3,huntHp:1.7,huntSeconds:35,cast:22,delay:12,surviveSeconds:28},
  {huntMobs:3,huntHp:2.1,huntSeconds:40,cast:21,delay:11,surviveSeconds:33},
  {huntMobs:3,huntHp:2.6,huntSeconds:45,cast:20,delay:10,surviveSeconds:38},
  {huntMobs:4,huntHp:3.1,huntSeconds:50,cast:19,delay:9,surviveSeconds:43},
  {huntMobs:4,huntHp:3.6,huntSeconds:55,cast:18,delay:8,surviveSeconds:48},
  {huntMobs:4,huntHp:4.2,huntSeconds:60,cast:17,delay:8,surviveSeconds:53},
  {huntMobs:4,huntHp:4.9,huntSeconds:65,cast:16,delay:7,surviveSeconds:58},
  {huntMobs:5,huntHp:5.8,huntSeconds:70,cast:15,delay:6,surviveSeconds:65}
]);

export function towerFloor(floor) {
  if(!Number.isSafeInteger(floor)||floor<1) throw new RangeError('樓層必須為正整數');
  const regionIndex = floor<=100?Math.floor((floor-1)/10):Math.floor((floor-101)/10)%10;
  const region = TOWER_REGIONS[regionIndex];
  const position = (floor-1)%10+1;
  const endless = floor>100;
  const difficultyIndex=endless?9:regionIndex,scale=TOWER_REGIONS[difficultyIndex],challenge=TOWER_CHALLENGE_CURVE[difficultyIndex];
  const kind = position===10?'boss':position===5?'guardian':position===4||position===8||position===9?'elite':'normal';
  const objective=position===3?'hunt':position===6?'survive':position===9?'assassinate':'eliminate';
  const goal=objective==='hunt'?challenge.huntSeconds:objective==='survive'?challenge.surviveSeconds:objective==='assassinate'?1:null;
  const depth = Math.max(0,floor-100);
  const hpGrowth = endless?1.25+.045*depth+.0003*depth*depth:1;
  const atkGrowth = endless?1.15+.015*depth+.00004*depth*depth:1;
  const affixes = endless?(floor<121?1:floor<151?2:3):regionIndex>=3&&position===8?1:0;
  const affixPool=['狂暴之境','魔力枯竭','重甲領域','靈魂壓制','生命侵蝕','增援號角'];
  const activeAffixes=Array.from({length:affixes},(_,index)=>affixPool[(floor*7+index)%affixPool.length]);
  return Object.freeze({floor,regionIndex,region:region.name,kind,endless,
    name:objective==='assassinate'?`${region.name}追捕首領`:kind==='boss'?region.boss:kind==='guardian'?`${region.name}守衛者`:region.enemies[(position-1)%region.enemies.length],
    enemyCount:objective==='hunt'?challenge.huntMobs:objective==='survive'?0:objective==='assassinate'?1:kind==='boss'||kind==='guardian'?1:kind==='elite'?2:regionIndex<2?2:3,
    objective,goal,pursuerCastSeconds:objective==='hunt'?challenge.cast:0,pursuerDelayPerKillSeconds:objective==='hunt'?challenge.delay:0,
    huntHpFactor:objective==='hunt'?challenge.huntHp:1,difficultyTier:difficultyIndex+1,
    hpMultiplier:(kind==='boss'?scale.bossHp:scale.hp)*(1+(position-1)*.025)*hpGrowth,
    atkMultiplier:scale.atk*(1+(position-1)*.01)*atkGrowth,
    timeLimitSeconds:objective==='hunt'?goal+20:objective==='survive'?goal+30:kind==='boss'?Math.min(360,180+20*difficultyIndex):kind==='guardian'||kind==='elite'?180:120,
    mechanic:region.mechanic,affixes,activeAffixes,
    reward:kind==='boss'&&!endless?region.reward:null,
    checkpoint:floor%10===0
  });
}

export function towerObjectiveLabel(stage) {
  if(stage.objective==='hunt')return `追擊逃離：持續擊殺重生小怪，撐過 ${stage.goal} 秒即可逃離；每擊敗 1 隻小怪，將首領必殺技延後 ${stage.pursuerDelayPerKillSeconds} 秒`;
  if(stage.objective==='survive')return `堅守逃離：在追獵首領攻擊下存活 ${stage.goal} 秒，不要求擊殺敵人`;
  if(stage.objective==='assassinate')return '首領斬首：擊敗指定首領立即通關，護衛一同消失';
  return `殲滅關卡：擊敗 ${stage.enemyCount} 隻指定敵人`;
}

export function towerEntryError(player) {
  if(!player?.thirdJob||player.level<210) return '需要三轉 Base 210';
  if(player.hp<=0) return '請先復活';
  if(player.trialRun||player.homecomingRun) return '請先結束目前的挑戰';
  if(!player.dawnUnlocked) return '需先解鎖曙界新陸';
  return null;
}

export function normalizeTowerProgress(value) {
  const highest=Math.max(0,Math.min(1_000_000,Math.floor(Number(value?.highest)||0)));
  return {highest,checkpoint:Math.floor(highest/10)*10,deepest:Math.max(0,Math.floor(Number(value?.deepest)||0)),
    claimed:Array.isArray(value?.claimed)?[...new Set(value.claimed.filter(n=>Number.isInteger(n)&&n>=10&&n<=100&&n%10===0))]:[]};
}

// Each cleared floor stays available independently; the next uncleared floor
// unlocks immediately, without requiring a continuous tower run.
export function towerAvailableFloors(progress,maxFloor=100) {
  const highest=normalizeTowerProgress(progress).highest;
  const cap=Math.max(0,Math.min(1000000,Math.floor(Number(maxFloor)||0)));
  return Array.from({length:Math.min(cap,highest+1)},(_,index)=>index+1);
}

export function finishTowerFloor(progress,floor,elapsedSeconds,alive=true) {
  const state=normalizeTowerProgress(progress),stage=towerFloor(floor);
  if(floor>state.highest+1) return {success:false,reason:'尚未解鎖此樓層',progress:state};
  if(!alive||!Number.isFinite(elapsedSeconds)||elapsedSeconds<0||elapsedSeconds>stage.timeLimitSeconds)
    return {success:false,reason:'挑戰失敗或超時',progress:state};
  state.highest=Math.max(state.highest,floor);
  state.checkpoint=Math.floor(state.highest/10)*10;
  if(floor>100)state.deepest=Math.max(state.deepest,floor);
  const firstReward=stage.reward&&!state.claimed.includes(floor)?stage.reward:null;
  if(firstReward)state.claimed.push(floor);
  const towerCoins=stage.kind==='boss'?(firstReward?300:50):stage.kind==='elite'||stage.kind==='guardian'?15:5;
  return {success:true,progress:state,firstReward,towerCoins};
}

export function estimateTowerClear(floor,{dps,hp,baselineEnemyHp,incomingDps,healingDps=0}={}) {
  const stage=towerFloor(floor);
  if(!Number.isFinite(dps)||dps<=0||!Number.isFinite(hp)||hp<=0||!Number.isFinite(baselineEnemyHp)||baselineEnemyHp<=0||!Number.isFinite(incomingDps)||incomingDps<0)
    return {viable:false,reason:'缺少同一戰鬥基準的 HP、DPS 與承傷數據'};
  const targetHp=baselineEnemyHp*stage.hpMultiplier*stage.enemyCount;
  const time=stage.objective==='survive'||stage.objective==='hunt'?stage.goal:targetHp/dps;
  const survival=incomingDps>healingDps?hp/(incomingDps-healingDps):Infinity;
  return {viable:time<=stage.timeLimitSeconds&&time<survival,estimatedSeconds:time,survivalSeconds:survival,
    note:stage.objective==='hunt'?'需以實際小怪擊殺間隔與技能延後時間模擬；DPS 單值不足以推估必殺技是否會施放':stage.objective==='survive'?'此層只需撐過指定秒數；須另評估追獵首領與護衛的瞬間傷害':
      '此為初篩，不包含技能控制、首領階段、生怪延遲、技能輸出分布或真實戰鬥 AI'};
}
