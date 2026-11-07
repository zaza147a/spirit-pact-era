// Limited, same-clock, same-engine smoke audit. Not a 12-class final balance ranking.
import {readFileSync} from 'node:fs';
import {runtime} from '../tests/runtime31-helper.mjs';

const fixtureName=job=>new URL(['pactWarrior','spiritCommander'].includes(job)?
 `../tests/fixtures/spirit-single-pet-optimal-210/${job}-210-sss-sigil8-optimal.json`:
 `../tests/fixtures/legacy-best-v6559/${job}-210-sss-sigil8-legal.json`,import.meta.url);
const jobs=(process.env.TOWER_AUDIT_JOBS||'knight,wizard').split(',').filter(Boolean);
const floorText=process.env.TOWER_AUDIT_FLOORS||'1,10';
const floors=/^\d+-\d+$/.test(floorText)?(()=>{const [first,last]=floorText.split('-').map(Number);return Array.from({length:Math.max(0,Math.min(100,last-first+1))},(_,i)=>first+i);})():floorText.split(',').map(Number);
const build=process.env.TOWER_AUDIT_BUILD||'damage';
function survivalRespec(attributes){
 const points={...attributes},target=100,need=Math.max(0,target-(Number(points.VIT)||0));
 let remain=need;
 // A deliberately conservative legal redistribution; not a claim of optimality.
 for(const key of ['LUK','AGI']){const spare=Math.max(0,(Number(points[key])||1)-(key==='AGI'?80:60));const take=Math.min(remain,spare);points[key]-=take;remain-=take;}
 points.VIT=(Number(points.VIT)||1)+need-remain;
 return points;
}
const results=[];
for(const job of jobs)for(const floor of floors){
 const c=await runtime(),a=c.api;
 const input=JSON.parse(readFileSync(fixtureName(job),'utf8')).player;
 const p=a.normalize(input);
 if(build==='survival')p.attributes=survivalRespec(p.attributes);
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
 const result={job,build,floor,ticks,success:p.towerProgress.highest>=floor,
  elapsedSeconds:Math.round(ticks/10),coins:p.towerCoins,hp:p.hp,
  status:p.towerRun?'not-finished':p.towerProgress.highest>=floor?'clear':'failed',
  ...((p.towerLastResult?.huntKills!==undefined||p.towerLastFailure?.huntKills!==undefined)?{huntKills:p.towerLastResult?.huntKills??p.towerLastFailure?.huntKills}:{}),
  ...(p.towerLastFailure?{failureReason:p.towerLastFailure.reason,failedAtSeconds:p.towerLastFailure.elapsedSeconds}:{})};
 results.push(result);console.log(JSON.stringify(result));
}
console.log(JSON.stringify({summary:true,scenarios:results.length,cleared:results.filter(r=>r.success).length,
 caveat:'Smoketest with historical legal builds; do not compare to old field DPS leaderboard or use as finalized stage tuning.'}));
