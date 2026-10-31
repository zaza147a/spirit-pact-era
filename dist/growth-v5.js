import {enhancedAffixes} from './sky-trials.js';
import {attributeCap} from './adventure-progression.js?v=6.3.1';
export const ATTRIBUTE_KEYS=['STR','AGI','VIT','INT','DEX','LUK'];
export const allocationBudget=(level,reborn=false)=>Math.max(0,(level-1)*2+(reborn?20:0));
export const gearAttributeLimit=p=>Math.floor(attributeCap(p)*.3);
export const cardAttributeLimit=p=>Math.floor(attributeCap(p)*.2);
export const overflowPotential=amount=>{const n=Math.max(0,Number(amount)||0);return .12*(n/(100+n));};
export const free201AttributeReset=p=>p.level>=201&&p.free201ResetUsed!==true;
export const POTENTIAL_NAMES={STR:'近距離物理傷害',DEX:'遠距離物理傷害',INT:'魔法傷害',VIT:'最大HP',AGI:'閃避率',LUK:'暴擊傷害'};
export function cappedAttributes(raw,total,perStat=total){const clamped=Object.fromEntries(ATTRIBUTE_KEYS.map(k=>[k,Math.min(perStat,Math.max(0,Number(raw[k])||0))])),sum=Object.values(clamped).reduce((a,b)=>a+b,0);if(sum<=total)return clamped;const scale=total/sum,exact=ATTRIBUTE_KEYS.map(k=>({k,value:clamped[k]*scale})),out=Object.fromEntries(exact.map(x=>[x.k,Math.floor(x.value)]));let left=total-Object.values(out).reduce((a,b)=>a+b,0);for(const x of exact.sort((a,b)=>(b.value%1)-(a.value%1)||ATTRIBUTE_KEYS.indexOf(a.k)-ATTRIBUTE_KEYS.indexOf(b.k))){if(left--<=0)break;out[x.k]++;}return out;}
export function rawGearAttributes(p){return Object.fromEntries(ATTRIBUTE_KEYS.map(k=>[k,Object.values(p.gear||{}).reduce((n,g)=>n+Math.max(0,Number(enhancedAffixes(g)[k])||0),0)]));}
export function rawCardAttributes(sockets,cards){return Object.fromEntries(ATTRIBUTE_KEYS.map(k=>[k,Object.values(sockets||{}).reduce((n,id)=>n+Math.max(0,Number(cards[id]?.effects?.[k])||0)+Math.max(0,cards[id]?.stat===k?Number(cards[id].bonus)||0:0),0)]));}
export function gearAttributes(p){const raw=rawGearAttributes(p),limit=gearAttributeLimit(p);return Object.fromEntries(ATTRIBUTE_KEYS.map(k=>[k,Math.min(limit,raw[k])]));}
export function cardAttributes(sockets,cards,p={level:120,reborn:true}){const raw=rawCardAttributes(sockets,cards),limit=cardAttributeLimit(p);return Object.fromEntries(ATTRIBUTE_KEYS.map(k=>[k,Math.min(limit,raw[k])]));}
export function attributeBreakdown(p,cards){const rawGear=rawGearAttributes(p),rawCards=rawCardAttributes(p.sockets,cards),gearLimit=gearAttributeLimit(p),cardLimit=cardAttributeLimit(p),gear={},card={},overflow={},potential={};for(const k of ATTRIBUTE_KEYS){gear[k]=Math.min(gearLimit,rawGear[k]);card[k]=Math.min(cardLimit,rawCards[k]);overflow[k]=Math.max(0,rawGear[k]-gearLimit)+Math.max(0,rawCards[k]-cardLimit);potential[k]=overflowPotential(overflow[k]);}return {rawGear,rawCards,gear,card,overflow,potential,gearLimit,cardLimit};}
export function allocationDamageMultiplier(job,magical,attributes,ranged=false){return 1+Math.max(0,attributes[magical?'INT':ranged?'DEX':'STR']||0)*.008;}
export const attributeDescriptions={STR:'每點近距離物理傷害額外+0.8%',AGI:'每點FLEE額外+0.45%，同時提升ASPD',VIT:'每點DEF／MDEF額外+0.6%，增加HP',INT:'每點魔法傷害額外+0.8%，並縮短詠唱',DEX:'每點遠距離物理傷害額外+0.8%，並縮短詠唱',LUK:'每點暴擊傷害+0.5個百分點，另提升暴擊率'};
