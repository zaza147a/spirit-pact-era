import {parentPort} from 'node:worker_threads';
import {runBuild} from './optimized-dps-simulator.mjs';
import {SECOND_JOBS} from '../dist/jobs.js';
import {FUSION_SKILLS} from '../dist/pet-fusion.js';
import {affixRange,primaryAffix,GEAR_BASE,PET_GEAR_BASE,rollPetGear,rollGear,SPECIAL_AFFIXES} from '../dist/loot.js';
import {CARDS,SLOTS} from '../dist/catalog.js';
import {cardEffectsFor} from '../dist/card-effects.js';
import {ZONES} from '../dist/world-data.js';
import {JOB_SKILLS as RUNTIME_JOB_SKILLS} from '../dist/job-skills.js?v=6.5.0';
import {THIRD_MAIN_CURVES} from '../dist/third-jobs.js?v=6.5.0';
const keys=['STR','AGI','VIT','INT','DEX','LUK'];
let selectedTwoHandBonus=1.15;
parentPort.on('message',({job,forcedWeapon})=>{
 selectedTwoHandBonus=forcedWeapon?.twoHandBonus??1.15;
 if(forcedWeapon?.wizardRecovery!==undefined)RUNTIME_JOB_SKILLS.wizard.find(s=>s.id==='thirdMain_wizard').recovery=forcedWeapon.wizardRecovery;
 if(forcedWeapon?.hunterMainScale!==undefined)THIRD_MAIN_CURVES.hunter=[1.05,1.05,1.51,1.57,1.67,1.67].map(x=>x*forcedWeapon.hunterMainScale);
 if(forcedWeapon?.mainScale!==undefined){const initial={crusader:[.67,1.20,1.58,1.63,1.73,1.73],rogue:[.80,1.40,2.10,2.21,2.30,2.30],knight:[2.15,2.37,2.37,2.37,2.37,2.37],monk:[1.65,2,2,2,2,2],performer:[.62,.68,1.04,1.10,1.18,1.18],sage:[1.8,1.9,1.9,1.9,1.9,1.9],priest:[1.9,2.14,2.14,2.14,2.14,2.14]};if(initial[job])THIRD_MAIN_CURVES[job]=initial[job].map(x=>x*forcedWeapon.mainScale);}
});
function allocate(order){let n=438;const a=Object.fromEntries(keys.map(k=>[k,1]));for(const k of [...new Set([...order,...keys])]){let d=Math.min(149,n);a[k]+=d;n-=d;}return a;}
function cards(job,mode){const magic=['wizard','sage','priest'].includes(job),main=SECOND_JOBS[job].attribute;let w={atkPct:magic?0:2,matkPct:magic?2:0,magicDamage:magic?2:0,crit:mode==='crit'?4:1,critDmg:mode==='crit'?3:.6,aspd:mode==='speed'?4:1,aspdPct:mode==='speed'?3:1,ignoreDef:magic?0:1,STR:magic?0:.4,INT:magic?.4:0,DEX:.2,AGI:.2,LUK:.3,VIT:job==='crusader'?.7:0};w[main]=(w[main]||0)+.2;const allowed=([id,c])=>id.startsWith('world_')?Number(id.slice(6))<=200:id.startsWith('boss_')?(ZONES.find(z=>z.id===c.map)?.max||999)<=200:!!c.slots;const score=c=>Object.entries(cardEffectsFor(c,200)).reduce((n,[k,v])=>n+v*(w[k]||0),0);return Object.fromEntries(Object.keys(SLOTS).map(slot=>[slot,Object.entries(CARDS).filter(x=>allowed(x)&&x[1].slots.includes(slot)).sort((a,b)=>score(b[1])-score(a[1])||a[0].localeCompare(b[0]))[0]?.[0]||null]));}
function configure(job,cfg){return(p,pet)=>{pet.iv=Object.fromEntries(Object.keys(pet.iv).map(k=>[k,5]));p.dawnUnlocked=true;p.attributes=cfg.attrs;p.sockets=cfg.sockets||cards(job,cfg.cards);p.gear.rightHand=rollGear(cfg.weapon,200,'mythic',()=>.5);p.gear.leftHand=cfg.offhand?rollGear(cfg.offhand,200,'mythic',()=>.5):null;for(const [isPet,bag]of [[false,p.gear],[true,pet.gear]])for(const g of Object.values(bag)){if(!g)continue;const b=(isPet?PET_GEAR_BASE:GEAR_BASE)[g.id],primary=primaryAffix(g.id),weapon=!!b.weaponType||isPet&&b.petSlot==='head';let stat=SECOND_JOBS[job].attribute;let desired=isPet?cfg.petStats:cfg.gearStats;let normal=[primary,...(weapon?['hit']:[]),...(isPet?desired:[stat,...desired]),...keys];normal=[...new Set(normal)].slice(0,5);g.affixes=Object.fromEntries(normal.map(k=>[k,Math.round(affixRange(k,g.tier,'mythic')[1]*(isPet&&!SPECIAL_AFFIXES.has(k)&&!['atk','matk'].includes(k)?10/3:1))]));const sp=weapon?cfg.special:'fleePct';g.affixes[sp]=affixRange(sp,g.tier,'mythic')[1];if(!isPet&&b.hands===2&&job!=='assassin'&&['atk','matk'].includes(primary))g.affixes[primary]=Math.round(g.affixes[primary]*1.15);g.enhancement='SSS';}
if(GEAR_BASE[p.gear.rightHand?.id]?.hands===2&&job!=='assassin'){
 const k=primaryAffix(p.gear.rightHand.id);
 if(['atk','matk'].includes(k))p.gear.rightHand.affixes[k]=Math.round(p.gear.rightHand.affixes[k]*selectedTwoHandBonus/1.15);
}
if(cfg.head==='magic'&&pet.gear.head.id!=='petCirclet'||cfg.head==='attack'&&pet.gear.head.id!=='petHelm'){const old=pet.gear.head;pet.gear.head=rollPetGear(cfg.head==='magic'?'petCirclet':'petHelm',200,'mythic',()=>.5);const g=pet.gear.head;let n=[primaryAffix(g.id),'hit',...cfg.petStats,...keys];n=[...new Set(n)].slice(0,5);g.affixes=Object.fromEntries(n.map(k=>[k,Math.round(affixRange(k,g.tier,'mythic')[1]*(!['atk','matk'].includes(k)?10/3:1))]));g.affixes[cfg.special]=affixRange(cfg.special,g.tier,'mythic')[1];g.enhancement='SSS';}
};}
function run(job,pair,cfg,seconds=12,seed=731,fixture=false){return runBuild(job,pair.split('-')[0],{level:210,encounterLevel:201,gearLevel:200,petLevelOverride:200,scenario:'regional',seconds,seed,reborn:true,thirdJob:true,referenceBuild:true,referenceQuality:'mythic',rarity:'mythic',fusionPair:pair,enhancement:'SSS',petEnhancement:'SSS',dawnSigil:0,petSkills:cfg.skills,searchConfig:configure(job,cfg),fixture});}
parentPort.on('message',({job,pair,sockets,forcedWeapon})=>{try{let count=0;const main=SECOND_JOBS[job].attribute;let weapons={knight:[['blade','shield'],['oneSpear','shield'],['twoSword',null],['twoSpear',null]],crusader:[['blade','shield'],['oneSpear','shield']],wizard:[['oneStaff','shield'],['twoStaff',null]],sage:[['oneStaff','shield'],['twoStaff',null],['spellFist',null]],assassin:[['rifle','shield'],['rifle','offDagger'],['katar',null]],rogue:[['rifle','shield']],priest:[['mace','shield']],monk:[['mace','shield'],['knuckles',null]],hunter:[['shortBow',null],['longBow',null],['crossbow',null]],performer:[['shortBow',null],['longBow',null],['instrument',null]]}[job];if(forcedWeapon)weapons=weapons.filter(([w,l])=>w===forcedWeapon.weapon&&l===forcedWeapon.offhand);let cfg={attrs:allocate([main,'LUK','AGI']),cards:'damage',gearStats:['LUK','AGI','DEX','INT'],petStats:[pair.startsWith('attack')?'STR':pair.startsWith('defense')?'VIT':'INT','AGI','LUK','VIT'],head:['magic','support'].includes(pair.split('-')[0])?'magic':'attack',special:'crit',skills:undefined,weapon:weapons[0][0],offhand:weapons[0][1],sockets};let best=run(job,pair,cfg);count++;
const step=candidates=>{let chosen=cfg,br=best;for(const c of candidates){const r=run(job,pair,c);count++;if(r.dps>br.dps){chosen=c;br=r;}}cfg=chosen;best=br;};
step(weapons.map(([weapon,offhand])=>({...cfg,weapon,offhand})));
step([[main,'AGI','LUK'],[main,'DEX','LUK'],[main,'LUK','DEX'],['LUK','AGI',main],['LUK','DEX',main],['AGI',main,'LUK']].map(o=>({...cfg,attrs:allocate(o)})));
step([['AGI','DEX','LUK','INT'],['LUK','DEX','INT','AGI'],['INT','LUK','DEX','AGI']].map(g=>({...cfg,gearStats:g})));
step(['crit','critDmg','aspdPct','ignoreDef'].map(s=>({...cfg,special:s})));
step(['damage','crit','speed'].map(c=>({...cfg,cards:c})));
step([{head:'magic',petStats:['INT','AGI','LUK','VIT']},{head:'attack',petStats:['STR','AGI','LUK','VIT']},{head:'attack',petStats:['VIT','AGI','LUK','INT']}].map(p=>({...cfg,...p})));
const skills=FUSION_SKILLS[pair];const sets=[];for(let a=0;a<skills.length;a++)for(let b=a+1;b<skills.length;b++)for(let c=b+1;c<skills.length;c++)sets.push([skills[a].id,skills[b].id,skills[c].id]);step(sets.map(s=>({...cfg,skills:s})));
// Revisit attributes after gear and skill changes.
step([[main,'AGI','LUK'],[main,'DEX','LUK'],[main,'LUK','DEX'],[main,'LUK','AGI'],['LUK','AGI',main],['LUK','DEX',main]].map(o=>({...cfg,attrs:allocate(o)})));
step(weapons.map(([weapon,offhand])=>({...cfg,weapon,offhand})));
const results=[42,137,731].map(seed=>run(job,pair,cfg,60,seed));count+=3;const mean=k=>results.reduce((n,r)=>n+r[k],0)/results.length;
const detail=run(job,pair,cfg,1,731,true);parentPort.postMessage({job,pair,count,cfg,ownerDps:mean('ownerDps'),petDps:mean('petDps'),dps:mean('dps'),kills:mean('kills'),alive:results.every(r=>r.alive),seeds:results.map(r=>({ownerDps:r.ownerDps,petDps:r.petDps,dps:r.dps,kills:r.kills,alive:r.alive,metrics:r.metrics})),equipment:{gear:detail.fixture.gear,petGear:detail.fixture.pets[0].gear,sockets:detail.fixture.sockets},skills:(cfg.skills||detail.petSkills).map(id=>({id,name:skills.find(s=>s.id===id)?.name}))});}catch(e){parentPort.postMessage({job,pair,error:e.stack});}});
