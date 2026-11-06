# DPS 測試條件更正及錯誤入口清理

## 已確認的原因

- 舊榜「刺客 7.30 億」的具體來源：`tests/fixtures/legacy-best-v6559/manifest.json`，精確紀錄 729,714,391.909 DPS。
- 該 manifest 明確標示：**三次 240 秒混合首領戰、生存優先的第一階段候選配裝**，不是 120 秒自然生怪、也不是無限血量的常駐首領加四怪。
- 刺客原始合法存檔為**主手 `rifle` 匕首 + 副手 `offDagger` 匕首**，不是單匕首配盾，也不是拳刃。裝備已核對 JSON 與 manifest 一致。
- 近期自然生怪 Worker 的刺客 505,983,772 DPS，以及 120 秒固定五個 1e15 HP 目標測試的 514,558,850 DPS，**都不能和舊 729,714,392 DPS 直接做增減比較**。兩者不是相同戰鬥條件；缺少可重演的舊 240 秒混合首領戰完整調度程式，不能據此宣稱刺客遭到削弱。

## 本次已清理

刪除兩個使用五隻「1e15 HP 永遠打不死」怪物卻被誤當作實際地圖 DPS 排名的入口：

- `tests/spirit-twelve-job-boss-four-120s.mjs`
- `tests/spirit-twelve-optimal-fixed-boss-four-120s.mjs`

刪除錯誤標示刺客原本為匕首加盾牌的臨時武器檢查腳本，以及與上述錯誤入口相關的過時候選排名報告。保留原始合法存檔與 manifest，**不改寫任何使用者裝備、卡片或舊測試數據**。

`tests/spirit-twelve-optimal-weapon-rerun-120s.mjs` 及 `tests/spirit-ten-optimal-saves-live-worker.mjs` 明確標註為「120 秒自然生怪診斷」，與 manifest 240 秒結果不可互相比較；新增 `tests/spirit-benchmark-scope.test.mjs` 防止錯誤入口復活。

## 後續唯一可比較方式

1. 找回舊版 240 秒混合首領戰的**完整怪物 HP、出生與替補、AI、攻擊目標、種子、技能優先序與傷害計數程式**。
2. 使用相同原始存檔，分別在舊程式與新程式執行**完全相同**的戰鬥。
3. 先比較主人／夥伴／BUFF 的傷害明細，再判定職業或武器是否真的被削弱。

在上述條件未齊全前，`manifest.dps` 只能用作歷史候選紀錄，不可作為目前 DPS 排名或刺客回歸失敗的斷言。
