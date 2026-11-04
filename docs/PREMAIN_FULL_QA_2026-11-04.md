# 《靈契紀元》合併 main 前完整驗收（2026-11-04）

分支：`feature/spirit-tamer-dual-pets`。不得以本報告作為自動合併或部署授權。

## 合併與 WIKI

- WIKI 依要求暫以 `main` 正式版為唯一基準；21 張首領卡與 210 專卡的 WIKI 後續另行更新。測試分支 `wiki/index.html` 已與 main 同一 blob。
- 使用三方合併預演 (`merge-tree --write-tree`)：exit 0，無衝突。此驗證不等於已合併 main。

## 完整回歸

在乾淨的測試分支快照執行 `node --test --test-concurrency=4 tests/*.test.mjs`：

- **最終乾淨快照 `1d937f18f90a5dc1852d42de8bd67537a67be6f3`：601 項通過、0 失敗、0 跳過，耗時 200.731 秒，exit 0。**
- 第一輪基準：602 項、569 通過、33 失敗，208.215 秒。原有 33 個失敗均已逐項確認並修復相容性斷言或新職業規格；移除一項已取消舊任務的重複案例，並以新轉生核心測試取代。
- 本輪修正並未更動兩個新職業的傷害／生存平衡公式。通過測試不代表可保證完全沒有未涵蓋的問題。

### 第一輪失敗分類（33 個個案，均在第二輪排除）

1. **王卡／卡片／裝備比較（5）**：`cards-v404`（3，舊槽位測試已更新）、`v5-expansion`（2，卡片防具限制與比較外觀）。需要依當前王卡機制比對 UI 與能力預覽。
2. **融合／技能／共鳴（12）**：`frontier-v6`（1）、`fusion-description-precision`（1）、`fusion-six-choose-three-exhaustive`（1）、`fusion-unique-contracts`（3）、`fusion-v61`（3）、`skill-runtime-v402`（3）。部分仍假設有序融合、10 職業與舊三轉契約，需逐項確認是否規格過時。
3. **進度、任務、轉生／經濟與舊存檔（7）**：`dawn-fusion-economy-acceptance`、`dawn-progression-acceptance`、`full-five-boss-matrix-acceptance`、`inventory`、`pet-evolution`、`qol-v403`（2）。其中多項有封存報告或舊轉生素材，不能以數字不符判定程式錯誤。
4. **使用者介面與美術資產（4）**：`companion-labels-v620`、`rank-outfit-refresh`、`sky-trial-art-v630`、`qol-v403`（1）。夥伴稱呼或新版資產數量應以最新正式需求為準。
5. **戰鬥／技能實際行為（5）**：`boss-loyalty-v620`、`sky-trials-v630`、`v21`（3）。優先檢查 DOM 模擬器缺少 `querySelector` 是否造成假失敗，以及實際技能／治療／捕捉行為。

> 這是第一輪的歷史故障清單，並非目前仍失敗。修正涵蓋舊王卡槽位、DOM 測試相容、匯入別名、12 職業技能數量、舊 10 職業封存報告、新 210 王卡掉落與新立繪獨立驗收。任何需要修改職業強度的項目仍依既有指示保持不動。

## 24 小時真實離線 Worker 運算

使用生產 Worker 與 `tests/offline-worker-benchmark.mjs` 的實際模擬路徑，同種子重現檢查均一致：

| 情境 | 模擬完成 | Worker 計算時間 | 原因／備註 |
| --- | --- | --- | --- |
| 6 分鐘一般掛機 | 360,000 ms | 289 ms | 正常結束 |
| 24 小時一般掛機 | 9,345,200 / 86,400,000 ms | 890 ms | 背包近上限，按既有規則中止 |
| 24 小時自動整理掛機 | 86,400,000 ms | 3,835 ms | 正常結束 |
| 24 小時雙夥伴自動整理 | 86,400,000 ms | 6,544 ms | 正常結束；人物與兩夥伴傷害均有記錄 |

以上不是玩家端實機瀏覽器或 Safari 24 小時持續前景運行的驗證。

## 其他短測

- 批次販賣與任務物品保護：通過。
- 王卡分解稀有度、品質聯合條件、210 首領掉卡：通過。
- 離線 Worker 載入與非法離線狀態保護：通過。
- 八張新職業立繪 400×400 與透明度、六張 S／SS／SSS 時裝 WEBP 512×768：通過。

## 低頻共鳴長時間行為驗證

執行 `node tests/spirit-rare-resonance-observation.mjs`：通過。五條代表性路線、兩個新職業、Lv200／210、兩種種子，共 **20 個模擬 300,000 ms** 的真實戰鬥情境；0 個完全不觸發的情境、總觸發 484 次。此為共鳴實際施放與冷卻的觀察，不等同於全職業 DPS 平衡已通過。

## 其他手動長測與實戰觀察

- `spirit-offline-survival-economy-observation.mjs`：12 個 10 分鐘生存／經濟情境，程序 exit 0。
- `spirit-vs-ten-jobs-combat-observation.mjs`：12 職業、兩等級、三種子合計 72 個實際離線戰鬥情境，程序 exit 0；非最佳化 DPS 排名。
- `spirit-underlevel-legacy-control.mjs`：24 個 170／180 等神話無強化裝備於 191–200 地圖的情境，程序 exit 0。
- `spirit-underlevel-map-survival.mjs`：24 個低等裝及 201–210 SSS 地圖對照情境，程序 exit 0。
- `spirit-gear-quality-observation.mjs`：18 個裝備品質對照，程序 exit 0。
- `spirit-200-low-gear-five-boss.mjs`：16 個 200 神話裝五連戰情境，程序 exit 0，但**並非所有場次通關**。靈契無強化 0/4、SS 強化 **2/4**；萬靈無強化 0/4、SS 強化 **4/4**。靈契 SS 的兩個失敗配置保留為平衡待辦（原 GitHub issue #9），不自行調整職業傷害／怪物難度。此獨立觀察不包含在 601 項 Node 回歸的 pass/fail 總數中。

上述報告有明確的裝備、場景、種子與時間限制，不能直接外推為所有玩家配置或最優 DPS。

## 發版判定

**程式層完整回歸已通過，Git 三方合併預演無衝突；但 200 神話 SS 靈契五連戰仍有 2/4 未通過，需作為平衡待辦而非誤報全面驗收成功。** 正式版 WIKI 保持不變，王卡 WIKI 更新留後續。線上正式瀏覽器、手機 Safari、GitHub Actions 的遠端執行狀態仍需分別確認。不得由測試結果推論「零缺陷」或自動合併／部署。現有 GitHub Pages 的完整回歸保護保留。
