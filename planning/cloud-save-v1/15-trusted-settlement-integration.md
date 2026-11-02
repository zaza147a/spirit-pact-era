# 15｜伺服器自行計算獎勵 × SQLite 原子結算整合測試

日期：2026-11-02；範圍：本機隔離 Python/SQLite 合成測試，**未修改主版、未建立雲端測試站**。

## 本輪相較 V2 的實質進步
V2 原型的 `advance()` 可以接收呼叫端提供的 `increment_reward`，若未隔離將產生任意加金幣漏洞。此輪新的 `advance(connection, owner, session, batch_size, idempotency_key)` **不接受獎勵值參數**。金幣獎勵由伺服器模組根據資料庫中保存的私有 seed、步數和合成怪物掉落規則自行計算，並與 checkpoint 的 `cursor/state/reward/status` 在單一 SQLite 交易中寫入。

**合成戰鬥規則：** 每一模擬步由 `SHA256(seed + ':' + step)` 的部分數字判定簡化掉落及小額金幣。這不是《靈契紀元》的真實技能、掉落或共鳴引擎，僅驗證「可信結算結果不可由 API 呼叫者指定」的設計。

## 15 項本機實測：15/15 PASS
執行：`python trusted_settlement_test.py -v`，Python sqlite3，耗時約 0.355 秒。測試內容：
1. 同一固定 seed，連續 101 步與分 7 步計算的獎勵、擊殺一致。
2. 19 步後關閉資料庫連線再恢復，完成 101 步。
3. 同一 advance key 重送不重算。
4. 同 key 但不同批次參數拒絕。
5. 故意在 commit 前拋例外，checkpoint、reward 及帳本完整回滾。
6. 非擁有人帳號不可 advance。
7. 不合法 batch size 拒絕；單次上限 5000（目前僅原型上限）。
8. 所有批次完成才可 claim；重送同 key 不重複加金幣，新 key 重領被拒絕。
9. pending 時不可領取。
10. 非擁有人不得領取。
11. claim 中途 crash 時金幣及 session 一同回滾，之後可重試。
12. 兩個 SQLite 連線同時 claim，僅一個成功。
13. 超過 24h / 864000 100ms 步的 session 被資料庫拒絕。
14. 同一角色同時建立第二個未結算 session，被唯一部分索引拒絕。
15. `PRAGMA integrity_check = ok`。

## 測試時發現並修正的原型錯誤
- 首次建立測試時 `sessions` 插入欄位數與 placeholder 不一致，導致 15 個測試均無法開始；已修正。
- 加入「同角色僅一個 active session」的資料庫唯一索引後，原本兩組等價測試使用同一角色，導致約束拒絕；已修改成同帳號的兩個獨立合成角色，最終 15 項全部通過。
- 此紀錄保留失敗→修復的歷程，以免將首次執行誤寫為通過。

## 仍然未完成的必要條件
- **沒有**使用原始 `dist/game.js` 或 `combatTick`，不代表正式 60 組共鳴、裝備、寵物、首領或完整 24h 戰鬥等價已完成。
- 合成 checkpoint 目前僅存 kills；正式需怪物 HP、技能 CD、狀態、寵物等完整狀態。
- 原型用 `BEGIN IMMEDIATE`，不代表 Cloudflare D1 實際交易 API 可直接照搬。
- 雲端版需要把伺服器種子與掉落規則當作秘密，並建立認證、限速、角色版本與跨設備衝突處理。
- **不能**把這個原型直接部署為正式服務：它只驗證交易模式。
- 遵守第 12 文件：就算全部驗證通過，也只能架設新的獨立測試伺服器，原本單機版永久不動。

## 交付
本輪真實可重跑的 Python 原型檔案：`cloud-save-v3/trusted_settlement_test.py`（本次對話附件連結），完全使用合成資料。未將玩家 JSON 或機密檔案寫入公開倉庫。

下一步：完整盤點現有 `game.js` 的可變戰鬥狀態，抽取可序列化核心；在一個**新的 Private Repo 與新的測試服務**中測真實 24h 等價與 D1 用量。
