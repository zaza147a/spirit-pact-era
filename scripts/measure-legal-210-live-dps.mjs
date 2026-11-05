import {readFileSync,writeFileSync} from 'node:fs';
import {runBuild} from './optimized-dps-simulator.mjs';
import {build} from './search-legal-210-stage1.mjs';

const source=JSON.parse(readFileSync(new URL('../docs/legal-210-armor-card-combined-ranking.json',import.meta.url)));
const duration=Number(process.argv.find(x=>x.startsWith('--seconds='))?.split('=')[1]||600);
const seeds=(process.argv.find(x=>x.startsWith('--seeds='))?.split('=')[1]||'42,137,731').split(',').map(Number);
const select=process.argv.find(x=>x.startsWith('--job='))?.split('=')[1];
const rows=[];
for(const row of source.rows.filter(r=>!select||r.job===select)){
 const trials=[];
 for(const seed of seeds){
  const setup=build(row.job,row.weapon,row.offhand,row.armorPair,row.agility,row.special,row.seed,row.cardOverrides,row.armorOverrides);
  const result=runBuild(row.job,'attack',{level:210,encounterLevel:210,gearLevel:200,petLevelOverride:200,seconds:duration,seed,scenario:'pack',reborn:true,thirdJob:true,rarity:'mythic',gearRarity:'mythic',fusionPair:'attack-magic',enhancement:'SSS',petEnhancement:'SSS',dawnSigil:8,searchConfig:(p,pet,imports)=>{setup(p,pet,imports);p._liveFieldTest=true;p.autoRevive=false;}});
  const owner=(result.metrics.playerDamage||0)+(result.metrics.playerBuffDamage||0);
  const pet=(result.metrics.petDamage||0)+(result.metrics.resonanceDamage||0)+(result.metrics.buffDamage||0);
  trials.push({seed,seconds:result.elapsed,alive:result.alive,petDeaths:result.petDeaths,kills:result.kills,bossSpawns:result.metrics.bossSpawns||0,bossKills:result.metrics.bossKills||0,ownerDamage:owner,petDamage:pet,realDps:(owner+pet)/duration,ownerDps:owner/duration,petDps:pet/duration,remainingHp:result.remainingHp,maxHp:result.maxHp});
 }
 const valid=trials.every(t=>t.alive&&t.petDeaths===0);
 rows.push({job:row.job,weapon:row.weapon,offhand:row.offhand,valid,meanDps:trials.reduce((s,t)=>s+t.realDps,0)/trials.length,meanKills:trials.reduce((s,t)=>s+t.kills,0)/trials.length,meanBossKills:trials.reduce((s,t)=>s+t.bossKills,0)/trials.length,trials});
 console.log(JSON.stringify({job:row.job,valid,realDps:Math.round(rows.at(-1).meanDps),kills:rows.at(-1).meanKills,bossKills:rows.at(-1).meanBossKills}));
}
rows.sort((a,b)=>b.meanDps-a.meanDps);
const output={method:'Real encounter slots with stochastic 100–900ms spawn and 250–1400ms replacement; boss 3.5% encounter chance, 90s cooldown; no death clamping; elapsed wall clock includes idle; one cumulative damage report',duration,seeds,rows};
writeFileSync(new URL('../docs/legal-210-live-field-dps.json',import.meta.url),JSON.stringify(output,null,2)+'\n');
