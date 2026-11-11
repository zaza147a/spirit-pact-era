// Real-engine smoke/legality comparison for two simultaneous boss-card changes.
import {spawnSync} from 'node:child_process';
import {writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {CARDS} from '../dist/catalog.js';
import {cardAllowedInSlot} from '../dist/card-effects.js';
import {currentEndgamePlayer} from '../tests/fixtures/current-210-endgame-player.mjs';
const jobs=[{job:'pactWarrior',fusion:'attack-support',profile:'agi-luk'},{job:'spiritCommander',fusion:'attack-magic',profile:'agi-luk'}];
const output=[];
for(const {job,fusion,profile} of jobs){
 const p=currentEndgamePlayer(job,{fusion,weaponChoice:'aspdPct',attributeProfile:profile});
 const selected={};
 const used=new Set(Object.values(p.sockets).filter(Boolean));
 // Find two legal replacements in different occupied slots. Preserve uniqueness.
 for(const slot of Object.keys(p.gear)){
  if(!p.gear[slot])continue;
  const candidate=Object.entries(CARDS).find(([id,c])=>c.boss&&id!==p.sockets[slot]&&!used.has(id)&&cardAllowedInSlot(c,slot,job));
  if(!candidate)continue;
  selected[slot]=candidate[0];used.add(candidate[0]);
  if(Object.keys(selected).length===2)break;
 }
 assert.equal(Object.keys(selected).length,2,'need two distinct legal boss-card replacements');
 for(const mode of ['hp','clear']){
  for(const overrides of [{},selected]){
   const r=spawnSync(process.execPath,['scripts/current-extreme-continuous-benchmark.mjs'],{
    env:{...process.env,EXTREME_JOB:job,EXTREME_FUSION:fusion,EXTREME_WEAPON:'aspdPct',EXTREME_ATTRIBUTE_PROFILE:profile,EXTREME_CARD_OVERRIDES:JSON.stringify(overrides),EXTREME_MODES:mode,EXTREME_SEED:'20261110',EXTREME_FLOOR_CEILING:'250'},encoding:'utf8'});
   if(r.status!==0)throw Error(r.stderr||r.stdout);
   const row=JSON.parse(r.stdout.trim());
   assert.equal(row.stopped,'first-failure');
   assert.deepEqual(row.cardOverrides,overrides);
   output.push(row);
   console.log(job,mode,JSON.stringify(overrides),row.highest);
  }
 }
}
writeFileSync('docs/current-extreme-multicard-smoke-20261111.json',JSON.stringify({purpose:'Demonstrate simultaneous legal boss-card changes through real Extreme Trial; not a card optimization',rows:output},null,2)+'\n');
