# 16｜正式戰鬥狀態盤點與分段恢復阻礙

日期：2026-11-02。**唯讀對照原 `main` 的 `dist/game.js`、`dist/offline-rules.js`、`dist/offline-worker.js`，只在 `planning/cloud-save-v1` 分支建立審計文件與檢查器，不修改單機遊戲。**

## 已核對的原程式行為
- `simulateOffline()` 在開始離線模擬時執行 `resetSession(); auto=true; spawn();`，之後每 `100ms` 執行 `combatTick(offlineClock)`。這套初始化在一段**新**離線任務的最前面可以理解，但**不可每個續算 chunk 再呼叫**。
- `resetSession()` 會清除 `resonanceUsedAt`、`originalPactCounters`、`controlEffect`、`casting`、`bossCooldowns`、`classBuffs`、`enemy/enemies`、`petShield`、`jobSkillTimers`、`timers`、`nextEncounterAt`、`deadUntil`，還會呼叫 `clearPetEffects()`，影響戰鬥持續狀態。
- RNG 使用 `Math.random()`；因原始程式並未提供可序列化的確定性 PRNG 注入，**同一角色、同一離線時間不保證產生可重播的結果**。
- `offline-worker.js` 只 import 整份 `game.js`，並非獨立可部署的伺服器模組。需清楚分離 UI、DOM、localStorage、timer 與規則層。
- 離線上限 24 小時、100ms/tick，共最多 **864,000** tick；提前停止條件包括角色死亡、背包接近 1900 筆、試煉失敗、補給問題。

## Checkpoint 欄位：依原始碼建立的初步最低集合
| 類別 | 必須保存 | 依據 |
|---|---|---|
| 權威角色 | `player` 角色核心、技能、經驗、裝備、藥水、卡片、金幣、寵物與任務 | `player` 在戰鬥中直接更新 |
| 時間 | `offlineClock`、`timers`、`petSkillTimers`、`jobSkillTimers` | 多組 CD／回復／補給計時 |
| 怪物 | `enemy` 的選擇身份、`enemies` 全體內容、`encounterSlots`、`nextEncounterAt`、`deadUntil` | 多體戰鬥及下一波出怪 |
| 寵物與持續狀態 | `petEffects`、`petShield`、`petDeathSequence`、`pendingPetCredit` | 流血、燃燒、護盾、死亡／經驗判定 |
| 職業與共鳴 | `classBuffs`、`bossCooldowns`、`controlEffect`、`resonanceUsedAt`、`originalPactCounters`、`originalPactHitCount` | 60 組共鳴相關效果的可能狀態 |
| 施法 | `casting` | 未完成技能延遲與目標判定 |
| 事件與結果 | `offlineMetrics`、`report`、`combatStarted`、`encounterSerial` | 掉落／金幣／統計與隨機遭遇；是否必須持久化仍需逐項追蹤 |
| 亂數 | **新加入**確定性 PRNG 的 state/counter，種子由伺服器建立 | 原 `Math.random()` 尚不能重播 |
| 版本 | `rulesetHash`、`saveVersion`、`checkpointVersion`、`cursor` | 版本升級後安全恢復、禁止舊版篡改 |

**以上是初步清單，尚非全域狀態閉包的完整證明。** 後續需以程式分析／實際測試檢查每個被 `combatTick` 間接呼叫的副作用，以及 Map、Set、undefined、infinity 等 JSON 序列化問題。尤其 `resonanceUsedAt`、`originalPactCounters` 是 `Map`：直接 JSON.stringify 會遺失內容，必須明確轉為 entries 並還原。

## 必須先過的正式引擎等價性關卡
1. 對原本引擎**在獨立複本**注入可重播 RNG 與時間來源，不碰既有 `main`。
2. `S0` 先初始化一次，`advance(100ms)` 重複到完整時長；每段只 serialize/deserialize，不執行 `resetSession/spawn`。
3. 比較未中斷運行、固定每 1/7/500/5000 步中斷、任意斷線恢復的：生命、資源、職業 Buff、技能冷卻、怪物、寵物、道具掉落 UID、卡片、共鳴與通關進度。
4. 驗證**十職業 × 60 組三轉共鳴**、四種寵物定位、連續五連戰、死亡／復活／逃離首領、無藥、背包接近上限。
5. 以伺服器可信 seed + 請求冪等鍵 + DB 原子 checkpoint，最後才連接 V2/V3 存檔帳本。
6. 量測真實 Worker CPU、D1 讀寫與總段數，才能確認 500 人免費方案是否可持續。

## 本輪可重跑核查
新增 `prototypes/audit-offline-state.mjs`：讀取原始 `dist/` 檔案，檢查 17 個不可缺少的程式標記；若原檔變更就中止，強制重新審核。這只是**原始碼快照守門檢查**，不是執行戰鬥、不是 60 組共鳴測試，也不是安全性證明。

## 永久隔離
新雲端服務需要獨立 Private Repository、獨立域名、獨立 D1、獨立權限；通過驗收也不合併回原單機 `main`。此文件不附真實玩家完整存檔。
