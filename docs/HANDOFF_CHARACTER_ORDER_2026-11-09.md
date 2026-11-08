# 首頁角色排序交接（2026-11-09）

- 分支：`feature/character-select-order-2026-11-09`（從 `main` / `87f7295` 建立）。
- 變更：首頁八個角色卡新增向前／向後箭頭，排序保存於本機 `icarus-character-display-order-v1`。
- 重要：只更動選角畫面排列，實際存檔格編號及建立、導入、匯出、進入角色的索引不變，避免改動任何角色資料。
- 相關檔案：`dist/game.js`、`dist/character-order.js`、`tests/character-order.test.mjs`、`tests/character-order-ui.test.mjs`。
- GitHub 初次推送提交：`4be251dda85b9d09c516f27319a7c30c81ace762`。
- 驗證：`node --test tests/character-order*.test.mjs tests/character-slot-legacy-ledger.test.mjs tests/entry-portrait-clarity.test.mjs`，9／9 通過。新增 UI 模擬測試確認箭頭操作、畫面重繪與原始格號不變；尚未進行真正瀏覽器的視覺驗收。
- 待驗：瀏覽器八角色卡、跨重新整理、空格、建立／導入／匯出操作。
- 已新增 GitHub Actions `character-order-browser.yml`，在測試分支推送時執行 Chromium 真實瀏覽器驗收；腳本 `scripts/browser/character-order-acceptance.mjs`，產生 `browser-qa/character-order/` 截圖與報告。待確認 Actions 結果後才能標記瀏覽器驗收通過。
- 尚未合併 `main`、尚未更新正式版；本機排序不跨不同瀏覽器或裝置同步。
