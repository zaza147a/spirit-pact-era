import {towerFloor,towerEntryError,normalizeTowerProgress,finishTowerFloor} from './endless-tower.js';

// Battle adapter. The host game's combat loop owns attack resolution, target AI,
// cooldowns and damage attribution. This module owns only stage transitions.
export const TOWER_RUN_VERSION=1;
export const TOWER_FIRST_RELEASE_MAX=30;

export const TOWER_BOSS_PATTERNS=Object.freeze({
  10:{phases:[.7,.3],abilities:['聖光斬','破曉衝擊','守護戰旗'],summons:[2,0],control:null},
  20:{phases:[.7,.3],abilities:['龍炎吐息','熔岩爆裂','焚天咆哮'],summons:[4,0],control:'burn'},
  30:{phases:[.7,.3],abilities:['極寒新星','冰晶長矛','永凍領域'],summons:[3,0],control:'freeze'},
  40:{phases:[.7,.3],abilities:['巨神重擊','鋼鐵屏障','核心過載'],summons:[2,0],control:null},
  50:{phases:[.7,.3],abilities:['虛空凝視','次元震盪','吞噬屏障'],summons:[0,0],control:'silence'},
  60:{phases:[.7,.3],abilities:['血月斬擊','生命汲取','血之契約'],summons:[3,0],control:null},
  70:{phases:[.7,.3],abilities:['時間停滯','時序逆流','鐘擺審判'],summons:[0,0],control:'slow'},
  80:{phases:[.7,.3],abilities:['靈魂收割','幽冥鎖鏈','魂之審判'],summons:[2,0],control:'bind'},
  90:{phases:[.7,.3],abilities:['光之裁決','暗影吞噬','混沌共鳴'],summons:[1,1],control:null},
  100:{phases:[.7,.3,.1],abilities:['天穹裁決','界域混沌','終焉降臨'],summons:[2,2,0],control:'fear'}
});

export function buildTowerEnemies(floor,{monster,boss},now=0) {
  const stage=towerFloor(floor),base=stage.objective==='assassinate'||stage.kind==='boss'||stage.kind==='guardian'?boss:monster;
  if(!base||!Number.isFinite(base.hp)||base.hp<=0||!Number.isFinite(base.atk)||base.atk<=0)throw Error('缺少有效的曙界怪物或首領基準');
  const isBoss=stage.kind==='boss';
  const targets=Array.from({length:stage.enemyCount},(_,index)=>({
    id:`tower-${floor}-${index}`,name:stage.enemyCount===1?stage.name:`${stage.name}・${index+1}`,
    map:'tower',level:210,role:'attack',roleName:'天穹終境',boss:isBoss||stage.objective==='assassinate',elite:stage.kind==='elite'||stage.kind==='guardian',tower:true,
    towerFloor:floor,towerRegion:stage.regionIndex,slotIndex:isBoss?null:index,
    hp:Math.round(base.hp*stage.hpMultiplier*stage.huntHpFactor*(stage.kind==='guardian'?.65:1)),
    atk:Math.round(base.atk*stage.atkMultiplier),
    def:Math.max(0,Math.round((base.def||0)*(1+.06*stage.regionIndex))),
    maxHp:Math.round(base.hp*stage.hpMultiplier*stage.huntHpFactor*(stage.kind==='guardian'?.65:1)),
    xp:0,gold:0,drops:[],appearedAt:now,
    bossPattern:isBoss?TOWER_BOSS_PATTERNS[(stage.regionIndex+1)*10]:null
  }));
  if(stage.objective==='hunt'||stage.objective==='survive'){
    // Chasing boss is a hazard, not a required kill; no normal drops or score.
    targets.push({id:`tower-chaser-${floor}`,name:`${stage.region}・追獵者`,tower:true,towerPursuer:true,boss:true,
      towerNextStrikeAt:now+stage.pursuerCastSeconds*1000,towerCastIntervalMs:stage.pursuerCastSeconds*1000,
      map:'tower',level:210,role:'attack',roleName:'天穹追獵首領',
      hp:Math.round(boss.hp*stage.hpMultiplier*10),maxHp:Math.round(boss.hp*stage.hpMultiplier*10),
      atk:Math.round(boss.atk*stage.atkMultiplier*.32),def:Math.round((boss.def||0)*1.2),
      xp:0,gold:0,drops:[],appearedAt:now});
  }
  if(stage.objective==='survive'||stage.objective==='assassinate'){
    for(let i=0;i<2;i++)targets.push({id:`tower-escort-${floor}-${i}`,name:`${stage.region}・追隨護衛`,tower:true,towerEscort:true,
      map:'tower',level:210,role:'attack',roleName:'天穹護衛',boss:false,
      hp:Math.round(monster.hp*stage.hpMultiplier*.7),maxHp:Math.round(monster.hp*stage.hpMultiplier*.7),
      atk:Math.round(monster.atk*stage.atkMultiplier*.55),def:monster.def||0,
      xp:0,gold:0,drops:[],appearedAt:now});
  }
  return targets;
}

