// Generated from docs/original-60-resonance-acceptance.md, section IV.
// Every classic job × fusion entry carries the exact source design wording.
// Trigger mapping and payload selection are implementation defaults subject to behavior tests.
export const ORIGINAL_60_MECHANICS = Object.freeze({
  "knight/attack-magic": {
    "event": "thirdHit_knight",
    "payload": "stackStrike",
    "threshold": 2,
    "description": "龍槍命中疊元素爆"
  },
  "knight/attack-defense": {
    "event": "shieldBreak",
    "payload": "armorBreak",
    "threshold": 1,
    "description": "盾碎後龍槍破甲"
  },
  "knight/attack-support": {
    "event": "skill",
    "payload": "haste",
    "threshold": 1,
    "description": "血線穩定時連續追擊"
  },
  "knight/magic-defense": {
    "event": "thirdHit_knight",
    "payload": "ward",
    "threshold": 1,
    "description": "龍槍生成星壁穿刺"
  },
  "knight/magic-support": {
    "event": "combo",
    "payload": "manaRefund",
    "threshold": 2,
    "description": "龍槍連段回復 SP"
  },
  "knight/defense-support": {
    "event": "damageTaken",
    "payload": "counterStrike",
    "threshold": 1,
    "description": "承傷觸發龍魂反擊"
  },
  "crusader/attack-magic": {
    "event": "thirdHit_crusader",
    "payload": "arcaneStrike",
    "threshold": 1,
    "description": "聖盾附龍焰裁決"
  },
  "crusader/attack-defense": {
    "event": "damageTaken",
    "payload": "stackStrike",
    "threshold": 2,
    "description": "承傷積累破城反擊"
  },
  "crusader/attack-support": {
    "event": "skill",
    "payload": "comboLeech",
    "threshold": 1,
    "description": "聖誓吸血後盾擊"
  },
  "crusader/magic-defense": {
    "event": "block",
    "payload": "stackStrike",
    "threshold": 1,
    "description": "盾反充能結界魔砲"
  },
  "crusader/magic-support": {
    "event": "shield",
    "payload": "manaRefund",
    "threshold": 1,
    "description": "防禦技能回流魔力"
  },
  "crusader/defense-support": {
    "event": "shield",
    "payload": "ward",
    "threshold": 1,
    "description": "聖盾守護後裁界追擊"
  },
  "wizard/attack-magic": {
    "event": "thirdHit_wizard",
    "payload": "elementBurn",
    "threshold": 1,
    "description": "星隕引燃元素鏈爆"
  },
  "wizard/attack-defense": {
    "event": "damageTaken",
    "payload": "stackStrike",
    "threshold": 2,
    "description": "被攻擊時蓄力法術"
  },
  "wizard/attack-support": {
    "event": "castComplete",
    "payload": "haste",
    "threshold": 1,
    "description": "持續施法獲獵歌節奏"
  },
  "wizard/magic-defense": {
    "event": "skill",
    "payload": "arcaneStrike",
    "threshold": 1,
    "description": "結界存法術後砲擊"
  },
  "wizard/magic-support": {
    "event": "thirdWideHit_wizard",
    "payload": "manaRefund",
    "threshold": 1,
    "description": "星雨擴散並回流 SP"
  },
  "wizard/defense-support": {
    "event": "shield",
    "payload": "ward",
    "threshold": 1,
    "description": "護壁期間提高多段命中"
  },
  "sage/attack-magic": {
    "event": "autospell",
    "payload": "mark",
    "threshold": 1,
    "description": "自詠附雙極元素烙印"
  },
  "sage/attack-defense": {
    "event": "thirdMain_sage",
    "payload": "armorBreak",
    "threshold": 1,
    "description": "魔力拳破甲連擊"
  },
  "sage/attack-support": {
    "event": "autospell",
    "payload": "manaRefund",
    "threshold": 1,
    "description": "自詠追獵擊回復資源"
  },
  "sage/magic-defense": {
    "event": "thirdHit_sage",
    "payload": "stackStrike",
    "threshold": 2,
    "description": "魔力拳堆疊星陣砲擊"
  },
  "sage/magic-support": {
    "event": "autospell",
    "payload": "splash",
    "threshold": 1,
    "description": "自詠星雨連鎖回流"
  },
  "sage/defense-support": {
    "event": "autospell",
    "payload": "guardianAutoChase",
    "threshold": 1,
    "description": "守護有效時自詠追擊"
  },
  "assassin/attack-magic": {
    "event": "crit",
    "payload": "elementBurn",
    "threshold": 1,
    "description": "暴擊附元素灼燒"
  },
  "assassin/attack-defense": {
    "event": "thirdHit_assassin",
    "payload": "armorExecution",
    "threshold": 1,
    "description": "突刺破甲後處刑"
  },
  "assassin/attack-support": {
    "event": "thirdHit_assassin",
    "payload": "comboLeech",
    "threshold": 2,
    "description": "汲血連斬疊斬殺印"
  },
  "assassin/magic-defense": {
    "event": "thirdHit_assassin",
    "payload": "arcaneStrike",
    "threshold": 1,
    "description": "影殺後星砲追擊"
  },
  "assassin/magic-support": {
    "event": "thirdHit_assassin",
    "payload": "arcaneStrike",
    "threshold": 1,
    "description": "閃襲後追加魔力飛刃"
  },
  "assassin/defense-support": {
    "event": "damageTaken",
    "payload": "lowHpRiposte",
    "threshold": 1,
    "description": "殘血時護壁並反襲"
  },
  "rogue/attack-magic": {
    "event": "thirdHit_rogue",
    "payload": "arcaneStrike",
    "threshold": 1,
    "description": "掠刃追加元素炸裂"
  },
  "rogue/attack-defense": {
    "event": "thirdHit_rogue",
    "payload": "armorBreak",
    "threshold": 1,
    "description": "偷襲破甲與反擊"
  },
  "rogue/attack-support": {
    "event": "skillRefresh",
    "payload": "hunterSummon",
    "threshold": 1,
    "description": "技能刷新時召喚獵擊"
  },
  "rogue/magic-defense": {
    "event": "thirdHit_rogue",
    "payload": "haste",
    "threshold": 1,
    "description": "影擊觸發星陣連射"
  },
  "rogue/magic-support": {
    "event": "combo",
    "payload": "manaRefund",
    "threshold": 1,
    "description": "連擊回流 SP 並擴散"
  },
  "rogue/defense-support": {
    "event": "dodge",
    "payload": "arcaneStrike",
    "threshold": 1,
    "description": "閃避後聖域追擊"
  },
  "priest/attack-magic": {
    "event": "thirdHit_priest",
    "payload": "arcaneStrike",
    "threshold": 1,
    "description": "聖光觸發龍焰但限頻"
  },
  "priest/attack-defense": {
    "event": "thirdHit_priest",
    "payload": "armorBreak",
    "threshold": 1,
    "description": "聖裁觸發破甲聖盾"
  },
  "priest/attack-support": {
    "event": "buff",
    "payload": "arcaneStrike",
    "threshold": 1,
    "description": "祈禱增益改為獵歌協攻"
  },
  "priest/magic-defense": {
    "event": "thirdHit_priest",
    "payload": "arcaneStrike",
    "threshold": 1,
    "description": "聖光凝聚玄星炮"
  },
  "priest/magic-support": {
    "event": "overheal",
    "payload": "arcaneStrike",
    "threshold": 1,
    "description": "治療溢量轉化星雨"
  },
  "priest/defense-support": {
    "event": "skill",
    "payload": "ward",
    "threshold": 1,
    "description": "聖域裁決與守護反擊分流"
  },
  "monk/attack-magic": {
    "event": "thirdHit_monk",
    "payload": "arcaneStrike",
    "threshold": 1,
    "description": "極意拳附元素爆發"
  },
  "monk/attack-defense": {
    "event": "combo",
    "payload": "stackStrike",
    "threshold": 2,
    "description": "連擊蓄力破城拳"
  },
  "monk/attack-support": {
    "event": "combo",
    "payload": "comboLeech",
    "threshold": 2,
    "description": "連段汲血追擊"
  },
  "monk/magic-defense": {
    "event": "thirdStance_monk",
    "payload": "arcaneStrike",
    "threshold": 1,
    "description": "集氣化為星陣衝擊"
  },
  "monk/magic-support": {
    "event": "combo",
    "payload": "manaRefund",
    "threshold": 1,
    "description": "連擊回 SP 啟動星雨"
  },
  "monk/defense-support": {
    "event": "damageTaken",
    "payload": "arcaneStrike",
    "threshold": 1,
    "description": "承傷回氣強化極意拳"
  },
  "hunter/attack-magic": {
    "event": "falcon",
    "payload": "elementBurn",
    "threshold": 1,
    "description": "鷹擊點燃龍焰標記"
  },
  "hunter/attack-defense": {
    "event": "thirdHit_hunter",
    "payload": "armorBreak",
    "threshold": 1,
    "description": "貫穿箭附破甲反擊"
  },
  "hunter/attack-support": {
    "event": "falcon",
    "payload": "haste",
    "threshold": 1,
    "description": "獵鷹與戰歌連射協同"
  },
  "hunter/magic-defense": {
    "event": "thirdHit_hunter",
    "payload": "arcaneStrike",
    "threshold": 1,
    "description": "狙擊引爆遠距星砲"
  },
  "hunter/magic-support": {
    "event": "thirdWideHit_hunter",
    "payload": "splash",
    "threshold": 1,
    "description": "箭雨附星雨擴散"
  },
  "hunter/defense-support": {
    "event": "shield",
    "payload": "ward",
    "threshold": 1,
    "description": "護壁維持射擊後反狙"
  },
  "performer/attack-magic": {
    "event": "thirdHit_performer",
    "payload": "elementBurn",
    "threshold": 1,
    "description": "音波引燃元素節奏"
  },
  "performer/attack-defense": {
    "event": "buff",
    "payload": "soundShield",
    "threshold": 2,
    "description": "演奏時疊加反擊音盾"
  },
  "performer/attack-support": {
    "event": "buff",
    "payload": "arcaneStrike",
    "threshold": 1,
    "description": "戰歌追加獵魂追擊"
  },
  "performer/magic-defense": {
    "event": "thirdHit_performer",
    "payload": "arcaneStrike",
    "threshold": 1,
    "description": "音波轉化結界砲擊"
  },
  "performer/magic-support": {
    "event": "buff",
    "payload": "splash",
    "threshold": 1,
    "description": "樂曲延長星雨連鎖"
  },
  "performer/defense-support": {
    "event": "heal",
    "payload": "arcaneStrike",
    "threshold": 1,
    "description": "治癒旋律觸發裁界脈衝"
  }
});
export const ORIGINAL_SIX_KEYS = Object.freeze(["attack-magic","attack-defense","attack-support","magic-defense","magic-support","defense-support"]);
