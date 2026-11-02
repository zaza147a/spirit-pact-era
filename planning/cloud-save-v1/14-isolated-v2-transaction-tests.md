# 14｜完全隔離 V2：存檔權限與 24 小時結算帳本整合驗證

日期：2026-11-02。狀態：**本機 SQLite 模型已實測，獨立雲端測試服尚未建立。**

## 本輪真實執行
使用 Python 3、SQLite、合成帳號及角色，在本機臨時資料庫執行 `python -m unittest -v test_cloud.py`。**Ran 30 tests / OK (0.896 seconds)**。原遊戲 `main`、`dist`、GitHub Pages、原始存檔完全沒有修改。

- 資料庫新增 `containers`，容器 ID 與 account_id 使用複合 FK；物品堆疊必須參照同帳號已存在的背包／倉庫容器。
- `equipment` 的背包／倉庫位置由 trigger 檢查，裝備角色必須符合背包的 character_id。
- 寵物的複合唯一鍵 `(pet_id, account_id, character_id)` 與裝備的複合 FK 保證寵物裝備所屬角色一致。
- 相同帳號只允許一個共用倉庫、每個角色只有一個背包；同帳號角色可將裝備經倉庫轉移，但不複製 UID。
- 離線 session 的 `(cursor, checkpoint, status, gold_reward)` 與冪等操作帳本採同一 SQLite transaction 更新。
- `ready` 的 session 才能領取；領取成功後 `claimed`，獎勵與角色金幣同一 transaction；新 key 重領被拒絕，同 key 重送只取回前次結果。
- 雙連線同時 claim 的競態測試只有一次成功，角色金幣僅增加一次。

## 30 項測試範圍
涵蓋：
1. 八格限制、重複角色槽、負數堆疊數量。
2. item_stack 跨帳號及不存在的 container 拒絕。
3. 每帳號單一 warehouse、bag 的角色歸屬驗證。
4. 重複裝備 UID、裝備容器跨帳號、角色錯誤歸屬拒絕。
5. 寵物裝備跨角色錯配拒絕，合法配裝通過。
6. 倉庫轉入／轉出、跨帳號拒絕、重送 key 與內容碰撞。
7. 超過 24h 的 session 拒絕，同角色兩個尚未結算 session 拒絕。
8. 游標分段推進、斷線回滾、舊游標拒絕、同批重送不重複獎勵、同 key 不同內容拒絕。
9. 尚未完成不能領取、跨帳號不能領、同 key 重送不重複領、新 key 不能再次領、領取失敗完整回滾。
10. 兩個並發 SQLite 連線搶領、資料庫 integrity_check。

## 不可誤用的安全限制
**這只是資料庫機制原型，離線增量金幣目前由原型測試呼叫傳入。絕對不能直接當成公開 API**，否則惡意玩家可以要求服務端任意加金幣。正式實作必須先將可信的戰鬥核心與確定性 RNG 移至 Workers，根據權威 checkpoint 產出獎勵，API 僅接受有限操作意圖。

此外：
- 目前採用本機 SQLite `BEGIN IMMEDIATE`，尚未驗證 Cloudflare D1 的原子性語義。
- 尚未接 Firebase Auth、Workers、正式戰鬥規則與 500 人雲端壓測。
- 尚未做正式角色與材料的全體 schema migration。
- 裝備、卡片、寵物與倉庫完整業務規則仍需和正式 `game.js` 對照。
- 任何測試成果都不能自動合併 `main`，全部通過也只允許新測試伺服器。

## 交付
此輪可執行測試程式與 V2 SQL schema 已保存在本次對話的獨立測試資料夾 `/mnt/data/cloud-save-isolated-v2/`；提交到規劃分支的是**此測試結果與設計紀錄**，避免混淆本機測試與已部署的正式功能。

## 下一階段
整合正式遊戲的 `combatTick`、職業共鳴及 24 小時離線戰鬥核心，建立可信伺服器運算，再將此 V2 帳本機制移至新 Private Repository 及新雲端 staging。需要獨立雲端服務連線及管理員授權才可建立，絕不可借用舊版部署。
