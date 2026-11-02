# 09｜雲端存檔交易一致性：本機實測報告

日期：2026-11-02。環境：Python 3 標準庫 sqlite3、獨立 tempfile SQLite DB，**全部測試使用合成帳號與裝備，未連接正式玩家、Cloudflare 或正式遊戲**。

## 結果
在隔離環境執行 `python consistency_test.py`，輸出 **Ran 13 tests / OK**，耗時約 0.367 秒。

| 測試 | 驗證內容 | 結果 |
|---|---|---|
| test_save_stale_two_devices | 版本 0 的第二裝置不能覆寫版本 1 | PASS |
| test_same_request_retry | 相同 idempotency key 重送只回傳上次結果 | PASS |
| test_negative_gold_rejected | 不允許金幣變負數 | PASS |
| test_injected_failure_save_rollback | 故意中斷存檔，金幣及帳本一起回滾 | PASS |
| test_transfer_warehouse_and_back | 裝備背包→倉庫→背包，始終只有一件 | PASS |
| test_transfer_retry_and_cross_account_reject | 重送不複製、跨帳號不得移動裝備 | PASS |
| test_transfer_failure_rollback | 倉庫轉移中斷後維持原位置 | PASS |
| test_claim_exact_once | 重送同一離線 session 不會重複領取 | PASS |
| test_claim_failed_commit_rollback | 離線獎勵在寫入前失敗時原子回滾，之後可重試 | PASS |
| test_claim_wrong_character_rejected | 他角色不得領取此角色的離線獎勵 | PASS |
| test_two_connection_race_claim | **兩個 SQLite 真實連線 + Barrier 同時領**，恰有一個成功 | PASS |
| test_cross_character_duplicate_slot | 同帳號相同 slot 禁止重複 | PASS |
| test_no_duplicate_equipment_uid | UID 主鍵拒絕同裝備重複 | PASS |

## 測試原型所使用的機制
- 每個可修改資產的操作都以 `BEGIN IMMEDIATE` 開始，成功 `COMMIT`，例外 `ROLLBACK`。
- `characters.version` 做樂觀鎖：只有目前版本符合才可以寫入。
- `operations.id` 是重送鍵；在同一資料庫交易裡和資產變更一起寫入。重送取得既有結果，而不是再次扣／加。
- `equipment.uid` 是唯一裝備主鍵，`location` 僅能 `bag/equipped/warehouse`，且倉庫位置的 `character_id` 必須為 NULL。
- `offline_sessions.status` 區分 `pending/claimed`，領取時在同一交易更新角色與 session 狀態。
- 本機連線均設 `PRAGMA foreign_keys=ON` 與 `busy_timeout`。

## 本輪不代表完成的部分
1. 這是簡化交易原型，不是正式 API；沒有串接 Firebase Token、Cloudflare D1、Workers 或真實瀏覽器。
2. 離線 `earned_gold` 是固定合成測試值，**並未驗證 24 小時戰鬥是否正確**；必須由伺服器可信戰鬥引擎產生。
3. 同帳號八格共用倉庫、寵物、卡片、能力與多種材料應於正式 schema 中增加更完整唯一約束。
4. 本機 SQLite `BEGIN IMMEDIATE` 不保證可直接照搬到 Cloudflare D1；必須使用 D1 支援的交易方式或條件式原子操作再做實測。
5. 請求鍵若被惡意套到不同參數，正式實作需要額外保存請求內容雜湊，拒絕內容不同但鍵相同的請求。
6. 測試未包括 500 人並行的實際雲端負載；不能宣稱整體已完成。

## 後續驗收順序
1. 把測試原型擴充成正式 schema 的所有權／帳本／UID 一致性測試（含每帳號八格、寵物裝備與卡片）。
2. 建立隔離 Workers + D1 staging，逐項重跑 13 個測試，檢查交易原子性差異。
3. 藉由實際遊戲規則建立可重播的 24 小時離線事件／分段結算與精確收益測試。
4. 完成 500 帳號負載、資料庫容量與跨裝置瀏覽器驗收，再決定部署。

## 來源與保存
測試原型檔案：此輪對話環境產出的 `cloud-save-benchmark/consistency_test.py`，可下載後用 Python 3 直接執行。本報告僅含結果與方法，**未上傳玩家真實存檔**。

狀態：**本機存檔交易一致性原型 13/13 PASS；線上雲端與實際遊戲尚未開始驗證。**
