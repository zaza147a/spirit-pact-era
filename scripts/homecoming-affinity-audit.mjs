// Controlled affinity audit. Game sources are checked out at AUDIT_SOURCE_SHA.
// No fourth skill, job rebalance, invulnerability or encounter-delay replacement.
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {comparisonPlayer} from '../tests/fixtures/spirit-vs-class-player.mjs';
import {SECOND_JOBS,parentJob} from '../dist/jobs.js';
import {JOB_SKILLS} from '../dist/job-skills.js';
import {FUSION_SKILLS,FUSION_DEFAULTS,companionRole} from '../dist/pet-fusion.js';
import {makePet,CARDS,SLOTS,petStats} from '../dist/catalog.js';
import {rollGear,rollPetGear,GEAR_BASE,PET_GEAR_BASE,primaryAffix,affixRange,SPECIAL_AFFIXES} from '../dist/loot.js';
import {cardAllowedInSlot,cardEffectsFor} from '../dist/card-effects.js';
import {FIELDS,damageSplitPcb} from '../dist/contribution.js';
const PAIRS=['attack-magic','attack-defense','attack-support','magic-defense','magic-support','defense-support'];
const JOBS=Object.keys(SECOND_JOBS).filter(j=>!['pactWarrior','spiritCommander'].includes(j));
const attrs=['STR','AGI','VIT','INT','DEX','LUK'],dist=new URL('../dist/',import.meta.url),imports={};
let source=readFileSync(new URL('game.js',dist),'utf8');
for(const m of source.matchAll(/^import \{([^}]+)\} from '([^']+)';$/gm)){
 const mod=await import(new URL(m[2],dist));
 for(const item of m[1].split(',').map(x=>x.trim())){const [orig,alias]=item.split(/\s+as\s+/);imports[alias||orig]=mod[orig];}
}
source=source.replace(/^import .*;\n/gm,'').replace(/\ninit\(\);\s*$/,'');
source+="\nglobalThis.api={normalize,valid,stat,petStats,setup:(p,scenario,scale)=>{player=p;resetSession();offlineSimulation=true;offlineClock=Date.now();auto=true;player.hp=stat('hp');player.mp=stat('mp');for(const pet of p.pets){pet.hp=petStats(pet).hp;pet.sp=petStats(pet).sp;}petDeathSequence=0;globalThis.bossKills=0;"+
"startReport=()=>{report=newReport(player.location,enemy.id,activePet());};const originalEnd=endReport;endReport=(outcome)=>{captureReport(report);originalEnd(outcome);};"+
"const originalDamage=dealDamage;dealDamage=(...args)=>{const n=originalDamage(...args);countApplied(n);return n;};"+
"const originalAdd=addEncounter;addEncounter=(...args)=>{const old=new Set(enemies);originalAdd(...args);for(const foe of enemies)if(!old.has(foe)){foe.atk*=scale;foe.matk*=scale;}};"+
"const originalAward=award;award=()=>{const first=enemy&&enemy.hp<=0&&!enemy.rewarded,boss=enemy?.boss;originalAward();if(first&&boss)globalThis.bossKills++;};"+
"if(scenario==='boss'){const t=MAP_BOSSES.dawnrift;enemy={...t,...monsterRuntimeStats(t),hp:t.hp*10000,maxHp:t.hp*10000,lastAttack:gameNow(),appearedAt:gameNow(),instanceId:'sustained-boss'};enemies=[enemy];tickEncounters=()=>{};startReport();}else spawn();},"+
"tick:now=>{offlineClock=now;combatTick(now);},finish:()=>captureReport(report),state:()=>({player,enemies,petDeaths:petDeathSequence,bossKills:globalThis.bossKills})};"+
"render=()=>{};renderSide=()=>{};message=()=>{};toast=()=>{};save=()=>true;showReviveDialog=()=>{};";
const compiled=new vm.Script(source);
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
function fixture(job,pair){
 const p=comparisonPlayer({job,level:210});
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
 pet.equippedSkills=FUSION_DEFAULTS[pair].map(i=>FUSION_SKILLS[pair][i].id);pet.hp=petStats(pet).hp;pet.sp=petStats(pet).sp;
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
function run(base,{scenario='field',scale=1,seconds=180,seed=471122,skills=null,step=100,record=true}={}){
 let now=1000000,rngState=seed>>>0,appliedDamage=0,potions=0;
 const rng=()=>((rngState=(Math.imul(rngState,1664525)+1013904223)>>>0)/4294967296);
 const originalRandom=Math.random;Math.random=rng;
 const metrics=Object.fromEntries(FIELDS.map(k=>[k,0])),seenReports=new WeakSet();
 const captureReport=r=>{if(!r||seenReports.has(r))return;seenReports.add(r);for(const [k,v]of Object.entries(r.metrics))if(Number.isFinite(v))metrics[k]=(metrics[k]||0)+v;};
 const c={...imports,console,performance,structuredClone,Math:Object.create(Math),
 Date:class extends Date{static now(){return now;}},
 document:{getElementById:()=>({style:{}})},localStorage:{setItem:()=>{}},confirm:()=>true,window:{alert:()=>{}},setTimeout:()=>0,clearTimeout:()=>{},
 captureReport,countApplied:n=>appliedDamage+=n};
 c.Math.random=rng;c.rand=(lo,hi)=>Math.floor(rng()*(hi-lo+1))+lo;
 // Reports are observational; do not consume combat PRNG for report IDs.
 c.newReport=(...args)=>{const prior=rngState,r=imports.newReport(...args);rngState=prior;r.startedAt=now;return r;};
 c.consumeStack=(bag,id)=>{const yes=imports.consumeStack(bag,id);if(yes&&/^(red|blue)_/.test(id))potions++;return yes;};
 try{
  vm.createContext(c);compiled.runInContext(c);const a=c.api,p=a.normalize(structuredClone(base));
  if(skills)p.pets[0].equippedSkills=skills;
  a.setup(p,scenario,scale);
  assert.ok(a.valid(p),'production save validity');
  assert.ok(a.stat('damageReduction')<=40);assert.ok(a.petStats(p.pets[0]).damageReduction<=40);
  for(const branch of ['first','second','third']){
   const sum=JOB_SKILLS[p.job].filter(s=>s.branch===branch).reduce((n,s)=>n+(p.jobSkills[s.id]||0),0);
   assert.equal(sum,branch==='first'?49:69,'normalized legal skills '+branch);
  }
  const initial={owner:Object.fromEntries(['hp','mp','atk','matk','def','mdef','aspd','damageReduction'].map(k=>[k,a.stat(k)])),pet:a.petStats(p.pets[0]),thresholds:p.potionThresholds};
  const startKills=p.kills;let elapsed=0,minHp=1;
  for(let t=step;t<=seconds*1000;t+=step){
   now=1000000+t;a.tick(now);elapsed=t/1000;minHp=Math.min(minHp,p.hp/initial.owner.hp);
   if(p.hp<=0)break;
   if(scenario==='boss'&&a.state().enemies[0].hp<=0)throw Error('Boss HP diagnostic insufficient');
  }
  a.finish();const s=a.state(),split=damageSplitPcb({metrics});
  assert.equal(split.total,appliedDamage,'all owner/pet/buff credit equals actual applied enemy HP loss');
  assert.ok(p.bag.filter(x=>x.id==='red_large'||x.id==='blue_large').every(x=>x.qty>0),'supplies not exhausted');
  return {job:p.job,pair:base.pets[0].fusion.main+'-'+base.pets[0].fusion.sub,scenario,scale,seed,seconds,step,elapsed,alive:p.hp>0,
   kills:p.kills-startKills,bossKills:s.bossKills,petDeaths:s.petDeaths,potions,minHp,
   ownerDps:split.P/elapsed,petDirectDps:metrics.petDamage/elapsed,resonanceDps:metrics.resonanceDamage/elapsed,buffDps:split.B/elapsed,
   totalDps:split.total/elapsed,windowDps:split.total/seconds,metrics,skills:p.pets[0].equippedSkills,...(record?{initial}:{})};
 }finally{Math.random=originalRandom;}
}
const job=process.argv[2]||'knight',pilot=process.argv.includes('--pilot');
assert.ok(JOBS.includes(job),'Only ten original jobs are in scope');
const rows=[],screens=[],fixtures={};
for(const pair of pilot?['attack-magic','defense-support']:PAIRS){
 const p=fixture(job,pair);fixtures[pair]=p;
 const list=FUSION_SKILLS[pair],triples=[];
 for(let a=0;a<6;a++)for(let b=a+1;b<6;b++)for(let c=b+1;c<6;c++)triples.push([a,b,c].map(i=>list[i].id));
 for(const scenario of ['field','boss','pressure']){
  let best=null;
  for(const skills of pilot?[p.pets[0].equippedSkills]:triples){
   const r=run(p,{scenario,scale:scenario==='pressure'?4:1,seconds:pilot?10:20,seed:1007,skills,record:false});
   screens.push({pair,scenario,skills,alive:r.alive,elapsed:r.elapsed,kills:r.kills,dps:r.totalDps});
   const score=scenario==='boss'?r.totalDps:r.kills*1e12+r.windowDps;
   if(!best||r.elapsed>best.elapsed||r.elapsed===best.elapsed&&score>best.score)best={...r,score};
  }
  for(const seed of pilot?[471122]:[471122,93217]){
   rows.push(run(p,{scenario,scale:scenario==='pressure'?4:1,seconds:pilot?30:180,seed,skills:best.skills}));
  }
 }
 console.log('PROGRESS '+job+'/'+pair);
}
const grouped=PAIRS.filter(pair=>rows.some(r=>r.pair===pair)).flatMap(pair=>['field','boss','pressure'].map(scenario=>{
 const rs=rows.filter(r=>r.pair===pair&&r.scenario===scenario),mean=k=>rs.reduce((s,r)=>s+r[k],0)/rs.length;
 return {job,pair,scenario,seeds:rs.length,survived:rs.filter(r=>r.alive&&r.elapsed===r.seconds).length,kills:mean('kills'),bossKills:mean('bossKills'),seconds:rs[0].seconds,elapsed:mean('elapsed'),
 totalDps:mean('totalDps'),windowDps:mean('windowDps'),ownerDps:mean('ownerDps'),petDirectDps:mean('petDirectDps'),resonanceDps:mean('resonanceDps'),buffDps:mean('buffDps'),
 petDeaths:mean('petDeaths'),potions:mean('potions'),minHp:mean('minHp'),skills:rs[0].skills,
 healPerSecond:rs.reduce((s,r)=>s+(r.metrics.effectiveHeal||0)/r.seconds,0)/rs.length,
 shieldPerSecond:rs.reduce((s,r)=>s+(r.metrics.shieldPrevented||0)/r.seconds,0)/rs.length};
}));
const output={sourceSha:process.env.AUDIT_SOURCE_SHA,conditions:{level:210,petLevel:200,gearLevel:200,rarity:'mythic',enhancement:'SSS',dawnSigil:8,
 scope:JOBS,tickMs:100,seconds:pilot?30:180,seeds:pilot?[471122]:[471122,93217],screenSeed:1007,screenSeconds:pilot?10:20,
 ownerBuild:'one controlled legal build per job; primary then AGI (wizard DEX) then VIT; fixed default weapon, boss cards; not global max-DPS optimization',
 petSkills:'all 20 combinations in ascending slot order screened separately per scenario; best short-run survivor then boss DPS or field kills; not all skill permutations',
 field:'real 201 map spawns, replacements, loot, natural bosses and lethal damage',
 boss:'single real Dawn boss with only HP x10000 for sustained diagnostic; not actual boss TTK',
 pressure:'field with test-only ATK and MATK x4; not production difficulty',
 telemetry:'reports enabled in offline mode; final metrics aggregated after source reattribution; total asserted against actual enemy HP loss',
 fourthSkill:false,autoRevive:false,potionThresholds:{playerHp:90,playerSp:90,petHp:90,petSp:90}},job,grouped,rows,screens,fixtures};
mkdirSync('docs/homecoming-audit',{recursive:true});
writeFileSync('docs/homecoming-audit/'+job+'.json',JSON.stringify(output,null,2)+'\n');
console.log('AFFINITY_RESULT '+JSON.stringify({sourceSha:output.sourceSha,job,grouped,rows:rows.map(({initial,...r})=>r)}));
