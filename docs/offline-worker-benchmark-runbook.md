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
- `SPIRIT_BENCH_HOURS=1,6` 可只跑指定時長；預設為 `1,6,12,24`。
- `SPIRIT_BENCH_REPEAT=2` 對每個時長重新建立相同存檔與亂數種子，並比對完整 SHA-256 及僅正規化新掉落裝備 UID 的語義 SHA-256。完整雜湊不同會輸出差異路徑；語義狀態不同則測試失敗。正規化保留 UID 引用關係並檢查裝備 UID 重複。預設執行一次，可設為 1–3 次。
- 每段輸出 JSON：實際牆鐘時間、Worker heap、進程 RSS、第一次進度回報時間、回報次數、模擬時數、停止原因、擊殺、經驗、金幣、消耗品、裝備與卡片數量、完整玩家狀態 SHA-256。

## 判斷方法

1. **合法性**：先用遊戲匯入驗證存檔，確認裝備／卡片／能力點／減傷上限，並在遊戲中手動確定可正常戰鬥。工具本身不保證輸入合法。
2. **完成度**：若 `simulatedMs` 少於要求時長，應檢查停止原因（死亡、背包滿、連續試煉中止等），不得把提前停止當作完整 24 小時速度。
3. **一致性**：同種子、同存檔、同時間窗口重跑，檢查 `stateSha256`；如不同，先調查非 `Math.random` 來源的隨機 ID 或時鐘，再以逐欄位差異核對。完整狀態雜湊不同可能僅是掉落裝備 UID 隨機碼；語義雜湊必須一致，並核對完整差異只落在 UID 欄位。正規化並不證明兩個原始存檔位元組完全相同。
4. **最佳化前後**：兩個不同 commit／worktree 各用同一份 fixture、seed 和 Node 版本執行，對照輸出。必須額外比對 Base／Job／雙寵 XP、金幣、物品與詞條、卡片、擊殺、HP/SP、消耗品、任務進度。
5. **場景**：高頻擊殺、雙寵、治療與自動補貨、分解／販售、背包接近 1900 格、死亡復活、連續試煉分別建立合法 fixture；不要只用單一地圖推斷整體效能。

## 目前驗證界線

本檔提供測量器與執行規範；建立檔案不等於已成功完成 1／6／12／24 小時 benchmark。需要在可執行 Node 且持有合法測試存檔的環境實際跑出數值後，才能給出端到端改善百分比。

## 2026-11-03 GitHub Actions 實測（Node 22）

- [#41605654288](https://github.com/zaza147a/spirit-pact-era/actions/runs/41605654288)：回歸 + 起始場景 1/6/12/24h ×2 PASS；原始裝備 UID 不同，正規化語義狀態一致。6/12/24h 在 9,371,400ms（約 2h36m）因背包接近上限停止，**不可宣稱完整 24h**。
- [#41606084922](https://github.com/zaza147a/spirit-pact-era/actions/runs/41606084922)：加上自動分解，全部 1/6/12/24h 真正完成。24h 兩次牆鐘耗時 3,638/3,742ms、94,941 擊殺、Base XP +457,298、Job XP +387,813、金幣 +189,709、保留裝備 17 件；語義 hash 一致。
- [#41606283391](https://github.com/zaza147a/spirit-pact-era/actions/runs/41606283391)：額外啟用兩隻 Lv1 基礎夥伴（攻擊型與魔法型），全部 1/6/12/24h ×2 完成。24h 牆鐘耗時 7,856/7,684ms、98,379 擊殺、夥伴 XP 合計 +405,720、金幣 +196,824、保留裝備 15 件、Worker heap 27–30MB。兩隻夥伴設定保留，語義狀態一致。這不是 200/210 高負載融合寵測試。

CI 固定 seed 12648430；起始測試 fixture 在 `tests/fixtures/starter-player.mjs`。執行 `node tests/offline-worker-benchmark.mjs --starter-salvage` 或 `--starter-dual-salvage`；兩個模式均要求模擬完整時長，提前終止直接失敗。首次原始存檔 UID 差異來自隨機生成身份，並未修改正式遊戲 UID 邏輯。

尚未完成：合法 200/210 雙融合寵、完整裝備卡片、補給／自售、死亡復活、試煉五連戰之實戰端到端一致性與效能驗收；目前數據不得外推。

### 離線傷害歸屬（2026-11-03 新增）

`summary.damage` 以怪物實際扣除 HP 為基準：`player`（人物及歸屬人物的職業 Buff）、`pet1`、`pet2`、`resonance`（雙靈共鳴直接扣血）、`petSupport`（寵物對人物攻擊的支援份額）、`other`（待分類來源）與 `total`。各項分量必須非負，且總和等於 `total`；Buff 不可重複視作額外 DPS。此統計是離線戰鬥總傷害，非單一首領的 DPS。

[#41607358365](https://github.com/zaza147a/spirit-pact-era/actions/runs/41607358365)：Node 回歸與三種離線 benchmark 均 PASS。固定測試雙寵 IV 後，24h ×2 實際運算 5,877/5,875ms，模擬 86,400,000ms，98,618 擊殺，Base XP +458,215、Job XP +387,637、夥伴 XP +405,720、金幣 +197,441；傷害 player 627,747、pet1 12,962,260、pet2 2,120,903、petSupport 286,546、resonance 0、other 0，總計 15,997,456。此為一轉非融合雙寵，三轉共鳴尚未觸發；不是 200/210 配裝平衡結論。
