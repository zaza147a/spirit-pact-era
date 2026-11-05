import {CARDS,SLOTS} from '../dist/catalog.js';
import {cardAllowedInSlot,cardEffectsFor} from '../dist/card-effects.js';

export function bossCardCandidates(job,slot){
 return Object.entries(CARDS).filter(([id,card])=>id.startsWith('boss_')&&cardAllowedInSlot(card,slot,job));
}

export function preferredBossCards(job){
 const magic=['wizard','sage','priest','spiritCommander'].includes(job);
 const ranged=['hunter','performer'].includes(job);
 const main=magic?'INT':ranged?'DEX':'STR';
 const weights={STR:1,INT:1,DEX:1,AGI:1.1,LUK:1.1,VIT:.6,atkPct:magic?0:3,matkPct:magic?3:0,magicDamage:magic?4:0,crit:2,critDmg:1.6,aspd:2,aspdPct:2,ignoreDef:2,hpPct:.6,defPct:.4,mdefPct:.4,fleePct:.4};
 weights[main]=6;
 const selected={};
 for(const slot of Object.keys(SLOTS)){
  const choices=bossCardCandidates(job,slot);
  const score=card=>Object.entries(cardEffectsFor(card,200)).reduce((sum,[key,value])=>sum+value*(weights[key]||0),0);
  choices.sort((a,b)=>score(b[1])-score(a[1])||a[0].localeCompare(b[0]));
  selected[slot]=choices[0]?.[0]||null;
 }
 return selected;
}
