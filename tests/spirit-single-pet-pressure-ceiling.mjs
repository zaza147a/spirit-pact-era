// Synthetic solo-monster durability probe using the real game enemyAttack + autoUsePotions.
// Never registers the monster in game content. Exactly one target, one hit per second.
import assert from 'node:assert/strict';
import {runtime} from './runtime31-helper.mjs';
import {highLevelSpiritPlayer} from './fixtures/spirit-high-level-player.mjs';
import {FUSION_TYPES,canonicalFusionKey} from '../dist/spirit-job-rules.js';
import {rollGear,GEAR_BASE,PET_GEAR_BASE,SPECIAL_AFFIXES,affixRange} from '../dist/loot.js';
import {CARDS,SLOTS} from '../dist/catalog.js';
import {cardAllowedInSlot} from '../dist/card-effects.js';
import {DAWN_BOSS} from '../dist/dawn-world.js';

const trials=Number(process.env.SPIRIT_PRESSURE_HITS||60);
assert.ok(Number.isInteger(trials)&&trials>=1&&trials<=600);
const jobs=[['pactWarrior','magic-defense',{STR:1,AGI:72,VIT:120,INT:150,DEX:1,LUK:100}],
 ['spiritCommander','attack-support',{STR:150,AGI:90,VIT:23,INT:120,DEX:1,LUK:60}]];
const cards=['迷霧鐘樓魔像','千枝菌冠女皇','以太晶冠聖鹿','永凍白熊王','星核觀測者',
 '星潮海皇','古誓森母','齒輪裁決者','曜骨龍皇','界源熾天使'];

function loadout(job,fusion,attributes){
 const partner=FUSION_TYPES.find(v=>v!==fusion);
 const p=highLevelSpiritPlayer({job,level:210,pairKey:[fusion,partner].sort().join('+'),allowBoss:true});
 p.attributes={...attributes};
 assert.equal(Object.values(p.attributes).reduce((sum,n)=>sum+n-1,0),438);
 const pet=p.pets.find(unit=>canonicalFusionKey(unit)===fusion);
 p.pets=[pet];p.activePetId=pet.id;p.secondaryPetId=null;
 p.petStances={[pet.id]:job==='pactWarrior'?'assimilate':'assist'};
 p.gear.rightHand=rollGear('staffSword',200,'mythic',()=>.25);
 p.gear.rightHand.enhancement='SSS';
 // Match the prior 15-minute survival-benchmark special-affix selection.
 for(const gear of [...Object.values(p.gear),...Object.values(pet.gear)]){
  if(!gear)continue;
  const base=GEAR_BASE[gear.id]||PET_GEAR_BASE[gear.id];
  const weapon=!!base?.weaponType||base?.petSlot==='head';
  const next={...gear.affixes};
  for(const key of Object.keys(next))if(SPECIAL_AFFIXES.has(key))delete next[key];
  const chosen=weapon?'damageReduction':'hpPct';
  next[chosen]=affixRange(chosen,gear.tier,gear.rarity,gear.id)[1];
  assert.equal(Object.keys(next).length,Object.keys(gear.affixes).length);
  gear.affixes=next;
 }
 for(const [i,slot] of Object.keys(SLOTS).entries()){
  const card=Object.entries(CARDS).find(([id,v])=>v.boss&&v.name.includes(cards[i])&&v.map!=='dawnrift'&&cardAllowedInSlot(v,slot,job));
  assert.ok(card,`legal boss card missing for ${slot}: ${cards[i]}`);
  p.sockets[slot]=card[0];
 }
 p.potionThresholds={playerHp:90,playerSp:90,petHp:90,petSp:90};
 p.autoPotions={playerHp:true,playerSp:true,petHp:true,petSp:true};
 p.autoRevive=false;
 p.hp=1e15;pet.hp=1e15;
 return p;
}

async function probe(job,fusion,attributes,attackType,power){
 const c=await runtime();const p=loadout(job,fusion,attributes);
 const foe={...DAWN_BOSS,id:'dawn-scout',name:'測試用壓力怪',boss:false,
  attackType,atk:power,matk:power,hit:1000000,aspd:150,hp:1e18,maxHp:1e18,lastAttack:0};
 c.api.setup(p,foe);c.Math.random=()=>0;c.rand=lo=>lo;
 const actualMax=job==='pactWarrior'?c.api.stat('hp'):c.petStats(p.pets[0]).hp;
 p.hp=c.api.stat('hp');p.pets[0].hp=c.petStats(p.pets[0]).hp;
 const selected=job==='pactWarrior'?p:p.pets[0];
 let minimumRatio=1,failAt=null,potions=0;
 const startStock=p.bag.find(item=>item.id==='red_large')?.qty||0;
 for(let i=0;i<trials;i++){
  c.setTime(1000000+i*1000);
  c.api.enemyAttack();
  minimumRatio=Math.min(minimumRatio,selected.hp/actualMax);
  if(selected.hp<=0){failAt=i+1;break;}
  c.api.autoUsePotions();
 }
 potions=startStock-(p.bag.find(item=>item.id==='red_large')?.qty||0);
 return {job,fusion,attackType,monsterAtk:power,threshold:90,passed:failAt===null,
  firstDefeatHit:failAt,receivedHits:failAt||trials,potions,
  minHpPct:Number((minimumRatio*100).toFixed(2)),endHpPct:Number((selected.hp/actualMax*100).toFixed(2)),
  targetMaxHp:actualMax};
}

const rows=[];
const base=DAWN_BOSS.atk;
for(const [job,fusion,attributes] of jobs)for(const attackType of ['physical','magic']){
 let low=0,high=1;
 const at=async multiplier=>probe(job,fusion,attributes,attackType,Math.round(base*multiplier));
 for(;high<=128;high*=2){const result=await at(high);rows.push(result);if(!result.passed)break;low=high;}
 if(high>128)continue;
 for(let i=0;i<7;i++){
  const mid=(low+high)/2;if(mid===low||mid===high)break;
  const result=await at(mid);rows.push(result);
  if(result.passed)low=mid;else high=mid;
 }
}
console.log(JSON.stringify({scenario:'One immortal synthetic Lv210 monster, exact 90% auto-heal, consecutive guaranteed hits at 1 Hz, increasing physical/magic ATK; zero auto-revives',baseDawnBossAtk:base,hitsPerTrial:trials,rows},null,2));
