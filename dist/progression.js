export const GEAR_TIERS=Object.freeze([{min:1,max:20},{min:21,max:35},{min:36,max:50},{min:51,max:70},{min:71,max:90},{min:91,max:99}].map((range,i)=>Object.freeze({...range,tier:i+1,code:['I','II','III','IV','V','VI'][i],name:['晨曦','征途','星輝','天啟','聖域','創世'][i],power:2**i})));
export const gearTierForLevel=level=>{const value=Math.min(99,Math.max(1,Math.floor(Number(level)||1)));return GEAR_TIERS.find(t=>value<=t.max).tier;};
export const gearTierRange=tier=>GEAR_TIERS[Math.min(6,Math.max(1,Math.floor(Number(tier)||1)))-1];
export const legacyFiveTierToNew=tier=>gearTierForLevel([20,40,60,80,99][Math.min(5,Math.max(1,Math.floor(Number(tier)||1)))-1]);
export function migrateFiveTierShards(bag){const result=[];for(const entry of bag){const match=!entry.uid&&/^shard_(weapon|armor)_([1-5])$/.exec(entry.id);const item=match?{...entry,id:`shard_${match[1]}_${legacyFiveTierToNew(Number(match[2]))}`}:{...entry};if(!item.uid&&/^shard_/.test(item.id)){const found=result.find(x=>x.id===item.id&&!x.uid);if(found){found.qty+=item.qty;continue;}}result.push(item);}return result;}
export const isNoviceLevel=level=>Number(level)>=1&&Number(level)<=50;
export function noviceMonsterStats(level,boss=false){const factor=boss?1.12:1;return {hp:Math.round((32+level*11+level*level*.12)*factor),atk:Math.round((4+level*1.05)*(boss?1.05:1)),def:Math.round(1+level*.34),xp:Math.max(12,Math.round((12+level*7+level*level*.13)*.9))};}

// Normal difficulty starts at 51. Keep novice formulas isolated and unchanged.
export function normalMonsterStats(level,boss=false){const n=Math.max(0,level-51),factor=boss?1.25:1,power=GEAR_TIERS[gearTierForLevel(level)-1].power;return {hp:Math.round((1600+n*42+n*n*.65)*(1+power*.035)*factor),atk:Math.round((92+n*2.1+power*18)*(boss?1.12:1)),def:Math.round((30+n*.7+power*.75)*(boss?1.08:1)),xp:Math.round((1150+n*52+n*n*.45)*(boss?1.3:1))};}
