// Twelve ordered identities, twelve separate continents. Pure data: no save mutation.
export const HOMECOMING_ROUTES=Object.freeze([
  {
    "id": "attack-magic",
    "companion": "星焰真契者",
    "continent": "燼星大陸",
    "town": "燼星龍城",
    "npc": "守爐長・赫焰",
    "title": "熄滅的祖爐",
    "boss": "噬焰空殼",
    "color": "#c76838",
    "letter": "家鄉寄來的龍焰石已經冰冷。夥伴請你同行，找回祖爐熄滅的原因。",
    "journey": [
      "沿黑曜石古道攀上火山。",
      "冷灰飄過熔岩橋，供熱塔的火光逐一消失。",
      "燼星龍城就在眼前，守爐長正等候最後的火種。"
    ],
    "choices": [
      "先檢查供熱塔的火種匣",
      "直接封死祖爐入口",
      "把龍焰石投入深谷"
    ],
    "answer": 0,
    "nodes": [
      "修復東側供熱塔",
      "接通熔岩橋導流槽",
      "護送守爐者進入祖爐"
    ],
    "gates": [
      2,
      5,
      8
    ],
    "foes": [
      "灰燼啃食者",
      "熔脈裂甲獸",
      "失焰爐靈"
    ],
    "ending": "祖爐再度亮起，溫暖沿著管道回到每一戶人家。",
    "inheritance": "hp",
    "continentId": "home_1",
    "townId": "hc_1_town",
    "fieldId": "hc_1_wild",
    "bossMapId": "hc_1_boss",
    "bossId": "hc_1_chief"
  },
  {
    "id": "magic-attack",
    "companion": "赤曜星羽姬",
    "continent": "赤羽大陸",
    "town": "赤羽天都",
    "npc": "引航官・翎澈",
    "title": "無法歸巢的候鳥",
    "boss": "逆風羽王",
    "color": "#cf667e",
    "letter": "送信的幼鳥帶著破碎航標。故鄉的鳥群已經錯過歸巢之夜。",
    "journey": [
      "登上離開崖港的風帆船。",
      "雷暴中，斷裂的航標指向相反星路。",
      "穿過雲層，赤羽天都的巨大光環黯淡無光。"
    ],
    "choices": [
      "熄滅所有航標",
      "比對幼鳥羽片上的星路",
      "跟隨雷暴中最亮的閃光"
    ],
    "answer": 1,
    "nodes": [
      "校正第一座航標",
      "救回雲隙中的幼鳥",
      "點亮歸巢主信標"
    ],
    "gates": [
      2,
      4,
      7
    ],
    "foes": [
      "逆流風鰩",
      "碎羽雷鷲",
      "迷航雲影"
    ],
    "ending": "鳥群在天都上空盤旋，失落已久的歸巢鐘聲再度響起。",
    "inheritance": "def",
    "continentId": "home_2",
    "townId": "hc_2_town",
    "fieldId": "hc_2_wild",
    "bossMapId": "hc_2_boss",
    "bossId": "hc_2_chief"
  },
  {
    "id": "attack-defense",
    "companion": "鎮界龍衛",
    "continent": "玄關大陸",
    "town": "玄關壁城",
    "npc": "守關隊長・岑盾",
    "title": "最後一道關門",
    "boss": "裂隙攻城獸",
    "color": "#a89463",
    "letter": "昔日同袍寄來斷裂軍徽。地脈裂縫已逼近撤離居民的最後道路。",
    "journey": [
      "踏上荒原中的舊軍道。",
      "在崩裂峽谷旁接應撤離車隊。",
      "玄關壁城層層城門聳立，鎮界錨已出現裂痕。"
    ],
    "choices": [
      "優先追擊遠處敵軍",
      "先關閉所有城門",
      "先確認居民撤離路線"
    ],
    "answer": 2,
    "nodes": [
      "接應峽口居民",
      "修復第二鎮界錨",
      "守住最後一支撤離車隊"
    ],
    "gates": [
      3,
      6,
      9
    ],
    "foes": [
      "裂隙斥候",
      "斷岩掠奪獸",
      "崩壁石衛"
    ],
    "ending": "守關隊長逐一點名，最後一位居民也平安走過城門。",
    "inheritance": "hp",
    "continentId": "home_3",
    "townId": "hc_3_town",
    "fieldId": "hc_3_wild",
    "bossMapId": "hc_3_boss",
    "bossId": "hc_3_chief"
  },
  {
    "id": "defense-attack",
    "companion": "赤曜鎧聖",
    "continent": "赤砧大陸",
    "town": "赤砧爐堡",
    "npc": "工匠代表・鐵菈",
    "title": "不再回響的鐵鎚",
    "boss": "空心爐衛",
    "color": "#bb754c",
    "letter": "鍛造師困在山腹，沒有穿戴者的空鎧卻開始巡行街道。",
    "journey": [
      "搭乘礦軌車深入山腹。",
      "無人的鍛造廊裡，鐵鎚仍規律敲擊。",
      "穿過鐵橋，赤砧爐堡的主爐仍在失控運轉。"
    ],
    "choices": [
      "切斷空鎧軍團的供能軌道",
      "先拆掉工匠的避難門",
      "朝主爐加入更多燃料"
    ],
    "answer": 0,
    "nodes": [
      "切換礦軌救出工匠",
      "取回熔斷器",
      "停用空鎧供能閘"
    ],
    "gates": [
      2,
      4,
      8
    ],
    "foes": [
      "空鎧巡兵",
      "軌道熔蛛",
      "失控鍛錘"
    ],
    "ending": "爐堡裡重新響起人的笑聲，鐵鎚終於再次握在工匠手中。",
    "inheritance": "def",
    "continentId": "home_4",
    "townId": "hc_4_town",
    "fieldId": "hc_4_wild",
    "bossMapId": "hc_4_boss",
    "bossId": "hc_4_chief"
  },
  {
    "id": "attack-support",
    "companion": "聖瑞麟劍士",
    "continent": "玉穗大陸",
    "town": "玉穗原鄉",
    "npc": "村長・穗青",
    "title": "被切斷的豐收路",
    "boss": "枯穗棘獸",
    "color": "#a2ad52",
    "letter": "收穫祭前商隊失蹤，守護田野的麟靈也不再回應。",
    "journey": [
      "走過金色梯田與收割後的小路。",
      "循商隊留下的車轍進入古林。",
      "玉穗原鄉的入口已被巨大的荊棘纏住。"
    ],
    "choices": [
      "燒掉整片古林",
      "循車轍與遺落貨物找人",
      "把失蹤名冊丟進井裡"
    ],
    "answer": 1,
    "nodes": [
      "找到遺落的商隊帳冊",
      "接回受困的村民",
      "淨化祭田旁的根巢"
    ],
    "gates": [
      2,
      5,
      7
    ],
    "foes": [
      "穢穗蟲",
      "棘藤獵犬",
      "枯葉寄生靈"
    ],
    "ending": "商隊重新駛過古道，村民與麟靈一起迎接遲來的收穫祭。",
    "inheritance": "recovery",
    "continentId": "home_5",
    "townId": "hc_5_town",
    "fieldId": "hc_5_wild",
    "bossMapId": "hc_5_boss",
    "bossId": "hc_5_chief"
  },
  {
    "id": "support-attack",
    "companion": "赤曜麟武姬",
    "continent": "丹旌大陸",
    "town": "丹旌武鄉",
    "npc": "代理教頭・緋槐",
    "title": "遲到的歸旗人",
    "boss": "吞旗戰魂",
    "color": "#c76061",
    "letter": "師父只留下帶回舊戰旗的信，隨後在祭典前夕失去音訊。",
    "journey": [
      "沿紅楓山道帶著舊戰旗前進。",
      "廢棄演武台上，仍留著師父的步痕。",
      "丹旌武鄉的百旗迎風飄揚，練武場卻異常安靜。"
    ],
    "choices": [
      "把戰旗交給陌生旅商",
      "直接宣布師父已經離開",
      "依三位舊友的線索尋師"
    ],
    "answer": 2,
    "nodes": [
      "完成第一場步法演武",
      "查明禁地留下的刀痕",
      "接應守在禁地的師父"
    ],
    "gates": [
      3,
      5,
      8
    ],
    "foes": [
      "失序武偶",
      "赤楓刃影",
      "殘旗守靈"
    ],
    "ending": "師父親手繫好舊旗，這次守鄉的誓言由夥伴自己決定。",
    "inheritance": "recovery",
    "continentId": "home_6",
    "townId": "hc_6_town",
    "fieldId": "hc_6_wild",
    "bossMapId": "hc_6_boss",
    "bossId": "hc_6_chief"
  },
  {
    "id": "magic-defense",
    "companion": "星岩晶詠者",
    "continent": "晶歌大陸",
    "town": "晶歌深城",
    "npc": "記憶司書・璃音",
    "title": "逐漸失聲的城市",
    "boss": "噤聲晶核",
    "color": "#8e8acb",
    "letter": "共鳴水晶失聲，居民甚至開始忘記彼此的名字。",
    "journey": [
      "搭升降籠下降到地底晶穴。",
      "沿發光晶河前進，水聲掩蓋了原本的歌聲。",
      "晶歌深城的共鳴高塔一片寂靜。"
    ],
    "choices": [
      "先找回三段失落的記憶音節",
      "敲碎城市所有水晶",
      "刪去居民的名字"
    ],
    "answer": 0,
    "nodes": [
      "找回溪畔的記憶音節",
      "校正共鳴柱的音序",
      "解救被雜音困住的歌者"
    ],
    "gates": [
      2,
      6,
      9
    ],
    "foes": [
      "噤聲晶蛾",
      "失憶晶影",
      "雜音聚合體"
    ],
    "ending": "歌聲沿晶河流過，居民終於能再次喊出彼此的名字。",
    "inheritance": "def",
    "continentId": "home_7",
    "townId": "hc_7_town",
    "fieldId": "hc_7_wild",
    "bossMapId": "hc_7_boss",
    "bossId": "hc_7_chief"
  },
  {
    "id": "defense-magic",
    "companion": "星曜符衛",
    "continent": "環符大陸",
    "town": "環符祕城",
    "npc": "結界監察官・赫紋",
    "title": "結界之內的陌生人",
    "boss": "失律裁定者",
    "color": "#76aabb",
    "letter": "城門結界開始把居民當成入侵者，求援信只能從裂隙送出。",
    "journey": [
      "穿越佈滿石碑的砂海。",
      "追著不斷移動的符文道路走過蜃景。",
      "環符祕城的分段城門正反覆重組。"
    ],
    "choices": [
      "把所有居民趕出城市",
      "比對三座符塔的原始誓文",
      "無條件服從目前裁定"
    ],
    "answer": 1,
    "nodes": [
      "取得第一份原始誓文",
      "解開居民區的隔離符",
      "重連主塔守護紋路"
    ],
    "gates": [
      3,
      6,
      8
    ],
    "foes": [
      "錯紋沙偶",
      "禁行符獸",
      "失律監視者"
    ],
    "ending": "新的誓文刻上城門：結界守護的是居民，而不是一紙錯誤裁定。",
    "inheritance": "def",
    "continentId": "home_8",
    "townId": "hc_8_town",
    "fieldId": "hc_8_wild",
    "bossMapId": "hc_8_boss",
    "bossId": "hc_8_chief"
  },
  {
    "id": "magic-support",
    "companion": "聖光羽靈姬",
    "continent": "白羽大陸",
    "town": "白羽聖港",
    "npc": "守燈人・露汐",
    "title": "沒有黎明的燈塔",
    "boss": "無曙霧主",
    "color": "#9ebcc7",
    "letter": "引航聖燈熄滅，每晚濃霧裡都有求援聲傳來。",
    "journey": [
      "乘夜船越過深色海面。",
      "無光燈塔在霧中浮現，遠處有真假難辨的船影。",
      "白羽聖港的拱廊下，守燈人望著失去航線的船冊。"
    ],
    "choices": [
      "追逐每一道聲音直到迷航",
      "丟棄全部航海紀錄",
      "核對失蹤船冊與求援信號"
    ],
    "answer": 2,
    "nodes": [
      "辨識第一艘真實船隻",
      "護送受損船隊靠岸",
      "修復燈塔引航鏡"
    ],
    "gates": [
      2,
      5,
      8
    ],
    "foes": [
      "迷霧舟影",
      "吞燈海魟",
      "失航潮靈"
    ],
    "ending": "聖燈穿透濃霧，最後一艘船也循著光安全進港。",
    "inheritance": "recovery",
    "continentId": "home_9",
    "townId": "hc_9_town",
    "fieldId": "hc_9_wild",
    "bossMapId": "hc_9_boss",
    "bossId": "hc_9_chief"
  },
  {
    "id": "support-magic",
    "companion": "星羽瑞雲仙",
    "continent": "雲織大陸",
    "town": "雲織仙鄉",
    "npc": "織雲長者・紗嵐",
    "title": "落向大地的故鄉",
    "boss": "斷雲蠶",
    "color": "#b49cc4",
    "letter": "送來的雲紗變成雨水，承托故鄉的雲海正在消散。",
    "journey": [
      "乘天河小舟進入高空雲海。",
      "斷裂雲橋與飄散絲帶橫在前方。",
      "雲織仙鄉的屋舍正隨浮台緩緩下沉。"
    ],
    "choices": [
      "先固定屋舍，再重織四季風線",
      "直接剪斷全部雲橋",
      "等村落落地後再處理"
    ],
    "answer": 0,
    "nodes": [
      "收回春風與夏雨絲線",
      "固定下沉的屋舍浮台",
      "接回秋霜與冬雪雲脈"
    ],
    "gates": [
      2,
      4,
      6
    ],
    "foes": [
      "斷雲絲蛾",
      "落帷風靈",
      "吞紗雲獸"
    ],
    "ending": "雲脈重新托起屋舍，長者在新織的橋上迎接每一位歸人。",
    "inheritance": "recovery",
    "continentId": "home_10",
    "townId": "hc_10_town",
    "fieldId": "hc_10_wild",
    "bossMapId": "hc_10_boss",
    "bossId": "hc_10_chief"
  },
  {
    "id": "defense-support",
    "companion": "碧玉聖庭守望者",
    "continent": "翠庭大陸",
    "town": "翠庭樹城",
    "npc": "樹庭長老・苔珞",
    "title": "世界樹的空心處",
    "boss": "空根寄生者",
    "color": "#68a580",
    "letter": "世界樹根部出現無法癒合的空洞，居民仍困在深處根室。",
    "journey": [
      "沿巨大的樹根進入古林。",
      "枯萎內庭的深處，有生命光點持續流失。",
      "翠庭樹城依樹幹而建，最底層的燈火正在熄滅。"
    ],
    "choices": [
      "把幼苗拔掉以減輕負擔",
      "先救居民並追查生命流失方向",
      "封住所有根室出口"
    ],
    "answer": 1,
    "nodes": [
      "救出第一根室的居民",
      "支撐瀕臨斷裂的主根",
      "保護新生幼苗並封住空洞"
    ],
    "gates": [
      3,
      5,
      9
    ],
    "foes": [
      "空根螟",
      "枯庭藤衛",
      "噬脈寄生靈"
    ],
    "ending": "老樹的傷口開始癒合，新芽在眾人圍成的庭院裡舒展。",
    "inheritance": "hp",
    "continentId": "home_11",
    "townId": "hc_11_town",
    "fieldId": "hc_11_wild",
    "bossMapId": "hc_11_boss",
    "bossId": "hc_11_chief"
  },
  {
    "id": "support-defense",
    "companion": "聖岩麟角賢者",
    "continent": "磐泉大陸",
    "town": "磐泉隱村",
    "npc": "守泉人・岩沐",
    "title": "冬天之前的最後泉水",
    "boss": "封泉霜魁",
    "color": "#84a9c8",
    "letter": "山村的溫泉接連冰封，必須在大雪封山前帶回古泉印。",
    "journey": [
      "隨雪地商隊沿山路向上。",
      "越過結冰吊橋，谷底已看不見流水。",
      "磐泉隱村只剩最後一口冒著熱氣的暖泉。"
    ],
    "choices": [
      "優先鑿開村民家的門",
      "把最後暖泉封起來保存",
      "先開避難雪道，再接通地下水脈"
    ],
    "answer": 2,
    "nodes": [
      "打通避難雪道",
      "送達受困居民的禦寒補給",
      "依古泉圖接通地下水脈"
    ],
    "gates": [
      2,
      6,
      10
    ],
    "foes": [
      "霜脈雪蟲",
      "封泉冰衛",
      "裂冰山魈"
    ],
    "ending": "暖泉再次流過村莊，雪夜裡的每一扇窗都亮起了燈。",
    "inheritance": "hp",
    "continentId": "home_12",
    "townId": "hc_12_town",
    "fieldId": "hc_12_wild",
    "bossMapId": "hc_12_boss",
    "bossId": "hc_12_chief"
  }
].map(r=>Object.freeze(r)));
export const HOMECOMING_BY_ID=Object.fromEntries(HOMECOMING_ROUTES.map(r=>[r.id,r]));
export const HOMECOMING_MAP_INDEX=Object.fromEntries(HOMECOMING_ROUTES.flatMap(r=>[[r.townId,{route:r,kind:'town'}],[r.fieldId,{route:r,kind:'field'}],[r.bossMapId,{route:r,kind:'boss'}]]));
export const homecomingMap=map=>HOMECOMING_MAP_INDEX[map]||null;
export const homecomingIdentity=pet=>pet?.fusion?pet.fusion.main+'-'+pet.fusion.sub:null;
export const HOMECOMING_JOURNEY_ART=Object.freeze(Object.fromEntries(HOMECOMING_ROUTES.map(r=>[r.id,[null,null,null]])));
