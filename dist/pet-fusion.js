import {trueFormName,trueFormArt} from './pet-true-form.js';
const roles=['attack','magic','defense','support'];
export const BASE_PET_ROLES={fang:'attack',wisp:'magic',shell:'defense',sprout:'support'};
export const fusionKey=(a,b)=>a!==b&&roles.includes(a)&&roles.includes(b)?[a,b].join('-'):null;
// Fusion skills retain their original three IDs; new alternatives occupy 3–5.
// Each coefficient is a visible skill ratio, never a global combat multiplier.
export const FUSION_PAIRS={
 "attack-magic": {
  "name": "龍凰交響",
  "role": "magic",
  "style": "雙極烙印、元素爆發與連鎖灼燒",
  "hp": 1.4,
  "def": 1.3,
  "attack": 2.6,
  "skills": [
   [
    "龍凰共焰",
    "magic",
    24,
    5500,
    0.85,
    {
     "ignoreDef": 25
    }
   ],
   [
    "雙極烙印",
    "mark",
    3.8,
    8000,
    0,
    {
     "hits": 6
    }
   ],
   [
    "星火汲魂",
    "drain",
    18,
    8500,
    0.3
   ],
   [
    "裂界星爆",
    "magic",
    39,
    11000,
    0.65,
    {
     "ignoreDef": 40
    }
   ],
   [
    "不滅凰炎",
    "bleed",
    10.8,
    10000,
    0,
    {
     "ticks": 5,
     "interval": 1200
    }
   ],
   [
    "龍凰同調",
    "blessing",
    0.95,
    12000,
    0,
    {
     "duration": 10000
    }
   ]
  ]
 },
 "attack-defense": {
  "name": "裂陣鐵誓",
  "role": "attack",
  "style": "前線破城、鋼甲反擊與近戰壓制",
  "hp": 1.7,
  "def": 1.6,
  "attack": 2.5,
  "skills": [
   [
    "龍岩戰陣",
    "guard",
    3.6,
    9500,
    0,
    {
     "counter": 2.6
    }
   ],
   [
    "破城重擊",
    "strike",
    18,
    5500,
    0.55,
    {
     "basis": "siege"
    }
   ],
   [
    "裂甲戰印",
    "mark",
    4,
    8500,
    0,
    {
     "hits": 5,
     "basis": "siege"
    }
   ],
   [
    "鐵誓衝城",
    "strike",
    26,
    10000,
    0.8,
    {
     "basis": "siege",
     "ignoreDef": 30
    }
   ],
   [
    "鎧龍戰吼",
    "blessing",
    0.9,
    12000,
    0,
    {
     "duration": 10000
    }
   ],
   [
    "鋼心復燃",
    "heal",
    4.2,
    7500
   ]
  ]
 },
 "attack-support": {
  "name": "聖獵長歌",
  "role": "attack",
  "style": "汲血連獵、戰歌增幅與獵印追擊",
  "hp": 1.55,
  "def": 1.35,
  "attack": 2.7,
  "skills": [
   [
    "聖獵汲取",
    "drain",
    16,
    5500,
    0.45
   ],
   [
    "麟火戰歌",
    "blessing",
    1.15,
    12000,
    0,
    {
     "duration": 11000
    }
   ],
   [
    "巡獵追印",
    "mark",
    4.5,
    8000,
    0,
    {
     "hits": 6
    }
   ],
   [
    "長歌連獵",
    "strike",
    22,
    8500,
    0.7
   ],
   [
    "聖瑞回生",
    "heal",
    4.8,
    7000
   ],
   [
    "逐獵血契",
    "bleed",
    8,
    10000,
    0,
    {
     "ticks": 4,
     "interval": 1500,
     "leech": 0.25
    }
   ]
  ]
 },
 "magic-defense": {
  "name": "玄星堡壘",
  "role": "magic",
  "style": "結界反壓、符晶砲擊與防護轉攻",
  "hp": 1.65,
  "def": 1.6,
  "attack": 2.35,
  "skills": [
   [
    "星岩結界",
    "guard",
    4,
    9500,
    0,
    {
     "counter": 3
    }
   ],
   [
    "玄星轟擊",
    "magic",
    21.25,
    5500,
    0.7,
    {
     "basis": "bastion"
    }
   ],
   [
    "護界靈印",
    "mark",
    4,
    8000,
    0,
    {
     "hits": 5,
     "basis": "bastion"
    }
   ],
   [
    "符晶殲滅砲",
    "magic",
    30,
    10500,
    0.85,
    {
     "basis": "bastion",
     "ignoreDef": 35
    }
   ],
   [
    "結界共振",
    "blessing",
    1.05,
    12000,
    0,
    {
     "duration": 10000,
     "basis": "bastion"
    }
   ],
   [
    "星鎧重構",
    "shield",
    5.5,
    8000
   ]
  ]
 },
 "magic-support": {
  "name": "萬象靈泉",
  "role": "magic",
  "style": "靈印接力、魔力循環與星雨共奏",
  "hp": 1.5,
  "def": 1.35,
  "attack": 2.55,
  "skills": [
   [
    "萬象星印",
    "mark",
    5,
    7500,
    0,
    {
     "hits": 7
    }
   ],
   [
    "不滅靈泉",
    "mana",
    3.6,
    8500,
    0,
    {
     "petRestore": 0.2
    }
   ],
   [
    "鳳麟星雨",
    "magic",
    18,
    5500,
    0.9
   ],
   [
    "萬象共奏",
    "blessing",
    1.25,
    12000,
    0,
    {
     "duration": 11000
    }
   ],
   [
    "星泉甘霖",
    "heal",
    4.5,
    7500
   ],
   [
    "靈脈奔流",
    "magic",
    24,
    10000,
    0.7,
    {
     "ignoreDef": 30
    }
   ]
  ]
 },
 "defense-support": {
  "name": "永生聖域",
  "role": "defense",
  "style": "聖域承傷、雙向恢復與防護反擊",
  "hp": 1.85,
  "def": 1.8,
  "attack": 1,
  "skills": [
   [
    "永生聖域",
    "guard",
    4.5,
    9000,
    0,
    {
     "counter": 3.4
    }
   ],
   [
    "大地甘霖",
    "heal",
    5.2,
    6500
   ],
   [
    "聖域震擊",
    "strike",
    3.8,
    6500,
    0.5
   ],
   [
    "永恆聖詠",
    "blessing",
    1.35,
    12000,
    0,
    {
     "duration": 11000
    }
   ],
   [
    "不滅壁壘",
    "shield",
    6,
    8000
   ],
   [
    "生命回環",
    "regen",
    1.5,
    11000,
    0,
    {
     "ticks": 5,
     "interval": 1500
    }
   ]
  ]
 }
};
// The six reverse ordered routes are intentionally separate gameplay contracts.
// Existing six route skills retain their IDs and coefficients for old-save stability.
const REVERSE_ROUTE_NAMES={
 'magic-attack':'赤曜星羽', 'defense-attack':'赤岩戰誓',
 'support-attack':'聖瑞戰歌', 'defense-magic':'晶盾祕術',
 'support-magic':'星羽治癒', 'support-defense':'聖岩守護'
};
const REVERSE_ROUTE_SKILLS={
 'magic-attack':['凰焰術式','星羽烙印','魔凰汲魂','赤曜星暴','星灼連燒','魔羽同調'],
 'defense-attack':['赤岩固守','玄甲裂斬','焰鎧破甲','磐石爆擊','守護戰吼','不屈壁壘'],
 'support-attack':['聖瑞增幅','麟角衝鋒','生命汲取','祝福連擊','聖光戰幕','自然甦生'],
 'defense-magic':['晶盾展開','星岩法咒','護盾反擊','靈晶蝕印','魔紋禁錮','岩靈共鳴'],
 'support-magic':['星羽補給','聖羽星擊','靈能汲取','聖光擴散','祈禱庇護','生命織歌'],
 'support-defense':['聖岩祝禱','麟角護陣','聖盾恢復','岩甲回春','防禦誓約','永恆聖域']
};
for(const [key,title] of Object.entries(REVERSE_ROUTE_NAMES)){
 const [main,sub]=key.split('-'),forward=FUSION_PAIRS[[main,sub].sort((a,b)=>roles.indexOf(a)-roles.indexOf(b)).join('-')];
 const skillNames=REVERSE_ROUTE_SKILLS[key];
 FUSION_PAIRS[key]={
   ...forward,name:title,role:main,
   style:`${title}・以主系${main}為核心的獨立技能組`,
   hp:+(forward.hp*(main==='defense'?1.14:main==='support'?1.08:0.96)).toFixed(3),
   def:+(forward.def*(main==='defense'?1.16:main==='support'?1.06:0.96)).toFixed(3),
   attack:+(forward.attack*(main==='magic'?1.03:main==='support'?.93:.96)).toFixed(3),
   skills:forward.skills.map((skill,i)=>[skillNames[i]||`${title}技${i+1}`,skill[1],+(skill[2]*(main==='magic'?1.03:main==='support'?.95:.98)).toFixed(3),skill[3],skill[4],skill[5]])
 };
}
export const FUSION_DEFAULTS={'attack-magic':[0,1,5],'attack-defense':[0,1,4],'attack-support':[0,1,2],'magic-defense':[0,1,4],'magic-support':[0,2,3],'defense-support':[0,1,3]};
for(const key of Object.keys(REVERSE_ROUTE_NAMES)){
 const [main,sub]=key.split('-');
 const base=[main,sub].sort((a,b)=>roles.indexOf(a)-roles.indexOf(b)).join('-');
 FUSION_DEFAULTS[key]=[...FUSION_DEFAULTS[base]];
}
export const defaultFusionSkills=pet=>{const key=pet?.fusion&&fusionKey(pet.fusion.main,pet.fusion.sub);return (FUSION_DEFAULTS[key]||[]).map(i=>FUSION_SKILLS[key][i].id);};
export const petSkillLimit=pet=>fusedPair(pet)?3:2;
export const FUSION_NAMES={'attack-magic':'星焰裂界龍皇','magic-attack':'赤曜星翼神凰','attack-defense':'鎮界玄鎧龍皇','defense-attack':'赤曜龍鎧泰坦','attack-support':'聖瑞玉麟龍皇','support-attack':'赤曜麟角聖君','magic-defense':'星岩晶翼神凰','defense-magic':'星曜符晶泰坦','magic-support':'聖光星羽神凰','support-magic':'星羽瑞雲玉麟','defense-support':'碧玉聖域泰坦','support-defense':'聖岩鎧麟聖君'};
export const fusedPair=pet=>pet?.fusion&&FUSION_PAIRS[fusionKey(pet.fusion.main,pet.fusion.sub)]||null;
export const companionRole=pet=>fusedPair(pet)?.role||BASE_PET_ROLES[pet?.species];
export const fusionForm=pet=>trueFormName(pet)||(fusedPair(pet)?FUSION_NAMES[pet.fusion.main+'-'+pet.fusion.sub]:null);
export const fusionArt=pet=>trueFormArt(pet)||(fusedPair(pet)?`assets/fusion/${pet.fusion.main}-${pet.fusion.sub}.webp`:null);
const descriptions={magic:'法術群攻',strike:'物理破陣',drain:'攻擊並回復主人與自身生命',mark:'主人後續攻擊附加夥伴傷害',bleed:'持續追擊，隨目標轉移',blessing:'依自身能力提高主人傷害，增傷歸屬夥伴',guard:'護盾、自療並在受擊時反擊',heal:'優先恢復生命比例較低的一方',shield:'依自身能力提供雙方護盾',mana:'回復主人與自身SP',regen:'持續恢復雙方生命，僅計有效治療'};
export const FUSION_SKILLS=Object.fromEntries(Object.entries(FUSION_PAIRS).map(([key,p])=>[key,p.skills.map(([name,kind,power,cooldown,splash=0,extra={}],i)=>({id:`fusion_${key}_${i}`,name,kind,power,cooldown,unlock:1,...extra,description:`${p.name}：${descriptions[kind]}`,family:'fusion',splash}))]));
export const fusionSkills=pet=>{const key=pet?.fusion&&fusionKey(pet.fusion.main,pet.fusion.sub);return FUSION_SKILLS[key]||null;};
export function fusionPetError(p,mainId,subId){if(p.location!=='skycity')return '請回蒼穹樞城進行融合進化';if(mainId===subId)return '需要兩隻不同夥伴';const a=p.pets.find(x=>x.id===mainId),b=p.pets.find(x=>x.id===subId);if(!a||!b)return '夥伴不存在';if(a.locked||b.locked)return '請先解除兩隻夥伴的鎖定';if(a.fusion||b.fusion)return '融合夥伴不可再次作為融合素材';if(a.rarity!=='mythic'||b.rarity!=='mythic'||!a.ascended||!b.ascended||a.level<150||b.level<150)return '兩隻均須為已界限進化、150級的神話夥伴';if(!fusionKey(BASE_PET_ROLES[a.species],BASE_PET_ROLES[b.species]))return '需要兩種不同系列';if(p.bag.length+Object.values(b.gear||{}).filter(Boolean).length>2000)return '背包空間不足，無法退回副素材裝備';return null;}
export function fusePets(p,mainId,subId){const error=fusionPetError(p,mainId,subId);if(error)return {error};const pet=p.pets.find(x=>x.id===mainId),donor=p.pets.find(x=>x.id===subId),main=BASE_PET_ROLES[pet.species],sub=BASE_PET_ROLES[donor.species];for(const gear of Object.values(donor.gear||{}))if(gear)p.bag.push({...gear,swapProtected:true});pet.iv=Object.fromEntries(['hp','atk','def','matk','sp','aspd'].map(k=>[k,Math.floor(((pet.iv?.[k]||0)+(donor.iv?.[k]||0))/2)]));pet.fusion={main,sub,version:1};pet.rarity='mythic';pet.ascended=true;pet.level=150;pet.xp=0;pet.nickname=fusionForm(pet);pet.equippedSkills=defaultFusionSkills(pet);p.pets=p.pets.filter(x=>x.id!==subId);if(p.activePetId===subId)p.activePetId=mainId;return {before:'mythic',after:'mythic',form:pet.nickname,fusion:true};}
