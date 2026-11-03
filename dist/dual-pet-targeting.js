// Experimental target allocation among an already-selected pet target.
// The existing chooseMonsterTarget() makes the player-vs-pet decision first.
// Do not call this to increase the aggregate chance of a pet being targeted.
export function chooseDefendingPet(roster,roleOf,{mode='focus',guardingIds=[],rng=Math.random}={}){
 const alive=(roster||[]).filter(p=>p&&p.hp>0);
 if(!alive.length)return null;
 if(alive.length===1)return alive[0];
 const guards=new Set(guardingIds);
 const weights=alive.map(p=>{
  const role=roleOf(p);
  const defensive=role==='defense'||p.fusion?.main==='defense'||p.fusion?.sub==='defense';
  let weight=defensive?1.6:role==='support'?.8:1;
  if(guards.has(p.id))weight*=1.7;
  if(mode==='guard'&&defensive)weight*=1.3;
  return weight;
 });
 const total=weights.reduce((a,b)=>a+b,0);
 let choice=Math.max(0,Math.min(.999999,Number(rng())||0))*total;
 for(let i=0;i<alive.length;i++){choice-=weights[i];if(choice<0)return alive[i];}
 return alive.at(-1);
}
