# 13｜獨立雲端資料庫原型：17 項實測與正式版隔離驗證

**日期：2026-11-02。狀態：本機 SQLite 原型測試完成；沒有建置真實雲端伺服器。**

## 不得影響單機版
- 只在對話環境中的隔離測試目錄執行 SQLite，未修改舊 `main`、`dist/`、GitHub Pages 網址及任何玩家本機存檔。
- 此檔及 `prototypes/cloud-schema-v1.sql` 僅位於規劃分支 `planning/cloud-save-v1`；不是正式遊戲部署檔。
- 完成後仍然只准另開新的測試服。後續建議使用全新 **Private Repository**，不能將舊 `main` 改成雲端版。

## 本輪實測內容與環境
- 實際建立 Python 3.13.5、sqlite3 本機測試資料庫，每個測試使用獨立 temporary directory 與合成帳號、角色、裝備。
- 使用 `PRAGMA foreign_keys=ON`，建置 8 格角色、材料 stack、寵物、個別裝備、離線 session 和冪等操作帳本。
- 執行 `python3 -m unittest -v test_schema.py`，**Ran 17 tests / OK**，約 0.370 秒。

| 測試群組 | 已通過項目 |
|---|---|
| 角色與物品完整性 | 8 格範圍、同帳號重複格拒絕、負數材料拒絕、重複裝備 UID 拒絕、SQLite integrity_check |
| 帳號／寵物權限 | 跨帳號裝備轉移拒絕、跨帳號角色關聯 FK 拒絕、寵物可持有裝備 |
| 倉庫與交易 | 背包→倉庫→另角色背包、交易中斷回滾、不重複建立裝備 |
| 雙裝置和冪等 | 舊版本存檔拒絕、相同請求不重複加金幣、同 key 不同內容拒絕 |
| 離線 24 小時約束 | 超過 24 小時的 session 拒絕、同角色同時兩個未完成 session 拒絕 |

## 重要測試限制
- 本測試的 `save_character` 只是測 DB 原子性，**不能用於正式服從前端直接加金幣**。正式版必須由受信任戰鬥引擎計算合法收益。
- 沒有完整 24 小時戰鬥、職業共鳴驗證，也沒有 Firebase Token、Cloudflare Workers/D1 部署。
- 本機 sqlite `BEGIN IMMEDIATE` 不能直接視為 Cloudflare D1 的交易 API；部署前必須重新以 D1 交易能力建立實作與回歸測試。
- `item_stacks.container_id` 在此只是資料模型示例；正式版需建立 container 所有權的 FK 或 trigger，並確認物品無法寫到其他帳號的角色容器。
- `equipment` 目前的 pet_id FK 檢查帳號一致，**仍需檢查 pet 所屬角色與 equipment.character_id 相同**，避免同帳號跨角色錯誤掛裝。
- 離線 session 的已結算游標和領獎結果需要額外實作原子更新與 500 人負載測試。

## 可重跑交付
- 完整本機 Python 測試原型：`cloud-save-isolated/prototypes/schema.sql`、`test_schema.py`。
- GitHub 另存 `prototypes/cloud-schema-v1.sql` 作為後續 staging schema 起點。
- 程式打包於本次對話的測試 ZIP；沒有上傳真實玩家 JSON 或機密金鑰。
- 下一步：將跨帳號 item_stacks FK、跨角色寵物裝備檢查補齊，整合真正的離線結算冪等 checkpoint，最後另建私人倉庫和全新測試伺服器。
