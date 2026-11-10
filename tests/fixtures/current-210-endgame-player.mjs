// Current 210 endgame candidate generator. Independent of retired ranking saves.
import assert from 'node:assert/strict';
import {homecomingPlayer} from './homecoming-player.mjs';
import {HOMECOMING_ROUTES} from '../../dist/homecoming-data.js';
import {optimizeAffixes,selectBossCards,validateOwnerLoadout} from './twelve-job-loadout-policy.mjs';
import {attackAttribute} from './twelve-job-loadout-policy.mjs';
import {GEAR_BASE,rollGear} from '../../dist/loot.js';
import {parentJob} from '../../dist/jobs.js';

export const FUSIONS=['attack-magic','attack-defense','attack-support','magic-defense','magic-support','defense-support'];
export const ATTRIBUTE_PROFILES=['reference','agi-vit','luk-vit','dex-vit','agi-luk','vit-luk','dex-luk'];
export const WEAPON_VARIANTS={
 knight:['blade','twoSword','oneSpear','twoSpear'],
 crusader:['blade','oneSpear'],
 wizard:['oneStaff','twoStaff'],
 sage:['oneStaff','twoStaff','spellFist'],
 assassin:['rifle','katar','rifle+offDagger'],
 rogue:['rifle'],priest:['mace'],monk:['knuckles'],
 hunter:['shortBow','longBow','crossbow'],performer:['instrument'],
 pactWarrior:['staffSword'],spiritCommander:['staffSword'],
};

export function currentEndgamePlayer(job,{fusion='attack-magic',weaponChoice='critDmg',attributeProfile='reference',weaponId=null}={}){
 assert.ok(FUSIONS.includes(fusion));
 assert.ok(ATTRIBUTE_PROFILES.includes(attributeProfile));
 assert.ok(WEAPON_VARIANTS[job]);
 assert.ok(weaponId===null||WEAPON_VARIANTS[job].includes(weaponId),`illegal weapon for ${job}: ${weaponId}`);
 const player=homecomingPlayer(job,fusion);
 if(weaponId){
  const dual=weaponId==='rifle+offDagger',main=dual?'rifle':weaponId;
  const metadata=GEAR_BASE[main];
  assert.ok(metadata?.weaponType&&metadata.slot==='rightHand');
  assert.ok(metadata.jobs.includes(job)||metadata.jobs.includes(parentJob(job)));
  const generated=rollGear(main,200,'mythic',()=>.5);
  generated.enhancement='SSS';
  player.gear.rightHand=generated;
  const left=dual?'offDagger':metadata.hands===2?null:'shield';
  if(left){
   const off=rollGear(left,200,'mythic',()=>.5);
   off.enhancement='SSS';
   player.gear.leftHand=off;
  }else player.gear.leftHand=null;
 }
 if(attributeProfile!=='reference'){
  const main=attackAttribute(job),mapping={
   'agi-vit':['AGI','VIT'],'luk-vit':['LUK','VIT'],'dex-vit':['DEX','VIT'],
   'agi-luk':['AGI','LUK'],'vit-luk':['VIT','LUK'],'dex-luk':['DEX','LUK']};
  const order=[...new Set([main,...mapping[attributeProfile],'STR','INT','DEX','AGI','VIT','LUK'])];
  let budget=438;
  player.attributes=Object.fromEntries(['STR','INT','DEX','AGI','VIT','LUK'].map(k=>[k,1]));
  for(const key of order){const gain=Math.min(149,budget);player.attributes[key]+=gain;budget-=gain;}
  assert.equal(budget,0);
 }
 // All 12 homecoming routes have been completed, including the reverse identities.
 player.homecoming={version:2,routes:Object.fromEntries(HOMECOMING_ROUTES.map(r=>[r.id,{
  phase:'claimed',journeyIndex:2,investigated:true,kills:100,nodes:3,
  evolvedPetId:r.id===fusion?player.pets[0].id:undefined,
 }])),completedRoutes:Object.fromEntries(HOMECOMING_ROUTES.map(r=>[r.id,true]))};
 const pet=player.pets[0];pet.homecomingEvolved=true;
 player.petStances={[pet.id]:job==='pactWarrior'?'assimilate':'assist'};
 for(const [slot,item] of Object.entries(player.gear))if(item){
  player.gear[slot]=optimizeAffixes(item,{job,weaponChoice});
 }
 selectBossCards(player);
 validateOwnerLoadout(player);
 assert.equal(Object.values(player.attributes).reduce((sum,v)=>sum+v-1,0),438);
 assert.ok(Object.values(player.attributes).every(v=>Number.isInteger(v)&&v>=1&&v<=150));
 assert.ok(player.pets.every(p=>p.rarity==='mythic'&&p.ascended&&p.humanoidStage===3&&p.homecomingEvolved));
 assert.ok(player.pets.every(p=>Object.values(p.gear).every(g=>g.rarity==='mythic'&&g.enhancement==='SSS')));
 return player;
}
