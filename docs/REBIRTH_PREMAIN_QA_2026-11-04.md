# 轉生核心單項改動與合併 main 前驗收（2026-11-04）

## 本次改動

- 保留二轉 Base99／Job50、村莊轉生的條件，改為只消耗一枚「星宮轉生核心」。
- Lv.99「終界吞天巨鯨」每次實際擊殺固定掉落核心×1，涵蓋正常與離線戰鬥；同一擊殺不可重複領取。
- 五個舊征途任務自引導 NPC、追蹤 UI、接取／繳交 API 移除；讀取舊存檔時刪除這五筆舊任務進度。舊誓印保留在背包以防資料遺失，不再是轉生要求；舊雜物按一般設定可販售。
- 轉生只消耗一枚核心；玩家取消、儲存失敗可完整回復，保留裝備、卡片、夥伴與金幣。
- `[rebirth-only]` 提交僅觸發轉生專項 CI，避免自動啟動不相干的長時基準測試。

## 實測

- `node tests/rebirth-core-only.test.mjs`：通過，包括真實王獎勵函式與離線獎勵路徑。
- `node tests/v40.test.mjs`：16 / 16 通過。
- `node tests/skill-queue-v506.test.mjs`：4 / 4 通過。
- `node --test --test-name-pattern='former quest junk|old five-zone quest' tests/skill-runtime-v402.test.mjs`：2 / 2 通過。
- `node --check dist/game.js`、`node --check dist/adventure-economy.js`、`node --check dist/adventure-progression.js`、`git diff --check`：通過。

## 全套回歸風險（main 尚不可合併）

已執行 `node --test --test-concurrency=4 tests/*.test.mjs`，共 **669 項、521 通過、148 未通過**（約 17 秒）。失敗包括既有測試工具未支援程式別名／額外全域物件、原本只涵蓋十職業的舊固定計數、部分舊王卡槽位與顯示斷言，以及長年累積的裝備／共鳴／生存測試。直接涉及舊五區任務的斷言已更新；其餘失敗尚未逐一辨識為測試過時或正式回歸。

**結論：本次轉生專項已通過，但不能保證整體正式版零問題，且不應在全面測試未排除既有失敗前合併 main。** 本文件不代表線上瀏覽器、手機或長時掛機已驗收。
