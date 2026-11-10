// Current 210 endgame candidate generator. Independent of retired ranking saves.
import assert from 'node:assert/strict';
import {homecomingPlayer} from './homecoming-player.mjs';
import {HOMECOMING_ROUTES} from '../../dist/homecoming-data.js';
import {optimizeAffixes,selectBossCards,validateOwnerLoadout} from './twelve-job-loadout-policy.mjs';

export const FUSIONS=['attack-magic','attack-defense','attack-support','magic-defense','magic-support','defense-support'];

export function currentEndgamePlayer(job,{fusion='attack-magic',weaponChoice='critDmg'}={}){
 assert.ok(FUSIONS.includes(fusion));
 const player=homecomingPlayer(job,fusion);
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
 assert.ok(player.pets.every(p=>p.rarity==='mythic'&&p.ascended&&p.humanoidStage===3&&p.homecomingEvolved));
 assert.ok(player.pets.every(p=>Object.values(p.gear).every(g=>g.rarity==='mythic'&&g.enhancement==='SSS')));
 return player;
}
