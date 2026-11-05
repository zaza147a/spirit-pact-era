import {readFileSync,writeFileSync} from 'node:fs';
import {runBuild} from './optimized-dps-simulator.mjs';
import {build} from './search-legal-210-stage1.mjs';

const source=JSON.parse(readFileSync(new URL('../docs/legal-210-armor-card-combined-ranking.json',import.meta.url)));
const jobs=(process.argv.find(x=>x.startsWith('--jobs='))?.slice(7)||'wizard,sage,monk').split(',');
const seconds=Number(process.argv.find(x=>x.startsWith('--seconds='))?.slice(10)||600);
const seeds=(process.argv.find(x=>x.startsWith('--seeds='))?.slice(8)||'42,137,731').split(',').map(Number);
const shifts=(process.argv.find(x=>x.startsWith('--shifts='))?.slice(9)||'0,40,80,120').split(',').map(Number);
const cardArg=process.argv.find(x=>x.startsWith('--card='))?.slice(7)||'';
const [cardSlot,cardId]=cardArg?cardArg.split(':'):[];
const tag=process.argv.find(x=>x.startsWith('--tag='))?.slice(6)||'';
const guardRankArg=process.argv.find(x=>x.startsWith('--guard-rank='))?.slice(13);
const vitZero=process.argv.includes('--vit-zero');
const mageDefenses=process.argv.includes('--mage-defenses');
const rows=[];
for(const job of jobs){
 const row=source.rows.find(r=>r.job===job);
 if(!row)throw Error('Missing loadout for '+job);
 for(const shift of shifts){
  const trials=[];
  for(const seed of seeds){
   const setup=build(row.job,row.weapon,row.offhand,row.armorPair,row.agility,row.special,row.seed,{...row.cardOverrides,...(cardSlot?{[cardSlot]:cardId}:{})},row.armorOverrides);
   const result=runBuild(job,'attack',{level:210,encounterLevel:210,gearLevel:200,petLevelOverride:200,seconds,seed,scenario:'pack',reborn:true,thirdJob:true,rarity:'mythic',gearRarity:'mythic',fusionPair:'attack-magic',enhancement:'SSS',petEnhancement:'SSS',dawnSigil:8,searchConfig:(p,pet,imports)=>{
    setup(p,pet,imports);
    if(mageDefenses&&['wizard','sage'].includes(job))p.autoSkills.order=['barrier','focus',...p.autoSkills.order.filter(id=>!['barrier','focus'].includes(id))];
    if(guardRankArg!==undefined)p.jobSkills.manaStudy=Number(guardRankArg);
    if(vitZero){
     let refund=Math.max(0,p.attributes.VIT-1);
     p.attributes.VIT=1;
     for(const key of ['AGI','DEX','STR']){
      const moved=Math.min(refund,150-p.attributes[key]);
      p.attributes[key]+=moved;refund-=moved;
     }
     if(refund)throw Error('Unable to redistribute VIT points legally');
    }
    const transfer=Math.min(shift,150-p.attributes.VIT,p.attributes.LUK-1);
    p.attributes.LUK-=transfer;p.attributes.VIT+=transfer;
    p._liveFieldTest=true;p.autoRevive=false;
   }});
   const m=result.metrics;
   const owner=(m.playerDamage||0)+(m.playerBuffDamage||0);
   const partner=(m.petDamage||0)+(m.resonanceDamage||0)+(m.buffDamage||0);
   trials.push({seed,alive:result.alive,petDeaths:result.petDeaths,elapsed:result.elapsed,remainingHp:result.remainingHp,kills:result.kills,bossKills:m.bossKills||0,potionsUsed:result.potions,intSpRegen:m.intSpRegen||0,playerSpPotionRestore:m.playerSpPotionRestore||0,manaGuardDeathSnapshot:m.manaGuardDeathSnapshot||null,manaWardGenerated:m.manaWardGenerated||0,manaDamageAbsorbed:m.manaDamageAbsorbed||0,manaGuardSpSpent:m.manaGuardSpSpent||0,shieldPrevented:m.playerShieldPrevented||0,ownerDps:owner/seconds,petDps:partner/seconds,dps:(owner+partner)/seconds});
  }
  const valid=trials.every(x=>x.alive&&x.petDeaths===0);
  rows.push({job,shift,card:cardArg||null,guardRank:guardRankArg===undefined?null:Number(guardRankArg),vitZero,mageDefenses,valid,meanDps:trials.reduce((s,x)=>s+x.dps,0)/trials.length,trials});
  console.log(JSON.stringify({job,shift,valid,dps:Math.round(rows.at(-1).meanDps),deaths:trials.filter(x=>!x.alive).map(x=>x.seed)}));
  writeFileSync(new URL(`../docs/legal-210-survival-recovery-${jobs.join('-')}${cardArg?'-'+cardSlot+'-'+cardId:''}${tag?'-'+tag:''}-checkpoint.json`,import.meta.url),JSON.stringify({seconds,seeds,shifts,vitZero,mageDefenses,card:cardArg||null,tag:tag||null,conditions:'Existing legal boss-card and SSS loadout, optionally refund VIT down to base 1 and distribute to AGI/DEX/STR, then transfer LUK to VIT without exceeding stat cap; optional first-job barrier/focus autobattle priority; genuine spawn and death; candidate search only',rows},null,2)+'\n');
 }
}
