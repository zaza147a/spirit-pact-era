# 首頁角色排序交接（2026-11-09）

- 分支：`feature/character-select-order-2026-11-09`（從 `main` / `87f7295` 建立）。
- 變更：首頁八個角色卡新增向前／向後箭頭，排序保存於本機 `icarus-character-display-order-v1`。
- 重要：只更動選角畫面排列，實際存檔格編號及建立、導入、匯出、進入角色的索引不變，避免改動任何角色資料。
- 相關檔案：`dist/game.js`、`dist/character-order.js`、`tests/character-order.test.mjs`、`tests/character-order-ui.test.mjs`。
- GitHub 初次推送提交：`4be251dda85b9d09c516f27319a7c30c81ace762`。
- 驗證：`node --test tests/character-order*.test.mjs tests/character-slot-legacy-ledger.test.mjs tests/entry-portrait-clarity.test.mjs`，9／9 通過。新增 UI 模擬測試確認箭頭操作、畫面重繪與原始格號不變；尚未進行真正瀏覽器的視覺驗收。
- 待驗：空白存檔格及建立／導入／匯出的完整手動操作。
- GitHub Actions `character-order-browser.yml` 的首次 Chromium 真實瀏覽器驗收已成功：執行 `42503687492`、提交 `f8531d247bfe7bf3160712046473d60f26205c16`、45 秒完成。覆蓋八張卡片、向前排序、刷新持續、選角與原始存檔識別；截圖及 JSON 報告在 `character-order-browser-evidence` 附件。空格的新建／導入／匯出完整手動操作尚不在此自動驗收內。
- 合併前檢查：`main` 仍為 `87f7295`，與本分支共祖一致；執行全套 `node --test --test-concurrency=2 tests/*.test.mjs` 時已通過大量測試（包含完整 24 小時離線測試），但在後段長時間無輸出，因此以 Ctrl-C 中止，**不可標記全套測試通過**。特定排序與存檔 9／9、Chromium Actions 通過。暫不合併 main。
- 補充發布前驗證：依照 `.github/workflows/github-pages.yml` 的正式發布快速回歸集合，加上本次排序測試，`60／60` 通過；`node --check dist/game.js` 通過。這是正式發布流程所要求的快速回歸，與先前中止的額外全量重型測試分開記錄。
- **正式發布完成（2026-11-09）**：PR [#34](https://github.com/zaza147a/spirit-pact-era/pull/34) 已合併 `main`，merge SHA `e774939cb9b6f1ee329f7525ae634e7c752a2514`；GitHub Pages [#42504991732](https://github.com/zaza147a/spirit-pact-era/actions/runs/42504991732) 成功。實際開啟 `https://zaza147a.github.io/spirit-pact-era/` 確認 8 格皆有左右排序箭頭，第 2 格移至首位，重整後仍保留。此為事後交接紀錄更新於保留的測試分支；正式遊戲程式未再更動。
- 尚未合併 `main`、尚未更新正式版；本機排序不跨不同瀏覽器或裝置同步。
