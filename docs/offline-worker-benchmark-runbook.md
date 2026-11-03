# 御靈使／離線 Worker 端到端 Benchmark

此工具僅用於 GitHub 測試分支，不會更新正式站、雲端存檔或寫回輸入 JSON。

## 執行方式

在 Node.js 22+、專案根目錄：

```bash
node tests/offline-optimizer-regression.mjs
node tests/dual-pet-combat-regression.mjs
node tests/offline-worker-benchmark.mjs path/to/legal-save.json
```

測速器直接透過 `tests/offline-worker-node-entry.mjs` 載入正式遊戲使用的 `dist/offline-worker.js` 和 `dist/game.js`，依序跑 1、6、12、24 小時。會以同一份初始玩家狀態重新建立各時間長度的模擬，不會把上一段的結算狀態拿來當下一段起點。

- 需要**合法玩家存檔**，可為直接 player JSON 或 `{"player":...}` 包裝。
- 存檔必須位於可戰鬥地圖、`offline.enabled=true` 且角色存活或可自動復活。
- 不要將真實玩家存檔直接提交到公開 GitHub。先在受控環境執行，或使用去識別化、合法的測試檔。
- 可設定 `SPIRIT_BENCH_SEED`（預設 12648430）與 `SPIRIT_BENCH_TIMEOUT_MS`（單段預設 600000）。
- 每段輸出 JSON：實際牆鐘時間、Worker heap、進程 RSS、第一次進度回報時間、回報次數、模擬時數、停止原因、擊殺、經驗、金幣、消耗品、裝備與卡片數量、完整玩家狀態 SHA-256。

## 判斷方法

1. **合法性**：先用遊戲匯入驗證存檔，確認裝備／卡片／能力點／減傷上限，並在遊戲中手動確定可正常戰鬥。工具本身不保證輸入合法。
2. **完成度**：若 `simulatedMs` 少於要求時長，應檢查停止原因（死亡、背包滿、連續試煉中止等），不得把提前停止當作完整 24 小時速度。
3. **一致性**：同種子、同存檔、同時間窗口重跑，檢查 `stateSha256`；如不同，先調查非 `Math.random` 來源的隨機 ID 或時鐘，再以逐欄位差異核對。完整玩家狀態雜湊相同才代表嚴格逐欄位一致。
4. **最佳化前後**：兩個不同 commit／worktree 各用同一份 fixture、seed 和 Node 版本執行，對照輸出。必須額外比對 Base／Job／雙寵 XP、金幣、物品與詞條、卡片、擊殺、HP/SP、消耗品、任務進度。
5. **場景**：高頻擊殺、雙寵、治療與自動補貨、分解／販售、背包接近 1900 格、死亡復活、連續試煉分別建立合法 fixture；不要只用單一地圖推斷整體效能。

## 目前驗證界線

本檔提供測量器與執行規範；建立檔案不等於已成功完成 1／6／12／24 小時 benchmark。需要在可執行 Node 且持有合法測試存檔的環境實際跑出數值後，才能給出端到端改善百分比。
