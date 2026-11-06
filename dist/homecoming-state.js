import {HOMECOMING_ADVENTURES,newHomecomingAdventure,normalizeHomecomingAdventure,adventureLocation,advanceAdventure} from './homecoming-adventures.js';
import {HOMECOMING_ROUTES,HOMECOMING_BY_ID,homecomingIdentity} from './homecoming-data.js';
const JOBS=new Set(['knight','crusader','wizard','sage','assassin','rogue','priest','monk','hunter','performer']);
const PHASES=new Set(['letter','traveling','arrived','active','ready','claimed']);
const count=(v,max)=>Math.max(0,Math.min(max,Number.isFinite(v)?Math.floor(v):0));
export function eligibleHomecoming(p,pet){return JOBS.has(p?.job)&&Number(p?.dawnSigil)===8&&pet?.trueForm===true&&Number(pet?.humanoidStage)===3&&!!HOMECOMING_BY_ID[homecomingIdentity(pet)];}
export function normalizeHomecoming(p){
 const raw=p.homecoming?.routes||{},routes={},completedRoutes={};
 for(const r of HOMECOMING_ROUTES){
  const q=raw[r.id];if(!q||!PHASES.has(q.phase))continue;
  const phase=q.phase;
  routes[r.id]={phase,journeyIndex:count(q.journeyIndex,2),investigated:q.investigated===true,kills:count(q.kills,100000),nodes:count(q.nodes,3),...(typeof q.evolvedPetId==='string'?{evolvedPetId:q.evolvedPetId}:{}),...(['active','ready','claimed'].includes(phase)?{adventure:normalizeHomecomingAdventure(r.id,q.adventure)}:{})};
  if(phase==='claimed')completedRoutes[r.id]=true;
 }
 p.homecoming={version:2,routes,completedRoutes};
 // Legacy completed quests also receive the permanent visual unlock.
 for(const r of HOMECOMING_ROUTES){const q=routes[r.id];if(q?.phase!=='claimed')continue;const matching=(p.pets||[]).filter(pet=>homecomingIdentity(pet)===r.id&&pet.trueForm===true&&pet.humanoidStage===3);const chosen=matching.find(pet=>pet.id===q.evolvedPetId)||(!q.evolvedPetId?matching[0]:null);if(chosen){chosen.homecomingEvolved=true;q.evolvedPetId=chosen.id;}}
 return p.homecoming;
}
export function discoverHomecoming(p,pets,{town=false,offline=false}={}){
 normalizeHomecoming(p);if(!town||offline)return [];
 const found=[];for(const pet of pets||[]){const id=homecomingIdentity(pet);if(eligibleHomecoming(p,pet)&&!p.homecoming.routes[id]){p.homecoming.routes[id]={phase:'letter',journeyIndex:0,investigated:false,kills:0,nodes:0};found.push(id);}}return found;
}
export function homecomingContinents(p){return HOMECOMING_ROUTES.filter(r=>{const q=p.homecoming?.routes?.[r.id];return q&&q.phase!=='letter';});}
export function homecomingBonuses(p){
 const b={damage:0,hp:0,def:0,recovery:0,count:0};
 if(!JOBS.has(p?.job)||!p.homecoming?.routes||Object.keys(p.homecoming.routes).length===0)return b;
 for(const r of HOMECOMING_ROUTES)if(p.homecoming?.routes?.[r.id]?.phase==='claimed'){b.count++;b[r.inheritance]++;}
 b.damage=b.count*.0025;b.hp*=.01;b.def*=.01;b.recovery*=.01;return b;
}
export function homecomingTransition(p,id,action,{pet,town=false,offline=false,choice,location=p.location}={}){
 const r=HOMECOMING_BY_ID[id];if(!r)throw Error('未知的返鄉路線');
 normalizeHomecoming(p);const q=p.homecoming.routes[id];
 if(offline)throw Error('返鄉故事需在線上手動進行');
 if(!q)throw Error('尚未收到返鄉來信');
 const match=eligibleHomecoming(p,pet)&&homecomingIdentity(pet)===id;
 const requireMatch=()=>{if(!match)throw Error('請帶上這條路線對應的高階人形夥伴，並達成契印 8');};
 if(action==='begin'){requireMatch();if(!town||q.phase!=='letter')throw Error('請在城鎮閱讀來信');q.phase='traveling';q.journeyIndex=0;}
 else if(action==='next'){requireMatch();if(q.phase!=='traveling'||q.journeyIndex>=2)throw Error('目前不能翻到下一頁');q.journeyIndex++;}
 else if(action==='arrive'){requireMatch();if(q.phase!=='traveling'||q.journeyIndex!==2)throw Error('尚未走完首次旅程');q.phase='arrived';p.location=r.townId;}
 else if(action==='revisit'){if(['letter','traveling'].includes(q.phase))throw Error('請先完成首次旅程');p.location=r.townId;}
 else if(action==='accept'){requireMatch();if(q.phase!=='arrived'||location!==r.townId)throw Error('請到當地城鎮與委託人交談');q.phase='active';q.adventure=newHomecomingAdventure(id);}
 else if(['investigate','field','node','boss'].includes(action)&&q.adventure){throw Error('此支線使用專屬流程，請依目前任務節點行動');}
 else if(action==='investigate'){requireMatch();if(q.phase!=='active'||q.investigated||location!==r.townId)throw Error('目前不能調查');if(Number(choice)!==r.answer)throw Error('線索還不吻合，請重新判斷');q.investigated=true;}
 else if(action==='field'){requireMatch();if(q.phase!=='active'||!q.investigated)throw Error('請先完成城鎮調查');p.location=r.fieldId;}
 else if(action==='node'){requireMatch();if(q.phase!=='active'||!q.investigated||location!==r.fieldId||q.nodes>=3||q.kills<r.gates[q.nodes])throw Error('請先完成這一階段的野外調查');q.nodes++;}
 else if(action==='boss'){requireMatch();if(q.phase!=='active'||q.nodes!==3)throw Error('請先完成三個野外事件');p.location=r.bossMapId;}
 else if(action==='return'){if(['letter','traveling'].includes(q.phase))throw Error('尚未抵達城鎮');p.location=r.townId;}
 else if(action==='claim'){requireMatch();if(q.phase!=='ready'||location!==r.townId)throw Error('請完成討伐並回到城鎮交付任務');q.phase='claimed';q.evolvedPetId=pet.id;p.homecoming.completedRoutes[id]=true;pet.homecomingEvolved=true;}
 else throw Error('未知的返鄉操作');
 return q;
}
export function homecomingAdventureAction(p,id,choiceId,{pet,offline=false,go=false}={}){
 if(offline)throw Error('返鄉故事需在線上手動進行');
 const r=HOMECOMING_BY_ID[id],q=p.homecoming?.routes?.[id];
 if(!r||q?.phase!=='active'||!eligibleHomecoming(p,pet)||homecomingIdentity(pet)!==id)throw Error('請攜帶對應夥伴，並確認任務正在進行');
 q.adventure=normalizeHomecomingAdventure(id,q.adventure);
 const step=HOMECOMING_ADVENTURES[id].nodes[q.adventure.step],map=adventureLocation(r,step);
 if(go){p.location=map;return q;}
 if(p.location!==map)throw Error('請先前往當前任務地點');
 if(advanceAdventure(r,q.adventure,choiceId))q.phase='ready';
 return q;
}
// Call only after the combat engine confirms an actual, previously uncredited death.
export function recordHomecomingVictory(p,id,{pet,mapId,boss=false,offline=false}={}){
 const r=HOMECOMING_BY_ID[id],q=p.homecoming?.routes?.[id];
 if(!r||!q||offline||q.phase!=='active'||!eligibleHomecoming(p,pet)||homecomingIdentity(pet)!==id||!(Number(pet.hp)>0))return false;
 const a=q.adventure,step=HOMECOMING_ADVENTURES[id]?.nodes[a?.step];
 if(!step?.combat||mapId!==p.location||mapId!==adventureLocation(r,step)||boss!==(step.location==='boss'))return false;
 if(advanceAdventure(r,a,null,{victory:true}))q.phase='ready';
 return true;
}
