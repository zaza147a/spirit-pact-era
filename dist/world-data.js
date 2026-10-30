import {noviceMonsterStats,normalMonsterStats} from './progression.js?v=5.0.8';
// Fifteen progression zones cover every Base level once; the final zone ends at the level cap.
export const ZONES=[
 {id:'starter',name:'初始謎域',min:1,max:10,icon:'🌫️',names:['霧芽史萊姆','迷途野兔','青苔幼蟲','小石靈','尖耳魔鼠','幽光飛蛾','泥沼獵犬','藤蔓守衛','迷霧行者','謎域巨角獸']},
 {id:'forest',name:'苔影密林',min:11,max:20,icon:'🌲',names:['苔絨精','毒刺蜂','藤甲甲蟲','夜眼狐','腐葉怪','森牙狼','巨葉螳螂','月影鹿','古木守衛','密林棘王']},
 {id:'desert',name:'赤砂荒原',min:21,max:30,icon:'🏜️',names:['沙塵蠍','赤砂幼蜥','流沙蟲','砂岩龜','焰尾狐','沙暴獵鷹','熔沙傀儡','赤牙巨狼','古墓沙靈','荒原沙王']},
 {id:'frost',name:'霜骨峽谷',min:31,max:40,icon:'❄️',names:['雪絨靈','凍土獵犬','寒霜飛蛾','冰甲蠍','雪角鹿','冰魄幽魂','霜牙獅','碎冰巨人','凜冬守護者','霜骨暴君']},
 {id:'astral',name:'星墜禁區',min:41,max:50,icon:'☄️',names:['墜星碎片獸','虛空飛蟲','暗晶獵犬','星蝕精靈','秘銀構裝體','深空監視者','星紋戰獸','異界行刑者','墜星守護機','星墜領主']},
 {id:'volcano',name:'燼火熔獄',min:51,max:60,icon:'🌋',names:['餘燼小鬼','熔甲火蟲','焦牙獵犬','黑曜火蜥','焰翼魔蝠','熔岩傀儡','熔角巨犀','燼翼地龍','獄火守衛','熔獄暴君']},
 {id:'abyss',name:'深淵潮域',min:61,max:70,icon:'🌊',names:['幽燈獵魚','珊瑚重蟹','觸潮海巫','深淵魔魟','棘潮海蛇','古珊瑚騎士','巨淵魔章','珠殼守護者','利維坦幼體','深淵海皇']},
 {id:'ruins',name:'古代機城',min:71,max:80,icon:'⚙️',names:['符紋聖甲蟲','黃銅機蛛','碎岩古兵','沙時計靈','古刃螳螂','機巧獵隼','符甲半人馬','古殿守衛','機城戰爭巨像','時序泰坦']},
 {id:'eclipse',name:'蝕月聖域',min:81,max:90,icon:'🌘',names:['幽影怨靈','蝕月魔狼','骨甲冥鴉','黑曜石像鬼','銀刃女妖','墮落聖堂騎士','翼魘戰駒','暗甲墮天使','蝕月魔龍','蝕月君王']},
 {id:'celestial',name:'終焉星宮',min:91,max:99,icon:'🌌',names:['星塵幻獸','虛晶魔蠍','彗翼迅猛龍','星鎧獅王','重力岩衛','星刃熾天使','虛空多首龍','天穹金甲巨神','噬星終焉龍']},
 {'id': 'skyport', 'name': '浮空港灣', min: 101, max: 110, 'icon': '🛩️', 'continent': 'sky', 'names': ['風絮精', '黃銅海鷗', '貨艙甲蟹', '渦輪小鬼', '帆翼魔魟', '空賊斥候', '牧雲使徒', '雲翼雄獅', '幼空鯨', '天港巡衛']},
 {'id': 'gearfell', 'name': '千輪機關城', min: 111, max: 120, 'icon': '⚙️', 'continent': 'sky', 'names': ['銅甲齒蟎', '機巧蛛', '鋸輪甲蟲', '齒牙機狼', '鐵軌戰兵', '巨盾構裝體', '鋼鐵半人馬', '鑽岩魔像', '攻城機蠍', '千輪巨像']},
 {'id': 'aether', 'name': '以太晶海', min: 121, max: 130, 'icon': '💎', 'continent': 'sky', 'names': ['以太微光', '晶翅靈蛾', '稜晶月兔', '符尾晶狐', '碎晶長蛇', '秘術星梟', '星紋靈鹿', '稜鏡騎士', '晶翼飛龍', '以太巨靈']},
 {'id': 'stormforge', 'name': '雷霆熔爐', min: 131, max: 140, 'icon': '⚡', 'continent': 'sky', 'names': ['火花小鬼', '雷羽冥鴉', '暴風電鰻', '熔爐火蜥', '霆甲猛貓', '閃電巨螳', '熔爐守衛', '蒼角雷犀', '轟雷飛龍', '風暴泰坦']},
 {'id': 'zenith', 'name': '天極斷界', min: 141, max: 150, 'icon': '☀️', 'continent': 'sky', 'names': ['虛空蛾', '蝕日鴉', '環軌探機', '星痕魔狼', '天極聖獅', '熾翼構裝體', '重力巨像', '耀日龍', '天門神衛', '斷界空鯨']}
];
export const worldMonsterArt=level=>{const zone=ZONES.find(z=>level>=z.min&&level<=z.max);return zone?{file:`monsters-${zone.id}`,format:level>=101?'webp':'png',cols:5,rows:2,index:level-zone.min}:null;};
export const WORLD_MONSTERS=ZONES.flatMap(zone=>zone.names.map((name,i)=>{const level=zone.min+i,id=`world_${level}`,elite=level===zone.max,novice=level<=50;return {id,level,map:zone.id,name,icon:zone.icon,role:'attack',roleName:elite?'區域精英':'敵對生物',boss:false,elite,novice,...(novice?noviceMonsterStats(level,elite):normalMonsterStats(level,elite)),gold:Math.round(2+level*.35),drops:level<=10?['red_small','blue_small','scrap']:level<=20?['red_small','blue_small','red_mid','herb']:level<=30?['red_mid','blue_mid','ore']:level<=40?['red_mid','blue_mid','red_large','crystal']:['red_large','blue_large','crystal','relic']};}));
export const WORLD_MAPS=Object.fromEntries(ZONES.map((z,index)=>[z.id,{name:z.name,eyebrow:`SECTOR ${String(index+1).padStart(2,'0')} / ${z.min}-${z.max} / ${z.max<=50?'NOVICE':'ADVENTURE'}`,description:z.max<=50?`新手準備區 · Base Lv.${z.min}–${z.max}，${z.names.length}種敵人。Lv.1–50供熟悉戰鬥、培養寵物及準備二轉。掉落對應等級裝備、藥水與靈核；隨機地圖首領可避戰，首領裝備保底罕見。`:`正式冒險區 · Base Lv.${z.min}–${z.max}，${z.names.length}種敵人。正常難度，為二轉後成長設計；請備妥裝備、寵物及補給。隨機地圖首領Lv.${z.max}可避戰，首領裝備保底罕見；掉落對應等級裝備、特色卡片與進化靈核。`,capture:false,min:z.min,max:z.max,novice:z.max<=50}]));
