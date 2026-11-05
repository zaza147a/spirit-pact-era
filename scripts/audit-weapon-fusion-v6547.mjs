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
const sigil=Number(process.env.WEAPON_AUDIT_SIGIL||0);
if(!Number.isInteger(sigil)||sigil<0||sigil>8)throw Error('Sigil outside 0..8');
const cardSource=process.env.WEAPON_AUDIT_SOCKETS_SOURCE?JSON.parse(readFileSync(process.env.WEAPON_AUDIT_SOCKETS_SOURCE)):null;
const cardSlots=new Map((cardSource?.rows||[]).map(r=>[r.job+'/'+r.pair,r.sockets]));
const selected=new Set((process.env.WEAPON_AUDIT_JOBS||'').split(',').filter(Boolean));
const tasks=Object.entries(weapons).filter(([job])=>!selected.size||selected.has(job)).flatMap(([job,items])=>items.flatMap(([weapon,offhand])=>pairs.map(pair=>({job,pair,sigil,...(cardSource?{sockets:cardSlots.get(job+'/'+pair)}:{}),forcedWeapon:{weapon,offhand,twoHandBonus:['twoStaff','spellFist'].includes(weapon)?1.10:1.15}}))));
const output=process.env.WEAPON_AUDIT_OUTPUT||(sigil===8?'docs/weapon-fusion-audit-sigil8-v6547.json':'docs/weapon-fusion-audit-v6547.json');
const existing=existsSync(output)?JSON.parse(readFileSync(output)):null;
const rows=selected.size&&existing?existing.rows.filter(r=>!selected.has(r.job)):process.env.WEAPON_AUDIT_RESUME==='1'&&existing?.conditions?.sigil===sigil?existing.rows:[];let next=0;
const finished=new Set(rows.map(r=>r.job+':'+r.weapon+':'+r.offhand+':'+r.pair));
const remaining=tasks.filter(t=>!finished.has(t.job+':'+t.forcedWeapon.weapon+':'+t.forcedWeapon.offhand+':'+t.pair));
function save(){writeFileSync(output,JSON.stringify({conditions:{level:210,gearLevel:200,petLevel:200,enhancement:'SSS',sigil,scenario:'regional',bossIncluded:false,cardSource:process.env.WEAPON_AUDIT_SOCKETS_SOURCE||'built-in weighted cards',search:'bounded coordinate optimization across all legal weapons, 6 unordered fusion pairs and all 20 fusion-skill triples; not global exhaustive for gear, card and stat combinations',seeds:[42,137,731]},completed:rows.length,total:Object.values(weapons).reduce((sum,list)=>sum+list.length*pairs.length,0),rows},null,2)+'\n');}
save();
await Promise.all(Array.from({length:4},async()=>{
 while(next<remaining.length){
  const task=remaining[next++];
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
