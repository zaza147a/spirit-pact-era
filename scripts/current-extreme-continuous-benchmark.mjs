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
const modes=(process.env.EXTREME_MODES||'atk,matk,hp,clear').split(',');
const ceiling=Number(process.env.EXTREME_FLOOR_CEILING||150);
const maxSimSeconds=Number(process.env.EXTREME_SIM_SECONDS||7200);
assert.ok(SECOND_JOBS[job]&&FUSIONS.includes(fusion));
assert.ok(['critDmg','aspdPct'].includes(weaponChoice));
assert.ok(modes.every(x=>['atk','matk','hp','clear'].includes(x)));
assert.ok(Number.isInteger(ceiling)&&ceiling>0&&ceiling<=500);

async function run(kind){
 const c=await runtime(),p=currentEndgamePlayer(job,{fusion,weaponChoice});
 p.location='dawncity';p.extremeProgress={};p.extremeRun=null;
 const started=1_000_000;let now=started,ticks=0;
 c.setTime(started);c.api.setup(p,null);
 vm.runInContext(`startExtreme(${JSON.stringify(kind)},1)`,c);
 assert.equal(p.extremeRun?.kind,kind);
 while(p.extremeRun&&p.extremeRun.floor<=ceiling&&(now-started)<maxSimSeconds*1000){
  now+=100;c.setTime(now);c.api.combatTick(now);ticks++;
 }
 const highest=p.extremeProgress?.[kind]?.highest||0;
 const result={job,fusion,weaponChoice,kind,highest,ticks,simulatedSeconds:(now-started)/1000,
  stopped:p.extremeRun?'safety-ceiling':'first-failure',failure:p.extremeLastResult?.reason||null,
  nextFloor:p.extremeRun?.floor||p.extremeLastResult?.floor||null};
 if(result.stopped==='first-failure')assert.equal(result.nextFloor,highest+1);
 return result;
}
for(const kind of modes)console.log(JSON.stringify(await run(kind)));
