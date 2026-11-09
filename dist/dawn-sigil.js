// Dawn Contract Sigil: new passive slot, independent from character/pet gear.
// Four wilderness ranks followed by four boss-core ranks.
export const DAWN_SIGIL_MAX=8;
export const DAWN_SIGIL_CORE='dawn_archon_core';
export const DAWN_SIGIL_JUNK=['dawn_scout_fang','dawn_ram_horn','dawn_ray_membrane','dawn_archon_crystal'];
export function sigilLevel(player){return Math.max(0,Math.min(DAWN_SIGIL_MAX,Math.floor(Number(player?.dawnSigil)||0)));}
export function sigilCost(next){
 if(!Number.isInteger(next)||next<1||next>DAWN_SIGIL_MAX)return null;
 // Each rank is a separate farming step. At 20 kills/minute with three
 // equally frequent guaranteed drops, 400 of each material means ~1 hour.
 const perMaterial=[400,800,1600,3200][(next-1)%4];
 if(next<=4)return {
  dawn_scout_fang:perMaterial,
  dawn_ram_horn:perMaterial,
  dawn_ray_membrane:perMaterial
 };
 // Archon farming occurs concurrently with field farming from rank 0.
 // Planning baseline: ~30 Archon kills/hour (90-second minimum encounter
 // respite, plus encounter randomness/combat), 1 core + 5 crystals per kill.
 const archonKills=30*2**(next-5);
 return {dawn_archon_crystal:archonKills*5,[DAWN_SIGIL_CORE]:archonKills};
}
export function sigilBonus(player){const level=sigilLevel(player);return {atk:1+level*.02,matk:1+level*.02,hp:1+level*.02,def:1+level*.02,mdef:1+level*.02,petDamage:1+level*.02};}
// The Lv210 Archon is a wilderness-farming graduation encounter. SSS equipment
// is mandatory in this continent, but it must not bypass its field progression.
// Rank IV is obtainable entirely from mobs; higher ranks require Archon cores.
// This factor is applied to all damage sources equally, preserving P/C/B share.
export function dawnArchonPreparationFactor(player){
 const prepared=[.34,.44,.54,.75,1];
 const rank=sigilLevel(player);
 return rank<=4?prepared[rank]:1+(rank-4)*.025;
}
export function sigilError(player,next){
 if(!player||player.location!=='dawncity')return '請回曙光聖港強化曙界契印';
 if(player.hp<=0)return '角色倒下時不能強化';
 if(next!==sigilLevel(player)+1)return '契印必須逐階強化';
 const cost=sigilCost(next);if(!cost)return '契印已達最高階';
 for(const [id,qty] of Object.entries(cost))if((player.bag||[]).find(x=>x.id===id)?.qty<qty||!(player.bag||[]).some(x=>x.id===id))return '曙界契印材料不足';
 return null;
}
export function upgradeDawnSigil(player){
 const next=sigilLevel(player)+1,error=sigilError(player,next);if(error)return {error};
 const cost=sigilCost(next);
 for(const [id,qty] of Object.entries(cost)){const entry=player.bag.find(x=>x.id===id);entry.qty-=qty;if(!entry.qty)player.bag.splice(player.bag.indexOf(entry),1);}
 player.dawnSigil=next;return {level:next,bonus:sigilBonus(player)};
}
export function dawnBossRewards(enemy){return enemy?.id==='dawn-archon'?[{id:DAWN_SIGIL_CORE,qty:1}]:[];}
