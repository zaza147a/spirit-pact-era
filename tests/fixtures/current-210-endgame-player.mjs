// Current 210 endgame candidate generator. Independent of retired ranking saves.
import assert from 'node:assert/strict';
import {homecomingPlayer} from './homecoming-player.mjs';
import {HOMECOMING_ROUTES} from '../../dist/homecoming-data.js';
import {optimizeAffixes,selectBossCards,validateOwnerLoadout} from './twelve-job-loadout-policy.mjs';
import {attackAttribute} from './twelve-job-loadout-policy.mjs';

export const FUSIONS=['attack-magic','attack-defense','attack-support','magic-defense','magic-support','defense-support'];
export const ATTRIBUTE_PROFILES=['reference','agi-vit','luk-vit','dex-vit','agi-luk','vit-luk','dex-luk'];

export function currentEndgamePlayer(job,{fusion='attack-magic',weaponChoice='critDmg',attributeProfile='reference'}={}){
 assert.ok(FUSIONS.includes(fusion));
 assert.ok(ATTRIBUTE_PROFILES.includes(attributeProfile));
 const player=homecomingPlayer(job,fusion);
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
