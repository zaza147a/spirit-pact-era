// Five classes × four pet roles. Incoming events are real outcomes, never simulated dodges or blocks.
const rule=(events,name,effect,power,cooldown,description)=>({event:events[0],events,name,effect,power,cooldown,description});
export const RESONANCE_RULES={
 swordsman:{attack:rule(['attack','block'],'守護追擊','strike',1,4500,'劍士普攻命中或格擋時，攻擊夥伴追擊'),magic:rule(['skill','attack'],'劍氣附魔','magic',.9,4500,'劍士攻擊或攻擊技能命中時，魔法夥伴追加元素傷害'),defense:rule(['attack','block','pet_guard','shield'],'鋼鐵連防','shield',1.3,5500,'劍士命中、格擋、施放護盾，或防禦型夥伴受擊時獲得護盾'),support:rule(['attack','skill','heal'],'不屈祝福','heal',.7,5500,'劍士攻擊命中或成功治療後，夥伴恢復主人生命')},
 acolyte:{attack:rule(['skill','attack'],'聖光追獵','strike',1,4500,'服事攻擊命中時，攻擊夥伴追加追擊'),magic:rule(['skill','attack'],'神聖魔彈','magic',1.15,4500,'服事攻擊命中時，魔法夥伴追加魔法傷害'),defense:rule(['heal','skill','shield','pet_guard'],'恩典護盾','shield',1.2,6000,'服事攻擊施法、成功治療、施放護盾或防禦型夥伴受擊時獲得護盾'),support:rule(['heal','skill','attack'],'雙重祈禱','mana',1,6000,'服事成功治療或攻擊命中時，輔助夥伴恢復SP')},
 mage:{attack:rule(['skill','attack'],'元素裂擊','strike',1,4500,'法師攻擊命中時，攻擊夥伴進行物理追擊'),magic:rule(['skill','attack'],'元素連鎖','magic',1.25,5000,'法師攻擊命中時，魔法夥伴追加連鎖魔法'),defense:rule(['skill','pet_guard','mana'],'守護詠唱','shield',1.35,6000,'法師攻擊施法、回復SP或防禦型夥伴受擊時，獲得護盾'),support:rule(['skill','attack','mana'],'魔力回響','mana',1.25,5500,'法師攻擊命中或成功凝聚魔力後，夥伴補充SP')},
 archer:{attack:rule(['attack','skill'],'獵鷹齊射','strike',1.15,4600,'弓箭手攻擊命中後，攻擊夥伴協同追擊'),magic:rule(['skill','attack'],'元素箭共鳴','magic',1.2,5100,'弓箭手普攻或箭技命中後，魔法夥伴以MATK追加傷害'),defense:rule(['attack','skill','pet_guard'],'獵手護幕','shield',1.4,5900,'弓箭手普攻／箭技命中，或防禦型夥伴受擊時獲得護盾；不依賴弓箭手被打或閃避'),support:rule(['attack','skill'],'續航箭歌','mana',1.1,5800,'弓箭手攻擊命中時，輔助夥伴恢復SP')},
 thief:{attack:rule(['attack','crit'],'疾影追刃','strike',1.25,4000,'盜賊普攻或爆擊命中時，攻擊夥伴快速追擊'),magic:rule(['skill','crit','attack'],'魔毒引爆','magic',1,5000,'盜賊攻擊命中時，魔法夥伴追加魔法傷害'),defense:rule(['attack','dodge','pet_guard'],'殘影護身','shield',1.1,5500,'盜賊普攻命中、實際閃避或防禦型夥伴受擊時獲得護盾'),support:rule(['attack','crit'],'迅捷祝福','mana',.9,5000,'盜賊普攻或爆擊命中時，輔助夥伴補充SP')}
};
export const RESONANCE_MAX=100,ULTIMATE_COST=60,ULTIMATE_COOLDOWN=30000;
export const RESONANCE_EVENTS={attack:'普攻命中',skill:'攻擊技能命中',crit:'爆擊命中',block:'實際格擋',dodge:'實際閃避',heal:'有效治療',shield:'施放護盾',mana:'有效回復SP',pet_guard:'防禦型夥伴實際受擊',pet:'夥伴行動',tactic:'使用職業戰術'};
export const resonanceRule=(job,role)=>RESONANCE_RULES[job]?.[role]||null;
export const resonanceTriggered=(rule,event)=>!!rule&&(rule.events||[rule.event]).includes(event);
export const SECOND_RESONANCE_PLAYS={
 "knight": [
  [
   "charge",
   "裂陣衝鋒",
   "charge",
   {
    "bonus": 0.45,
    "targets": 1
   },
   "衝鋒後6秒：衝鋒倍率+45%、多打1體"
  ],
  [
   "skill",
   "符焰槍陣",
   "brandish",
   {
    "magic": 2.2
   },
   "技能命中後6秒：槍陣追加夥伴MATK220%魔焰"
  ],
  [
   "charge",
   "重甲穿刺",
   "pierce",
   {
    "armor": 0.8
   },
   "衝鋒後6秒：零CD穿刺追加DEF80%傷害"
  ],
  [
   "skill",
   "凱旋節奏",
   "pierce",
   {
    "haste": 0.12,
    "refund": 1
   },
   "技能命中後6秒：穿刺攻擊週期縮短12%、每擊退1SP"
  ]
 ],
 "crusader": [
  [
   "block",
   "復仇盾鋒",
   "shieldBash",
   {
    "bonus": 0.25
   },
   "格擋後6秒：盾擊倍率+25%"
  ],
  [
   "skill",
   "審判聖印",
   "holyCross",
   {
    "targets": 2
   },
   "技能命中後6秒：聖十字額外命中2體"
  ],
  [
   "pet_guard",
   "堡壘反震",
   "shieldBash",
   {
    "counter": 0.2
   },
   "防禦型夥伴受擊後6秒：夥伴以自身DEF20%反擊受擊敵人"
  ],
  [
   "buff",
   "誓約轉輪",
   "holyCross",
   {
    "refund": 12,
    "cooldown": 0.45
   },
   "犧牲守護後6秒：聖十字退12SP、冷卻縮短45%"
  ]
 ],
 "wizard": [
  [
   "castStart",
   "孤星獵殺",
   "*",
   {
    "single": 0.35
   },
   "開始詠唱／無詠唱施法後6秒：單一敵人時法術倍率+35%"
  ],
  [
   "castComplete",
   "元素擴散",
   "*",
   {
    "targets": 2
   },
   "完成法術後6秒：元素法術額外擴散2體"
  ],
  [
   "castStart",
   "蓄魔堡壘",
   "*",
   {
    "castPower": 0.8
   },
   "開始詠唱後6秒：依實際原始詠唱時間每秒增加80%技能倍率；無詠唱失去此收益"
  ],
  [
   "castStart",
   "靈泉速詠",
   "*",
   {
    "castFactor": 0.55,
    "cooldown": 0.2
   },
   "開始詠唱／無詠唱施法後6秒：後續詠唱縮短45%、冷卻縮短20%"
  ]
 ],
 "sage": [
  [
   "fist",
   "疾牙魔拳",
   "spellFist",
   {
    "haste": 0.08
   },
   "魔拳命中後6秒：魔拳攻擊週期縮短8%"
  ],
  [
   "autospell",
   "元素湧流",
   "spellFist",
   {
    "autoTargets": 2,
    "autoPower": 0.35
   },
   "自詠觸發後6秒：自詠追加2體、倍率+35%"
  ],
  [
   "fist",
   "震甲拳意",
   "spellFist",
   {
    "armor": 0.20,
    "counter": 0.08
   },
   "魔拳命中後6秒：魔拳追加DEF20%，夥伴受擊反擊自身DEF8%"
  ],
  [
   "autospell",
   "循環法脈",
   "spellFist",
   {
    "refund": 2,
    "autoMana": 4,
    "manaBurst": 0.2
   },
   "自詠後6秒：魔拳每擊退2SP、自詠回4SP；SP達80%時魔拳倍率+20%"
  ]
 ],
 "assassin": [
  [
   "crit",
   "獵殺終結",
   "sonicBlow",
   {
    "execute": 1.2
   },
   "暴擊後6秒：音速投擲對30%以下目標倍率+120%"
  ],
  [
   "skill",
   "魔毒迴旋",
   "katarSlash",
   {
    "magic": 0.8,
    "targets": 1,
    "leech": 0.12
   },
   "技能命中後6秒：旋斬追加夥伴MATK80%、多打1體，主目標有效傷害12%吸血"
  ],
  [
   "dodge",
   "殘影突進",
   "dualStrike",
   {
    "haste": 0.2,
    "leech": 0.06,
    "bonus": 0.3
   },
   "閃避後6秒：雙刃倍率+30%、攻擊週期縮短20%、主目標有效傷害6%吸血"
  ],
  [
   "crit",
   "夜行續刃",
   "dualStrike",
   {
    "refund": 2,
    "bonus": 0.15
   },
   "暴擊後6秒：雙刃退2SP、倍率+15%"
  ]
 ],
 "rogue": [
  [
   "snatch",
   "奪寶追刃",
   "daggerDance",
   {
    "bonus": 0.15,
    "bounty": 0.04
   },
   "掠奪突襲命中後6秒：遊擊倍率+15%，有效命中按等級獲少量金幣"
  ],
  [
   "skill",
   "咒印伏擊",
   "gangAmbush",
   {
    "magic": 1,
    "targets": 1
   },
   "短劍技能後6秒：伏擊追加夥伴MATK100%、多打1體"
  ],
  [
   "shield",
   "煙幕誘敵",
   "daggerDance",
   {
    "armor": 0.6,
    "haste": 0.1
   },
   "煙幕後6秒：遊擊追加DEF60%、攻擊週期縮短10%"
  ],
  [
   "snatch",
   "影步回收",
   "daggerDance",
   {
    "refund": 2,
    "leech": 0.05,
    "haste": 0.12
   },
   "掠奪突襲命中後6秒：遊擊退2SP、攻擊週期縮短12%、有效傷害5%吸血"
  ]
 ],
 "priest": [
  [
   "heal",
   "聖獵裁決",
   "holyJudgment",
   {
    "bonus": 0.7,
    "cooldown": 0.15
   },
   "有效治療後6秒：審判倍率+70%、冷卻縮短15%"
  ],
  [
   "skill",
   "星域驅魔",
   "exorcism",
   {
    "targets": 2,
    "bonus": 0.25
   },
   "聖光技能後6秒：驅魔多打2體、倍率+25%"
  ],
  [
   "pet_guard",
   "苦修審判",
   "holyJudgment",
   {
    "petArmor": 3
   },
   "防禦型夥伴受擊後6秒：審判追加夥伴DEF300%傷害，防禦裝備與夥伴品質會提升威力"
  ],
  [
   "heal",
   "恩典轉化",
   "exorcism",
   {
    "refund": 12,
    "cooldown": 0.35
   },
   "有效治療後6秒：驅魔退12SP、冷卻縮短35%"
  ]
 ],
 "monk": [
  [
   "combo",
   "猛虎斷空",
   "asura",
   {
    "bonus": 1.2
   },
   "拳套連段後6秒：阿修羅倍率+120%"
  ],
  [
   "combo",
   "靈氣擴散",
   "spiritPalm",
   {
    "targets": 2,
    "magic": 1.2
   },
   "連段後6秒：氣功多打2體、追加夥伴MATK120%"
  ],
  [
   "combo",
   "金剛拳勢",
   "chainCombo",
   {
    "armor": 0.55,
    "leech": 0.04
   },
   "連段後6秒：連環拳追加DEF55%、有效傷害4%吸血"
  ],
  [
   "combo",
   "吐納連拳",
   "chainCombo",
   {
    "refund": 2,
    "haste": 0.12
   },
   "連段後6秒：連環拳退2SP、攻擊週期縮短12%"
  ]
 ],
 "hunter": [
  [
   "falcon",
   "鷹狼獵首",
   "beastMark",
   {
    "single": 0.9
   },
   "獵鷹協攻後6秒：單一敵人時標記倍率+90%"
  ],
  [
   "skill",
   "元素箭幕",
   "arrowRain",
   {
    "magic": 3.0,
    "targets": 2
   },
   "箭技後6秒：箭雨追加夥伴MATK300%、多打2體"
  ],
  [
   "falcon",
   "定點狙擊",
   "falconStrike",
   {
    "bonus": 1.1,
    "haste": -0.12
   },
   "獵鷹協攻後6秒：定點突襲倍率+110%，攻擊週期延長12%"
  ],
  [
   "buff",
   "巡林連射",
   "falconStrike",
   {
    "refund": 2,
    "haste": 0.25,
    "bonus": 0.15
   },
   "獵手專注後6秒：突襲倍率+15%、退2SP、攻擊週期縮短25%"
  ]
 ],
 "performer": [
  [
   "song",
   "狂想終曲",
   "encore",
   {
    "bonus": 0.35,
    "cooldown": 0.15
   },
   "樂曲後6秒：終曲倍率+35%、冷卻縮短15%"
  ],
  [
   "song",
   "星光交響",
   "dissonance",
   {
    "targets": 2,
    "magic": 0.7,
    "cooldown": 0.25
   },
   "演奏後6秒：不協和音多打2體、追加夥伴MATK70%、冷卻縮短25%"
  ],
  [
   "song",
   "重拍舞台",
   "sonicNote",
   {
    "armor": 0.65,
    "leech": 0.05
   },
   "樂曲後6秒：音刃追加DEF65%、有效傷害5%吸血"
  ],
  [
   "song",
   "無盡安可",
   "sonicNote",
   {
    "refund": 2,
    "haste": 0.15,
    "bonus": 0.2
   },
   "樂曲後6秒：音刃倍率+20%、退2SP、攻擊週期縮短15%"
  ]
 ]
};
for(const [job,plays] of Object.entries(SECOND_RESONANCE_PLAYS))RESONANCE_RULES[job]=Object.fromEntries(['attack','magic','defense','support'].map((role,i)=>{const [event,name,skillId,transform,baseDescription]=plays[i];if(transform.targets)transform.spread=transform.targets===1?.82:.7;const description=baseDescription+(transform.targets?`；實際擴散額外目標時每體倍率為${Math.round(transform.spread*100)}%`:'');return [role,{...rule([event],name,'stance',0,5000,description),mode:'pact',skillId,transform,playId:job+'_'+role}];}));
Object.assign(RESONANCE_EVENTS,{snatch:'掠奪突襲命中',castStart:'開始詠唱／無詠唱施法',castComplete:'法術完成',charge:'衝鋒命中',fist:'魔力拳命中',autospell:'自動念咒命中',steal:'成功偷取物品',buff:'施放增益',combo:'拳套連段命中',falcon:'獵鷹協攻',song:'樂曲協奏'});


