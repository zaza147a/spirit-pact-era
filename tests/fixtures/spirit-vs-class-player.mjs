// Comparable synthetic 200/210 field fixtures for the ten original professions
// and both dual-fusion spirit jobs. Not optimized player exports.
import {highLevelSpiritPlayer} from './spirit-high-level-player.mjs';
import {SECOND_JOBS,parentJob} from '../../dist/jobs.js';
import {JOB_SKILLS} from '../../dist/job-skills.js';
import {GEAR_BASE,rollGear} from '../../dist/loot.js';
import {allocationBudget} from '../../dist/growth-v5.js';
import {attributeCap} from '../../dist/adventure-progression.js';
import {CARDS} from '../../dist/catalog.js';
import {cardAllowedInSlot} from '../../dist/card-effects.js';
const spirit=new Set(['pactWarrior','spiritCommander']);
export const ALL_COMPARISON_JOBS=Object.keys(SECOND_JOBS);
function seeded(seed=4455){return()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);}
function attributes(level,main){
 const high=level===210,top=high?150:120,mid=120,third=100,fourth=high?70:78,minor=high?3:5;
 const keys=['STR','AGI','VIT','INT','DEX','LUK'];
 const primary=main==='DEX'?'DEX':main==='VIT'?'VIT':main==='INT'?'INT':'STR';
 const remaining=primary==='INT'?['VIT','DEX','LUK','AGI','STR']:
  primary==='DEX'?['VIT','AGI','LUK','STR','INT']:
  primary==='VIT'?['STR','AGI','DEX','LUK','INT']:['VIT','AGI','DEX','LUK','INT'];
 const values=[top,mid,third,fourth,minor,1],names=[primary,...remaining];
 return Object.fromEntries(keys.map(k=>[k,values[names.indexOf(k)]]));
}
function allocateSkills(job){
 const skills=JOB_SKILLS[job],result={};
 for(const [branch,budget] of [['first',49],['second',69],['third',69]]){
  const group=skills.filter(skill=>skill.branch===branch);
  let remaining=budget;
  for(const skill of group){const rank=Math.min(skill.maxRank,remaining);result[skill.id]=rank;remaining-=rank;}
  if(remaining!==0)throw Error('insufficient '+branch+' skill budget for '+job);
 }
 return result;
}
export function comparisonPlayer({level=210,job='knight'}={}){
 if(![200,210].includes(level)||!ALL_COMPARISON_JOBS.includes(job))throw Error('unsupported comparison player');
 const dual=spirit.has(job),p=highLevelSpiritPlayer({level,job:job==='spiritCommander'?job:'pactWarrior',
  pairKey:'attack-magic+attack-magic',gearRarity:'mythic'});
 p.job=job;p.jobSkills=allocateSkills(job);
 // Role-correct Pact Warrior benchmark: absorb one pet to empower owner while the other assists.
 if(job==='pactWarrior')p.petStances={[p.pets[0].id]:'assimilate',[p.pets[1].id]:'assist'};
 p.attributes=attributes(level,SECOND_JOBS[job].attribute);p.statPoints=0;
 const points=Object.values(p.attributes).reduce((sum,n)=>sum+n-1,0);
 if(points!==allocationBudget(level,true)||Math.max(...Object.values(p.attributes))>attributeCap(p))
  throw Error('illegal comparison stat budget '+job);
 p.autoSkills={version:2,disabled:[],order:['thirdStance_','thirdUtility_','thirdWide_',
  'thirdFinish_','thirdMain_'].map(prefix=>prefix+job)};
 if(!dual){
  p.pets=[p.pets[0]];p.secondaryPetId=null;p.petStances={[p.pets[0].id]:'assist'};
  delete p.quests.dual_spirit_pact;
  const weapon=SECOND_JOBS[job].weapon,meta=GEAR_BASE[weapon];
  if(!meta)throw Error('missing weapon '+weapon);
  if(meta.jobs&&!meta.jobs.includes(job)&&!meta.jobs.includes(parentJob(job)))throw Error('wrong profession weapon '+weapon);
  const rng=seeded(32021),gear=rollGear(weapon,200,'mythic',rng);
  gear.uid='compare-'+job+'-weapon';
  if(level===210)gear.enhancement='SSS';
  p.gear.rightHand=gear;
  if(meta.hands===2){p.gear.leftHand=null;p.sockets.leftHand=null;}
 }
 for(const [slot,id]of Object.entries(p.sockets))if(id){
  if(!p.gear[slot]||!CARDS[id]||!cardAllowedInSlot(CARDS[id],slot))throw Error('invalid occupied card '+job+' '+slot);
 }
 return p;
}
