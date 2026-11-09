// Legal Lv210 magic-focused SSS test loadout. Never mutates real saved characters.
import {rollPetGear,affixRange,SPECIAL_AFFIXES} from '../../dist/loot.js';

const maximum=(item,key,pet=false)=>{
 const max=affixRange(key,item.tier,item.rarity,item.id)[1];
 return pet&&!SPECIAL_AFFIXES.has(key)&&!['atk','matk'].includes(key)?Math.round(max*10/3):max;
};
function equipAffixes(item,keys,pet=false){item.affixes=Object.fromEntries(keys.map(key=>[key,maximum(item,key,pet)]));}

export function equipPactMagicLoadout(player){
 if(player.job!=='pactWarrior')throw Error('pact only');
 player.attributes={STR:1,AGI:100,VIT:120,INT:150,DEX:70,LUK:3};
 for(const [slot,item] of Object.entries(player.gear||{})){
  if(!item)continue;
  if(slot==='rightHand')equipAffixes(item,['atk','matk','INT','DEX','VIT','aspdPct']);
  else if(slot==='leftHand')equipAffixes(item,['def','mdef','flee','INT','VIT','hpPct']);
  else equipAffixes(item,['def','mdef','flee','INT','VIT','hpPct']);
 }
 for(const pet of player.pets||[]){
  const old=pet.gear||{};
  const head=rollPetGear('petCirclet',200,'mythic',()=>.5);
  const body=rollPetGear('petRobe',200,'mythic',()=>.5);
  head.enhancement=body.enhancement='SSS';
  equipAffixes(head,['matk','hit','DEX','INT','VIT','aspdPct'],true);
  equipAffixes(body,['hp','def','mdef','INT','VIT','hpPct'],true);
  pet.gear={head,body,shoes:old.shoes};
  if(old.shoes)equipAffixes(old.shoes,['flee','hit','def','INT','VIT','hpPct'],true);
 }
 return player;
}
