# 18｜使用正式版 combatTick 主循環做可重啟分段驗證

2026-11-02。**已在隔離 Node.js 執行原版函式，但其依賴仍為測試替身。正式單機版 `main` 不修改。**

## 原始碼來源
從 `main` 的 `dist/game.js`（原版本 `5065481bbbfaebf5c01f61a3745059945b368118`）**原樣擷取** `function combatTick(now=gameNow())` 到 `prototypes/original-combat-tick.mjs`，未改其判斷順序或函式主體。此函式經由 Node `vm` 在獨立上下文執行；外部函式（`playerAttack`、`enemyAttack`、`petAttack`、`autoCastJobs` 等）由測試替身提供。這是**主迴圈控制流程**驗證，尚非真正技能／共鳴／掉落引擎移植。

## 實際測試
於本機 Node.js 22.16.0 執行 `node --test original-combat-tick.test.mjs`，**15 tests / 15 PASS**：
1. 確保載入的是由原版擷取的 `combatTick`，不是另外重寫的主迴圈。
2. 自動戰鬥呼叫技能／角色攻擊。
3. 每 4 秒回復人物 MP 與寵物 SP。
4. 未滿 4 秒不觸發回復。
5. 死亡時進入自動復活分支，而不是繼續攻擊。
6. 試煉中死亡立即中止。
7. 詠唱完成觸發主動技能呼叫。
8. 寵物護盾過期正確扣除。
9. 寵物狀態護盾過期清除。
10. 怪物攻擊間隔更新。
11. 關閉自動戰鬥時不呼叫角色／寵物攻擊。
12. 100 tick 連續 vs 每 1 tick 做 checkpoint，結果一致。
13. 100 tick 連續 vs 7+31+62 tick 分段，結果一致。
14. 300 tick 連續 vs 80+100+120 tick 分段，結果一致。
15. 規則 hash 不符時拒絕舊 checkpoint。

在分段測試中，每段使用上一階段的 `checkpoint-codec` 實際執行 JSON 編碼／解碼，然後建立新的 VM 上下文以模擬 process restart。比較整個模擬角色、怪物、計時器、寵物、事件序列、偽隨機狀態。

## 發現並修正的測試 Harness 問題
首輪 15 項中有 3 個分段等價測試失敗：測試替身的 RNG 更新了舊的閉包 `s.rngState`，但 checkpoint 序列化讀取的是 VM context 的 `rngState`，導致恢復後 RNG 序列重啟。修正替身使 RNG 直接更新 `context.rngState` 後，**重新執行 15/15 通過**。這強化一項架構要求：**所有偽隨機狀態必須與 checkpoint 保存在同一個可序列化的權威物件中，不能留在另個 closure。**

## 重要限制
- 此輪測試只驗證 **原版 combatTick 主迴圈 + 外部依賴替身**；不是十職業、60 組共鳴、完整怪物 AI、物品掉落的真實等價測試。
- `original-combat-tick.mjs` 保留原版對全域變數的引用；直接 import 不能作為完整可運作的 Worker server。
- 未使用真實玩家存檔進行全引擎模擬，未測 24h（864000 tick）端對端實際收益，未測 Cloudflare CPU。
- Node `vm` 是本機程式測試隔離工具，**不能當作安全邊界去執行玩家提供的任意程式碼**。
- 本機完整 15 項測試程式保留於使用者可下載的 `cloud-save-stage18-tests.zip`；GitHub 中此輪保存原始函式擷取與報告。
- 原單機版 `main`／`dist`、GitHub Pages、正式存檔均未修改或部署。

## 下一步
1. 將所有 `combatTick` 下游依賴逐步替換為**真實函式**並明確注入時間與 seed，以封閉的 runtime state 運作。
2. 以十職業 × 60 組共鳴構建 golden states；每階段逐個對比真實傷害／掉落。
3. 將完整可還原的 runtime 與之前 V2/V3 的 DB checkpoint/ledger 接合，再進入獨立 Private Repository 的新 staging 部署。
4. 永久遵守第 12 階段限制：**不改原單機，驗證完仍只部署到新測試伺服器**。
