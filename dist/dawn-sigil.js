// Dawn Contract Sigil: new passive slot, independent from character/pet gear.
// Four wilderness ranks followed by four boss-core ranks.
export const DAWN_SIGIL_MAX=8;
export const DAWN_SIGIL_CORE='dawn_archon_core';
export const DAWN_SIGIL_JUNK=['dawn_scout_fang','dawn_ram_horn','dawn_ray_membrane','dawn_archon_crystal'];
export function sigilLevel(player){return Math.max(0,Math.min(DAWN_SIGIL_MAX,Math.floor(Number(player?.dawnSigil)||0)));}
export function sigilCost(next){
 if(!Number.isInteger(next)||next<1||next>DAWN_SIGIL_MAX)return null;
 return {
  dawn_scout_fang:8+next*4,
  dawn_ram_horn:8+next*4,
  dawn_ray_membrane:8+next*4,
  ...(next>4?{dawn_archon_crystal:next*3,[DAWN_SIGIL_CORE]:next-3}:{})
 };
}
export function sigilBonus(player){const level=sigilLevel(player);return {atk:1+level*.02,matk:1+level*.02,hp:1+level*.02,def:1+level*.02,mdef:1+level*.02,petDamage:1+level*.02};}
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
export function dawnBossRewards(enemy){return enemy?.id==='dawn-archon'?[{id:'dawn_archon_crystal',qty:5},{id:DAWN_SIGIL_CORE,qty:1}]:[];}
