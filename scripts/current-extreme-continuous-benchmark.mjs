// Uses the real four extreme trials, from floor 1 until failure or an explicit safety ceiling.
// One candidate at a time; not an optimized twelve-class leaderboard.
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {runtime} from '../tests/runtime31-helper.mjs';
import {SECOND_JOBS} from '../dist/jobs.js';
import {FUSIONS,currentEndgamePlayer} from '../tests/fixtures/current-210-endgame-player.mjs';

const job=process.env.EXTREME_JOB||'knight';
const fusion=process.env.EXTREME_FUSION||'attack-magic';
const weaponChoice=process.env.EXTREME_WEAPON||'critDmg';
const weaponId=process.env.EXTREME_WEAPON_ID||null;
const cardSlot=process.env.EXTREME_CARD_SLOT||null;
const cardId=process.env.EXTREME_CARD_ID||null;
const attributeProfile=process.env.EXTREME_ATTRIBUTE_PROFILE||'reference';
const modes=(process.env.EXTREME_MODES||'atk,matk,hp,clear').split(',');
const ceiling=Number(process.env.EXTREME_FLOOR_CEILING||150);
const maxSimSeconds=Number(process.env.EXTREME_SIM_SECONDS||7200);
const seed=Number(process.env.EXTREME_SEED||20261110);
assert.ok(SECOND_JOBS[job]&&FUSIONS.includes(fusion));
assert.ok(['critDmg','aspdPct'].includes(weaponChoice));
assert.equal(Boolean(cardSlot),Boolean(cardId),'card slot and id must be specified together');
assert.ok(modes.every(x=>['atk','matk','hp','clear'].includes(x)));
assert.ok(Number.isInteger(ceiling)&&ceiling>0&&ceiling<=500);

async function run(kind){
 const c=await runtime(),p=currentEndgamePlayer(job,{fusion,weaponChoice,attributeProfile,weaponId,cardOverrides:cardSlot?{[cardSlot]:cardId}:{}});
 let state=seed>>>0;
 const random=()=>((state=(Math.imul(state,1664525)+1013904223)>>>0)/4294967296);
 // Imported ESM helpers execute outside the VM. Seed both realms so they share one RNG stream.
 const nativeRandom=Math.random;
 Math.random=random;
 c.Math.random=random;c.rand=(lo,hi)=>Math.floor(random()*(hi-lo+1))+lo;
 p.location='dawncity';p.extremeProgress={};p.extremeRun=null;
 const started=1_000_000;let now=started,ticks=0;
 c.setTime(started);c.api.setup(p,null);
 vm.runInContext(`startExtreme(${JSON.stringify(kind)},1)`,c);
 assert.equal(p.extremeRun?.kind,kind);
 while(p.extremeRun&&p.extremeRun.floor<=ceiling&&(now-started)<maxSimSeconds*1000){
  now+=100;c.setTime(now);c.api.combatTick(now);ticks++;
 }
 const highest=p.extremeProgress?.[kind]?.highest||0;
 const result={job,fusion,weaponChoice,weaponId,cardSlot,cardId,attributeProfile,seed,kind,highest,ticks,simulatedSeconds:(now-started)/1000,
  stopped:!p.extremeRun?'first-failure':p.extremeRun.floor>ceiling?'floor-ceiling':'time-ceiling',failure:p.extremeLastResult?.reason||null,
  nextFloor:p.extremeRun?.floor||p.extremeLastResult?.floor||null};
 if(result.stopped==='first-failure')assert.equal(result.nextFloor,highest+1);
 Math.random=nativeRandom;
 return result;
}
for(const kind of modes)console.log(JSON.stringify(await run(kind)));
