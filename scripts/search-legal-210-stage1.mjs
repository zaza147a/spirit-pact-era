import {readFileSync,writeFileSync,existsSync,mkdirSync} from 'node:fs';
import {runBuild} from './optimized-dps-simulator.mjs';
import {legalEquipment,canonicalArmor,outputPairsForJob,legalNormalPool,assertLegalItem} from './legal-dps-equipment.mjs';
import {SECOND_JOBS} from '../dist/jobs.js';
import {SLOTS} from '../dist/catalog.js';
import {preferredBossCards,bossCardCandidates} from './boss-card-selection.mjs';
import {allocateForAspd} from './legal-dps-attributes.mjs';

const weapons={knight:[['twoSpear',null],['twoSword',null],['oneSpear','shield'],['blade','shield']],crusader:[['oneSpear','shield'],['blade','shield']],wizard:[['oneStaff','shield'],['twoStaff',null]],sage:[['spellFist',null],['twoStaff',null],['oneStaff','shield']],assassin:[['katar',null],['rifle','offDagger'],['rifle','shield']],rogue:[['rifle','shield']],priest:[['mace','shield']],monk:[['knuckles',null]],hunter:[['shortBow',null],['longBow',null],['crossbow',null]],performer:[['shortBow',null],['longBow',null],['instrument',null]]};
const armor={headUpper:'helm',headMiddle:'visor',headLower:'mask',armor:'vest',garment:'cloak',shoes:'boots',accessory1:'chip',accessory2:'ring'};
const pairs=['attack-magic'];
const statNames=['STR','AGI','VIT','INT','DEX','LUK'];
const opts=process.argv.slice(2);
const getArg=(name,otherwise)=>{const value=opts.find(x=>x.startsWith(`${name}=`));return value?value.split('=')[1]:otherwise;};
const jobs=getArg('--job','all')==='all'?Object.keys(weapons):getArg('--job','monk').split(',');
const batchSize=Math.max(1,Number(getArg('--batch','100')));
const output='docs/legal-210-stage1-aspd-checkpoint.json';
const previous=existsSync(output)?JSON.parse(readFileSync(output)):null;
const rows=previous?.version===5?previous.rows:[];
const done=new Set(rows.map(x=>x.key));
const attrsFor=(order)=>{const attrs=Object.fromEntries(statNames.map(k=>[k,1]));let left=438;for(const key of [...new Set([...order,...statNames])]){const n=Math.min(left,149);attrs[key]+=n;left-=n;}return attrs;};

