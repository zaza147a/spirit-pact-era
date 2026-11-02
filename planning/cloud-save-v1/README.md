# 靈契紀元｜雲端存檔 V1：獨立規劃

**日期：2026-11-02　狀態：僅規劃，尚未實作。**

## 範圍
- **500 個帳號上限**、每帳號 **8 個角色槽**，單人文字／網頁 RPG。
- 玩家登入、跨裝置、**所有角色、裝備、材料、背包、寵物、卡片、金幣、共用倉庫和進度都保存在雲端**。
- **24 小時離線戰鬥**仍保留；依伺服器時間與可信狀態進行結算。
- 核心公式、掉落、獎勵、強化、融合由伺服器權威判定；不得信任用戶端提交的完整存檔。
- GitHub 源碼日後改為 Private，公開網站仍可遊玩。
- V1 **不做**交易、排行榜、多人同步、聊天、公會或 PvP。
- 優先嘗試免費額度，但免費不是保證；須用實際存檔及負載測試驗證。

## 現有專案參考
- `dist/index.html`：正式遊戲入口。
- `dist/character-slots.js`：目前 `CHARACTER_SLOT_COUNT=8`；本機版角色存檔 `version:2`。
- `dist/game.js`：現有 UI 與戰鬥流程。
- `dist/pet-evolution.js`、`dist/pet-fusion.js`、`dist/pet-true-form.js`：寵物、融合與人形。
- `.github/workflows/github-pages.yml`：`main` 會進行測試及正式版部署。

## 不得影響正式版
本文件只寫在分支 `planning/cloud-save-v1` 的 `planning/cloud-save-v1/`；不修改 `main`、`dist/`、正式網頁、現有本機存檔或 GitHub 公開設定。

## 文件目錄
- [01｜架構與安全信任邊界](01-architecture-security.md)
- [02｜雲端資料模型與容量規劃](02-data-storage-capacity.md)
- [03｜24 小時離線與一致性](03-offline-save-protocol.md)
- [04｜實作階段、測試與決策](04-roadmap-validation.md)

## 完成標準
**文件完成 ≠ 系統完成。** 後續任何程式任務都必須先通過自動測試、真實瀏覽器操作、伺服器驗證、備份／還原、500 人負載及回歸測試，才可標記完成或發布。
