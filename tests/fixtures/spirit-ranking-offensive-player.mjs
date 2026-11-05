// A reproducible offensive candidate fixture, not a mathematical global optimum.
// All twelve professions use the same legal allocation and boss-card rules.
import assert from 'node:assert/strict';
import {comparisonPlayer} from './spirit-vs-class-player.mjs';
import {GEAR_BASE,PET_GEAR_BASE,affixRange,primaryAffix,SPECIAL_AFFIXES} from '../../dist/loot.js';
import {CARDS,SLOTS} from '../../dist/catalog.js';
import {cardAllowedInSlot,cardEffectsFor} from '../../dist/card-effects.js';
import {SECOND_JOBS} from '../../dist/jobs.js';
import {canonicalFusionKey} from '../../dist/spirit-job-rules.js';

const mainFor=job=>job==='pactWarrior'||job==='spiritCommander'?'INT':SECOND_JOBS[job].attribute;
function allocation(job){
  // Spend 438 extra points; retain the physical/magic primary and enough AGI/LUK
  // for attack-speed and crit follow-up. The full optimizer can refine it later.
  const primary=mainFor(job)==='DEX'?'DEX':mainFor(job)==='INT'?'INT':'STR';
  const stat={STR:1,AGI:1,VIT:1,INT:1,DEX:1,LUK:1};
  for(const [key,amount]of [[primary,149],['AGI',149],['LUK',99],['VIT',41]]){
    if(key===primary&&key==='AGI')continue;
    const increment=Math.min(amount,150-stat[key]);stat[key]+=increment;
  }
  let budget=438-Object.values(stat).reduce((n,v)=>n+v-1,0);
  for(const key of ['LUK','VIT','STR','INT','DEX','AGI']){
    const extra=Math.min(budget,150-stat[key]);stat[key]+=extra;budget-=extra;
    if(!budget)break;
  }
  assert.equal(budget,0);
  assert.equal(Object.values(stat).reduce((n,v)=>n+v-1,0),438);
  return stat;
}
function offensiveAffixes(p){
  for(const gear of [...Object.values(p.gear),...p.pets.flatMap(pet=>Object.values(pet.gear||{}))]){
    if(!gear)continue;
    const meta=GEAR_BASE[gear.id]||PET_GEAR_BASE[gear.id];
    const petGear=!!PET_GEAR_BASE[gear.id];
    const primary=mainFor(p.job);
    // Defense and magic-defense raw affixes are unusually important at Lv210.
    // Replacing them with +12 attributes causes a catastrophic MDEF collapse.
    const mandatory=Object.keys(gear.affixes).filter(key=>['def','mdef'].includes(key));
    const attributes=[primary,'AGI','LUK','VIT',primary==='INT'?'STR':'INT'];
    const normal=[...new Set([...mandatory,primaryAffix(gear.id),...attributes])].slice(0,5);
    // Preserve the established boss-farming survival convention: one defensive
    // special roll on each slot, while normal rolls favor primary/AGI/LUK.
    const special=meta?.weaponType||meta?.petSlot==='head'?'damageReduction':'hpPct';
    const next={};
    for(const key of [...normal,special]){
      let value=affixRange(key,gear.tier,gear.rarity,gear.id)[1];
      if(petGear&&!SPECIAL_AFFIXES.has(key)&&!['atk','matk'].includes(key))value=Math.round(value*10/3);
      next[key]=value;
    }
    assert.equal(Object.keys(next).length,6,gear.id);
    gear.affixes=next;
  }
}
function bossCardBuild(p){
  const primary=mainFor(p.job);
  for(const slot of Object.keys(SLOTS)){
    if(!p.gear[slot]){p.sockets[slot]=null;continue;}
    let chosen=null,top=-Infinity;
    for(const [id,card] of Object.entries(CARDS)){
      if(!card.boss||card.map==='dawnrift'||card.map==='legacy'||!cardAllowedInSlot(card,slot,p.job))continue;
      const fx=cardEffectsFor(card,200);
      const weights={STR:primary==='STR'?16:2,INT:primary==='INT'?16:2,DEX:primary==='DEX'?16:2,
        AGI:10,LUK:12,atkPct:13,matkPct:13,aspdPct:12,crit:12,critDmg:12,
        magicDamage:10,ignoreDef:10,hit:5,hpPct:1,damageReduction:1,defPct:1,mdefPct:1};
      const score=Object.entries(fx).reduce((n,[key,value])=>n+Math.min(100,value)*(weights[key]||0),0);
      if(score>top){top=score;chosen=id;}
    }
    assert.ok(chosen,slot+' boss-card candidate');p.sockets[slot]=chosen;
  }
}
export function offensiveComparisonPlayer(job,{stats=true,affixes=true,bossCards=true}={}){
  const p=comparisonPlayer({level:210,job});
  p.dawnSigil=8;if(stats)p.attributes=allocation(job);
  if(['pactWarrior','spiritCommander'].includes(job)){
    // One companion by design, compare all unordered fusion types separately later.
    const pet=p.pets.find(unit=>canonicalFusionKey(unit)==='attack-magic')||p.pets[0];
    p.pets=[pet];p.activePetId=pet.id;p.secondaryPetId=null;
    p.petStances={[pet.id]:job==='pactWarrior'?'assimilate':'assist'};
  }else{
    // Same attack+magic fusion choice used in the existing legacy DPS ranking.
    const pet=p.pets.find(unit=>canonicalFusionKey(unit)==='attack-magic')||p.pets[0];
    p.pets=[pet];p.activePetId=pet.id;p.secondaryPetId=null;
    p.petStances={[pet.id]:'assist'};
  }
  if(affixes)offensiveAffixes(p);
  if(bossCards)bossCardBuild(p);
  return p;
}
