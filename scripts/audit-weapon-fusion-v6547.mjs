import {Worker} from 'node:worker_threads';
import {readFileSync,writeFileSync,existsSync} from 'node:fs';

// Bounded optimizer: one independently optimized build per legal weapon/fusion pair.
// This is pure regional DPS with normal monsters, not a boss-inclusive field replay.
const weapons={
 knight:[['blade','shield'],['oneSpear','shield'],['twoSword',null],['twoSpear',null]],
 crusader:[['blade','shield'],['oneSpear','shield']],
 wizard:[['oneStaff','shield'],['twoStaff',null]],
 sage:[['oneStaff','shield'],['twoStaff',null],['spellFist',null]],
 assassin:[['rifle','shield'],['rifle','offDagger'],['katar',null]],
 rogue:[['rifle','shield']],priest:[['mace','shield']],monk:[['knuckles',null]],
 hunter:[['shortBow',null],['longBow',null],['crossbow',null]],
 performer:[['shortBow',null],['longBow',null],['instrument',null]]
};
const pairs=['attack-magic','attack-defense','attack-support','magic-defense','magic-support','defense-support'];
const selected=new Set((process.env.WEAPON_AUDIT_JOBS||'').split(',').filter(Boolean));
const tasks=Object.entries(weapons).filter(([job])=>!selected.size||selected.has(job)).flatMap(([job,items])=>items.flatMap(([weapon,offhand])=>pairs.map(pair=>({job,pair,forcedWeapon:{weapon,offhand,twoHandBonus:['twoStaff','spellFist'].includes(weapon)?1.10:1.15}}))));
const output=process.env.WEAPON_AUDIT_OUTPUT||'docs/weapon-fusion-audit-v6547.json';
const rows=selected.size&&existsSync(output)?JSON.parse(readFileSync(output)).rows.filter(r=>!selected.has(r.job)):[];let next=0;
function save(){writeFileSync(output,JSON.stringify({conditions:{level:210,gearLevel:200,petLevel:200,enhancement:'SSS',sigil:0,scenario:'regional',bossIncluded:false,search:'bounded coordinate optimization; not exhaustive',seeds:[42,137,731]},completed:rows.length,total:Object.values(weapons).reduce((sum,list)=>sum+list.length*pairs.length,0),rows},null,2)+'\n');}
save();
await Promise.all(Array.from({length:4},async()=>{
 while(next<tasks.length){
  const task=tasks[next++];
  const result=await new Promise((resolve,reject)=>{
   const w=new Worker(new URL('./optimized-dps-hypothesis-worker.mjs',import.meta.url));
   w.once('error',reject);
   w.once('message',async value=>{await w.terminate();value.error?reject(Error(value.error)):resolve(value);});
   w.postMessage(task);
  });
  rows.push({weapon:task.forcedWeapon.weapon,offhand:task.forcedWeapon.offhand,...result});save();
  console.log(`${rows.length}/${tasks.length} ${task.job} ${task.forcedWeapon.weapon} ${task.pair} ${(result.dps/1e6).toFixed(1)}M`);
 }
}));
