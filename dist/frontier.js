export const CONTINENTS={icarus:{name:'伊卡洛斯大陸',range:'1–99',town:'town'},sky:{name:'蒼穹彼岸',range:'101–200',town:'skycity'}};
export const FRONTIER_MAPS=['starshore','oathwood','nightclock','sungrave','worldroot'];
export const continentFor=location=>['skycity','skyport','gearfell','aether','stormforge','zenith',...FRONTIER_MAPS].includes(location)?'sky':'icarus';
export const PLAYER_REVIVE_MS=15000,PET_REVIVE_MS=10000;
export const deathRemaining=(unit,now)=>Math.max(0,Math.ceil(((unit?.reviveAt||0)-now)/1000));
export const baseExperienceNeed=p=>Math.round((250+17*p.level**2.05)*(p.level>=181?10:p.level>=151?5:p.reborn?2:1));
export const petExperienceNeed=pet=>Math.round((90+9*pet.level**2)*(pet.level>=181?10:pet.level>=151?5:1));
export const THIRD_SEAL='proof_third_awakening';
export const THIRD_SEAL_COST=1;
export const THIRD_SEAL_NAME='天極覺醒聖印';
export const FRONTIER_ITEMS={
 [THIRD_SEAL]:{name:THIRD_SEAL_NAME,quest:true,thirdSeal:true,cost:0,description:'150級天極斷界龍5%掉落；集滿1枚，Base150／轉生二轉Job70，在蒼穹樞城三轉'},
 ...Object.fromEntries(FRONTIER_MAPS.map((id,i)=>['ticket_'+id,{name:['星瀾裂隙通行契','古誓秘境通行契','永夜時庭通行契','曜龍聖墓通行契','界源天穹通行契'][i],ticket:true,quest:true,cost:0,description:'此地圖獨立首領必定掉落1張；未來內容入場憑證，目前不消耗、不自動出售'}]))
};
export function thirdJobError(p){if(p.thirdJob)return '已完成三轉';if(p.location!=='skycity')return '請回蒼穹樞城找覺醒導師';if(!p.reborn||p.level<150||p.jobLevel<70)return '需要Base150／轉生二轉Job70';if((p.bag.find(x=>x.id===THIRD_SEAL)?.qty||0)<THIRD_SEAL_COST)return `需要${THIRD_SEAL_NAME}${THIRD_SEAL_COST}枚`;return null;}
export function thirdJobRewards(monster,rng=Math.random){const rows=[];if(monster.boss&&monster.level===150&&monster.map==='zenith'&&rng()<.05)rows.push({id:THIRD_SEAL,qty:1});if(monster.boss&&monster.level>=151&&FRONTIER_MAPS.includes(monster.map))rows.push({id:'ticket_'+monster.map,qty:1});return rows;}