function build(job,weapon,offhand,armorPair,agility,weaponSpecial,seed,cardOverrides={},armorOverrides={}){
 return(player,pet)=>{
  player.attributes=allocateForAspd(job,agility);
  player.dawnUnlocked=true;
  player.sockets={...preferredBossCards(job),...cardOverrides};
  player.gear=Object.fromEntries(Object.keys(SLOTS).map(slot=>{
   if(armor[slot])return[slot,canonicalArmor(armor[slot],armorOverrides[slot]||armorPair,seed)];
   const id=slot==='rightHand'?weapon:offhand;
   if(!id)return[slot,null];
   const base=legalNormalPool(id);
   const mandatory=[base[0],'hit'];
   const extra=[...new Set([SECOND_JOBS[job].attribute,'DEX','LUK','AGI','INT','STR','VIT'])].filter(x=>!mandatory.includes(x));
   const normal=[...mandatory,...extra.slice(0,3)];
   // Shields are armor, and offhand daggers are weapons.
   if(id==='shield')return[slot,canonicalArmor(id,armorOverrides[slot]||armorPair,seed)];
   return[slot,legalEquipment(id,{normal,special:weaponSpecial,seed})];
  }));
  for(const slot of Object.keys(SLOTS))if(!player.gear[slot])player.sockets[slot]=null;
  const pSeed=seed*131;
  // Every pet slot has a different legal pool. Prefer fixed defense first;
  // only fill the unavailable remaining properties with attributes.
  pet.gear={
   head:legalEquipment('petHelm',{pet:true,normal:['atk','hit','DEX','VIT','AGI'],special:'damageReduction',seed:pSeed}),
   body:legalEquipment('petArmor',{pet:true,normal:['hp','def','mdef','VIT','AGI'],special:'hpPct',seed:pSeed+1}),
   shoes:legalEquipment('petBoots',{pet:true,normal:['flee','hit','def','VIT','AGI'],special:'hpPct',seed:pSeed+2})
  };
  for(const item of [...Object.values(player.gear),...Object.values(pet.gear)])if(item)assertLegalItem(item,{pet:!!item.id.startsWith('pet')});
 };
}
function* tasks(){
 for(const job of jobs){
  const outputPairs=outputPairsForJob(job);
  for(const [weapon,offhand]of weapons[job])for(const pair of pairs)for(let i=0;i<outputPairs.length;i++)for(const special of ['aspdPct','critDmg']){
   const key=`${job}/${weapon}/${offhand}/${pair}/${i}/${special}`;
   yield{key,job,weapon,offhand,pair,armorPair:outputPairs[i],special,seed:53+i};
  }
 }
}
let attempted=0;
for(const task of getArg('--full',null)||getArg('--cards',null)||getArg('--combine-cards',null)||getArg('--armor-swaps',null)||getArg('--combine-armor',null)||getArg('--export-final',null)?[]:tasks()){
 if(done.has(task.key))continue;
 const calibrated=(agi)=>runBuild(task.job,task.pair.split('-')[0],{level:210,encounterLevel:210,gearLevel:200,petLevelOverride:200,seconds:0,seed:42,reborn:true,thirdJob:true,rarity:'mythic',gearRarity:'mythic',fusionPair:task.pair,enhancement:'SSS',petEnhancement:'SSS',dawnSigil:8,searchConfig:build(task.job,task.weapon,task.offhand,task.armorPair,agi,task.special,task.seed)}).stats.owner.aspd;
 let agility=150;
 if(calibrated(150)>=193){let low=1,high=150;while(low<high){const mid=Math.floor((low+high)/2);if(calibrated(mid)>=193)high=mid;else low=mid+1;}agility=low;}
 const config=build(task.job,task.weapon,task.offhand,task.armorPair,agility,task.special,task.seed);
 const run=(seed,scenario,seconds)=>runBuild(task.job,task.pair.split('-')[0],{level:210,encounterLevel:210,gearLevel:200,petLevelOverride:200,seconds,seed,scenario,reborn:true,thirdJob:true,rarity:'mythic',gearRarity:'mythic',fusionPair:task.pair,enhancement:'SSS',petEnhancement:'SSS',dawnSigil:8,searchConfig:config});
 try{
  const normal=run(42,'regional',30);
  const boss=normal.alive&&normal.petDeaths===0?run(42,'bossCrowdTrial',60):null;
  const survived=!!boss?.alive&&boss.petDeaths===0;
  rows.push({...task,agility,aspd:calibrated(agility),survived,fieldAlive:normal.alive,fieldPetDeaths:normal.petDeaths,bossVictory:boss?.bossVictory??false,bossPetDeaths:boss?.petDeaths??null,bossDps:boss?boss.dps*60/Math.max(.02,boss.elapsed):0,bossSeconds:boss?.timeToKill??null});
 }catch(error){rows.push({...task,error:String(error)});}
 attempted++;
 if(attempted%10===0||attempted===batchSize){
  writeFileSync(output,JSON.stringify({version:5,conditions:'Lv210; attack+magic fusion; boss cards; legal defensive pet gear; weapon special critDmg or aspdPct; AGI calibrated to ASPD 193 and remaining points to LUK; dawnrift boss with four normal mobs; stage 1',completed:rows.length,rows},null,2)+'\n');
  console.log(`checkpoint: +${attempted}, total ${rows.length}, survived ${rows.filter(x=>x.survived).length}`);
 }
 if(attempted>=batchSize)break;
}

