// Draft story opponents; not registered in the live game's ambient spawn/drop pools.
import {DAWN_MONSTERS,DAWN_BOSS} from './dawn-world.js?v=6.5.0';
const sprite=id=>`assets/homecoming/monsters/${id}.webp`;
// Post-Dawn challenges: SSS / sigil-8 entrants are compared with the Dawn
// boss and its normal monsters. Keep each role's HP, pressure and armor distinct.
const definitions=[
 ['furnace','噬焰空殼',true,2.2,1.15,1.15,'吞焰爐殼','祖爐點火後現身的空殼，必須守住剛恢復的火種。'],
 ['siege','裂隙攻城獸',true,2.5,1.2,1.35,'攻城重甲','最後車隊撤離後逼近城門的攻城獸。'],
 ['scout','裂隙斥候',false,2.25,1.1,1.1,'峽谷追兵','出現在繞行伏擊或親自斷後的護送支線。'],
 ['patrol','空鎧巡兵',false,3.0,1.15,1.3,'空鎧巡邏','救援工匠時選擇交戰，或警戒升高後的守衛。'],
 ['master','守旗師父',false,3.5,1.05,1.2,'非致命演武','武鄉的演武對手；勝利代表獲得認可，不是殺死師父。'],
 ['crystal','噤聲晶核',true,2.0,1.12,1.1,'記憶封印','城市旋律恢復後，藏在記憶中的晶核才會現身。'],
 ['parasite','噬脈寄生靈',false,3.0,1.2,1.1,'生根守衛戰','在樹液分配完成後，守住幼苗生根的最後時刻。']
];
export const HOMECOMING_OPPONENTS=Object.freeze(Object.fromEntries(definitions.map(([id,name,boss,hp,atk,def,roleName,description])=>{
 const base=boss?DAWN_BOSS:DAWN_MONSTERS[2];
 return [id,Object.freeze({...base,id:`homecoming-${id}`,name,level:210,boss,roleName,description,hp:Math.round(base.hp*hp),atk:Math.round(base.atk*atk),def:Math.round(base.def*def),xp:0,gold:0,drops:[],dawn:false,junkId:null,map:null,homecoming:true,capture:false,nonlethal:id==='master',artPath:sprite(id),balanceStatus:'draft'})];
})));
export const HOMECOMING_ENCOUNTERS=Object.freeze({
 'attack-magic':Object.freeze({breach:'furnace'}),
 'attack-defense':Object.freeze({ambush:'scout',rear:'scout',gate:'siege'}),
 'defense-attack':Object.freeze({patrol:'patrol'}),
 'support-attack':Object.freeze({duel:'master'}),
 'magic-defense':Object.freeze({release:'crystal'}),
 'defense-support':Object.freeze({defend:'parasite'})
});
export function homecomingOpponent(routeId,stepId){return HOMECOMING_OPPONENTS[HOMECOMING_ENCOUNTERS[routeId]?.[stepId]]||null;}
