export const BASE_ATTRIBUTE_CAP=99;
export const JOB_ATTRIBUTE_MAX={
 swordsman:[6,2,8,0,3,1],acolyte:[1,1,3,9,4,2],mage:[0,1,2,10,6,1],thief:[4,8,2,0,4,2],archer:[2,3,2,1,10,2],
 knight:[12,4,7,0,5,2],crusader:[5,1,15,2,5,2],wizard:[0,1,3,16,8,2],sage:[2,4,6,12,5,1],assassin:[10,10,2,0,4,4],rogue:[7,8,4,1,7,3],priest:[1,1,7,15,4,2],monk:[12,5,7,2,3,1],hunter:[3,5,3,1,14,4],performer:[2,6,4,3,12,3]
};
const keys=['STR','AGI','VIT','INT','DEX','LUK'];
export function jobAttributeBonus(player,secondJobs){const meta=secondJobs[player.job],current=JOB_ATTRIBUTE_MAX[player.job]||[0,0,0,0,0,0],first=meta?JOB_ATTRIBUTE_MAX[meta.parent]:[0,0,0,0,0,0],ratio=level=>Math.max(0,Math.min(1,((Number(level)||1)-1)/49));return Object.fromEntries(keys.map((key,i)=>[key,Math.floor(current[i]*ratio(player.jobLevel))+Math.floor(first[i]*ratio(player.firstJobLevel))]));}
export function capBaseAttributes(player){for(const key of keys){const value=player.attributes?.[key];if(Number.isFinite(value)&&value>BASE_ATTRIBUTE_CAP){player.statPoints+=value-BASE_ATTRIBUTE_CAP;player.attributes[key]=BASE_ATTRIBUTE_CAP;}}return player;}