if(getArg('--full',null)){
 const finalPath='docs/legal-210-full-aspd-bosscards-checkpoint.json';
 const prior=existsSync(finalPath)?JSON.parse(readFileSync(finalPath)):null;
 const finalRows=prior?.version===1?prior.rows:[];
 const finalDone=new Set(finalRows.map(x=>x.key));
 let count=0;
 for(const task of rows.filter(r=>r.survived)){
  if(finalDone.has(task.key))continue;
  const config=build(task.job,task.weapon,task.offhand,task.armorPair,task.agility,task.special,task.seed);
  try{
   const results=[42,137,731].map(seed=>runBuild(task.job,task.pair.split('-')[0],{level:210,encounterLevel:210,gearLevel:200,petLevelOverride:200,seconds:240,seed,scenario:'bossCrowdTrial',reborn:true,thirdJob:true,rarity:'mythic',gearRarity:'mythic',fusionPair:'attack-magic',enhancement:'SSS',petEnhancement:'SSS',dawnSigil:8,searchConfig:config}));
   finalRows.push({...task,validated:true,bossWins:results.filter(r=>r.bossVictory).length,playerSurvival:results.filter(r=>r.alive).length,petSurvival:results.filter(r=>r.petDeaths===0).length,meanEffectiveDps:results.reduce((n,r)=>n+r.dps*240/Math.max(.02,r.elapsed),0)/3,meanKillSeconds:results.reduce((n,r)=>n+(r.timeToKill??240),0)/3,seedResults:results.map((r,i)=>({seed:[42,137,731][i],bossVictory:r.bossVictory,alive:r.alive,petDeaths:r.petDeaths,timeToKill:r.timeToKill,elapsed:r.elapsed}))});
  }catch(error){finalRows.push({...task,validated:false,error:String(error)});}
  count++;
  if(count%5===0||count>=Number(getArg('--full','10'))){
   writeFileSync(finalPath,JSON.stringify({version:1,conditions:'Original 10 jobs; 210-region boss plus four live mobs; 3 seeds × 240s; legal gear, boss-only cards, attack+magic pet; candidate stage 2',completed:finalRows.length,rows:finalRows},null,2)+'\n');
   console.log(`Full mixed-boss verification: +${count}, total ${finalRows.length}`);
  }
  if(count>=Number(getArg('--full','10')))break;
 }
}

