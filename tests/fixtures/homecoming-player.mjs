// Legal endgame build extracted from the frozen affinity audit.
// Keep the historical audit pipeline independent from the post-Dawn checks.
import assert from 'node:assert/strict';
import {comparisonPlayer} from './spirit-vs-class-player.mjs';
import {SECOND_JOBS,parentJob} from '../../dist/jobs.js';
import {JOB_SKILLS} from '../../dist/job-skills.js';
import {FUSION_SKILLS,FUSION_DEFAULTS,companionRole} from '../../dist/pet-fusion.js';
import {makePet,CARDS,SLOTS,petStats} from '../../dist/catalog.js';
import {rollGear,rollPetGear,GEAR_BASE,PET_GEAR_BASE,primaryAffix,affixRange,SPECIAL_AFFIXES} from '../../dist/loot.js';
import {cardAllowedInSlot,cardEffectsFor} from '../../dist/card-effects.js';
const attrs=['STR','AGI','VIT','INT','DEX','LUK'];
const PAIRS=['attack-magic','attack-defense','attack-support','magic-defense','magic-support','defense-support'];
function gear(id,primary,pet=false,special='hpPct'){
 const g=(pet?rollPetGear:rollGear)(id,200,'mythic',()=>.5),b=(pet?PET_GEAR_BASE:GEAR_BASE)[id],weapon=!!b.weaponType||b.petSlot==='head';
 const normal=weapon?[primaryAffix(id),'hit',primary,'AGI','LUK']:pet&&b.petSlot==='body'?['hp','def','mdef',primary,'VIT']:pet?['flee','hit','def',primary,'AGI']:['def','mdef',primary,'AGI','VIT'];
 const keys=[...new Set([...normal,...attrs])].slice(0,5),sp=weapon?'critDmg':special;
 g.affixes=Object.fromEntries([...keys,sp].map(k=>[k,Math.round(affixRange(k,g.tier,'mythic',id)[1]*(pet&&!SPECIAL_AFFIXES.has(k)&&!['atk','matk'].includes(k)?10/3:1))]));
 g.enhancement='SSS';
 assert.equal(Object.keys(g.affixes).length,6);
 for(const [k,v]of Object.entries(g.affixes)){
  const range=affixRange(k,g.tier,'mythic',id),mult=pet&&!SPECIAL_AFFIXES.has(k)&&!['atk','matk'].includes(k)?10/3:1;
  assert.ok(v>=Math.round(range[0]*mult)&&v<=Math.round(range[1]*mult),'affix range '+id+'/'+k);
 }
 return g;
}
export function homecomingPlayer(job,pair,{fourth=false}={}){
 const p=comparisonPlayer({job,level:210});if(fourth)p.homecoming={completedRoutes:Object.fromEntries(PAIRS.map(pair=>[pair,true]))};
 Object.assign(p,{name:'夥伴適性測試',growthVersion:50,dawnSigil:8,autoEscapeBoss:false,autoRevive:false,autoUltimate:true,
 potionThresholds:{playerHp:90,playerSp:90,petHp:90,petSp:90},autoPotions:{playerHp:true,playerSp:true,petHp:true,petSp:true},
 bag:[{id:'red_large',qty:50000},{id:'blue_large',qty:50000}],gold:50000000});
 const main=job==='crusader'?'STR':SECOND_JOBS[job].attribute;let budget=438;
 p.attributes=Object.fromEntries(attrs.map(k=>[k,1]));
 for(const k of [...new Set([main,job==='wizard'?'DEX':'AGI','VIT','LUK',...attrs])]){const n=Math.min(149,budget);p.attributes[k]+=n;budget-=n;}
 for(const [slot,g]of Object.entries(p.gear))if(g)p.gear[slot]=gear(g.id,main,false,slot==='armor'?'damageReduction':'hpPct');
 p.sockets=Object.fromEntries(Object.keys(SLOTS).map(slot=>{
  if(!p.gear[slot])return [slot,null];
  const w={atkPct:main==='INT'?0:2,matkPct:main==='INT'?2:0,magicDamage:main==='INT'?2:0,critDmg:1,crit:1,aspdPct:1,aspd:1,ignoreDef:main==='INT'?0:.6,hpPct:.4,damageReduction:.4,STR:main==='STR'?.6:0,DEX:main==='DEX'?.6:.1,INT:main==='INT'?.6:0,VIT:.2,AGI:.2,LUK:.2};
  const score=c=>Object.entries(cardEffectsFor(c,210)).reduce((s,[k,v])=>s+v*(w[k]||0),0);
  const cs=Object.entries(CARDS).filter(([id,c])=>id.startsWith('boss_')&&cardAllowedInSlot(c,slot,job));
  cs.sort((a,b)=>score(b[1])-score(a[1])||a[0].localeCompare(b[0]));assert.ok(cs.length,slot);return [slot,cs[0][0]];
 }));
 const [mainRole,sub]=pair.split('-'),pet=makePet({attack:'fang',magic:'wisp',defense:'shell',support:'sprout'}[mainRole]);
 Object.assign(pet,{id:'audit-pet',fusion:{main:mainRole,sub,version:1},level:200,xp:0,rarity:'mythic',ascended:true,evolution:4,loyalty:500,trueForm:true,humanoidStage:3,iv:{hp:5,atk:5,def:5,matk:5,sp:5,aspd:5}});
 const role=companionRole(pet),primary=role==='magic'?'INT':role==='defense'?'VIT':'STR';
 pet.gear={head:gear(role==='magic'?'petCirclet':'petHelm',primary,true),body:gear('petArmor',primary,true,'damageReduction'),shoes:gear('petBoots',primary,true,'hpPct')};
 const skillPair=FUSION_DEFAULTS[pair]?pair:pair.split('-').reverse().join('-');
 pet.equippedSkills=FUSION_DEFAULTS[skillPair].map(i=>FUSION_SKILLS[skillPair][i].id);pet.hp=petStats(pet).hp;pet.sp=petStats(pet).sp;
 Object.assign(p,{pets:[pet],activePetId:pet.id,secondaryPetId:null,petStances:{[pet.id]:'assist'},
 autoSkills:{version:2,disabled:[],order:['thirdUtility_','thirdStance_','thirdMain_','thirdWide_','thirdFinish_'].map(x=>x+job)}});
 for(const branch of ['first','second','third']){
  const group=JOB_SKILLS[job].filter(s=>s.branch===branch),limit=branch==='first'?49:69;
  if(branch==='third'){
   let remain=limit;
   for(const s of [...group].sort((a,b)=>(a.kind==='passive'?0:1)-(b.kind==='passive'?0:1)||p.autoSkills.order.indexOf(a.id)-p.autoSkills.order.indexOf(b.id))){
    p.jobSkills[s.id]=Math.min(s.maxRank,remain);remain-=p.jobSkills[s.id];
   }
  }
  assert.equal(group.reduce((n,s)=>n+(p.jobSkills[s.id]||0),0),limit);
 }
 assert.equal(Object.values(p.attributes).reduce((a,b)=>a+b-1,0),438);
 for(const slot of Object.keys(SLOTS))if(p.sockets[slot])assert.ok(cardAllowedInSlot(CARDS[p.sockets[slot]],slot,job));
 const jobs=GEAR_BASE[p.gear.rightHand.id].jobs;
 assert.ok(!jobs||jobs.includes(job)||jobs.includes(parentJob(job)));
 assert.ok(p.pets.length===1);
 return p;
}
