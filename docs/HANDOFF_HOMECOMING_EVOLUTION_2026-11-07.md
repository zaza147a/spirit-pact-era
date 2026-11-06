# 返鄉契約・夥伴終階進化交接

- 分支：`feature/homecoming-final-evolution`，基於 `main` 的 `af57c50`（V7.0.1）。
- 12 條有向融合路線各新增一張 **1145×1374、透明背景 WebP**：`dist/assets/true-forms/homecoming/<main>-<sub>.webp`。
- 每張以現有 `dist/assets/true-forms/SSS/` 對應角色為參考個別生成；SSS 原圖完全保留。
- 完成返鄉契約領獎時，對應夥伴永久取得 `homecomingEvolved=true`，記錄完成對象 `evolvedPetId`，由 `trueFormArt` 切換新圖；舊存檔已完成路線於正規化時補發造型（僅同路線第一隻符合條件的夥伴）。
- 既有 S／SS／SSS 夥伴裝備進化，在存檔成功後彈出前後圖的進化提示框；領取返鄉獎勵時同樣彈窗。
- 不改任何戰鬥數值、技能倍率、地圖和掉落表。

## 回歸

`node --test tests/homecoming-final-evolution.test.mjs tests/homecoming-state.test.mjs tests/pet-humanoid-evolution.test.mjs tests/homecoming-game.test.mjs`：51／51 通過。全量測試需另行確認完成狀態。

## 後續確認

1. 瀏覽器中實際完成 S、SS、SSS 三次進化與返鄉領獎，檢查彈窗與圖片裁切。
2. 確認所有 12 張新圖在首頁、夥伴欄、選擇卡片顯示一致。
3. 通過發佈前檢查後才合併 `main`、更新正式版。