if(getArg('--cards',null)){
 const source=JSON.parse(readFileSync('docs/legal-210-full-aspd-bosscards-checkpoint.json'));
 const chosen=new Map();
 for(const row of source.rows.filter(r=>r.validated&&r.bossWins===3&&r.playerSurvival===3&&r.petSurvival===3)){
  const prev=chosen.get(row.job);if(!prev||row.meanEffectiveDps>prev.meanEffectiveDps)chosen.set(row.job,row);
 }
 const path='docs/legal-210-boss-card-swaps-checkpoint.json';
 const earlier=existsSync(path)?JSON.parse(readFileSync(path)):null;
 const comparisons=earlier?.version===1?earlier.rows:[];
 const compared=new Set(comparisons.map(r=>r.key));
 let completed=0;
 for(const [job,baseline]of chosen){
  if(getArg('--cards','all')!=='all'&&job!==getArg('--cards','all'))continue;
  const preferred=preferredBossCards(job);
  for(const slot of Object.keys(SLOTS)){
   if(slot==='leftHand'&&!baseline.offhand)continue;
   for(const [id]of bossCardCandidates(job,slot)){
    if(id===preferred[slot])continue;
    const key=`${job}/${baseline.key}/${slot}/${id}`;
    if(compared.has(key))continue;
    const config=build(job,baseline.weapon,baseline.offhand,baseline.armorPair,baseline.agility,baseline.special,baseline.seed,{[slot]:id});
    try{
     const results=[42,137,731].map(seed=>runBuild(job,baseline.pair.split('-')[0],{level:210,encounterLevel:210,gearLevel:200,petLevelOverride:200,seconds:240,seed,scenario:'bossCrowdTrial',reborn:true,thirdJob:true,rarity:'mythic',gearRarity:'mythic',fusionPair:'attack-magic',enhancement:'SSS',petEnhancement:'SSS',dawnSigil:8,searchConfig:config}));
     comparisons.push({key,job,slot,card:id,baselineDps:baseline.meanEffectiveDps,threeWins:results.every(r=>r.bossVictory),threeSurvivors:results.every(r=>r.alive),noPetDeaths:results.every(r=>r.petDeaths===0),meanEffectiveDps:results.reduce((n,r)=>n+r.dps*240/Math.max(.02,r.elapsed),0)/3});
    }catch(error){comparisons.push({key,job,slot,card:id,error:String(error)});}
    completed++;
    if(completed%5===0||completed>=Number(getArg('--card-batch','100'))){
     writeFileSync(path,JSON.stringify({version:1,conditions:'Each original class best legal candidate, one boss card changed at a time, 3 seeds x 240s boss + four normals, death rejection',completed:comparisons.length,rows:comparisons},null,2)+'\n');
     console.log(`Boss card swaps: +${completed}, total ${comparisons.length}`);
    }
    if(completed>=Number(getArg('--card-batch','100')))break;
   }
   if(completed>=Number(getArg('--card-batch','100')))break;
  }
  if(completed>=Number(getArg('--card-batch','100')))break;
 }
}

if(getArg('--combine-cards',null)){
 const source=JSON.parse(readFileSync('docs/legal-210-full-aspd-bosscards-checkpoint.json'));
 const cardSwaps=JSON.parse(readFileSync('docs/legal-210-boss-card-swaps-checkpoint.json')).rows;
 const chosen=new Map();
 for(const row of source.rows.filter(r=>r.validated&&r.bossWins===3&&r.playerSurvival===3&&r.petSurvival===3)){
  const earlier=chosen.get(row.job);if(!earlier||row.meanEffectiveDps>earlier.meanEffectiveDps)chosen.set(row.job,row);
 }
 const rows=[];
 for(const [job,baseline]of chosen){
  const overrides=Object.fromEntries(cardSwaps.filter(r=>r.job===job&&r.threeWins&&r.threeSurvivors&&r.noPetDeaths&&r.meanEffectiveDps>r.baselineDps).map(r=>[r.slot,r.card]));
  const config=build(job,baseline.weapon,baseline.offhand,baseline.armorPair,baseline.agility,baseline.special,baseline.seed,overrides);
  const results=[42,137,731].map(seed=>runBuild(job,baseline.pair.split('-')[0],{level:210,encounterLevel:210,gearLevel:200,petLevelOverride:200,seconds:240,seed,scenario:'bossCrowdTrial',reborn:true,thirdJob:true,rarity:'mythic',gearRarity:'mythic',fusionPair:'attack-magic',enhancement:'SSS',petEnhancement:'SSS',dawnSigil:8,searchConfig:config}));
  rows.push({...baseline,cardOverrides:overrides,verified:results.every(r=>r.bossVictory&&r.alive&&r.petDeaths===0),meanEffectiveDps:results.reduce((n,r)=>n+r.dps*240/Math.max(.02,r.elapsed),0)/3,meanKillSeconds:results.reduce((n,r)=>n+(r.timeToKill??240),0)/3});
  console.log(job,Math.round(rows.at(-1).meanEffectiveDps),rows.at(-1).verified);
 }
 rows.sort((a,b)=>b.meanEffectiveDps-a.meanEffectiveDps);
 writeFileSync('docs/legal-210-combined-boss-cards-ranking.json',JSON.stringify({conditions:'Legal SSS gear, class output affixes, boss-only cards with profitable single-slot swaps combined; 210 regional boss + four live normals; 3 seeds x 240s; sigil 8',rows},null,2)+'\n');
}

