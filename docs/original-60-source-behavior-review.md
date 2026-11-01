# 原稿60格行為核對紀錄

核對範圍：原稿六融合，不含反向新增六融合。主程式提交 `116772e37c7373691531b529408f5f1e4e71a55e`。下表為逐格原稿語意核對，搭配60格實際動作、正負事件、共用冷卻、換寵回歸；複雜分段另有專項測試。這不是所有種子／配點／裝備或所有未來事件順序的窮舉證明。

共同證據：`tests/original-60-live-actions.test.mjs`（不直接呼叫 emitEvent，來源為實際技能／怪物攻擊／自詠／夥伴能力）、`original-60-payload-runtime`、`original-60-cooldown-negative`、`original-60-pet-switch`。專項為 `original-resonance-behavior`、`original-main-hit-gates`、`original-resonance-dot-lifecycle`、`original-resonance-buff-switch`、`original-guard-song-lifecycle`、`original-star-volley`、`original-monk-qi`。檔案均在 tests 下，以 `.test.mjs` 結尾。

| 配置 | 原稿 | 實際行為核對 |
|---|---|---|
| knight/attack-magic | 龍槍命中疊元素爆 | 主攻兩次累積後元素爆與三次灼燒，灼燒不轉移目標 |
| knight/attack-defense | 盾碎後龍槍破甲 | 實際盾碎後六秒內龍槍命中才破甲 |
| knight/attack-support | 血線穩定時連續追擊 | HP至少65%且龍槍命中，追加追擊與3.5秒加速 |
| knight/magic-defense | 龍槍生成星壁穿刺 | 龍槍命中生成護盾並穿透擴散至其餘兩目標 |
| knight/magic-support | 龍槍連段回復 SP | 龍槍連段累積兩次回SP |
| knight/defense-support | 承傷觸發龍魂反擊 | 承傷後一次龍魂反擊，無承傷不觸發 |
| crusader/attack-magic | 聖盾附龍焰裁決 | 聖盾主攻命中追加魔法裁決與灼燒 |
| crusader/attack-defense | 承傷積累破城反擊 | 兩次承傷累積後釋放破城反擊 |
| crusader/attack-support | 聖誓吸血後盾擊 | 首次命中汲血；同一目標後續命中才盾擊，8.5秒及換寵失效 |
| crusader/magic-defense | 盾反充能結界魔砲 | 實際格擋觸發蓄積傷害與魔砲 |
| crusader/magic-support | 防禦技能回流魔力 | 實際防禦建盾事件回SP並補護盾 |
| crusader/defense-support | 聖盾守護後裁界追擊 | 建盾不造成追擊；6.5秒內後續主攻命中且守護仍有效才消耗一次追擊 |
| wizard/attack-magic | 星隕引燃元素鏈爆 | 星隕命中點燃三次灼燒並擴散 |
| wizard/attack-defense | 被攻擊時蓄力法術 | 承傷蓄力，後續主攻命中才釋放魔法，過期與換寵失效 |
| wizard/attack-support | 持續施法獲獵歌節奏 | 完成施法獲得加速與兩次印記協攻 |
| wizard/magic-defense | 結界存法術後砲擊 | 結界先儲存法術，後續施法才放一次魔砲 |
| wizard/magic-support | 星雨擴散並回流 SP | 實際三轉範圍星雨命中後擴散並回SP |
| wizard/defense-support | 護壁期間提高多段命中 | 建盾後最多兩次協助命中，只在護壁有效期與同一夥伴存在時有效 |
| sage/attack-magic | 自詠附雙極元素烙印 | 自詠後附加兩次印記及元素灼燒 |
| sage/attack-defense | 魔力拳破甲連擊 | 魔力拳成功動作破甲並疊加連擊 |
| sage/attack-support | 自詠追獵擊回復資源 | 自詠後追獵擊並回SP |
| sage/magic-defense | 魔力拳堆疊星陣砲擊 | 主攻兩次後堆疊星陣打擊並擴散 |
| sage/magic-support | 自詠星雨連鎖回流 | 自詠觸發含主目標的三目標星雨，依實際傷害回SP |
| sage/defense-support | 守護有效時自詠追擊 | 既有守護有效才自詠追擊；時間邊界即失效，不能由失效數值重新開盾 |
| assassin/attack-magic | 暴擊附元素灼燒 | 實際暴擊後三次元素灼燒，非暴擊不啟動 |
| assassin/attack-defense | 突刺破甲後處刑 | 首次突刺暴露破甲，8.5秒內後續同目標突刺才處刑，殘血加成 |
| assassin/attack-support | 汲血連斬疊斬殺印 | 連斬累積兩次汲血並建立兩次斬殺印記 |
| assassin/magic-defense | 影殺後星砲追擊 | 影殺主攻命中後追加魔砲與印記 |
| assassin/magic-support | 閃襲後追加魔力飛刃 | 閃襲主攻命中後追加魔法飛刃並回SP |
| assassin/defense-support | 殘血時護壁並反襲 | HP不高於40%且承傷才護盾反襲 |
| rogue/attack-magic | 掠刃追加元素炸裂 | 掠刃主攻命中追加魔法打擊與元素灼燒 |
| rogue/attack-defense | 偷襲破甲與反擊 | 偷襲主攻命中破甲並追加反擊傷害 |
| rogue/attack-support | 技能刷新時召喚獵擊 | 實際技能冷卻刷新事件召喚獵擊並建立印記 |
| rogue/magic-defense | 影擊觸發星陣連射 | 影擊主攻命中後同目標兩段真實魔法連射；首段致死停止且不轉移 |
| rogue/magic-support | 連擊回流 SP 並擴散 | 連擊事件回SP並擴散至其餘兩目標 |
| rogue/defense-support | 閃避後聖域追擊 | 怪物攻擊實際被閃避才聖域追擊，命中不得替代 |
| priest/attack-magic | 聖光觸發龍焰但限頻 | 聖光主攻命中追加龍焰，受全共鳴4秒冷卻限制 |
| priest/attack-defense | 聖裁觸發破甲聖盾 | 聖裁主攻命中破甲並建盾 |
| priest/attack-support | 祈禱增益改為獵歌協攻 | 實際祈禱增益事件獲獵歌協攻與加速，事件別名不重複能量 |
| priest/magic-defense | 聖光凝聚玄星炮 | 聖光主攻命中凝聚疊加玄星魔砲 |
| priest/magic-support | 治療溢量轉化星雨 | 實際治療溢量轉三目標星雨；無溢量不觸發，傷害有上限 |
| priest/defense-support | 聖域裁決與守護反擊分流 | 攻擊施法裁決、建盾與守護承傷反擊分流；建盾不攻擊，反擊消耗有效守護充能 |
| monk/attack-magic | 極意拳附元素爆發 | 極意拳主攻命中追加元素魔法爆發及灼燒 |
| monk/attack-defense | 連擊蓄力破城拳 | 連擊兩次蓄力後破甲與破城拳 |
| monk/attack-support | 連段汲血追擊 | 連擊兩次後汲血追擊 |
| monk/magic-defense | 集氣化為星陣衝擊 | 實際集氣姿態事件轉星陣打擊並擴散 |
| monk/magic-support | 連擊回 SP 啟動星雨 | 連擊事件回SP並星雨擴散 |
| monk/defense-support | 承傷回氣強化極意拳 | 承傷只回SP及儲氣；後續極意拳實際命中才消耗，最多3層、12秒，換寵取消 |
| hunter/attack-magic | 鷹擊點燃龍焰標記 | 實際獵鷹事件附龍焰印記及三次灼燒 |
| hunter/attack-defense | 貫穿箭附破甲反擊 | 貫穿主攻命中破甲並追擊反擊 |
| hunter/attack-support | 獵鷹與戰歌連射協同 | 有有效戰歌／祝福時獵鷹事件追加兩段同目標連射 |
| hunter/magic-defense | 狙擊引爆遠距星砲 | 狙擊主攻命中引爆魔砲並擴散 |
| hunter/magic-support | 箭雨附星雨擴散 | 實際箭雨範圍命中後星雨擴散與灼燒 |
| hunter/defense-support | 護壁維持射擊後反狙 | 建盾維持期間後續射擊命中才反狙；失盾、6.5秒、換寵均取消 |
| performer/attack-magic | 音波引燃元素節奏 | 音波主攻命中引燃元素灼燒並加速 |
| performer/attack-defense | 演奏時疊加反擊音盾 | 20秒內兩次實際演奏增益蓄音盾；盾吸收後反擊一次 |
| performer/attack-support | 戰歌追加獵魂追擊 | 實際戰歌增益追加獵魂追擊與加速 |
| performer/magic-defense | 音波轉化結界砲擊 | 音波主攻命中追加結界砲擊並建盾 |
| performer/magic-support | 樂曲延長星雨連鎖 | 實際樂曲建立2秒間隔星雨，後續戰歌延長同一連鎖；最多6波／12秒、3目標，換寵及寵物死亡取消 |
| performer/defense-support | 治癒旋律觸發裁界脈衝 | 專屬治癒旋律確實治療；只有有效治療觸發裁界脈衝，不以純回SP冒充治療 |

判定：逐格原稿核對與上述範圍行為驗證已完成；不再把接線測試當作唯一證據。全量最終回歸、五王矩陣及實體裝置的結論見 `original-lifecycle-acceptance-2026-11-01.md`。
