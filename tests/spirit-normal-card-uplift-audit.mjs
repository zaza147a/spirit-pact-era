// Real Worker card uplift audit: compare no sockets with legal normal cards.
// Uses identical 210/SSS/sigil-8 fixtures, skills, pets, RNG seeds and map for each pair.
// Candidate card profiles are bounded, not an exhaustive proof of absolute best DPS.
import assert from 'node:assert/strict';
import {Worker} from 'node:worker_threads';
import {SECOND_JOBS} from '../dist/jobs.js';
import {CARDS,SLOTS} from '../dist/catalog.js';
import {cardAllowedInSlot,cardEffectsFor} from '../dist/card-effects.js';
import {comparisonPlayer} from './fixtures/spirit-vs-class-player.mjs';

const epoch=2000000000000;
const seeds=[471122,93217,81733];
const modes=['physical','magical','crit','haste','hybrid'];
const readSeconds=Number(process.env.CARD_AUDIT_SECONDS||300);
const previewSeconds=Number(process.env.CARD_AUDIT_PREVIEW_SECONDS||45);
assert.ok(readSeconds>=30&&readSeconds<=300&&previewSeconds>=15&&previewSeconds<=90);
const magicJobs=new Set(['wizard','sage','priest','spiritCommander']);
const allSlots=Object.keys(SLOTS);
function legalCards(slot){
 return Object.entries(CARDS).filter(([id,c])=>!c.boss&&c.map&&c.map!=='legacy'&&cardAllowedInSlot(c,slot));
}
function score(card,mode,job){
 const e=cardEffectsFor(card,210),magic=magicJobs.has(job);
 const weights={
  physical:{atkPct:12,atk:1.5,STR:3,DEX:3,crit:3,critDmg:2,aspdPct:2},
  magical:{matkPct:12,matk:1.5,INT:3,magicDamage:9,DEX:1,aspdPct:1,crit:1},
  crit:{crit:12,critDmg:8,atkPct:magic?1:5,matkPct:magic?5:1,LUK:3},
  haste:{aspdPct:12,atkPct:magic?1:6,matkPct:magic?6:1,AGI:2,crit:2},
  hybrid:{atkPct:magic?1:9,matkPct:magic?9:1,magicDamage:magic?8:0,crit:5,critDmg:5,aspdPct:4,STR:magic?0:2,INT:magic?3:0,LUK:2}
 }[mode];
 return Object.entries(e).reduce((n,[k,v])=>n+Math.max(0,v)*(weights[k]||0),0);
}
function makePlayer(job,mode='none'){
 const p=comparisonPlayer({level:210,job});
 p.dawnSigil=8;p.autoEscapeBoss=false;p.location='dawnrift';
 p.offline={at:epoch,enabled:true};p.manualPaused=false;
 for(const slot of allSlots){
  p.sockets[slot]=null;
  // Card sockets belong to the character, not the currently equipped item.
  // A two-handed weapon must not disable the left-hand card socket.
  if(mode==='none')continue;
  const options=legalCards(slot).sort((a,b)=>score(b[1],mode,job)-score(a[1],mode,job));
  assert.ok(options.length,'missing regular card '+slot);
  p.sockets[slot]=options[0][0];
 }
 assert.equal(Object.values(p.sockets).filter(Boolean).length,mode==='none'?0:10);
 for(const [slot,id] of Object.entries(p.sockets)){
  if(!id)continue;assert.ok(!CARDS[id].boss&&cardAllowedInSlot(CARDS[id],slot));
 }
 return p;
}
async function run(job,mode,seconds,seed){
 const player=makePlayer(job,mode);
 const worker=new Worker(new URL('./offline-worker-node-entry.mjs?clock='+epoch,import.meta.url),{type:'module',workerData:{seed}});
 try{
  const result=await new Promise((resolve,reject)=>{
   const timer=setTimeout(()=>reject(Error('card audit timeout '+job+' '+mode)),115000);
   worker.on('message',m=>{if(m.type==='result'){clearTimeout(timer);resolve(m.result);}if(m.type==='error'){clearTimeout(timer);reject(Error(m.stack||m.message));}});
   worker.on('error',reject);
   worker.postMessage({player,now:epoch+seconds*1000});
  });
  const s=result.summary,d=s?.damage;
  assert.ok(s?.simulated>0&&Number.isFinite(d?.total),job+' '+mode+' missing worker telemetry');
  const time=s.simulated/1000;
  return {job,mode,seed,time,kills:s.kills,bossCores:(result.player.bag.find(x=>x.id==='dawn_archon_core')?.qty||0),
    ownerDps:d.player/time,petDps:(d.pet1+d.pet2)/time,totalDps:d.total/time,
    cards:Object.values(player.sockets).filter(Boolean).length,alive:result.player.hp>0};
 }finally{await worker.terminate();}
}
const rows=[];
for(const job of Object.keys(SECOND_JOBS)){
 const previews=[];
 for(const mode of modes)previews.push(await run(job,mode,previewSeconds,seeds[0]));
 previews.sort((a,b)=>b.totalDps-a.totalDps);
 const selected=previews[0].mode;
 const runs=[];
 for(const seed of seeds){
  const empty=await run(job,'none',readSeconds,seed);
  const filled=await run(job,selected,readSeconds,seed);
  runs.push({seed,empty,filled,upliftPct:empty.totalDps>0?(filled.totalDps/empty.totalDps-1)*100:null});
 }
 const total=k=>runs.reduce((sum,r)=>sum+r[k].totalDps,0)/runs.length;
 const owner=k=>runs.reduce((sum,r)=>sum+r[k].ownerDps,0)/runs.length;
 const pet=k=>runs.reduce((sum,r)=>sum+r[k].petDps,0)/runs.length;
 const bare=total('empty'),withCards=total('filled');
 const row={job,cardMode:selected,cards:runs[0].filled.cards,emptyDps:Math.round(bare),cardDps:Math.round(withCards),
  upliftPct:bare>0?Number(((withCards/bare-1)*100).toFixed(2)):null,
  ownerUpliftPct:owner('empty')>0?Number(((owner('filled')/owner('empty')-1)*100).toFixed(2)):null,
  petUpliftPct:pet('empty')>0?Number(((pet('filled')/pet('empty')-1)*100).toFixed(2)):null,
  avgKillsNoCards:runs.reduce((sum,r)=>sum+r.empty.kills,0)/runs.length,
  avgKillsCards:runs.reduce((sum,r)=>sum+r.filled.kills,0)/runs.length,
  bossCoresNoCards:runs.reduce((sum,r)=>sum+r.empty.bossCores,0),
  bossCoresCards:runs.reduce((sum,r)=>sum+r.filled.bossCores,0),
  seeds:runs.map(r=>({seed:r.seed,upliftPct:Number(r.upliftPct?.toFixed(2)),bossNo:r.empty.bossCores,bossYes:r.filled.bossCores}))};
 rows.push(row);console.log(JSON.stringify({stage:'cardUpliftJob',row}));
}
assert.equal(rows.length,12);
console.log(JSON.stringify({complete:true,cardUpliftAudit:true,method:'paired real 201 map Worker with full pets skills combat; excludes all boss cards; 5 weighted normal-card candidates, 3 seeds',rows,
 caveats:'Unfixed random boss exposure, 45-second candidate screen, fixed legal comparison gear/weapon/stat/fusion fixture; not mathematical global maximum or separate deterministic boss-only DPS.'}));