// Explicit ability values are shared by gameplay, descriptions and the audit.
const baseTuning={sage:{attack:{haste:.04}},monk:{defense:{armor:1.1},magic:{magic:1.5},support:{haste:.08}},performer:{support:{haste:.1}},knight:{attack:{bonus:.35}},crusader:{defense:{counter:.3,bonus:.25},magic:{spread:.62}},rogue:{magic:{magic:1.2}},wizard:{magic:{spread:.55}}};
for(const [job,roles]of Object.entries(baseTuning))for(const [role,values]of Object.entries(roles))Object.assign(RESONANCE_RULES[job][role].transform,values);
RESONANCE_RULES.wizard.magic.description+='；轉生主攻命中返還4SP，即使已涵蓋全場仍有魔能回收收益';
RESONANCE_RULES.sage.attack.description='魔拳命中後6秒：魔拳攻擊週期縮短4%';
RESONANCE_RULES.monk.defense.description='連段後6秒：連環拳追加DEF110%、有效傷害4%吸血';
RESONANCE_RULES.monk.magic.description='連段後6秒：氣功多打2體、追加夥伴MATK150%';
RESONANCE_RULES.monk.support.description='連段後6秒：連環拳退2SP、攻擊週期縮短8%';
RESONANCE_RULES.performer.support.description='樂曲後6秒：音刃倍率+20%、退2SP、攻擊週期縮短10%';
RESONANCE_RULES.knight.attack.description='衝鋒後6秒：衝鋒倍率+35%、多打1體';
RESONANCE_RULES.crusader.defense.description='防禦型夥伴實際受擊後6秒：夥伴以自身DEF30%反擊受擊敵人，盾擊倍率+25%';
RESONANCE_RULES.rogue.magic.description='短劍技能後6秒：伏擊追加夥伴MATK120%、多打1體';
const rebirthTuning={wizard:{magic:{rebirthRefund:4}},knight:{attack:{rebirthBonus:.2,rebirthSpread:.72},magic:{rebirthBonus:.1,rebirthMagic:1.1},defense:{rebirthArmor:.35},support:{rebirthBonus:.1}},crusader:{magic:{rebirthSpread:.82}},assassin:{magic:{rebirthMagic:.45}},rogue:{magic:{rebirthMagic:.4},defense:{rebirthArmor:.4}},priest:{defense:{rebirthPetArmor:1.2}},monk:{attack:{rebirthBonus:.3},defense:{rebirthArmor:.7}},hunter:{attack:{rebirthBonus:.1},magic:{rebirthMagic:1.2,rebirthSpread:.45},defense:{rebirthBonus:.4}},performer:{attack:{rebirthBonus:.5},magic:{rebirthSpread:.55},defense:{rebirthArmor:.7},support:{rebirthBonus:.35}}};
for(const [job,roles]of Object.entries(rebirthTuning))for(const [role,values]of Object.entries(roles))Object.assign(RESONANCE_RULES[job][role].transform,values);
for(const roles of Object.values(RESONANCE_RULES))for(const r of Object.values(roles)){r.description=r.description.replace(/；實際擴散額外目標時每體倍率為\d+%/g,'');if(r.transform?.spread)r.description+=`；實際擴散額外目標時每體倍率為${Math.round(r.transform.spread*100)}%`;for(const [key,label]of [['rebirthSpread','擴散每體倍率'],['rebirthMagic','追加夥伴MATK'],['rebirthArmor','追加DEF'],['rebirthPetArmor','追加夥伴DEF'],['rebirthBonus','額外倍率+']])if(r.transform?.[key]!==undefined)r.description+=`；轉生主攻${label}${Math.round(r.transform[key]*100)}%`;}
export const resonanceOpener=(job,role)=>job==='crusader'&&role==='attack'?'crusaderWall':job==='rogue'&&role==='defense'?'smokeVeil':job==='priest'&&['attack','support'].includes(role)?'sanctuary':null;
