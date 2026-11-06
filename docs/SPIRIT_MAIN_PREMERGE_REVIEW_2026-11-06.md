# 御靈使 MAIN 合併前審核（2026-11-06）

## 結論

此分支為**合併候選版，尚未合併 MAIN 或部署正式網站**。

基底 `origin/feature/spirit-tamer-single-pet`：`7731f61`；該分支的祖先包含 MAIN `0a61d28`（裝備比較模式保存、倉庫首領卡排序）。2026-11-06 重新查詢遠端，兩分支指標未改變。

## 已納入

- 御靈使與一般職業同樣從 Base Lv.1 正常創立，沒有帳號 Lv.210 門檻，不直升三轉。
- 御靈使正常在 Base Lv.50 / Job Lv.40 後二轉，兩路分支沿用現有轉職及三轉流程。
- 御靈使、靈契戰使、雙靈指揮官只能裝備杖劍；沒有權杖、其他劍及單手法杖的職業漏洞。
- 保留單夥伴規則、君王同化、萬靈協戰及本地確認後的輸出下修數值；不恢復雙出戰、雙同化或舊雙夥伴共鳴。
- 保留從 MAIN 已有的裝備比較、共用倉庫和首領卡 UI 邏輯，沒有覆蓋 `dist/shared-warehouse.js` 等未衝突邏輯。`dist/index.html` 僅在後續審核提交調整發布版本與 `game.js` 快取識別（V6.5.65 → V6.5.66）；未替換 MAIN 的 UI 內容。
- 八格存檔整合測試使用現有合法角色 JSON，不再依賴缺失的 `scripts/balance-v24.mjs`。

## 驗證

以下 Node 程式流程／Worker／存檔／倉庫／首領卡回歸測試：**75 項通過、0 項失敗**（前一輪）；本輪另外補上創角控制器事件測試，獨立創角測試 **3 項通過**。

```bash
node --test tests/spirit-*.test.mjs tests/shared-warehouse.test.mjs tests/warehouse-boss-highlight.test.mjs tests/warehouse-offline-conflict.test.mjs tests/character-slot-legacy-ledger.test.mjs tests/boss-card-legacy-sockets.test.mjs tests/boss-card-notice-flow.test.mjs tests/four-slot-progression-integration.test.mjs
```

同時 `node --check dist/game.js`、`git diff --check` 通過。

PR #20 建立後額外驗證：原有 60 組共鳴與騎士連擊契約、離線 Worker 及 12 秒實際戰鬥 Worker，共 **4 項測試通過**；倉庫、八格存檔、舊王卡與掉落通知等相容性測試 **28 項通過**（後者與上述 75 項基準測試有重疊，不重複累加為全新測試）。

發布版本修正：首頁標題、頁面顯示、模組映射及主程式引用已改用 `V6.5.66` / `game.js?v=6.5.66`；其他未修改 CSS 保留原快取識別。針對創角、轉職與武器的 **13 項重跑測試通過**（與 75 項基準亦部分重疊）。

後續實戰對照（`tests/spirit-premerge-optimal-field-smoke.mjs`，生產環境離線 Worker，固定 seeds 20261106／471122／93217，210 等 201 地圖各 120 秒）：使用完全相同的最佳化 SSS／契印 8 存檔，君王三輪擊殺 151／142／153、遇王 2／2／1、平均 DPS 約 484,166,522；萬靈擊殺 143／145／143、遇王 2／1／2、平均 DPS 約 475,154,766。六輪均完整跑完、沒有復活。這是三組 seed 的實戰煙霧測試，**不能作為正式全職業最高 DPS 排名**，也不能外推至 200 等五連戰。

相對地，`tests/spirit-single-pet-real-worker.mjs` 使用未最佳化合成基準存檔，萬靈在 200／210 地圖皆提前死亡；`tests/spirit-single-pet-200-trial-worker.mjs` 攻魔組合在 191 首領約 4.2 秒失敗。該差異證明測試結果高度依賴合法配置，**不能引用基準存檔失敗判定新職業平衡或正式發布阻擋**；若要平衡結論須使用同標準合法最佳化存檔重跑五連戰。

## GitHub Actions 實際 Chromium 驗收

新增專用 `.github/workflows/spirit-premerge-browser.yml`，在 GitHub Ubuntu runner 安裝 Chromium／Playwright，以 `scripts/browser/spirit-premerge-acceptance.mjs` 操作真正的網頁與遊戲事件；只對本審核分支及指定測試檔案觸發，未觸及正式站。

- Run [42149833075](https://github.com/zaza147a/spirit-pact-era/actions/runs/42149833075)：**success**。Lv.1 御靈使創角，第 1、8 格存檔及重新載入。
- Run [42151291559](https://github.com/zaza147a/spirit-pact-era/actions/runs/42151291559)：**success**。追加兩個三轉路線的最佳化存檔匯入、進入遊戲、背包／夥伴頁、倉庫。
- Run [42151729009](https://github.com/zaza147a/spirit-pact-era/actions/runs/42151729009)：**success**。額外以符合條件的測試存檔實際點擊二轉與兩條三轉按鈕；輸出 `secondTransfer:true`、`thirdTransfer:true`，並保留先前所有驗收。
- Run [42152216298](https://github.com/zaza147a/spirit-pact-era/actions/runs/42152216298)：**success**。在君王及萬靈合法存檔背包加入可比較的杖劍裝備，分別實際點擊「全部屬性」／「本職業重點」，驗證雙向切換、面板顯示及隱藏、選中按鈕狀態，輸出 `gearCompareModes:true`；其餘原驗收亦全數通過。

測試的二轉、三轉起始存檔具備正確轉職前置條件，測試的是 UI 控制流程、事件及實際轉職結果，**非從 Lv.1 全程手動練等與任務**。裝備比較已驗證兩個三轉職業的選項切換，但未逐一對所有職業、所有裝備排列驗證。

## MAIN 合併前仍待人工確認

1. GitHub Actions Chromium 已驗證創角、進入遊戲、二轉、三轉、存檔、倉庫開啟及兩個三轉職業的裝備比較模式切換。**正式遊戲顯示／版面的人工視覺檢查仍待完成**，不可逕稱全畫面驗收通過。
2. 本地舊工作區有大量尚未提交的歷史 DPS 原始報告、測試 JSON 與快取；其中部分已由遠端獨立保存。這些不是啟動遊戲所需檔案，**未批量搬入合併候選版，也未刪除原檔**；個別歷史報告不可誤作目前 DPS 排名。
3. 正式合併前再次 `git fetch` 並確認 MAIN 未前進，若有新提交應先整合，禁止用整個分支檔案直接覆蓋 MAIN。

## 範圍

只保留本地審核分支 `review/spirit-main-premerge-20261106`。未合併 MAIN、未部署 GitHub Pages。
