# 11｜可中斷離線結算：獨立 JavaScript 原型實測

日期：2026-11-02。環境：Node.js v22.16.0、本機合成模型；**不是正式《靈契紀元》戰鬥核心，也未部署 Cloudflare**。

## 本輪已完成
設計可序列化的 session checkpoint，保存 `seed / now / end / ticks / heroHp / potions / enemyHp / attackAt / poisonUntil / poisonNext / reviveAt / kills / gold / loot / ended`；使用固定種子偽隨機序列及 100ms 時間步。每次 `advance(checkpoint, maxSteps)` 回傳完整的新 checkpoint，不修改原物件。藉由 JSON 序列化及恢復模擬斷線後續算。

### 本機測試：10 / 10 PASS
1. 各分段大小 1、7、31、100、777、10,000 步，最終結算與連續計算一致。
2. 模擬執行 2,051 步後序列化 JSON，恢復結果與不停機計算一致。
3. 多次暫停後 PRNG 的掉落與金幣結果一致。
4. 存活一小時的 36,000 步計數正確。
5. 48h 請求封頂 24h。
6. 0 秒不產生事件。
7. 已停止 session 不再前進。
8. 資源不足時死亡停掛且結果可恢復。
9. 不同種子產生不同獎勵且不影響結算時間上限。
10. 拒絕非法 checkpoint／步數預算。

### 測試的意外發現
原測試將 1h 場景設定成 10 瓶藥水，導致約 7,921 步後資源耗盡停掛；因此「一小時固定 36,000 步」測試一開始失敗。修改為足夠補給量後，再執行 10/10 PASS。**這不是要在正式遊戲加入無限補給**，而是將時間邊界測試與死亡停止測試分開，以免測試假設失真。

## 對原遊戲的限制
- 原 `dist/game.js` 的 `simulateOffline()` 具有更多內部狀態（技能、buff、debuff、共鳴、怪物 AI、掉落、寵物與連續試煉）。本原型**只是證明分段 + RNG + checkpoint 可決定性恢復**。
- 目前測試沒有接上正式遊戲的 `combatTick()`、`resetSession()`、`spawn()` 或 `offline-worker.js`，不能宣稱 60 組共鳴或 24h 正式收益等價。
- 目前沒有實作存檔資料庫的原子提交。跨裝置與重複請求已在上一輪 SQLite 原型分別驗證，兩者**尚未整合**。
- 未量測 Cloudflare 免費 Worker 10ms CPU 限制下的實際段長；要在 staging 測試。

## 本機交付檔
- `/mnt/data/cloud-save-benchmark/checkpoint-engine.mjs`（獨立合成 checkpoint 引擎）
- `/mnt/data/cloud-save-benchmark/checkpoint-engine.test.mjs`（10 項可重跑 Node 測試）
- 執行：`node --test checkpoint-engine.test.mjs`

以上為對話工作環境的可下載檔案，**沒有包含任何使用者的真實存檔或個人資料**。

## 後續優先事項
1. 盤點正式戰鬥引擎中每個可變狀態，產出完整 checkpoint 欄位／序列化設計。
2. 針對正式引擎建立連續運行 vs 多段運行的固定種子黃金測試。
3. 將 checkpoint 與 SQLite 原子事件帳本結合，測斷線後重試與防重複獎勵。
4. 建立預覽 Cloudflare Workers + D1，在真實 CPU 與讀寫配額下實測 24h、500 玩家集中結算。
