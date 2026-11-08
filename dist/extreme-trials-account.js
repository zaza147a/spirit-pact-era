import {normalizeExtremeProgress,settleExtremeStage} from './extreme-trials.js';

export const EXTREME_ACCOUNT_KEY='icarus-extreme-trials-account-v1';

export function readExtremeAccount(storage){
  let saved=null;
  try{saved=JSON.parse(storage?.getItem(EXTREME_ACCOUNT_KEY)||'null');}catch{}
  return {version:1,progress:normalizeExtremeProgress(saved?.progress),coins:Math.max(0,Math.floor(Number(saved?.coins)||0)),
    purchases:Array.isArray(saved?.purchases)?[...new Set(saved.purchases.filter(x=>typeof x==='string'&&x.length<=80))]:[]};
}

// A single account ledger backs all eight character slots. Only increases to
// the highest stage of a boss grant a currency reward.
export function claimExtremeAccountStage(storage,kind,floor){
  if(typeof storage?.setItem!=='function')throw Error('無法儲存帳號極限試煉獎勵');
  const previous=readExtremeAccount(storage),result=settleExtremeStage(previous.progress,kind,floor);
  if(!result.coins)return {account:previous,coins:0,firstClears:[]};
  const account={...previous,progress:result.progress,coins:previous.coins+result.coins};
  storage.setItem(EXTREME_ACCOUNT_KEY,JSON.stringify(account));
  return {account,coins:result.coins,firstClears:result.firstClears};
}
