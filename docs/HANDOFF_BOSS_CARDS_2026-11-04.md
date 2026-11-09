# 靈契紀元｜測試分支開發交接（2026-11-04）

> 本文件供下一個 ChatGPT 對話直接接手 GitHub 開發。請優先讀取 GitHub 最新檔案與 Actions，**不要把本文件中的歷史狀態視為比最新程式更權威**。

## 1. 專案與不可違反的範圍

- GitHub：`zaza147a/spirit-pact-era`
- **唯一開發分支**：`feature/spirit-tamer-dual-pets`
- 交接時 HEAD：`833c6fef3b2a977d515ec40a3c1fa940ae160705`
- 正式版分支：`main`，**未獲新授權不可合併、修改、發布或覆蓋正式網站**。
- 使用者已確認新對話可直接操作 GitHub；應使用 GitHub 可用讀寫工具，所有修改須提交到測試分支，不能僅留本地。
- 只做**短時間、針對本次改動的測試**。不做 24 小時測試，不要每次跑全職業 DPS、五連戰或 20 個已完成／待平衡的大型 Job。
- 對使用者回報精確的 commit SHA、Actions URL、測試通過／未通過／未執行；不得把靜態程式測試誤稱為瀏覽器實測。

## 2. 最近已完成的工作

### 2.1 關閉 2.5D 原型議題

- GitHub Issue #8 已於 2026-11-04 關閉，原因為 not planned。
- 2.5D 原型已不在現行開發範圍。不要重新導入。

### 2.2 GitHub Actions 改為卡片專項分流

- 提交：`da871d9a0aebef6e3fae12b8bbc4d703efd5cc60`
- 檔案：`.github/workflows/spirit-tamer-regression.yml`
- 當 commit message 含 `[card-only]` 時，只執行 `boss-card-focused`：
  - `tests/boss-card-salvage-regression.mjs`
  - `tests/card-balance-v404.test.mjs`
  - `tests/card-recycling.test.mjs`
  - `tests/card-collection.test.mjs`
  - `node --check dist/game.js`
- 其他 20 個大型 Job 均設定 `if: !contains(github.event.head_commit.message, '[card-only]')` 略過。
- Action #385：成功；1 個卡片 Job 通過，其餘 20 個略過。
- **後續首領卡片改動的 commit message 務必包含 `[card-only]`**；避免耗費時間、重複驗證。
- 此為「這批卡片修改」的分流，**不代表一般提交已永久停用大型測試**。如需更進一步縮減，先盤點相關流程與使用者先前要求的待辦範圍。

### 2.3 首領卡片首輪改造

- 提交：`833c6fef3b2a977d515ec40a3c1fa940ae160705`
- Action #386：`https://github.com/zaza147a/spirit-pact-era/actions/runs/41801237739`，**卡片專項 Job 通過，其餘 20 個略過，無失敗**。
- 涉及檔案：
  - `dist/card-effects.js`
  - `dist/catalog.js`
  - `dist/game.js`
  - `dist/map-rules.js`
  - `tests/boss-card-salvage-regression.mjs`
- 原先二十張地圖王卡**全部只能插飾品 1／2**；改為十個裝備卡槽各有兩張王卡選擇：
  `headUpper, headMiddle, headLower, armor, rightHand, leftHand, garment, shoes, accessory1, accessory2`。
- 加入 `BOSS_TRAITS` 與 `bossCardDamageFactor`，依實際戰況判定條件式增傷（開場、斬殺、孤敵、範圍、副手／玩家／夥伴連攜等現有代碼支持的情況；實際鍵請看源碼）；條件增傷的**加總上限為 18%**，避免十張王卡指數疊加。
- 第 21 張首領卡「**黎明裁界者卡片**」（ID `dawn-archon`）已加入卡片目錄，可插右手或左手。
- `dist/map-rules.js` 為 `dawnrift` 首領 `dawn-archon` 特別開放 **0.1%** 王卡掉率；同區普通怪物仍不掉卡。
- 卡片有名稱、現有首領美術與說明；王卡機制使用同一套即時／離線傷害入口。

## 3. 王卡掉落恭喜框：已接線但瀏覽器驗收仍待辦

`dist/game.js` 已有：

- `queueBossCardNotice(id)`：一般擊殺掉王卡時加入佇列；離線期間記錄於 `offlineMetrics.bossCards`。
- `showNextBossCardNotice()`：顯示「恭喜獲得首領卡片！」彈窗、`spriteHtml(id,'large')` 美術、卡片名稱、描述與可插槽。
- 多張王卡以佇列先後逐張顯示。
- 抽卡 `result.drawn` 的王卡會依順序逐張入列。
- 離線計算結束先顯示 `showOfflineReport`，關閉離線報告的 `offlineClose` handler 會再呼叫 `showNextBossCardNotice()`。
- 背包已有 `boss-card-item` 首領卡醒目樣式。
- **目前只確認程式接線與靜態測試，尚未完成三種路徑的瀏覽器端互動／視覺驗收。** 請勿宣稱已實測。
- Boss 圖片目前取自現有怪物立繪，不代表已替每張卡製作獨立新美術圖；如果使用者要求「王卡專屬卡面」，需另行製作。

## 4. 王卡下一階段最高優先待辦

