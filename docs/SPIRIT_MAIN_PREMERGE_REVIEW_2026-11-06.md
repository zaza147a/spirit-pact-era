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

## MAIN 合併前仍待人工確認

1. 當前執行環境已裝 Playwright 套件，但在 `/opt`、`/usr/local`、`/root/.cache` 以及系統可執行路徑內未找到可用 Chromium/Chrome/Firefox；因此**沒有宣稱完成真實瀏覽器點擊 UI 驗收**。待具備 Chromium 的環境驗證創角、角色進入、二轉、三轉、倉庫比較切換。
   - 已用真實 `game.js` 創角控制器函式、模擬 DOM 和八格存檔介面額外驗證：御靈使按鈕解除鎖定、成功寫入第八格、關閉視窗與選角狀態恢復。
2. 本地舊工作區有大量尚未提交的歷史 DPS 原始報告、測試 JSON 與快取；其中部分已由遠端獨立保存。這些不是啟動遊戲所需檔案，**未批量搬入合併候選版，也未刪除原檔**；個別歷史報告不可誤作目前 DPS 排名。
3. 正式合併前再次 `git fetch` 並確認 MAIN 未前進，若有新提交應先整合，禁止用整個分支檔案直接覆蓋 MAIN。

## 範圍

只保留本地審核分支 `review/spirit-main-premerge-20261106`。未合併 MAIN、未部署 GitHub Pages。
