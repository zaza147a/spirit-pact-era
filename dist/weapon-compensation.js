import {GEAR_BASE,RARITIES,SPECIAL_AFFIXES,primaryAffix,affixRange,affixLabel,gearTier,rollGear} from './loot.js';

export const WEAPON_COMPENSATION_VERSION=1;
const ATTRS=['STR','AGI','VIT','INT','DEX','LUK'];
const MYTHIC_SPECIALS=['aspdPct','crit','critDmg','damageReduction'];
const RANKS=['D','C','B','A','S','SS','SSS'];
const weapon=p=>GEAR_BASE[p?.id]?.weaponType;
const eligibleGear=p=>weapon(p)&&Number.isInteger(p.level)&&p.level>=190&&p.level<=200;
export function oldWeaponProof(player){
 const all=[...Object.values(player.gear||{}),...(player.bag||[])].filter(eligibleGear);
 all.sort((a,b)=>b.level-a.level||RARITIES.findIndex(r=>r.id===b.rarity)-RARITIES.findIndex(r=>r.id===a.rarity)||RANKS.indexOf(b.enhancement)-RANKS.indexOf(a.enhancement));
 return all[0]?{level:all[0].level,rarity:all[0].rarity,enhancement:RANKS.includes(all[0].enhancement)?all[0].enhancement:null}:null;
}
export function initializeWeaponCompensation(player){
 if(player.weaponCompensation!==undefined)return player.weaponCompensation;
 const proof=oldWeaponProof(player);
 player.weaponCompensation=proof?{version:WEAPON_COMPENSATION_VERSION,state:'pending',proof}:{version:WEAPON_COMPENSATION_VERSION,state:'ineligible'};
 return player.weaponCompensation;
}
export function compensationWeaponOptions(job){
 const list=Object.entries(GEAR_BASE).filter(([id,b])=>b.slot==='rightHand'&&b.weaponType&&b.jobs?.includes(job)).map(([id,b])=>({id,name:b.name,trait:b.weaponTrait||'無額外固有武器特性',twoHand:b.hands===2}));
 if(job==='assassin'&&list.some(x=>x.id==='rifle'))list.push({id:'dualDagger',name:'雙短劍（主手＋副手）',trait:'同時獲得主手短劍與副手匕首；兩件各有獨立詞條，無持盾專屬效果',twoHand:true});
 return list;
}
export function compensationNormalKeys(id){return [primaryAffix(id),'hit',...ATTRS].filter((k,i,a)=>a.indexOf(k)===i);}
export function compensationSpecialKeys(rarity){return rarity==='mythic'?[...MYTHIC_SPECIALS]:[];}
export function compensationAffixCount(rarity){return Math.min(5,RARITIES.find(r=>r.id===rarity)?.count||2);}
export function compensationPreview(id,proof,chosen){
 if(!GEAR_BASE[id]?.weaponType)throw Error('請選擇合法武器');
 const count=compensationAffixCount(proof.rarity),regular=chosen?.regular||[];
 if(regular.length!==count||new Set(regular).size!==count||!regular.includes(primaryAffix(id))||!regular.includes('hit')||regular.some(k=>!compensationNormalKeys(id).includes(k)))throw Error('詞條不符合武器固定欄位或數量');
 const special=chosen?.special;
 if(proof.rarity==='mythic'&&!MYTHIC_SPECIALS.includes(special))throw Error('請選擇合法神話特殊詞條');
 if(proof.rarity!=='mythic'&&special)throw Error('此品質不可使用神話特殊詞條');
 const tier=gearTier(proof.level),keys=[...regular,...(special?[special]:[])];
 return Object.fromEntries(keys.map(k=>[k,affixRange(k,tier,proof.rarity,id)[1]]));
}
export function claimWeaponCompensation(player,selection){
 const state=player.weaponCompensation;
 if(state?.version!==WEAPON_COMPENSATION_VERSION||state.state!=='pending')throw Error('此角色沒有可領取的武器改版補償');
 const option=compensationWeaponOptions(player.job).find(o=>o.id===selection?.id);
 if(!option)throw Error('無法領取其他職業武器');
 const ids=option.id==='dualDagger'?['rifle','offDagger']:[option.id];
 if((player.bag?.length||0)+ids.length>2000)throw Error('背包空間不足，請先整理再領取');
 const items=ids.map((id,i)=>{
  const affixes=compensationPreview(id,state.proof,i===1?selection.offhand:selection.main);
  const gear=rollGear(id,state.proof.level,state.proof.rarity);
  gear.affixes=affixes;
  if(state.proof.enhancement)gear.enhancement=state.proof.enhancement;
  gear.weaponCompensation=true;
  return gear;
 });
 player.bag.push(...items);
 player.weaponCompensation={...state,state:'claimed',claimedAt:Date.now(),reward:items.map(i=>i.uid)};
 return items;
}
export const compensationAffixDescription=(id,proof,choice)=>Object.entries(compensationPreview(id,proof,choice)).map(([k,v])=>affixLabel(k,v));
