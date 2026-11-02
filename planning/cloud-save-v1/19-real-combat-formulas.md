# 19｜正式戰鬥公式隔離驗證

日期：2026-11-02。這輪首次測試從正式版 `main/dist/combat-balance.js` **取出的實際數值公式**，而不是虛構的傷害替身。

## 本輪實際執行
- 透過 GitHub 讀取 `dist/combat-balance.js`，在本機隔離資料夾建立同公式測試副本，不對原程式寫入。
- Node 22 `node --test real-combat-rules.test.mjs`：**15/15 PASS**。
- GitHub 新增 `prototypes/real-combat-rules.test.mjs`，改為**直接 import 分支內實際 `../../../dist/combat-balance.js`**，避免正式碼更新後測試仍讀舊副本。
- GitHub 版本新增後已確認檔案提交，但尚未透過 CI 在 GitHub checkout 中另行跑完整測試，因此 15/15 數字指本機隔離副本執行結果。

## 驗證公式範圍
1. `incomingMonsterDamage`：防禦減傷、最低傷害與隨機倍率範圍。
2. `aspdAttackIntervalMs`：ASPD 193 => 140ms，邊界。
3. `roStyleCritRate`：LUK 暴擊率與封頂。
4. `hitChance/monsterHitChance`：物理／魔法命中邊界與差異。
5. `monsterCombatStats`：首領與一般怪的命中、閃避、攻速差異。
6. `monsterRuntimeStats/monsterAttackPower/monsterDefenseAgainst`：法攻與法防 fallback。
7. `outgoingHitDamage`：**先扣防禦，再乘暴擊**，傷害浮動上下限。
8. `jobZoneOutputFactor`：十職業皆為有限正數、200與201等倍率連續，以及指定職業基準。
9. 未知職業返回中性倍率1。

## 與前階段的差別
第18階段使用原版 `combatTick` 主循環但下游函式仍為測試替身。本輪實際進入**已拆成純函式的正式數值規則**；這些可不修改單機遊戲地被新雲端版本直接引用或移植。

## 不可擴大的結論
- 這是公式契約測試，**不是**真實 `combatTick` + `playerAttack` + `petAttack` + `enemyAttack` 的整合測試。
- 未驗證60組共鳴、法術／DOT／寵物配裝、首領AI、掉落、全部職業DPS或24h完整模擬。
- 500 人 Cloudflare Workers/D1 實際壓測尚未開始。
- 下一階段依相同方法直接引用 `pet-effects.js`、`fusion-resonance.js` 的真正函式，逐步將下游測試替身替換。
- **所有成果只放獨立規劃分支。** 原本單機版不修改；完成後仍只開全新的獨立測試伺服器。
