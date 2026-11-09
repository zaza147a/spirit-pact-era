// Actual continuous combat from floor 1, including every stage transition.
// Run: node scripts/audit-extreme-trials-continuous-30.mjs > result.jsonl
import {runtime} from '../tests/runtime31-helper.mjs';
import {legacyOptimalPlayer} from '../tests/fixtures/legacy-optimal-player.mjs';
import {beginExtremeRun,extremeStage} from '../dist/extreme-trials.js';
import {readFileSync} from 'node:fs';

const legacy=['knight','crusader','wizard','sage','priest','monk','assassin','rogue','hunter','performer'];
const jobs=process.argv.includes('--job')?[process.argv[process.argv.indexOf('--job')+1]]:[...legacy,'pactWarrior','spiritCommander'];
const kinds=process.argv.includes('--kind')?[process.argv[process.argv.indexOf('--kind')+1]]:['atk','matk','hp','clear'];
const epoch=1000000;
function fixture(job){
 if(legacy.includes(job))return legacyOptimalPlayer(job);
 return structuredClone(JSON.parse(readFileSync(new URL(`../tests/fixtures/spirit-single-pet-optimal-210/${job}-210-sss-sigil8-optimal.json`,import.meta.url),'utf8')).player);
}
async function audit(job,kind){
 const c=await runtime(),player=fixture(job);
 player.location='dawncity';
 const entry=beginExtremeRun(player,kind,1,epoch);
 if(entry.error)return {job,kind,error:entry.error};
 player.extremeRun=entry.run;player.location='dawnrift';
 player.offline={at:epoch,enabled:true};
 c.api.setup(player);c.api.spawnExtremeBoss();c.api.checkpointExtreme();
 const gold=player.gold,xp=player.xp,seconds=extremeStage(kind,1).seconds;
 // One stage beyond the 30th floor gives room for the 30th completion.
 const duration=seconds*31*1000;
 try{
  const result=await c.api.simulateOffline(player,epoch+duration);
  const p=result.player,highest=p.extremeProgress?.[kind]?.highest||0;
  return {job,kind,highest,completed30:highest>=30,
    ended:!p.extremeRun,nextFloor:p.extremeRun?.floor||null,
    reason:result.summary?.reason||'',simulatedSeconds:Math.round((result.summary?.simulated||0)/1000),
    goldDelta:p.gold-gold,xpDelta:p.xp-xp,valid:c.api.valid(p),
    lastResult:p.extremeLastResult||null};
 }catch(error){return {job,kind,error:String(error)};}
}
const rows=[];
for(const job of jobs){
 for(const kind of kinds){const result=await audit(job,kind);rows.push(result);console.log(JSON.stringify(result));}
 console.log(JSON.stringify({checkpoint:job,records:rows.length,errors:rows.filter(x=>x.error).length}));
}
console.log(JSON.stringify({summary:true,total:rows.length,errors:rows.filter(x=>x.error).length,
 all30:rows.every(x=>x.completed30),
 perKind:Object.fromEntries(kinds.map(kind=>[kind,rows.filter(x=>x.kind===kind&&x.completed30).length])),
 noXpLeak:rows.every(x=>!x.error&&x.xpDelta===0)}));
