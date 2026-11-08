# 首頁角色排序交接（2026-11-09）

- 分支：`feature/character-select-order-2026-11-09`（從 `main` / `87f7295` 建立）。
- 變更：首頁八個角色卡新增向前／向後箭頭，排序保存於本機 `icarus-character-display-order-v1`。
- 重要：只更動選角畫面排列，實際存檔格編號及建立、導入、匯出、進入角色的索引不變，避免改動任何角色資料。
- 相關檔案：`dist/game.js`、`dist/character-order.js`、`tests/character-order.test.mjs`。
- 驗證：`node --test tests/character-order.test.mjs`；另應進行瀏覽器八角色卡、跨重新整理、空格、建立／導入／匯出回歸。
- 尚未合併 `main`、尚未更新正式版；本機排序不跨不同瀏覽器或裝置同步。
