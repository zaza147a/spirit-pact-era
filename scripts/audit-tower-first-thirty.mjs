// Limited, same-clock, same-engine smoke audit. Not a 12-class final balance ranking.
import {readFileSync} from 'node:fs';
import {runtime} from '../tests/runtime31-helper.mjs';

const fixtureName=job=>new URL(['pactWarrior','spiritCommander'].includes(job)?
 `../tests/fixtures/spirit-single-pet-optimal-210/${job}-210-sss-sigil8-optimal.json`:
 `../tests/fixtures/legacy-best-v6559/${job}-210-sss-sigil8-legal.json`,import.meta.url);
const jobs=(process.env.TOWER_AUDIT_JOBS||'knight,wizard').split(',').filter(Boolean);
const floors=(process.env.TOWER_AUDIT_FLOORS||'1,10').split(',').map(Number);
const results=[];
for(const job of jobs)for(const floor of floors){
 const c=await runtime(),a=c.api;
 const input=JSON.parse(readFileSync(fixtureName(job),'utf8')).player;
 const p=a.normalize(input);
 Object.assign(p,{level:210,thirdJob:true,reborn:true,dawnUnlocked:true,location:'dawncity',
  towerProgress:{highest:floor-1},towerCoins:0});
 a.setup(p,null);p.hp=a.stat('hp');p.mp=a.stat('mp');
 const started=1_000_000,stageTime=180_000;
 c.setTime(started);a.startTower(floor);
 if(!p.towerRun)throw Error(`start failed: ${job} floor ${floor}`);
 let ticks=0;
 for(let time=started+100;time<=started+stageTime&&p.towerRun;time+=100){
  c.setTime(time);a.combatTick(time);ticks++;
 }
 const result={job,floor,ticks,success:p.towerProgress.highest>=floor,
  elapsedSeconds:Math.round(ticks/10),coins:p.towerCoins,hp:p.hp,
  status:p.towerRun?'not-finished':p.towerProgress.highest>=floor?'clear':'failed',
  ...(p.towerLastFailure?{failureReason:p.towerLastFailure.reason,failedAtSeconds:p.towerLastFailure.elapsedSeconds}:{})};
 results.push(result);console.log(JSON.stringify(result));
}
console.log(JSON.stringify({summary:true,scenarios:results.length,cleared:results.filter(r=>r.success).length,
 caveat:'Smoketest with historical legal builds; do not compare to old field DPS leaderboard or use as finalized stage tuning.'}));