export function postponeTowerPursuer(foe,seconds=8) {
  if(!foe?.towerPursuer||!Number.isFinite(foe.towerNextStrikeAt))return null;
  const delay=Math.min(15000,Math.max(0,Number(seconds)||0))*1000;
  foe.towerNextStrikeAt+=delay;
  return foe.towerNextStrikeAt;
}

export function beginTowerRun(player,floor,now=0,maxFloor=TOWER_FIRST_RELEASE_MAX) {
  const error=towerEntryError(player);
  if(error)return {error};
  const progress=normalizeTowerProgress(player.towerProgress);
  if(!Number.isInteger(floor)||floor<1||floor>Math.min(maxFloor,progress.highest+1))return {error:'尚未解鎖此樓層'};
  if(player.towerRun)return {error:'已在天穹終境挑戰中'};
  return {run:{version:TOWER_RUN_VERSION,floor,startedAt:now,stageStartedAt:now,
    status:'active',completedEnemyIds:[],firstClear:floor>progress.highest},progress};
}

export function validateTowerRun(run,now=0) {
  return run?.version===TOWER_RUN_VERSION&&run.status==='active'&&
    Number.isSafeInteger(run.floor)&&run.floor>=1&&run.floor<=TOWER_FIRST_RELEASE_MAX&&
    Number.isFinite(run.startedAt)&&Number.isFinite(run.stageStartedAt)&&run.stageStartedAt<=now&&
    Array.isArray(run.completedEnemyIds)&&run.completedEnemyIds.length<=10;
}

export function towerRemainingSeconds(run,now) {
  if(!validateTowerRun(run,now))return 0;
  return Math.max(0,towerFloor(run.floor).timeLimitSeconds-(now-run.stageStartedAt)/1000);
}

export function markTowerEnemyDefeated(run,enemyId,totalEnemies,now) {
  if(!validateTowerRun(run,now)||!Number.isInteger(totalEnemies)||totalEnemies<1||totalEnemies>10)return {error:'挑戰狀態無效'};
  if(typeof enemyId!=='string'||!enemyId.startsWith(`tower-${run.floor}-`))return {error:'不是此樓層敵人'};
  if(run.completedEnemyIds.includes(enemyId))return {error:'敵人已結算'};
  const ids=[...run.completedEnemyIds,enemyId];
  if(ids.length>totalEnemies)return {error:'敵人數量不符'};
  return {run:{...run,completedEnemyIds:ids},stageCleared:ids.length===totalEnemies};
}

export function settleTowerRun(player,run,now,{alive=true,totalEnemies}={}) {
  if(!validateTowerRun(run,now))return {error:'挑戰狀態無效'};
  const stage=towerFloor(run.floor);
  if((stage.objective==='survive'||stage.objective==='hunt')&&(now-run.stageStartedAt)/1000<stage.goal)return {error:'尚未達成逃離時間'};
  if(stage.objective!=='survive'&&stage.objective!=='hunt'&&(!Number.isInteger(totalEnemies)||totalEnemies!==stage.enemyCount||run.completedEnemyIds.length!==totalEnemies))
    return {error:'尚未擊敗所有敵人'};
  const result=finishTowerFloor(player.towerProgress,run.floor,(now-run.stageStartedAt)/1000,alive);
  if(!result.success)return {error:result.reason};
  return {progress:result.progress,coins:result.towerCoins,firstReward:result.firstReward,
    clearSeconds:(now-run.stageStartedAt)/1000};
}

export function towerBossPhase(pattern,healthRatio,previous=0) {
  if(!pattern||!Number.isFinite(healthRatio))return previous;
  let next=previous;
  for(let i=previous;i<pattern.phases.length;i++)if(healthRatio<=pattern.phases[i])next=i+1;
  return next;
}

// Signature casts have fixed intervals and upper bounds; no infinite crowd control.
export function towerBossSignature(floor,phase=0) {
 const region=Math.ceil(Math.min(30,Math.max(1,Number(floor)||1))/10);
 const stage=Math.min(2,Math.max(0,Math.floor(phase)));
 if(region===1)return Object.freeze({type:'strike',name:'聖光裁決',intervalMs:10000-stage*1000,power:.30+stage*.08,maxHpRatio:.12});
 if(region===2)return Object.freeze({type:'burn',name:'炎龍灼燒',intervalMs:9000-stage*1000,hpRatio:.015+stage*.005,maxHpRatio:.03});
 return Object.freeze({type:'freeze',name:'永凍束縛',intervalMs:12000-stage*1000,durationMs:1100+stage*150,maxDurationMs:1400});
}
