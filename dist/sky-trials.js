// Sky trials: deterministic rules shared by the live game and balance audit.
export const TRIAL_PORTAL='天穹試煉之門';
export const ENHANCER_NAME='星鑄師・赫瑟';
export const ENHANCEMENT_RANKS=['D','C','B','A','S','SS','SSS'];
export const ENHANCEMENT_POWER={D:1.16,C:1.34,B:1.56,A:1.82,S:2.14,SS:2.60,SSS:3.20};
export const CONTROL_RESISTANCE={D:.15,C:.28,B:.42,A:.58,S:.75,SS:.90,SSS:1};
export const CONTROL_SLOTS={headUpper:'stun',headMiddle:'sleep',headLower:'fear',armor:'freeze',rightHand:'disarm',leftHand:'bind',garment:'petrify',shoes:'knockdown',accessory1:'silence',accessory2:'confusion'};
export const CONTROL_NAMES={stun:'暈眩',sleep:'沉睡',fear:'恐懼',freeze:'冰凍',disarm:'封武',bind:'束縛',petrify:'石化',knockdown:'擊倒',silence:'禁咒',confusion:'混亂'};
export const ENHANCEMENT_ITEMS=Object.fromEntries(ENHANCEMENT_RANKS.map(rank=>['rank_core_'+rank,{name:`${rank}階星鑄結晶`,enhancement:true,quest:true,cost:0,description:`在村莊找${ENHANCER_NAME}，將單件角色裝備逐階強化至${rank}階；消耗1個、成功率100%，不可跳階或轉移。`} ]));
export const rankOf=g=>ENHANCEMENT_RANKS.includes(g?.enhancement)?g.enhancement:null;
export const enhancementMultiplier=g=>ENHANCEMENT_POWER[rankOf(g)]||1;
export const enhancedStat=(g,key,value)=>{const factor=enhancementMultiplier(g);return factor===1?value:Math.round(value*factor*100)/100;};
export const enhancedAffixes=g=>Object.fromEntries(Object.entries(g?.affixes||{}).map(([key,value])=>[key,enhancedStat(g,key,value)]));
export function normalizeEnhancements(p){for(const g of [...Object.values(p.gear||{}),...(p.bag||[])])if(g?.uid&&!rankOf(g))delete g.enhancement;p.outfitUnlocks=Array.isArray(p.outfitUnlocks)?[...new Set(p.outfitUnlocks.filter(r=>['S','SS','SSS'].includes(r)))]:[];if(!p.outfitUnlocks.includes(p.selectedOutfit))p.selectedOutfit=null;return p;}
export function fullSetRank(p,base={}){const right=p.gear?.rightHand;const ranks=Object.keys(CONTROL_SLOTS).map(slot=>rankOf(slot==='leftHand'&&base[right?.id]?.hands===2?right:p.gear?.[slot]));return ranks.every(Boolean)?ENHANCEMENT_RANKS[Math.min(...ranks.map(r=>ENHANCEMENT_RANKS.indexOf(r)))]:null;}
export function unlockRankOutfits(p,base={}){p.outfitUnlocks ||= [];const rank=fullSetRank(p,base),unlocked=[];for(const r of ['S','SS','SSS'])if(ENHANCEMENT_RANKS.indexOf(rank)>=ENHANCEMENT_RANKS.indexOf(r)&&!p.outfitUnlocks.includes(r)){p.outfitUnlocks.push(r);unlocked.push(r);}if(rank==='SSS')p.dawnUnlocked=true;return unlocked;}
export function controlResistance(p,type,base={}){const slot=Object.keys(CONTROL_SLOTS).find(s=>CONTROL_SLOTS[s]===type),g=slot==='leftHand'&&base[p.gear?.rightHand?.id]?.hands===2?p.gear.rightHand:p.gear?.[slot];return CONTROL_RESISTANCE[rankOf(g)]||0;}
export function enhancementError(p,g,rank){if(!['town','skycity','dawncity'].includes(p.location))return '請回村莊找星鑄師';if(p.hp<=0)return '角色倒下時無法強化';if(!g?.uid||g.petSlot||!Object.values(p.gear||{}).includes(g))return '請選擇穿戴中的角色裝備';const next=ENHANCEMENT_RANKS[ENHANCEMENT_RANKS.indexOf(rankOf(g))+1];if(!next)return '已達SSS階';if(rank!==next)return `必須逐階強化，下一階是${next}`;if(!(p.bag||[]).some(x=>x.id==='rank_core_'+rank&&x.qty>0))return `缺少${rank}階星鑄結晶`;return null;}
export function enhanceEquipped(p,g,rank){const error=enhancementError(p,g,rank);if(error)return {error};const e=p.bag.find(x=>x.id==='rank_core_'+rank);if(!--e.qty)p.bag.splice(p.bag.indexOf(e),1);g.enhancement=rank;return {rank,uid:g.uid};}
// Pet equipment uses the same rank materials and enhancement multiplier as player equipment.
export function petEnhancementError(p,pet,g,rank){
 if(!pet||!p.pets?.includes(pet))return '請選擇自己的夥伴';
 if(!g?.uid||!Object.values(pet.gear||{}).includes(g))return '請選擇夥伴穿戴中的裝備';
 if(!['town','skycity','dawncity'].includes(p.location))return '請回村莊找星鑄師';
 if(p.hp<=0)return '角色倒下時無法強化';
 const next=ENHANCEMENT_RANKS[ENHANCEMENT_RANKS.indexOf(rankOf(g))+1];
 if(!next)return '已達SSS階';
 if(rank!==next)return `必須逐階強化，下一階是${next}`;
 if(!(p.bag||[]).some(item=>item.id==='rank_core_'+rank&&item.qty>0))return `缺少${rank}階星鑄結晶`;
 return null;
}
export function enhancePetEquipped(p,pet,g,rank){
 const error=petEnhancementError(p,pet,g,rank);if(error)return {error};
 const material=p.bag.find(item=>item.id==='rank_core_'+rank);if(!--material.qty)p.bag.splice(p.bag.indexOf(material),1);
 g.enhancement=rank;return {rank,uid:g.uid,petId:pet.id};
}
const names=[['星潮巡獵者','銀礁重衛','潮鏡幻鯨','星瀾龍侯','萬潮星冠'],['古誓石獅','斷碑審判者','金枝誓獸','聖鎖巨像','太古誓皇'],['夜幕蛛后','逆刻鐮衛','月蝕幽鹿','永夜鐘龍','終時冥王'],['曜鱗先鋒','熔冠獅王','赤曜翼皇','聖墓龍衛','焚日龍帝'],['界源哨兵','虛空星蠍','天軸巨神','創界六翼龍','天穹終焉者']];
export const TRIAL_ROUTES=[['starshore',151,'星瀾裂隙','D'],['oathwood',161,'古誓秘境','C'],['nightclock',171,'永夜時庭','B'],['sungrave',181,'曜龍聖墓','A'],['worldroot',191,'界源天穹','S']].map(([map,level,name,rank],i)=>({map,level,name,rank,ticket:'ticket_'+map,names:names[i]}));
// Drop rolls are independent: a boss can yield S, SS and SSS together.
export const ordinaryDropChances=[.10,.15,.20,.25,.50];
export const finalDropChances=[[.10,.01,.001],[.20,.02,.002],[.30,.03,.003],[.50,.10,.05],[1,.30,.10]];
export function trialDropTable(route,index){return route.level===191?['S','SS','SSS'].map((rank,i)=>({id:'rank_core_'+rank,rank,chance:finalDropChances[index][i]})):[{id:'rank_core_'+route.rank,rank:route.rank,chance:ordinaryDropChances[index]}];}
export const trialDrops=(route,index,rng=Math.random)=>trialDropTable(route,index).filter(e=>rng()<e.chance).map(e=>({id:e.id,qty:1}));
// Multipliers relative to each existing frontier map boss. Audited in docs/sky-trials-v630.json.
export const TRIAL_TUNING={151:{hp:[1.2,1.4,1.65,1.95,2.3],atk:[3.2,3.7,4.3,4.95,5.68]},161:{hp:[1.3,1.6,2,2.5,3.1],atk:[3.6,4.2,4.9,5.7,6.5]},171:{hp:[1.5,1.95,2.6,3.4,4.5],atk:[4.2,5,5.9,6.9,8]},181:{hp:[1.9,2.5,3.5,4.8,6.6],atk:[5,6,7.2,8.5,10]},191:{hp:[2.4,3.8,6.4,10,22],atk:[7,9,11.5,14,16.8]}};
export function createTrialBoss(route,index,base){const tuning=TRIAL_TUNING[route.level],control=Object.keys(CONTROL_NAMES)[(TRIAL_ROUTES.indexOf(route)*2+index*2)%10];return {...base,id:`boss-${route.level}-${index+1}`,name:route.names[index],trial:true,trialIndex:index,level:route.level+index*2,boss:true,hp:Math.round(base.hp*tuning.hp[index]),atk:Math.round(base.atk*tuning.atk[index]),def:Math.round(base.def*(1+index*.12)),xp:0,gold:0,drops:[],enrageAfter:route.level===191&&index===4?240000:null,control,controlDuration:1600+index*200,controlCooldown:8500-index*400,controlWindup:1400,artPath:`assets/sky-trials/boss-${route.level}-${index+1}.webp`};}
export function trialEntryError(p,route){if(p.location!=='skycity')return `請回蒼穹樞城使用${TRIAL_PORTAL}`;if(p.trialRun)return '目前已在挑戰中';if(!p.thirdJob||p.level<route.level)return `需要三轉 Base${route.level}`;if(p.hp<=0)return '請先復活';const ticket=p.bag.find(e=>e.id===route.ticket&&e.qty>0);if(!ticket)return '缺少對應入場券';const needed=(route.level===191?['S','SS','SSS']:[route.rank]).filter(r=>!p.bag.some(e=>e.id==='rank_core_'+r)).length;if(p.bag.length-(ticket.qty===1?1:0)+needed>2000)return '背包空間不足，請預留結晶欄位';return null;}
export const DAWN_MAP='dawnrift';
export const DAWN_ITEMS=Object.fromEntries([['dawn_scout_fang','晨晶獵牙',650],['dawn_ram_horn','曙岩角片',680],['dawn_ray_membrane','流光翼膜',710],['dawn_archon_crystal','黎明裁界晶',900]].map(([id,name,cost])=>[id,{name,dawnJunk:true,junk:true,map:'dawnrift',cost,description:'黎明斷層的獨有雜物；不會自動販賣，可在背包手動出售。'}]));
export function dawnEntryError(p){if(!p.thirdJob)return '需要完成三轉';if(!p.dawnUnlocked)return '需以全身SSS階裝備解鎖曙界新陸';if(p.hp<=0)return '請先復活';return null;}
