# 17｜真實戰鬥狀態 Checkpoint Codec（第一個可執行雲端模組）

日期：2026-11-02。**此版是獨立資料序列化與亂數模組，尚未抽出正式 `combatTick`，未建立實體雲端測試伺服器。**

## 對原程式的實際改善目標
正式版 `game.js` 有 `resonanceUsedAt = new Map()`、`originalPactCounters = new Map()`、`timers` 內使用 Infinity 作為哨兵、戰鬥時間和寵物狀態。普通 `JSON.stringify` 無法保存 Map/Set/undefined/Infinity，分段重載後可能讓共鳴冷卻錯誤或狀態遺失。此輪開發 `prototypes/checkpoint-codec.mjs` 與獨立測試 `checkpoint-codec.test.mjs`。

## 交付可執行程式
1. `encodeState/decodeState`：以帶標籤 JSON 形式往返 `Map`、`Set`、`undefined`、`Infinity`、`-Infinity`、`NaN`、`BigInt`、普通陣列與物件。
2. 拒絕循環資料、非一般物件原型（如 Date）、過深巢狀及保留的標籤欄位。
3. `serializeCheckpoint/restoreCheckpoint`：寫入版本、tick cursor (0～864000)、時間、規則 SHA/hash、RNG 狀態及戰鬥資料。恢復時拒絕版本／規則不符，保護規則更新後的 session。
4. `nextRandom`：可序列化的 xorshift32 狀態，離線中斷後續算可重現同一個亂數序列。**它不是密碼學安全 RNG，也不是現有 `game.js` 使用的亂數公式**；伺服器須可信地建立種子，不把種子當作授權秘密。
5. 本機 Node.js v22.16.0 執行 `node --test checkpoint-codec.test.mjs`，**15/15 PASS**。首次執行 14/15，因為解碼使用 null-prototype 物件使嚴格比對不同；改為正常物件並以 `Object.defineProperty` 防止 `__proto__` 指派問題後重新測試 15/15 通過。

## 已實測的 15 項
Map、Set、Infinity、undefined、非有限數字、巢狀物件、規則 hash 不符、非法 cursor、非法 RNG、特殊原型、循環、保留標籤、斷線後 RNG 序列一致、不修改輸入、序列化結果可重現。

## 明確限制
- **這是能保存複雜戰鬥狀態的底層工具，不是已完成的正式戰鬥核心移植。**
- 尚未把 `game.js` 所有全域／閉包狀態納入 `combat`，尚未讓其 `combatTick()` 接受 injected clock + RNG。
- 模組本身沒有密碼學驗證、資料庫交易或授權：checkpoint 應只放在受信任的伺服器資料庫，不可由玩家提交並覆寫。
- 沒有執行完整 864000 tick／真實 60 組共鳴等價／Cloudflare CPU 測試。
- 目前模組上限 8MB checkpoint 是測試性限制，不代表正式部署安全額度。
- 正式雲端服務若採此方案，還需為版本升級、輸出大小、負載以及 JSON 數值有效性做嚴格伺服器驗證。

## 使用方式
從專案根目錄：
```sh
node --test planning/cloud-save-v1/prototypes/checkpoint-codec.test.mjs
```
無須安裝 npm 相依套件；僅需 Node.js 18 以上。程式及測試皆只位於 `planning/cloud-save-v1`，**原單機 `main` 永久不動**。

## 下一階段
1. 在新 Private Repository 中建立原遊戲唯讀副本的可測試 runtime。
2. 將 `game.js` 戰鬥函數的 clock/RNG、狀態讀寫與 DOM 分離到獨立模組。
3. 使用此 codec 做真實戰鬥引擎分段／連續等價黃金測試（十職業、60 組共鳴）。
4. 接續已完成的 V2/V3 SQLite 原型，再開新的 Cloudflare staging 服務及獨立資料庫。
