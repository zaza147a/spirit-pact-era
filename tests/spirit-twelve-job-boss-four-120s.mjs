// Twelve-job stationary 210 boss + four-mob mixed DPS with actual combatTick.
// This does not claim to reproduce prior screenshots' unpublished build choices.
import assert from 'node:assert/strict';
import {runtime} from './runtime31-helper.mjs';
import {ALL_COMPARISON_JOBS} from './fixtures/spirit-vs-class-player.mjs';
import {offensiveComparisonPlayer} from './fixtures/spirit-ranking-offensive-player.mjs';
import {DAWN_BOSS,DAWN_MONSTERS} from '../dist/dawn-world.js';

const SEEDS=[471122,93217,81733],SECONDS=Number(process.env.SPIRIT_SECONDS||120),STEP=Number(process.env.SPIRIT_STEP_MS||100);
function seeded(seed){return()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);}
const rows=[];
for(const job of ALL_COMPARISON_JOBS.filter(j=>!process.env.SPIRIT_JOB_FILTER||j===process.env.SPIRIT_JOB_FILTER)){
  for(const seed of SEEDS){
    const p=offensiveComparisonPlayer(job);
    const c=await runtime({captureDamage:true});
    c.Math.random=seeded(seed);
    const foes=[DAWN_BOSS,...Array.from({length:4},(_,i)=>DAWN_MONSTERS[i%3])].map((m,i)=>({
      ...m,instanceId:`fixed-${i}`,maxHp:1e15,hp:1e15,appearedAt:1e6,
      lastAttack:1e6,slotIndex:i?i-1:undefined
    }));
    c.api.setup(p,foes[0]);c.api.setEnemies(foes);c.api.beginReport();
    // Test-only fixed encounter, no random respawning. Combat, cooldown, damage
    // and boss mechanics still run through the real game logic.
    c.tickEncounters=()=>{};
    c.api.setOnlineForTest({running:true});
    p.hp=c.api.stat('hp');p.mp=c.api.stat('mp');
    p.autoPotions={playerHp:true,playerSp:true,petHp:true,petSp:true};
    p.potionThresholds={playerHp:90,playerSp:90,petHp:90,petSp:90};
    p.bag.push({id:'red_large',qty:9999},{id:'blue_large',qty:9999});
    for(let tick=0;tick<SECONDS*1000;tick+=STEP){
      c.setTime(1e6+tick);
      c.api.combatTick(1e6+tick);
      if(!p.hp)break;
    }
    const damages=c.damageEvents;
    const total=damages.reduce((a,event)=>a+event.applied,0);
    const owner=damages.filter(e=>e.key==='playerDamage'||e.key==='playerBuffDamage').reduce((a,e)=>a+e.applied,0);
    rows.push({job,seed,actualDps:Math.round(total/SECONDS),bossKilled:foes[0].hp<=0,
      mobsKilled:foes.slice(1).filter(f=>f.hp<=0).length,alive:p.hp>0,
      ownerDps:Math.round(owner/SECONDS),
      petDps:Math.round((total-owner)/SECONDS),
      remainingBossHp:foes[0].hp});
    assert.ok(Number.isFinite(total));
  }
  console.log(JSON.stringify({progress:job,meanDps:Math.round(rows.filter(r=>r.job===job).reduce((a,r)=>a+r.actualDps,0)/3)}));
}
const ranked=ALL_COMPARISON_JOBS.map(job=>{
  const group=rows.filter(r=>r.job===job),mean=k=>group.reduce((a,r)=>a+r[k],0)/group.length;
  return {job,meanDps:Math.round(mean('actualDps')),meanOwnerDps:Math.round(mean('ownerDps')),
    meanPetDps:Math.round(mean('petDps')),bossKills:group.filter(r=>r.bossKilled).length,
    meanMobsKilled:Number(mean('mobsKilled').toFixed(2)),survived:group.filter(r=>r.alive).length};
}).sort((a,b)=>b.meanDps-a.meanDps);
console.log(JSON.stringify({complete:true,conditions:{seconds:SECONDS,seeds:SEEDS,boss:DAWN_BOSS.id,
  mobIds:Array.from({length:4},(_,i)=>DAWN_MONSTERS[i%3].id),sigil:8,
  limitation:'Stationary immortal boss+four mobs for 120s, real online combatTick and defenses; nonoptimized identical-quality SSS fixtures. This is sustained mixed DPS, not finite boss-clear DPS, and prior screenshot build and combat policy remain undocumented.'},
  ranked:ranked.map((r,i)=>({rank:i+1,...r})),rows},null,2));
