export const TARGET_PRIORITIES={lowestHp:'血量最少',oldest:'最早出現',manual:'手動指定'};
export function selectEncounterTarget(enemies,priority='lowestHp',current=null){
 const alive=enemies.filter(e=>e.hp>0);if(!alive.length)return null;
 if(priority==='manual'&&alive.includes(current))return current;
 return alive.reduce((best,e)=>priority==='oldest'?(e.appearedAt<best.appearedAt?e:best):(e.hp<best.hp||e.hp===best.hp&&e.appearedAt<best.appearedAt?e:best));
}
export const encounterDelay=(rng=Math.random)=>1500+Math.floor(rng()*2501);
export const replacementDelay=(rng=Math.random)=>600+Math.floor(rng()*701);
export const encounterLimit=location=>location==='town'?0:location==='petland'?1:['starter','forest'].includes(location)?2:['desert','frost','astral'].includes(location)?3:4;
