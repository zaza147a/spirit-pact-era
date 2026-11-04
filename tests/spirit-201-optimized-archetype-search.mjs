// Bounded legal-build search on the real 201-210 map Worker with mobs + random Archon.
// This is NOT a mathematical proof of global optimum. Report candidates and limitations.
import assert from 'node:assert/strict';
import {Worker} from 'node:worker_threads';
import {SECOND_JOBS} from '../dist/jobs.js';
import {FUSION_TYPES,DUAL_FUSION_TYPES} from '../dist/spirit-job-rules.js';
import {allocationBudget} from '../dist/growth-v5.js';
import {attributeCap} from '../dist/adventure-progression.js';
import {GEAR_BASE,rollGear,rollPetGear,affixRange,primaryAffix} from '../dist/loot.js';
import {CARDS,SLOTS} from '../dist/catalog.js';
import {cardAllowedInSlot,cardEffectsFor} from '../dist/card-effects.js';
import {parentJob} from '../dist/jobs.js';
import {comparisonPlayer} from './fixtures/spirit-vs-class-player.mjs';
import {highLevelSpiritPlayer} from './fixtures/spirit-high-level-player.mjs';
const epoch=2000000000000,seed=471122,roles=new Set(['pactWarrior','spiritCommander']),quick=process.env.QUICK_NORMAL_CARD_AUDIT==='1',bossMode=process.env.BOSS_CARD_AUDIT==='1';
const selectedJobs=(process.env.CARD_AUDIT_JOBS||'').split(',').map(x=>x.trim()).filter(Boolean);
const stats=['baseline','agi-luk','vit-luk','agi-dex','vit-agi','luk-focus','agi-focus','dex-focus','int-focus'];
const equipmentModes=['base','power','crit','speed','pierce'];
const cardModes=['base','power','crit','speed','pierce'];
function allocate(p,focus){const main=SECOND_JOBS[p.job].attribute;const order=[focus,main,'LUK','AGI','DEX','INT','VIT','STR'];let left=allocationBudget(210,true);for(const k of Object.keys(p.attributes))p.attributes[k]=1;for(const k of [...new Set(order)]){const n=Math.min(149,left);p.attributes[k]+=n;left-=n;}assert.equal(left,0);}
function cardScore(card,mode,job){const effects=cardEffectsFor(card,200);const magic=['wizard','sage','priest'].includes(job)||job==='spiritCommander';const weights={atkPct:magic?0:3,matkPct:magic?3:0,magicDamage:magic?3:0,crit:mode==='crit'?9:1,critDmg:mode==='crit'?6:1,aspd:mode==='speed'?9:1,aspdPct:mode==='speed'?8:1,ignoreDef:mode==='pierce'?9:2,ignoreMdef:mode==='pierce'?9:2,STR:1,INT:1,DEX:1,LUK:2,AGI:1};return Object.entries(effects).reduce((n,[k,v])=>n+v*(weights[k]||0),0)+(bossMode&&card.map==='dawnrift'&&roles.has(job)?300:0);}
function tuneEquipment(p,mode,cardMode,weapon){const seedRand=()=>.75;
 if(weapon&&p.gear.rightHand?.id!==weapon){const g=rollGear(weapon,200,'mythic',seedRand);g.enhancement='SSS';p.gear.rightHand=g;const base=GEAR_BASE[weapon];if(base.hands===2){p.gear.leftHand=null;p.sockets.leftHand=null;}else if(!p.gear.leftHand){const sh=rollGear('shield',200,'mythic',seedRand);sh.enhancement='SSS';p.gear.leftHand=sh;}}
 if(mode!=='base'){const main=SECOND_JOBS[p.job].attribute;const spec={power:'atkPct',crit:'critDmg',speed:'aspdPct',pierce:'ignoreDef'}[mode];for(const gear of [...Object.values(p.gear),...p.pets.flatMap(pet=>Object.values(pet.gear))]){if(!gear)continue;const primary=primaryAffix(gear.id);const keys=[primary,main,'LUK','AGI','DEX','VIT'];const next={};for(const key of [...new Set(keys)].slice(0,5)){const range=affixRange(key,gear.tier,'mythic');if(range)next[key]=range[1];}if(spec&&affixRange(spec,gear.tier,'mythic'))next[spec]=affixRange(spec,gear.tier,'mythic')[1];gear.affixes=next;}}
 if(cardMode!=='base'||bossMode){for(const slot of Object.keys(SLOTS)){if(!p.gear[slot]){p.sockets[slot]=null;continue;}let top=null,score=-Infinity;for(const [id,c] of Object.entries(CARDS)){if(bossMode?!c.boss:c.boss)continue;if(!cardAllowedInSlot(c,slot,p.job))continue;if(id.startsWith('world_')&&Number(id.slice(6))>210)continue;const n=cardScore(c,cardMode,p.job);if(n>score){score=n;top=id;}}p.sockets[slot]=top;}}
}
function weapons(job){const parent=parentJob(job),list=Object.entries(GEAR_BASE).filter(([id,b])=>b.weaponType&&(!b.jobs||b.jobs.includes(job)||!roles.has(job)&&b.jobs.includes(parent))).map(([id])=>id);return [...new Set([SECOND_JOBS[job].weapon,...list])].filter(Boolean).slice(0,6);}
const orders=['default','main-first'];
function variants(job){
 if(!roles.has(job))return FUSION_TYPES.map(fusion=>({job,pair:fusion,stance:'solo'}));
 return DUAL_FUSION_TYPES.flatMap(pair=>job==='pactWarrior'
  ?['assist-assist','assimilate-assist','assimilate-assimilate'].map(stance=>({job,pair,stance}))
  :[{job,pair,stance:'assist-assist'}]);
}
function createPlayer(cfg){
 const spirit=roles.has(cfg.job);
 const p=spirit?highLevelSpiritPlayer({level:210,job:cfg.job,pairKey:cfg.pair}):comparisonPlayer({level:210,job:cfg.job});
 if(!spirit){
  const pairKey=DUAL_FUSION_TYPES.find(key=>key.split('+').includes(cfg.pair));
  const alt=highLevelSpiritPlayer({level:210,job:'pactWarrior',pairKey});
  const index=pairKey.split('+').indexOf(cfg.pair);
  p.pets=[alt.pets[index]];p.activePetId=p.pets[0].id;p.secondaryPetId=null;
  p.petStances={[p.pets[0].id]:'assist'};
 }else{
  const stances=cfg.stance.split('-');
  p.petStances=Object.fromEntries(p.pets.map((pet,i)=>[pet.id,stances[i]]));
 }
 p.dawnSigil=8;p.autoEscapeBoss=false;p.location='dawnrift';
 if(cfg.stat?.endsWith('-focus'))allocate(p,cfg.stat.split('-')[0].toUpperCase());
 else if(cfg.stat!=='baseline'){
  const keys=cfg.stat.split('-').map(x=>x.toUpperCase());
  [p.attributes[keys[0]],p.attributes[keys[1]]]=[p.attributes[keys[1]],p.attributes[keys[0]]];
 }
 if(cfg.order==='main-first')p.autoSkills.order=[...p.autoSkills.order].reverse();
 tuneEquipment(p,cfg.equipment||'base',cfg.cards||'base',cfg.weapon);
 assert.equal(Object.values(p.attributes).reduce((a,b)=>a+b-1,0),allocationBudget(210,true));
 assert.ok(Object.values(p.attributes).every(n=>n>=1&&n<=attributeCap(p)));
 assert.ok(p.gear.rightHand&&Object.values(p.gear).filter(Boolean).every(g=>g.level===200&&g.enhancement==='SSS'));
 if(spirit){assert.equal(p.gear.rightHand.id,cfg.job==='pactWarrior'?'blade':'oneStaff');assert.equal(p.gear.leftHand?.id,'shield');}
 assert.ok(p.pets.every(pet=>Object.values(pet.gear).filter(Boolean).every(g=>g.level===200&&g.enhancement==='SSS')));
 assert.ok(Object.values(p.sockets).every(id=>!id||CARDS[id]&&CARDS[id].boss===bossMode),'測試卡片類型不符');
 if(spirit)assert.equal(p.pets.length,2);
 return p;
}
async function run(cfg,seconds,runSeed){
 const player=createPlayer(cfg),coreBefore=player.bag.find(x=>x.id==='dawn_archon_core')?.qty||0;
 const worker=new Worker(new URL('./offline-worker-node-entry.mjs?clock='+epoch,import.meta.url),
  {type:'module',workerData:{seed:runSeed}});
 try{
  const result=await new Promise((resolve,reject)=>{
   const timer=setTimeout(()=>reject(Error('mixed201 timeout '+JSON.stringify(cfg))),110000);
   worker.on('message',m=>{
    if(m.type==='result'){clearTimeout(timer);resolve(m.result);}
    if(m.type==='error'){clearTimeout(timer);reject(Error(m.stack||m.message));}
   });
   worker.on('error',e=>{clearTimeout(timer);reject(e);});
   worker.postMessage({player,now:epoch+seconds*1000});
  });
  const s=result.summary,d=s?.damage;
  assert.ok(s?.simulated>0&&Number.isFinite(d?.total));
  return {cfg,seed:runSeed,seconds:s.simulated/1000,
   kills:s.kills,revives:s.revives||0,alive:result.player.hp>0,
   bossCores:(result.player.bag.find(x=>x.id==='dawn_archon_core')?.qty||0)-coreBefore,
   ownerDps:Math.round(d.player*1000/s.simulated),
   petDps:Math.round((d.pet1+d.pet2)*1000/s.simulated),
   totalDps:Math.round(d.total*1000/s.simulated)};
 }finally{await worker.terminate();}
}
const screen=[],best=[];
for(const job of Object.keys(SECOND_JOBS).filter(job=>!selectedJobs.length||selectedJobs.includes(job))){
 const candidates=variants(job),results=[];
 for(const v of candidates)results.push(await run({...v,stat:'baseline',order:'default'},quick?30:90,seed));
 results.sort((a,b)=>b.totalDps-a.totalDps);
 const finalists=[];
 for(const result of results){if(!finalists.some(x=>x.pair===result.cfg.pair)){
  finalists.push(result.cfg);if(finalists.length===(quick?2:3))break;
 }}
 assert.equal(finalists.length,quick?2:3);
 screen.push({job,candidates:candidates.length,top:results.slice(0,4).map(r=>({pair:r.cfg.pair,stance:r.cfg.stance,dps:r.totalDps,kills:r.kills,bossCores:r.bossCores}))});
 let winner=null,count=0;
 for(const f of finalists)for(const stat of (quick?['baseline','luk-focus','agi-focus','int-focus','dex-focus']:stats))for(const order of orders){
  const r=await run({...f,stat,order},quick?30:90,seed);count++;
  if(!winner||r.totalDps>winner.totalDps)winner=r;
 }
 // Second pass: optimize SSS gear affixes, legal card sockets, weapon family, and 150-cap allocations.
 const advanced=[];const shortlist=[winner.cfg];
 for(const mode of equipmentModes)for(const cardMode of (quick?['base','power','crit','speed']:cardModes)){const cfg={...winner.cfg,equipment:mode,cards:cardMode};const r=await run(cfg,quick?25:45,seed);advanced.push(r);}
 advanced.sort((a,b)=>b.totalDps-a.totalDps);
 const geared=advanced.slice(0,quick?1:2).map(x=>x.cfg);let top=advanced[0];
 for(const cfg of geared)for(const stat of (quick?['baseline','luk-focus','agi-focus','int-focus','dex-focus']:stats))for(const weapon of (quick?weapons(job).slice(0,3):weapons(job))){
  const next={...cfg,stat,weapon};const r=await run(next,quick?25:45,seed);if(r.totalDps>top.totalDps)top=r;
 }
 const trialCandidates=[winner,top];
 let validations=[];let highestMean=-Infinity,selected=winner;
 for(const candidate of trialCandidates){const current=[];
  for(const testSeed of (quick?[471122,93217]:[471122,93217,81733]))current.push(await run(candidate.cfg,quick?120:300,testSeed));
  const average=current.reduce((sum,r)=>sum+r.totalDps,0)/current.length;
  if(average>highestMean){highestMean=average;selected=candidate;validations=current;}
 }
 winner=selected;
 const mean=k=>validations.reduce((sum,r)=>sum+r[k],0)/validations.length;
 const row={job,pair:winner.cfg.pair,stance:winner.cfg.stance,stat:winner.cfg.stat,order:winner.cfg.order,
  candidates:candidates.length,refinements:count+advanced.length+geared.length*stats.length*weapons(job).length,
  equipment:winner.cfg.equipment,cards:winner.cfg.cards,weapon:winner.cfg.weapon,
  ownerDps:Math.round(mean('ownerDps')),petDps:Math.round(mean('petDps')),
  totalDps:Math.round(mean('totalDps')),[quick?'kills2m':'kills5m']:Number(mean('kills').toFixed(2)),
  bossCores:validations.reduce((n,r)=>n+r.bossCores,0),
  survival:validations.filter(r=>r.alive).length,revives:Number(mean('revives').toFixed(2)),
  seeds:validations.map(r=>({seed:r.seed,kills:r.kills,bossCores:r.bossCores,dps:r.totalDps,alive:r.alive}))};
 best.push(row);console.log(JSON.stringify({stage:'jobComplete',row}));
}
assert.equal(screen.length,selectedJobs.length||12);assert.equal(best.length,selectedJobs.length||12);
best.sort((a,b)=>b.totalDps-a.totalDps);
console.log(JSON.stringify({summary:true,ranking:best.map((r,i)=>({rank:i+1,...r}))}));
console.log(JSON.stringify({complete:true,jobs:best.length,legalFusionTypes:FUSION_TYPES.length,
 legalDualCombinations:DUAL_FUSION_TYPES.length,stage1:screen,
  validationSeconds:quick?120:300,normalMonsterCardsOnly:!bossMode,bossCardsOnly:bossMode,
  limitations:'Bounded coordinate search of 6 single-fusion or 15 distinct dual-fusion combinations, legal stat permutations and skill priorities. Bounded mythic SSS affix/normal-card archetypes and allowed weapon families, no exhaustive arbitrary affix/card/pet-skill enumeration. Random 201 map includes boss chance; zero boss cores means boss not verified. DPS capped by enemy HP, not theoretical maximum.'}));
