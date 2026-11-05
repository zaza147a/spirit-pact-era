// Homecoming fourth-slot prototype. Coefficients are experimental, not a release balance.
// No profession-name multipliers: real combat events determine charge gain.
const ROLES=['attack','magic','defense','support'];
const LEGACY=new Set(['knight','crusader','wizard','sage','assassin','rogue','priest','monk','hunter','performer']);
export const FOURTH_SKILLS=Object.freeze({
 'attack-magic':Object.freeze({name:'雙極超載',power:40,cooldown:6000,cost:20,magical:true,targets:3,splash:.35,events:{crit:8}}),
 'attack-defense':Object.freeze({name:'裂陣戰旗',power:220,cooldown:4000,cost:20,magical:false,targets:3,splash:.45,events:{charge:14,snatch:14,combo:4}}),
 'attack-support':Object.freeze({name:'逐獵接力',power:300,cooldown:6000,cost:20,magical:false,targets:4,splash:.65,events:{falcon:16,combo:14,skillRefresh:16,kill:8}}),
 'magic-defense':Object.freeze({name:'星壁蓄砲',power:180,cooldown:4000,cost:20,magical:true,targets:3,splash:.85,events:{castComplete:22,shield:16,block:8}}),
 'magic-support':Object.freeze({name:'靈脈共奏',power:140,cooldown:4000,cost:20,magical:true,targets:4,splash:.65,events:{autospell:16,song:16,mana:12,buff:3}}),
 'defense-support':Object.freeze({name:'聖域裁決',power:200,cooldown:4000,cost:20,magical:true,targets:4,splash:.6,events:{heal:20,overheal:20,consecratedCast:16,shield:5}})
});
export function fourthPair(pet){const a=pet?.fusion?.main,b=pet?.fusion?.sub;return a!==b&&ROLES.includes(a)&&ROLES.includes(b)?[a,b].sort((x,y)=>ROLES.indexOf(x)-ROLES.indexOf(y)).join('-'):null;}
export function fourthUnlocked(player,pet){
 if(!LEGACY.has(player?.job)||pet?.trueForm!==true||Number(pet?.humanoidStage)!==3||Number(player?.dawnSigil)!==8)return false;
 const pair=fourthPair(pet);if(!FOURTH_SKILLS[pair])return false;
 const done=player.homecoming?.completedRoutes;
 return [pair,pair.split('-').reverse().join('-')].some(key=>done?.[key]===true);
}
export function newFourthState(now=0){return {energy:0,lastTick:now,nextCast:now,lastEvent:-Infinity,casts:0,events:0};}
export function advanceFourthCharge(state,now,active){
 if(!Number.isFinite(now)||now<state.lastTick)return;
 const dt=Math.min(1000,now-state.lastTick);state.lastTick=now;
 if(active)state.energy=Math.min(100,state.energy+dt*.004); // 25s fallback, no offline idle charge.
}
export function chargeFourth(state,pair,event,now,active=true){
 const points=FOURTH_SKILLS[pair]?.events[event]||0;
 if(!active||!points||!Number.isFinite(now)||now-state.lastEvent<300)return false;
 state.lastEvent=now;state.energy=Math.min(100,state.energy+points);state.events++;return true;
}
export function consumeFourth(state,pair,now,sp,active=true){
 const skill=FOURTH_SKILLS[pair];if(!skill||!active||!Number.isFinite(now)||!Number.isFinite(sp)||sp<skill.cost||state.energy<100-1e-8||now<state.nextCast)return null;
 state.energy=0;state.nextCast=now+skill.cooldown;state.casts++;return skill;
}
export function fourthOffense(stats,pair){
 const n=k=>Math.max(0,Number(stats?.[k])||0);
 if(pair==='defense-support')return Math.min(n('def')*.65+n('mdef')*.35,(n('atk')+n('healPower'))*1.2);
 if(pair==='attack-defense')return n('atk')*.8+n('def')*.25;
 return pair.startsWith('attack')&&!pair.endsWith('magic')?n('atk'):n('matk');
}
