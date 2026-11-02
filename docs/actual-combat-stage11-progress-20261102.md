# 第十一輪：實戰驗證的可執行排程檢查、原始紀錄續存、DPS 排名修正

日期：2026-11-02。僅獨立分支 `experiment-weapon-balance-20261102`，**未修改 main**。

## 本輪已實際執行
- 直接擷取獨立分支最新 `dist/game.js` 內的完整 `combatTick()` 原始函式，在受控的替身依賴環境執行一次。
- 確認事件排程：`trialControl → encounter → target → capture → potion → petEffect → enemyAttack → petAbility → petAttack → autoCastJobs → playerAttack`，與預期一致。
- 此為**真實戰鬥控制程式的排程測試**，但敵人與傷害函式仍為替身；**不是一次完整怪物實戰，也不構成實測 DPS**。
- 新增 `tests/actual-combattick-source-flow.test.mjs`，將控制排程／敵人已死／人物已死／寵物已死的條件變成可重跑回歸案例。

## 修正 GitHub Chromium 完整測試
- `tests/real-combat-browser-benchmark.mjs` 每20場實戰寫入一次 `test-results/lv200-lv210-full-partial-actual-combat.json`，例外時再保存全部已完成場次，避免後半段失敗使前面的原始扣血結果消失。
- 警告：**partial** 結果無法視為120組正式完成，必須由全量完成後的 `actual-combat-120-ranked.json` 驗收。
- 測試流程只在 **獨立分支** 跑，失敗時保留錯誤、對應職業／融合／配點／怪物、HTTP模組載入及JS堆疊。

## 修正最終排名的判斷標準
舊版排名優先以60%小怪／40%首領的「擊敗怪物HP比例」作為排序，實際上不等於要求的DPS。已修正：
- `stageDpsRank`：同等級 60%小怪實測每秒有效傷害＋40%首領實測每秒有效傷害排名。
- `bossDpsRank`：同等級按**地圖首領實測有效 DPS**獨立排名。
- `viabilityRank`：獨立列出首領擊殺且角色存活、刷圖進度／存活等；不與純DPS混淆。
- `bossOwnerDps`／`bossPetAttributedDps` 分開記錄；總傷必須與怪物實際HP變化相符。
- 60%／40%是透明的測試權重，不是遊戲正式生產掉落或效率公式。

## 還沒完成，不能冒充完成
- GitHub 尚未提供可核對的 Chromium 完整實戰成功紀錄；目前未讀取到 `docs/test-results/actual-combattick-smoke.json`。
- 本地環境無法直接透過GitHub網域下載私有／公開分支專案。無法在本地重建完整網頁模組樹並執行 Playwright 全程。
- 測試候選角色仍使用有限的配點集合與等級200神話中點詞條（Lv210再SSS），因此**不是全裝備／卡片／技能排序的最高可達DPS全球最適解**。
- 不應向使用者報出120組完整實測值、排名或全職平衡結論，直到有成功且可重播的實戰資料。

## 最終驗收
- Lv200無強化、191～200界源天穹10小怪＋200級地圖首領，10×6＝60組。
- Lv210全SSS、201～210黎明斷層3小怪＋210級地圖首領，10×6＝60組；契印IV與VIII分場。
- 每配置保留來源SHA、合法完整配點／武器、卡片、寵物6選3、實際傷害帳、技能施放、首領存活、勝率及每秒有效輸出。
- 需做可重播的候選配置最佳化與多個隨機種子後，才能判斷真正的最強配點與平衡。