if(getArg('--armor-swaps',null)){
 const ranking=JSON.parse(readFileSync('docs/legal-210-combined-boss-cards-ranking.json')).rows;
 const path='docs/legal-210-armor-position-swaps-checkpoint.json';
 const prior=existsSync(path)?JSON.parse(readFileSync(path)):null;
 const comparisons=prior?.version===1?prior.rows:[];
 const completedKeys=new Set(comparisons.map(r=>r.key));
 let processed=0;
 for(const baseline of ranking){
  const job=baseline.job;
  for(const slot of [...Object.keys(armor),...(baseline.offhand==='shield'?['leftHand']:[])]){
   for(const pair of outputPairsForJob(job)){
    if(JSON.stringify(pair)===JSON.stringify(baseline.armorPair))continue;
    const key=`${job}/${slot}/${pair.join('-')}`;
    if(completedKeys.has(key))continue;
    const config=build(job,baseline.weapon,baseline.offhand,baseline.armorPair,baseline.agility,baseline.special,baseline.seed,baseline.cardOverrides,{[slot]:pair});
    try{
     const results=[42,137,731].map(seed=>runBuild(job,baseline.pair.split('-')[0],{level:210,encounterLevel:210,gearLevel:200,petLevelOverride:200,seconds:240,seed,scenario:'bossCrowdTrial',reborn:true,thirdJob:true,rarity:'mythic',gearRarity:'mythic',fusionPair:'attack-magic',enhancement:'SSS',petEnhancement:'SSS',dawnSigil:8,searchConfig:config}));
     comparisons.push({key,job,slot,pair,baselineDps:baseline.meanEffectiveDps,verified:results.every(r=>r.bossVictory&&r.alive&&r.petDeaths===0),meanEffectiveDps:results.reduce((n,r)=>n+r.dps*240/Math.max(.02,r.elapsed),0)/3});
    }catch(error){comparisons.push({key,job,slot,pair,error:String(error)});}
    processed++;
    if(processed%10===0||processed>=Number(getArg('--armor-swaps','100'))){
     writeFileSync(path,JSON.stringify({version:1,conditions:'Independent slot output-pair swap, all other armor fixed, legitimate boss cards, 3 seeds x 240s live mixed encounter',completed:comparisons.length,rows:comparisons},null,2)+'\n');
     console.log(`Armor slot trials: +${processed}, total ${comparisons.length}`);
    }
    if(processed>=Number(getArg('--armor-swaps','100')))break;
   }
   if(processed>=Number(getArg('--armor-swaps','100')))break;
  }
  if(processed>=Number(getArg('--armor-swaps','100')))break;
 }
}