1. **20～30% 增幅實測**：使用者要求「王卡相對普通小怪卡約 20～30% 優勢」，但 **Commit 833c6fef 沒有證明已達成**。須以同等養成、相同卡槽、物理／魔法／新兩職業的合法配置，量測實際 DPS／生存價值，不可直接把不同屬性的百分比相加當 DPS。
2. **獨特性深化**：目前 21 張卡各有獨立主題與數值組，但條件式機制主要是 **7 類重複使用**，尚未達到「每張卡獨特玩法」的最終理想。設計特色時要考慮事件觸發、冷卻、同類效果重複、防止重複結算與離線一致性。不能只拉高數字。
3. **部位畢業配置**：雖然十個部位都有 2 張王卡，但物理／魔法／防禦／新兩職業配置的可替換性、同部位競爭及實際收益尚未完整驗證；尤其頭部數值上限、武器／副手、兩個飾品與近戰／法系差異。
4. **210 掉落實測**：用短時間可控 RNG 測試確認 `dawn-archon` 唯一以 0.1% 掉卡，普通曙界怪維持 0%，而且取得後會進背包、可插槽、可觸發恭喜框。避免真的等待自然掉落。
5. **王卡提示 UI 驗收**：普通即時擊殺、離線結算視窗關閉後、多張回收抽卡逐張彈出；確認素材、數值說明、點擊／鍵盤／小螢幕顯示。這些只需短時間測試，不要 24h。
6. **回歸防護**：新增小型可執行測試涵蓋觸發上限、王卡插槽限制、210 掉卡、既有存檔插卡遷移（以前全部插飾品的既有王卡若不符合新槽會歸還背包），並與現有 card-only CI 結合。
7. **WIKI 同步**：王卡新的可插槽、條件式效果、掉率及 210 王卡，應同步到 WIKI；目前不確認是否已完成。

## 5. 使用者最近明確確立的遊戲設計要求

- 兩個新職業：
  - **靈契君王**：夥伴能力（含夥伴裝備）轉而強化**自身**；偏集中單體。
  - **萬靈宗師**：自身能力（含人物裝備、卡片）轉而強化**夥伴**。
- 使用者已宣告兩個新職業平衡**暫時視為 OK**，先前欲小幅削弱靈契單體的想法又撤回；沒有新指示不要再次自行改動職業傷害，也不要新增專門只針對 201 地圖的補正。
- **卡片副手槽所有人皆可使用**，不能誤當只有盾牌職業可插。
- 王卡低掉率、早期就有價值、後期不易被一般怪卡替代；每個部位須有畢業級王卡，重複部位可分物理／魔法／兩新職業特色。
- 裝備分解多重條件（例「傳說以上＋創世階以上」）此前已修正並有專項回歸；若繼續編輯需保留判斷模式及保護裝備限制。
- 背包卡片比較窗應重點顯示目前／新卡實際效果，減少雜亂細節；卡片不能手動售出，其他適合的背包分類有一鍵批次販賣。
- 不做 24 小時測試；只跑必要的小型驗證。原本已完成但現在因平衡變動而不通過的大型測試，應記入待辦，避免每次提交都啟動。

## 6. 重要檔案入口

| 目的 | 路徑 |
|---|---|
| 首領卡資料、條件特性、卡槽映射 | `dist/card-effects.js` |
| 卡片目錄、黎明王卡註冊 | `dist/catalog.js` |
| 210 首領與黎明地圖怪物 | `dist/dawn-world.js` |
| 首領出現率與一般 20 區地圖王 | `dist/map-bosses.js` |
| 各地圖卡片掉落限制 | `dist/map-rules.js` |
| 實際傷害、王卡通知、背包、離線彈窗 | `dist/game.js` |
| 王卡、分解專項回歸 | `tests/boss-card-salvage-regression.mjs` |
| GitHub Actions 分流 | `.github/workflows/spirit-tamer-regression.yml` |
| 先前御靈使交接 | `docs/HANDOFF_SPIRIT_TAMER_2026-11-03.md` |

## 7. GitHub 提交與驗證流程

1. 先讀最新 `feature/spirit-tamer-dual-pets` HEAD、相關檔案及最近 Actions，避免另一個對話同時寫入而覆蓋。
2. 僅變更這次需求所需檔案。提交王卡相關修改時，commit message 包含 `[card-only]`。
3. 能合併成一次 commit 就不要多次逐檔提交觸發多輪 CI。若用 GitHub Git Trees/Commits/Refs API，必須以最新分支 HEAD 為 parent，更新 ref 時檢查 expected SHA。
4. 運行專項短測試並等 Actions 完成；失敗時先看對應 Job logs，只修實際失敗原因，不以大量重跑取代診斷。
5. 回覆完整 commit SHA、Actions 執行網址與哪些情境尚未驗收。
6. **絕不在未授權時合併 main 或更新正式網頁**。

## 8. 可直接貼給新對話的接手指令

> 請直接接手 GitHub 倉庫 `zaza147a/spirit-pact-era` 的測試分支 `feature/spirit-tamer-dual-pets`，先讀 `docs/HANDOFF_BOSS_CARDS_2026-11-04.md` 與該分支最新程式。從首領卡片的 20～30% 實際增幅、每張卡的獨特機制、210 王卡掉落與恭喜提示框短時間實測繼續開發。所有修改直接提交 GitHub 測試分支；首領卡相關 commit 加 `[card-only]`，只跑卡片專項 CI，不要跑全職業大型回歸或 24 小時測試。先前兩個新職業平衡目前視為 OK，勿自行再改。不要合併 main 或部署正式版。完成後提供 SHA 與 Actions 結果。
