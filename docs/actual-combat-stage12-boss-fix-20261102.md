# 第十二輪｜正式 combatTick 測試關鍵障礙修正（2026-11-02）

本文件只涵蓋 `experiment-weapon-balance-20261102`；正式 `main` 未修改。

## 這一輪找到的確定錯誤

實戰測試的 `fight({boss:true})` 原本一律讀取 `MAP_BOSSES[player.location]`。可是黎明斷層不屬於 `MAP_BOSSES` 裏面的區域，Lv210首領獨立定義於 `dist/dawn-world.js` 的 `DAWN_BOSS`。原本的 Lv210 地圖首領測試因目標是 undefined，無法進入有效的首領戰。

已修正為：`player.location==='dawnrift'?DAWN_BOSS:MAP_BOSSES[player.location]`。依測試分支實際來源擷取這條選擇式並執行，得到：
- Lv200／`worldroot`／boss → `boss_worldroot`
- Lv210／`dawnrift`／boss → `dawn-archon`

這是**真實來源的目標解析測試**，不是完整 Chromium 戰鬥測試。

另修正：
1. 指定 `monsterId` 不存在時，立即報錯，不得默默使用列表首隻怪；避免把錯的敵人當成已測。
2. 測試融合寵的 `xp`、`kills` 初始數值設成0，防止首次擊殺獎勵程序將 `undefined` 參與加法。
3. 新增 `tests/actual-combat-boss-fixture.test.mjs` 鎖定 Lv200／Lv210 首領來源、10+3 真實小怪、有效寵物資料。
4. Chromium 流程每完成20場保存一次完整原始記錄，途中報錯時保留故障職業、融合、武器、配點、怪物、JavaScript堆疊與HTTP錯誤。

## 尚未取得成功證據

由目前可用的GitHub操作未取得可核對的完整Chromium動作／傷害記錄。此環境直接連接GitHub網域失敗，無法在本地拉取所有網頁模組執行完整 Chromium 遊戲。因此不能宣稱120組實戰 DPS 已完成，不能提供假排名。

## 正式待驗收

- Lv200、10職×6融合、無強化、191～200 10種普通怪＋界源天穹地圖首領。
- Lv210、10職×6融合、全身SSS、201～210 3種普通怪＋黎明裁界者，契印IV及VIII分開。
- 各職合理優化合法武器、技能、配點、裝備與卡片，並經多固定種子實際 `combatTick` 回放，以人物有效傷害、寵物有效傷害、總有效DPS、存活與實際通關數據比較。
- 必須取得瀏覽器實測原始結果／成功證據，才能稱為最終平衡結果。
