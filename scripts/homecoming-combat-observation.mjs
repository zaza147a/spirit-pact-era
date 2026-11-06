// Normal online combat through the production tick, without injected damage.
// Fixed synthetic builds: an encounter smoke check, not optimized class balance.
import {writeFileSync,mkdirSync} from 'node:fs';
import {runtime} from '../tests/runtime31-helper.mjs';
import {comparisonPlayer,ALL_COMPARISON_JOBS} from '../tests/fixtures/spirit-vs-class-player.mjs';
import {HOMECOMING_ROUTES} from '../dist/homecoming-data.js';
import {HOMECOMING_ENCOUNTERS} from '../dist/homecoming-encounters.js';
import {HOMECOMING_ADVENTURES,adventureLocation,newHomecomingAdventure} from '../dist/homecoming-adventures.js';
const nativeRandom=Math.random;
const rows=[],epoch=1000000,limit=180000,seeds=[93217,44021];
for(const job of ALL_COMPARISON_JOBS.filter(j=>!['pactWarrior','spiritCommander'].includes(j)))
for(const [routeId,steps] of Object.entries(HOMECOMING_ENCOUNTERS))
for(const step of Object.keys(steps))for(const seed of seeds){
 let random=seed;const rng=()=>((random=(Math.imul(random,1664525)+1013904223)>>>0)/4294967296);
 // Imported combat modules use the host Math; seed both host and VM paths.
 Math.random=rng;
 const c=await runtime(),a=c.api,p=comparisonPlayer({job,level:210});
 c.Math.random=rng;c.rand=(lo,hi)=>Math.floor(rng()*(hi-lo+1))+lo;
 const route=HOMECOMING_ROUTES.find(r=>r.id===routeId),pet=p.pets[0];
 const [main,sub]=routeId.split('-');
 Object.assign(pet,{fusion:{main,sub,version:1},trueForm:true,humanoidStage:3});
 p.dawnSigil=8;p.autoRevive=false;p.autoEscapeBoss=false;
 p.location=adventureLocation(route,HOMECOMING_ADVENTURES[routeId].nodes[step]);
 p.homecoming={routes:{[routeId]:{phase:'active',adventure:{...newHomecomingAdventure(routeId),step}}},completedRoutes:{}};
 a.setup(a.normalize(p),null);const owner=a.state().player,unit=owner.pets[0];
 owner.hp=a.stat('hp');owner.mp=a.stat('mp');unit.hp=a.petStats(unit).hp;unit.sp=a.petStats(unit).sp;
 const maxHp=owner.hp,foe=a.addHomecomingEncounter(epoch);
 if(!foe)throw Error('Missing encounter '+routeId+'/'+step);
 let elapsed=0,minHp=maxHp,petDeaths=0,wasAlive=true;
 for(elapsed=20;elapsed<=limit;elapsed+=20){
  c.setTime(epoch+elapsed);a.combatTick(epoch+elapsed);
  minHp=Math.min(minHp,owner.hp);
  if(wasAlive&&unit.hp<=0)petDeaths++;wasAlive=unit.hp>0;
  if(owner.hp<=0||foe.hp<=0||owner.location!==p.location)break;
 }
 const current=a.state().player.homecoming.routes[routeId];
 const advanced=current.phase!=='active'||current.adventure.step!==step;
 const row={job,routeId,step,seed,enemy:foe.name,outcome:advanced?'win':owner.hp<=0?'death':foe.hp<=0?'uncredited':'timeout',seconds:Math.min(elapsed,limit)/1000,minHpPercent:Math.round(minHp/maxHp*10000)/100,enemyHpPercent:Math.round(foe.hp/foe.maxHp*10000)/100,petDeaths};
 rows.push(row);
}
Math.random=nativeRandom;
const summary={scenarios:rows.length,wins:rows.filter(r=>r.outcome==='win').length,deaths:rows.filter(r=>r.outcome==='death').length,timeouts:rows.filter(r=>r.outcome==='timeout').length,uncredited:rows.filter(r=>r.outcome==='uncredited').length};
mkdirSync('docs/homecoming-combat',{recursive:true});
writeFileSync('docs/homecoming-combat/results.json',JSON.stringify({summary,conditions:{seeds,tickMs:20,limitMs:limit,level:210,sigil:8,gear:'fixed mythic SSS fixture, normal cards',fourthSkill:'locked before route completion',limitations:'Synthetic builds, not optimized; VM combat ticks, not browser acceptance. Narrative entry is set directly to each battle node.'},rows},null,2)+'\n');
console.log(JSON.stringify(summary));
for(const key of Object.keys(HOMECOMING_ENCOUNTERS)){const group=rows.filter(r=>r.routeId===key);console.log(JSON.stringify({routeId:key,wins:group.filter(r=>r.outcome==='win').length,total:group.length,minSeconds:Math.min(...group.map(r=>r.seconds)),maxSeconds:Math.max(...group.map(r=>r.seconds))}));}
