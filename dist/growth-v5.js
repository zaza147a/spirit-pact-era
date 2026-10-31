import {enhancedAffixes} from './sky-trials.js';
import {GEAR_TIERS,gearTierForLevel} from './progression.js';
export const ATTRIBUTE_KEYS=['STR','AGI','VIT','INT','DEX','LUK'];
export const allocationBudget=(level,reborn=false)=>Math.max(0,(level-1)*2+(reborn?20:0));
export const gearAttributeLimit=p=>Math.floor(allocationBudget(GEAR_TIERS[gearTierForLevel(p.level)-1].max,p.reborn)*.3);
export function cappedAttributes(raw,total,perStat=total){const clamped=Object.fromEntries(ATTRIBUTE_KEYS.map(k=>[k,Math.min(perStat,Math.max(0,Number(raw[k])||0))])),sum=Object.values(clamped).reduce((a,b)=>a+b,0);if(sum<=total)return clamped;const scale=total/sum,exact=ATTRIBUTE_KEYS.map(k=>({k,value:clamped[k]*scale})),out=Object.fromEntries(exact.map(x=>[x.k,Math.floor(x.value)]));let left=total-Object.values(out).reduce((a,b)=>a+b,0);for(const x of exact.sort((a,b)=>(b.value%1)-(a.value%1)||ATTRIBUTE_KEYS.indexOf(a.k)-ATTRIBUTE_KEYS.indexOf(b.k))){if(left--<=0)break;out[x.k]++;}return out;}
export function gearAttributes(p){const raw=Object.fromEntries(ATTRIBUTE_KEYS.map(k=>[k,Object.values(p.gear||{}).reduce((n,g)=>n+(enhancedAffixes(g)[k]||0),0)]));return cappedAttributes(raw,gearAttributeLimit(p),Math.floor((p.reborn&&p.level>=100?120:99)*.3));}
export function cardAttributes(sockets,cards){const raw=Object.fromEntries(ATTRIBUTE_KEYS.map(k=>[k,Object.values(sockets||{}).reduce((n,id)=>n+(cards[id]?.effects?.[k]||0)+(cards[id]?.stat===k?cards[id].bonus||0:0),0)]));return cappedAttributes(raw,24);}
export function allocationDamageMultiplier(job,magical,attributes,ranged=false){return 1+Math.max(0,attributes[magical?'INT':ranged?'DEX':'STR']||0)*.008;}
export const attributeDescriptions={STR:'每點近距離物理傷害額外+0.8%',AGI:'每點FLEE額外+0.45%，同時提升ASPD',VIT:'每點DEF／MDEF額外+0.6%，增加HP',INT:'每點魔法傷害額外+0.8%，並縮短詠唱',DEX:'每點遠距離物理傷害額外+0.8%，並縮短詠唱',LUK:'每點暴擊傷害+0.5個百分點，另提升暴擊率'};
