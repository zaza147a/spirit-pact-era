import {HOMECOMING_ROUTES,homecomingMap,homecomingIdentity} from './homecoming-data.js';
import {HOMECOMING_ADVENTURES,adventureLocation} from './homecoming-adventures.js';
import {eligibleHomecoming,recordHomecomingVictory} from './homecoming-state.js';
import {homecomingOpponent} from './homecoming-encounters.js';
export const HOMECOMING_MAPS=Object.fromEntries(HOMECOMING_ROUTES.flatMap(r=>[
 [r.townId,{name:r.town,eyebrow:r.continent+' / 安全城鎮',capture:false}],
 [r.fieldId,{name:r.continent+'・任務現場',eyebrow:r.title,capture:false}],
 [r.bossMapId,{name:r.continent+'・核心區域',eyebrow:r.title,capture:false}]
]));
export function homecomingEntryError(p,mapId,pet){
 const info=homecomingMap(mapId);if(!info)return null;
 const {route:r,kind}=info,q=p?.homecoming?.routes?.[r.id];
 if(!q||['letter','traveling'].includes(q.phase))return '請先完成這位夥伴的首次返鄉旅程';
 if(kind==='town')return null;
 if(q.phase!=='active'||!eligibleHomecoming(p,pet)||homecomingIdentity(pet)!==r.id)return '請帶上對應夥伴，並依返鄉任務進度前往';
 const n=HOMECOMING_ADVENTURES[r.id]?.nodes[q.adventure?.step];
 return n&&adventureLocation(r,n)===mapId?null:'此任務地點尚未開放，請先完成目前事件';
}
export function homecomingBattle(p,pet){
 const info=homecomingMap(p?.location);if(!info||info.kind==='town'||!p.hp||!(pet?.hp>0)||homecomingEntryError(p,p.location,pet))return null;
 const r=info.route,q=p.homecoming.routes[r.id],step=q.adventure.step,n=HOMECOMING_ADVENTURES[r.id].nodes[step];
 const foe=n.combat&&homecomingOpponent(r.id,step);
 return foe?{...foe,map:p.location,homecomingRoute:r.id,homecomingStep:step}:null;
}
export function completeHomecomingBattle(p,foe,pet,{offline=false}={}){
 if(offline||!foe?.homecomingRoute||foe.hp>0||foe.rewarded)return false;
 const r=foe.homecomingRoute,q=p.homecoming?.routes?.[r],expected=homecomingOpponent(r,q?.adventure?.step);
 if(!p.hp||foe.homecomingStep!==q?.adventure?.step||foe.id!==expected?.id)return false;
 const changed=recordHomecomingVictory(p,r,{pet,mapId:foe.map,boss:!!foe.boss,offline,
  companionPresentAtStart:foe.homecomingPetId===pet?.id});
 if(changed)foe.rewarded=true;
 return changed;
}
