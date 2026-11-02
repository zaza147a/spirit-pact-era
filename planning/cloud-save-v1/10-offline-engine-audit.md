# 10｜正式版 24 小時離線引擎：程式審計與初步回歸

日期：2026-11-02。範圍：唯讀檢查 main 的 `dist/game.js`、`dist/offline-rules.js`、既有 Worker 呼叫方式；**未更動主版、尚未將真實引擎搬上伺服器**。

## 目前真實運作模式
1. `game.js` 由 `offlineWindow(player, Date.now())` 決定離線結算資格及時數。
2. `offline-rules.js` 中 `OFFLINE_CAP_MS=24*60*60*1000`；`OFFLINE_STEP_MS=100` 毫秒。
3. 正常離線滿 10 秒後具資格；連續試煉 `trialRun.continuous` 模式可在超過 0 毫秒後進入判定。需 `offline.enabled===true`、在可戰鬥地圖、角色生存或允許自動復活。
4. `simulateOffline(state,now,progress)` 以 `offlineClock` 模擬時間；每一步執行 `combatTick(offlineClock)`。會處理死亡／自動復活等待、背包達 1900 筆停止、連續試煉中止、補給購買與自動分解。
5. `settleOffline()` 使用瀏覽器 `new Worker('offline-worker.js?...')`，等待返回新 `player`，最後寫回瀏覽器本機存檔。防重複依靠 localStorage 原值比對；**不是伺服器權威**。
6. 離線收益明細可能因與即時模擬不同而稍有差異，現有 UI 文案已明確提示；雲端版若追求等價需額外定義和驗證。

## 24h 運算上界
`86400000 / 100 = 864000` 個模擬步，1h 36,000、6h 216,000、12h 432,000。這是最大基準步數，不代表每步均有擊殺，也不代表 CPU 時間。實際會提前停止的情況包括死亡、背包接近上限、試煉中止等。

## 已執行的測試
本機以正式版 `offline-rules.js` 的**相同程式內容複本**執行 Node 22 `node --test`，12 個測試 12/12 PASS。涵蓋 10 秒門檻、連續試煉差異、24/48h 封頂、未來時間無效、未啟用、城鎮、死亡復活、864000 步及物品增量。

已新增 `prototypes/offline-rule-regression.test.mjs`，**直接 import 分支內的真實 `../../../dist/offline-rules.js`**；此 GitHub 版本尚須在實際 checkout 後另行執行以確認相容性，不能把它宣稱已在 GitHub Actions 通過。

## 核心結論／架構決策
- 不能把完整 864000 步單次同步執行於免費 Worker 就假設能過 CPU 限額。
- 雲端離線結算應建立 `session_id`、版本化規則、可信 start_at／end_at、確定性 RNG 種子、權威狀態、`cursor`、分段獎勵工作快照及 `claimed` 狀態。
- 每段只能由伺服器推進。物品生成、掉落、強化、裝備／寵物狀態都以伺服器返回為準；不能讓瀏覽器提交最終 JSON。
- 若採遊戲時間分段，**必須保存跨段時間狀態**：敵人 HP、技能 CD／buff／debuff／召喚／毒傷、補給計時器、怪物索引與 RNG 狀態等；每段不能重新呼叫 `resetSession()/spawn()`，否則結果會偏離連續 24h 計算。
- 每段採 atomic checkpoint + idempotency key；領獎另以原子轉移確認；中斷可從上次可信游標恢復，不能改亂數序列／複製物品。
- 免費 Workers CPU 實際上限、D1 事務能力、分段同步成本需部署 staging 與真實壓測後才能確認。

## 仍需實測的功能（尚未通過）
1. 實際 `game.js` 連同 `offline-worker.js` 的 1h／12h／24h 真實戰鬥成果與 CPU 耗時；不是只測 `offlineWindow`。
2. 100ms tick 分段（例如每 500/5000 steps）與完整連續模擬的**固定 RNG 等價性**（含掉落和寵物共鳴）。
3. 裝備 200 萬件極端負載下，離線大量掉落後的 DB 寫入性能。
4. Cloudflare Worker 真正執行的 CPU 使用量、免費額度符合性。
5. 500 人集中登入、跨裝置領獎及服務中斷後恢復實測。
6. 正式遊戲所有職業、寵物、試煉與離線自動復活回歸。
