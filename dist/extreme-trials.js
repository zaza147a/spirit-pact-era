// 四域極限試煉：前 30 階是所有職業可完成的主要獎勵區，之後是極限排行。
export const EXTREME_TRIALS=Object.freeze({
  atk:{name:'破軍戰神',stat:'atk',seconds:20,baseMultiplier:1,stepMultiplier:.15},
  matk:{name:'冥界魔皇',stat:'matk',seconds:20,baseMultiplier:1,stepMultiplier:.15},
  hp:{name:'血淵暴君',stat:'hp',seconds:30,baseDps:50000000,stepDps:4500000,post30StepDps:50000000},
  clear:{name:'萬軍魔主',stat:'clear',seconds:30,baseKills:6,post30StepKills:2,simultaneous:5,hpStep:.02,post30HpStep:.1}
});

// No gameplay floor ceiling. JavaScript's maximum safe integer is the only
// representational boundary; objectives are saturated before overflowing it.
const floorValue=n=>Number.isSafeInteger(n)&&n>=1;
const safeCount=n=>Math.min(Number.MAX_SAFE_INTEGER,Math.max(0,Math.floor(n)));
export function extremeStage(kind,floor){
  const config=EXTREME_TRIALS[kind];
  if(!config||!floorValue(floor))throw Error('無效的極限試煉階段');
  const early=Math.min(29,floor-1),late=Math.max(0,floor-30);
  const requiredDps=config.stat==='hp'?config.baseDps+early*config.stepDps+late*config.post30StepDps:0;
  return kind==='clear'
    ?{floor,seconds:config.seconds,requiredKills:safeCount(config.baseKills+Math.floor(early/2)+late*config.post30StepKills),
      hpMultiplier:1+early*config.hpStep+late*config.post30HpStep,simultaneous:config.simultaneous}
    :kind==='hp'
    ?{floor,seconds:config.seconds,requiredDps:safeCount(requiredDps),requiredDamage:safeCount(requiredDps*config.seconds)}
    :{floor,seconds:config.seconds,attackMultiplier:config.baseMultiplier+(floor-1)*config.stepMultiplier};
}

export function normalizeExtremeProgress(value){
  const result={};
  for(const kind of Object.keys(EXTREME_TRIALS)){
    const source=value?.[kind]||{};
    const highest=Number(source.highest);
    result[kind]={highest:Number.isSafeInteger(highest)?Math.max(0,highest):0};
  }
  return result;
}

export function extremeEntryError(player,kind,floor){
  if(!EXTREME_TRIALS[kind])return '無效的挑戰類型';
  if(!floorValue(floor))return '無效的挑戰階段';
  if((player?.level||0)<200)return '角色達到 200 等才能參加極限試煉';
  if(player.towerRun||player.trialRun||player.extremeRun)return '目前已有其他挑戰進行中';
  if(player.location!=='dawncity')return '請前往曙光聖港尋找極限試煉官';
  const highest=normalizeExtremeProgress(player.extremeProgress)[kind].highest;
  if(floor>Math.max(1,Math.floor(highest/10)*10))return '尚未解鎖此起始階段';
  if(floor!==1&&floor%10!==0)return '僅能從第 1 階或已解鎖的十階節點入場';
  return null;
}

export function beginExtremeRun(player,kind,floor,now){
  const error=extremeEntryError(player,kind,floor);
  if(error)return {error};
  return {run:{kind,floor,startedAt:now,stageStartedAt:now,stageDamage:0,stageKills:0,status:'active'}};
}

export function recordExtremeDamage(run,damage){
  if(run?.status!=='active'||!Number.isFinite(damage)||damage<=0)return 0;
  const amount=Math.min(Number.MAX_SAFE_INTEGER,damage);
  run.stageDamage=Math.min(Number.MAX_SAFE_INTEGER,(run.stageDamage||0)+amount);
  return amount;
}

export function extremeStageResult(run,now,{alive=true}={}){
  if(!run||run.status!=='active')return {status:'invalid'};
  const stage=extremeStage(run.kind,run.floor);
  if(!alive)return {status:'failed',reason:'戰敗'};
  if(now-run.stageStartedAt<stage.seconds*1000)return {status:'active'};
  if(run.kind==='hp'&&(run.stageDamage||0)<stage.requiredDamage)
    return {status:'failed',reason:'階段傷害不足',required:stage.requiredDamage,actual:run.stageDamage||0};
  if(run.kind==='clear'&&(run.stageKills||0)<stage.requiredKills)
    return {status:'failed',reason:'階段擊殺數不足',required:stage.requiredKills,actual:run.stageKills||0};
  return {status:'cleared',floor:run.floor};
}

export function extremeFirstClearReward(floor){
  if(!floorValue(floor))throw Error('無效的獎勵階段');
  return floor<=10?10:floor<=20?15:floor<=30?20:0;
}

// 只為真正超過歷史最高的階段發獎，避免快速入場與重打重複領取。
export function settleExtremeStage(progress,kind,floor){
  if(!EXTREME_TRIALS[kind]||!floorValue(floor))throw Error('無效的通關資料');
  const next=normalizeExtremeProgress(progress),old=next[kind].highest;
  if(floor<=old)return {progress:next,firstClears:[],coins:0};
  // A corrupt/imported jump must not allocate millions of entries. Beyond
  // stage 30 there is no currency, so only the reached floor is needed.
  const rewardedFrom=Math.max(old+1,1),rewardedTo=Math.min(floor,30);
  const rewarded=rewardedTo>=rewardedFrom?Array.from({length:rewardedTo-rewardedFrom+1},(_,i)=>rewardedFrom+i):[];
  const firstClears=floor<=30?rewarded:[...rewarded,floor];
  next[kind].highest=floor;
  return {progress:next,firstClears,coins:rewarded.reduce((sum,n)=>sum+extremeFirstClearReward(n),0)};
}
