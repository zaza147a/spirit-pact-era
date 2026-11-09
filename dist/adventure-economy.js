import {WORLD_MONSTERS,ZONES} from './world-data.js?v=6.5.0';
import {MAP_BOSSES} from './map-bosses.js?v=6.5.0';
export const QUEST_REQUIREMENTS={junk:40,proof:5};
const bands=[[1,3],[4,6],[7,10],[11,16],[17,23],[33,47],[49,68],[74,100],[109,144],[158,203],[240,310],[335,430],[460,590],[630,800],[850,1080],[1120,1390],[1450,1780],[1850,2260],[2350,2840],[2950,3540]],parts=['霧晶殘屑','苔紋碎片','赤砂硬殼','霜骨結晶','星蝕粉晶','熾焰殘晶','潮汐遺珠','符紋零件','月影殘片','星宮碎核','浮空帆晶','精鍛齒核','以太稜晶','轟雷熔渣','天極星砂','星瀾潮晶','古誓木髓','永夜時沙','曜龍骨片','界源靈屑'];
export const JUNK_ITEMS=Object.fromEntries([...WORLD_MONSTERS,...Object.values(MAP_BOSSES)].map(m=>{const z=ZONES.findIndex(z=>z.id===m.map),zone=ZONES[z],t=(m.level-zone.min)/Math.max(1,zone.max-zone.min),cost=Math.round(bands[z][0]+t*(bands[z][1]-bands[z][0]));return ['junk_'+m.id,{name:m.name+'的'+parts[z],junk:true,cost:m.boss?cost*2:cost,map:m.map,monster:m.id,level:m.level}];}));
Object.assign(JUNK_ITEMS,{junk_fang:{name:'火狼幼獸的燼色絨毛',junk:true,cost:3,map:'petland',monster:'fang',level:1},junk_wisp:{name:'星光幼靈的微光粉塵',junk:true,cost:3,map:'petland',monster:'wisp',level:1},junk_shell:{name:'岩甲幼龜的幼岩甲片',junk:true,cost:4,map:'petland',monster:'shell',level:1},junk_sprout:{name:'生命芽靈的凝露嫩葉',junk:true,cost:3,map:'petland',monster:'sprout',level:1}});
export const PROOF_ITEMS=Object.fromEntries(ZONES.filter(z=>z.min>=51&&z.max<=99).map(z=>['proof_'+z.id,{name:({volcano:'燼火',abyss:'深淵',ruins:'古城',eclipse:'蝕月',celestial:'星宮'})[z.id]+'征途誓印',quest:true,cost:0,map:z.id}]));
// Keep old proof IDs loadable so existing saves never lose legacy inventory.
// They are no longer required or offered as rebirth quests.
PROOF_ITEMS.rebirth_core={name:'星宮轉生核心',quest:true,cost:0,map:'celestial',description:'擊敗Lv.99星宮首領必定取得。轉生僅需要並消耗1個；不會自動販售。'};
export const BREAKTHROUGH_ITEM='proof_third_awakening';
PROOF_ITEMS[BREAKTHROUGH_ITEM]={name:'天極覺醒聖印',quest:true,thirdSeal:true,cost:0,description:'150級天極斷界龍5%掉落，集滿1枚於蒼穹樞城三轉；永不自動出售'};
// Legacy entry points remain importable for old saves/extensions, but obsolete quests
// can no longer be started or completed, even through a stale UI event handler.
export function questAcceptError(){return '舊征途任務已取消；轉生只需要99級首領核心×1';}
export function acceptZoneQuest(){return {error:questAcceptError()};}
export function turnInZoneQuest(){return {error:questAcceptError()};}
export function sellSelectedJunk(p,items){if(!p.autoSellJunk?.length)return {gold:0,count:0};const selected=new Set(p.autoSellJunk);let gold=0,count=0;for(const e of p.bag){if(e.uid||!selected.has(e.id)||!items[e.id]?.junk||items[e.id]?.dawnJunk||items[e.id]?.goldBar)continue;const qty=Math.max(0,e.qty);if(!qty)continue;gold+=qty*items[e.id].cost;count+=qty;e.qty-=qty;}if(count){p.bag=p.bag.filter(e=>e.uid||e.qty>0);p.gold+=gold;}return {gold,count};}
