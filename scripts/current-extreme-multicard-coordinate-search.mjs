// Bounded coordinate search over multiple boss-card slots, using actual Extreme Trial combat.
// A single step replaces one slot while retaining all accepted prior replacements.
import {spawnSync} from 'node:child_process';
import {writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {currentEndgamePlayer} from '../tests/fixtures/current-210-endgame-player.mjs';
import {CARDS} from '../dist/catalog.js';
import {cardAllowedInSlot} from '../dist/card-effects.js';

const job=process.env.EXTREME_JOB||'pactWarrior';
const fusion=process.env.EXTREME_FUSION||'attack-support';
const profile=process.env.EXTREME_ATTRIBUTE_PROFILE||'agi-luk';
const weapon=process.env.EXTREME_WEAPON||'aspdPct';
const weaponId=process.env.EXTREME_WEAPON_ID||null;
const mode=process.env.EXTREME_MODE||'hp';
const seed=Number(process.env.EXTREME_SEED||20261110);
const maxSlots=Number(process.env.EXTREME_CARD_MAX_SLOTS||5);
const maxCards=Number(process.env.EXTREME_CARD_MAX_CARDS||6);
const passes=Number(process.env.EXTREME_CARD_PASSES||2);
const output=process.env.EXTREME_OUTPUT||`docs/current-extreme-multicard-coordinate-${job}-${mode}-20261111.json`;
assert.ok(['hp','clear','atk','matk'].includes(mode));
assert.ok(Number.isInteger(maxSlots)&&maxSlots>=1&&maxSlots<=12);
assert.ok(Number.isInteger(maxCards)&&maxCards>=1&&maxCards<=30);
assert.ok(Number.isInteger(passes)&&passes>=1&&passes<=5);
const initial=JSON.parse(process.env.EXTREME_CARD_OVERRIDES||'{}');
const player=currentEndgamePlayer(job,{fusion,weaponChoice:weapon,weaponId,attributeProfile:profile,cardOverrides:initial});
const slots=Object.keys(player.gear).filter(slot=>player.gear[slot]&&Object.entries(CARDS).some(([id,c])=>c.boss&&cardAllowedInSlot(c,slot,job))).slice(0,maxSlots);
const baseCards={...player.sockets};
const history=[];
function trial(overrides){
 const result=spawnSync(process.execPath,['scripts/current-extreme-continuous-benchmark.mjs'],{
  env:{...process.env,EXTREME_JOB:job,EXTREME_FUSION:fusion,EXTREME_WEAPON:weapon,EXTREME_WEAPON_ID:weaponId||'',EXTREME_ATTRIBUTE_PROFILE:profile,EXTREME_MODES:mode,EXTREME_SEED:String(seed),EXTREME_CARD_SLOT:'',EXTREME_CARD_ID:'',EXTREME_CARD_OVERRIDES:JSON.stringify(overrides),EXTREME_FLOOR_CEILING:'250'},encoding:'utf8'});
 if(result.status!==0)throw Error(result.stderr||result.stdout);
 const row=JSON.parse(result.stdout.trim());
 assert.equal(row.stopped,'first-failure');
 history.push({overrides:{...overrides},highest:row.highest,ticks:row.ticks});
 return row;
}
let accepted={...initial},best=trial(accepted),evaluations=1;
for(let pass=0;pass<passes;pass++){
 let improved=false;
 for(const slot of slots){
  const currentCards={...baseCards,...accepted};
  const legal=Object.entries(CARDS).filter(([id,c])=>c.boss&&cardAllowedInSlot(c,slot,job)&&!Object.entries(currentCards).some(([other,v])=>other!==slot&&v===id));
  const candidates=legal.filter(([id])=>id!==currentCards[slot]).slice(0,maxCards);
  let slotBest=best,slotAccepted=accepted;
  for(const [id] of candidates){
   const overrides={...accepted,[slot]:id};
   const row=trial(overrides);evaluations++;
   if(row.highest>slotBest.highest){
    slotBest=row;slotAccepted=overrides;
   }
  }
  if(slotAccepted!==accepted){accepted=slotAccepted;best=slotBest;improved=true;}
 }
 if(!improved)break;
}
const report={status:'BOUNDED MULTI-CARD COORDINATE SEARCH; NOT GLOBAL OPTIMUM',job,mode,fusion,weapon,weaponId,profile,seed,maxSlots,maxCards,passes,slots,evaluations,baseline:history[0],winner:{overrides:accepted,highest:best.highest,ticks:best.ticks},history};
writeFileSync(output,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({job,mode,evaluations,baseline:report.baseline.highest,winner:report.winner}));