if(getArg('--combine-armor',null)){
 const ranking=JSON.parse(readFileSync('docs/legal-210-combined-boss-cards-ranking.json')).rows;
 const changes=JSON.parse(readFileSync('docs/legal-210-armor-position-swaps-checkpoint.json')).rows;
 const improved=[];
 for(const baseline of ranking){
  const variants=changes.filter(x=>x.job===baseline.job&&x.verified&&x.meanEffectiveDps>x.baselineDps);
  const armorOverrides=Object.fromEntries(variants.map(x=>[x.slot,x.pair]));
  const calc=(agi)=>runBuild(baseline.job,'attack',{level:210,encounterLevel:210,gearLevel:200,petLevelOverride:200,seconds:0,seed:42,reborn:true,thirdJob:true,rarity:'mythic',gearRarity:'mythic',fusionPair:'attack-magic',enhancement:'SSS',petEnhancement:'SSS',dawnSigil:8,searchConfig:build(baseline.job,baseline.weapon,baseline.offhand,baseline.armorPair,agi,baseline.special,baseline.seed,baseline.cardOverrides,armorOverrides)}).stats.owner.aspd;
  let agility=150;
  if(calc(150)>=193){let low=1,high=150;while(low<high){const mid=Math.floor((low+high)/2);if(calc(mid)>=193)high=mid;else low=mid+1;}agility=low;}
  const config=build(baseline.job,baseline.weapon,baseline.offhand,baseline.armorPair,agility,baseline.special,baseline.seed,baseline.cardOverrides,armorOverrides);
  const results=[42,137,731].map(seed=>runBuild(baseline.job,'attack',{level:210,encounterLevel:210,gearLevel:200,petLevelOverride:200,seconds:240,seed,scenario:'bossCrowdTrial',reborn:true,thirdJob:true,rarity:'mythic',gearRarity:'mythic',fusionPair:'attack-magic',enhancement:'SSS',petEnhancement:'SSS',dawnSigil:8,searchConfig:config}));
  const tested={...baseline,agility,aspd:calc(agility),armorOverrides,verified:results.every(r=>r.bossVictory&&r.alive&&r.petDeaths===0),meanEffectiveDps:results.reduce((sum,r)=>sum+r.dps*240/Math.max(.02,r.elapsed),0)/3,meanKillSeconds:results.reduce((sum,r)=>sum+(r.timeToKill??240),0)/3};
  improved.push(tested.verified&&tested.meanEffectiveDps>baseline.meanEffectiveDps?tested:{...baseline,armorOverrides:{},combinedAttemptDps:tested.meanEffectiveDps});
  console.log(baseline.job,Math.round(improved.at(-1).meanEffectiveDps),improved.at(-1).verified);
 }
 improved.sort((a,b)=>b.meanEffectiveDps-a.meanEffectiveDps);
 writeFileSync('docs/legal-210-armor-card-combined-ranking.json',JSON.stringify({conditions:'Combined profitable armor and boss card swaps; AGI recalibrated to 193; 3 seeds x 240s 210-region boss with four normal enemies, death invalidates',rows:improved},null,2)+'\n');
}

if(getArg('--export-final',null)){
 const ranking=JSON.parse(readFileSync('docs/legal-210-armor-card-combined-ranking.json')).rows;
 const directory=new URL('../dist/test-saves/legal-210-survival-first/',import.meta.url);
 mkdirSync(directory,{recursive:true});
 const manifest=[];
 for(const row of ranking){
  if(!row.verified)continue;
  const config=build(row.job,row.weapon,row.offhand,row.armorPair,row.agility,row.special,row.seed,row.cardOverrides,row.armorOverrides);
  const result=runBuild(row.job,'attack',{level:210,encounterLevel:210,gearLevel:200,petLevelOverride:200,seconds:0,seed:42,reborn:true,thirdJob:true,rarity:'mythic',gearRarity:'mythic',fusionPair:'attack-magic',enhancement:'SSS',petEnhancement:'SSS',dawnSigil:8,fixture:true,searchConfig:config});
  const player=result.fixture;
  player.name=`合法首領測試-${row.job}`.slice(0,16);
  player.hp=result.maxHp;
  player.location='dawncity';player.lastMap='dawnrift';player.offline={at:Date.now(),enabled:true};player.manualPaused=false;
  player.autoPotions={playerHp:true,playerSp:true,petHp:true,petSp:true};
  delete player.trialRun;
  const file=`${row.job}-210-sss-sigil8-legal.json`;
  writeFileSync(new URL(file,directory),JSON.stringify({version:2,player},null,2)+'\n');
  manifest.push({file,job:row.job,weapon:row.weapon,offhand:row.offhand,armorPair:row.armorPair,armorOverrides:row.armorOverrides,cardOverrides:row.cardOverrides,agility:row.agility,aspd:row.aspd,dps:row.meanEffectiveDps,verified:row.verified});
  console.log('exported',file);
 }
 writeFileSync(new URL('manifest.json',directory),JSON.stringify({conditions:'Stage-one candidate optimum only. Three seeded 240-second mixed boss fights survived; not an exhaustive all-affix/card proof.',rows:manifest},null,2)+'\n');
}
