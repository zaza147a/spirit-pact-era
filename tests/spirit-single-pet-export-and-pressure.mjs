// Generate directly importable character saves from the same winning builds
// used in the production-Worker screen, then probe the real damage/potion path.
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {spiritCandidate} from './spirit-two-jobs-optimal-gear-fusion-screen.mjs';
import {runtime} from './runtime31-helper.mjs';
import {DAWN_BOSS} from '../dist/dawn-world.js';

const OUTPUT=resolve('tests/fixtures/spirit-single-pet-optimal-210');
const HITS=Number(process.env.SPIRIT_PRESSURE_HITS||120);
const CASES=[
 {job:'pactWarrior',fusion:'magic-defense',preset:'int_agi_luk',label:'靈契君王'},
 {job:'spiritCommander',fusion:'attack-magic',preset:'str_agi_luk',label:'萬靈宗師'}
];
assert.ok(Number.isInteger(HITS)&&HITS>=1&&HITS<=600);
mkdirSync(OUTPUT,{recursive:true});
const saves=[];
for(const scenario of CASES){
 const player=await spiritCandidate(scenario.job,scenario.fusion,scenario.preset);
 player.name=`最佳實戰-${scenario.label}`;
 player.location='dawncity';player.offline={at:0,enabled:false};
 player.autoRevive=false;
 player.autoPotions={playerHp:true,playerSp:true,petHp:true,petSp:true};
 const file=`${scenario.job}-210-sss-sigil8-optimal.json`;
 writeFileSync(resolve(OUTPUT,file),JSON.stringify({version:2,player},null,2)+'\n');
 saves.push({...scenario,file,player});
}

async function strike({player,job},kind,power){
 const p=structuredClone(player),c=await runtime();
 const foe={...DAWN_BOSS,id:'dawn-scout',name:'逐級增傷測試怪',boss:false,
  attackType:kind,atk:power,matk:power,hit:1000000,hp:1e18,maxHp:1e18,lastAttack:0};
 c.api.setup(p,foe);
 // The jobs have different mandatory aggro: King = owner; Commander = pet.
 // Do NOT force Commander attacks onto the owner: that produced a false ceiling.
 c.Math.random=()=>0;
 c.rand=(a)=>a;
 p.hp=c.api.stat('hp');p.mp=c.api.stat('mp');
 const victim=job==='spiritCommander'?p.pets[0]:p;
 const maxHp=victim.hp,def=c.api.stat('def'),mdef=c.api.stat('mdef');
 let failAt=null,minimum=100;
 const before=p.bag.find(item=>item.id==='red_large')?.qty||0;
 for(let hit=0;hit<HITS;hit++){
  c.setTime(1000000+hit*1000);
  c.api.enemyAttack();
  minimum=Math.min(minimum,100*victim.hp/maxHp);
  if(victim.hp<=0){failAt=hit+1;break;}
  c.api.autoUsePotions();
 }
 const after=p.bag.find(item=>item.id==='red_large')?.qty||0;
 return {passed:failAt===null,failAt,maxHp,def,mdef,
  minimumHpPct:Number(minimum.toFixed(2)),potionsUsed:before-after};
}

const results=[];
for(const data of saves.filter(x=>!process.env.SPIRIT_JOB_FILTER||x.job===process.env.SPIRIT_JOB_FILTER))
for(const kind of ['physical','magic'].filter(x=>!process.env.SPIRIT_ATTACK_FILTER||x===process.env.SPIRIT_ATTACK_FILTER)){
 let low=0,high=1;
 const trial=multiplier=>strike(data,kind,Math.round(DAWN_BOSS.atk*multiplier));
 let highResult=await trial(high);
 while(highResult.passed&&high<256){low=high;high*=2;highResult=await trial(high);}
 if(highResult.passed){results.push({job:data.job,kind,passedAtLeast:high,baseAtk:DAWN_BOSS.atk});continue;}
 for(let i=0;i<9;i++){
  const mid=(low+high)/2;
  const r=await trial(mid);
  if(r.passed)low=mid;else high=mid;
 }
 const lastPass=low?await trial(low):null;
 const firstFail=await trial(high);
 results.push({job:data.job,kind,baseAtk:DAWN_BOSS.atk,
  maximumPassingAtk:Math.round(DAWN_BOSS.atk*low),
  minimumFailingAtk:Math.round(DAWN_BOSS.atk*high),
  maxHp:firstFail.maxHp,def:firstFail.def,mdef:firstFail.mdef,
  passingPotions:lastPass?.potionsUsed??null,firstDefeatHit:firstFail.failAt});
 console.log(JSON.stringify({progress:data.job,kind,maximumPassingAtk:Math.round(DAWN_BOSS.atk*low)}));
}
if(!process.env.SPIRIT_JOB_FILTER&&!process.env.SPIRIT_ATTACK_FILTER)
 writeFileSync(resolve(OUTPUT,'pressure-results.json'),JSON.stringify({conditions:'One immortal enemy, 1 guaranteed attack per second, 90% potion threshold, real enemyAttack and autoUsePotions, no auto revive, original final DEF',hits:HITS,results},null,2)+'\n');
console.log(JSON.stringify({complete:true,hits:HITS,results},null,2));
