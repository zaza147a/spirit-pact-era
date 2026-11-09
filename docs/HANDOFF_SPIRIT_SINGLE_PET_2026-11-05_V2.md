# 《靈契紀元》御靈使單夥伴重製交接（2026-11-05，第二版）

## 1. 接手位置與禁止事項

- GitHub：`zaza147a/spirit-pact-era`
- **唯一工作分支**：`feature/spirit-tamer-single-pet`。
- 截至交接，GitHub 最新提交：`6f7d2e097f5c4d2f5565f771adaf4f555da795ad`（萬靈三技能欄位改造與測試報告）。
- **不可修改、合併或部署 `main`，不可更新正式網站** `https://zaza147a.github.io/spirit-pact-era/`，除非使用者另行明確授權。
- 本地工作區可能與 GitHub 分支的提交歷史不同步或有其他未提交變更；**以 GitHub 測試分支的最新檔案為準**，檢查檔案 SHA 再寫入，避免覆蓋其他對話的變更。
- 對已結束或無關的專項不要每次跑沉重 GitHub Actions；實際戰鬥、技能與單寵回歸是本階段的核心。

## 2. 最終規格：兩職業各一隻融合夥伴

| 項目 | 靈契君王 `pactWarrior` | 萬靈宗師 `spiritCommander` |
|---|---|---|
| 夥伴數量 | 唯一出戰夥伴 | 唯一出戰夥伴 |
| 二轉起固定流派 | **同化**，無姿態選擇 | **協戰**，無姿態選擇 |
| 敵人仇恨 | 只攻擊玩家 | 只攻擊唯一夥伴 |
| 直接輸出主體 | 只有玩家；夥伴無技能施放和傷害 | 主要由夥伴攻擊與施放技能 |
| 死亡 | 玩家或夥伴任何一方死亡，視為雙方死亡 | 同左 |
| 三轉要求 | 取得**一隻融合寵**才能轉職，非兩隻 | 同左 |
| 三轉共鳴 | 僅六種**無序**融合寵對應共鳴 | 同左 |
| 武器 | 專屬「杖劍」，同時具有 ATK/MATK | 同左 |

- 融合配對：攻魔、攻防、攻輔、魔防、魔輔、防輔，共六組；順序相反只影響外觀，不影響數值。
- 兩職都同時重視物理／魔法能力；不可簡化成純單一物傷或魔傷職業。
- 戰術系統不參與職業平衡。契印／刻印 0 是本階段比較基準；後續可另外測契印 8。
- 不修改舊十職業與怪物強度，減傷上限仍為 40%，攻速上限 193、暴擊按實際期望傷害計算。
- 御靈使新職系的創角入口先前設為暫停，沒有完整驗收前不應直接開放正式版。

## 3. 已完成的核心功能與關鍵檔案

1. 單寵編隊、雙方連動死亡、仇恨規則：`dist/dual-pet-formation.js`、`dist/dual-pet-targeting.js`、`dist/game.js`。
2. 二轉四類與三轉六融合共鳴資料：`dist/spirit-single-pet-profiles.js`、`dist/spirit-single-pet-procs.js`、`dist/spirit-job-rules.js`。君王同化按夥伴類型改造主攻；萬靈改造夥伴主攻。
3. 君王同化能力：`dist/game.js` 的 `pactAssimilationBonus()`。先前已將 DEF/MDEF 轉移比率調到 `.42`、HP `.28`；君王最高 DPS 已高於固定配裝十職業基準，因此未再提高 ATK/MATK 同化倍率。
4. 萬靈人物能力轉夥伴：`dist/commander-owner-growth.js`、`dist/game.js` 的 `commanderTransferredPetStats()`；最新專屬轉移含人物 ATK/MATK `.42`、DEF/MDEF `.50`、HP `.45`、減傷 `.50`，受既有上限限制；培養乘區起始 `.91`，滿培養係數維持上限 `1.3528`。
5. **萬靈人物卡片直接同步唯一夥伴**：`dist/commander-card-sync.js`。包含攻、防、生存、暴擊、攻速等卡片屬性；避免同張卡片透過主人轉移和直接同步重複加成。`dist/boss-card-runtime.js` 已可將萬靈一般首領卡的命中／承傷／閃避效果導向唯一夥伴；210 專屬卡舊雙寵觸發條件已修正為單寵三次命中。但**本階段平衡測試暫不考慮 210 首領卡**。
6. **萬靈夥伴技能三欄位改造**：`dist/commander-pet-skill-forms.js`、`dist/game.js` 的 `petAutoAbility()`。萬靈原本三格已裝備融合技能依順序：第一格主攻、第二格範圍、第三格終結。玩家透過既有裝備／順序按鈕改變定位，沒有新存檔結構；治療／護盾／BUFF／印記等非直傷技能保留本身作用，另依欄位提供受控的夥伴追擊。

### 三技能欄位目前倍率

| 欄位 | 名稱 | 最多目標 | 主要目標倍率 | 其他目標倍率 |
|---|---|---:|---:|---:|
| 1 | 主攻 | 3 | 120% | 50% |
| 2 | 範圍 | 6 | 95% | 75% |
| 3 | 終結 | 4 | 180% | 40% |

- 敵人實際命中數還受地圖同時存活敵人數量與 `encounterLimit()` 限制。
- 裝備在第幾欄即屬於該欄角色，**非按技能 ID 固定**；保留原本 CD／SP，不另外建立第二套技能。
- 基礎技能、二轉技能與融合共鳴的完整特色仍需繼續打磨；不要隨意刪除已製作的美術／金幣時裝資源。

## 4. 最新實戰與回歸數據

核心來源：`docs/SPIRIT_SINGLE_PET_SIX_FUSION_WORKER_2026-11-05.md`，其中第 14～17 階段有完整背景、配裝 A/B 與歷史差異。測試程式：

- `tests/spirit-six-fusion-worker-matrix.mjs`：正式離線 Worker，不是靜態公式；可設定等級、職業、融合寵、時間與種子。
- `tests/spirit-single-pet-200-trial-worker.mjs`：200 等神話 SSS 五連戰。
- `tests/spirit-vs-ten-jobs-combat-observation.mjs`：原十職對照（**注意：其舊御靈使 fixture 仍為雙寵，不能直接引用新職業排名**）。
- `tests/spirit-commander-pet-skill-forms.test.mjs`、`tests/spirit-commander-card-sync.test.mjs`、`tests/spirit-single-pet-wiring.test.mjs`、`tests/boss-card-runtime.test.mjs`：技能、同步、連動與首領卡回歸。

### 萬靈：最新 210 實際清怪 DPS

固定合成神話 SSS 人物及夥伴裝、普通卡片、契印 0、技能優先、120 秒，**不包含首領，不含 210 首領卡效果**：

| 融合 | DPS | 擊殺 | 復活 |
|---|---:|---:|---:|
| 攻魔 | 143,301,370 | 47 | 0 |
| 攻防 | 166,841,759 | 54 | 0 |
| 攻輔 | 132,895,139 | 43 | 0 |
| 魔防 | 129,570,360 | 42 | 0 |
| 魔輔 | 138,831,578 | 45 | 0 |
| 防輔 | 145,104,382 | 47 | 0 |

### 萬靈：最新 200 無強化地圖與 SSS 五王

200 一般地圖（神話**無強化**、120 秒）六融合 DPS 依上述順序：23.83m／31.87m／26.85m／24.74m／27.21m／39.49m，全部零復活。200 神話 **SSS** 五連戰六融合均通關且零復活；**不要把這個 SSS 五王結果當成無強化通關**。

### 君王與十職業對照的限制

- 君王前一輪 210 無首領固定配裝攻魔／攻防／攻輔約 317.30m／322.90m／319.20m；魔防／魔輔／防輔約 168.50m／175.10m／154.60m。這不是同一輪萬靈技能改造後的全面重新排名。
- 原十職業固定 SSS 配裝、三種子 60 秒實際 DPS 約 84.72m～164.09m；但最佳化配點、王卡、武器流派不同，**不可把上述數字稱為十二職最強 DPS 最終排名**。
- 210 首領卡不參與目前強化決策；此前用合法王卡與生存詞條測萬靈攻魔的 15 分鐘 Boss 場約 1.76 億 DPS、零復活，是不同條件的早期測試，**不得和最新普通卡無首領表直接比較**。
- 最近指定的設計目標是繼續強化新職業、使萬靈的攻擊由寵物技能主導；仍要保留君王單體主體輸出、萬靈唯一夥伴主體輸出的特色，避免兩職改成相同模板。

## 5. 接手後優先待辦

1. **萬靈技能最適化**：對六融合逐一搜尋合法三招技能選擇及排序（最多三個欄位主攻／範圍／終結），不只固定 fixture；量出主攻／範圍／終結技能實際命中、總傷、技能 CD、藥水、存活。尤其檢查「非直傷技能附帶追擊」是否有無意重複觸發或讓輔助技能壓過原本的純攻擊技能。
2. **210 混合地圖長戰**：每組至少三個種子，包含普通怪與自然首領生成；以**合法可取得的王卡（先排除 210 專屬王卡）**及生存特殊詞條，測實際 DPS、首領擊殺率、死亡、藥水，包含生怪間隔。對照全十職需採**相同資源與最佳化程度**。
3. **君王特色**：針對六融合的自身技能改造、共鳴觸發頻率、魔系與防輔輸出、生存分開驗證。最高輸出已有偏高的情況，優先改技能特色與差距，不宜直接無條件增加同化攻擊倍率。
4. **卡片同步稽核**：逐卡片屬性與首領機制測來源、同步一次且不重複、適用目標與有效量；特別確認人物能力 `stat()` 扣卡片後的轉移公式、最終 HP/減傷及人物自身卡片仍正常。210 首領卡本階段只做相容回歸，**不納入平衡 DPS**。
5. **存檔／UI／Worker 一致性**：已有存檔的單寵遷移、轉職任務要求一融合寵、融合順序無關、未解鎖職業創角流程、技能欄位資訊、離線 24 小時效能與在線技能施放規則一致。
6. 每輪數值修改後，跑針對性的回歸與可重現的實戰；**不要無必要地每次執行已完成的沉重驗證**。未通過驗證的項目登記待辦，等下一輪平衡再跑。

## 6. 建議指令

```bash
node --check dist/game.js
node --test tests/spirit-commander-pet-skill-forms.test.mjs tests/spirit-commander-card-sync.test.mjs tests/spirit-single-pet-wiring.test.mjs tests/boss-card-runtime.test.mjs
SPIRIT_LEVEL_FILTER=210 SPIRIT_JOB_FILTER=spiritCommander node tests/spirit-six-fusion-worker-matrix.mjs
SPIRIT_LEVEL_FILTER=200 SPIRIT_JOB_FILTER=spiritCommander node tests/spirit-six-fusion-worker-matrix.mjs
node tests/spirit-single-pet-200-trial-worker.mjs
```

可選旗標：`SPIRIT_FUSION_FILTER=attack-magic`、`SPIRIT_SEED=93217`、`SPIRIT_DURATION_MS=900000`、`SPIRIT_ALLOW_BOSS=1`、`SPIRIT_BOSS_CARDS=1`、`SPIRIT_SURVIVAL_AFFIXES=1`。若使用 `SPIRIT_BOSS_CARDS=1`，現有測試器可能選到 210 專屬王卡；**在排除 210 首領卡的平衡實驗前，必須先加入卡片池過濾**，不能直接拿該旗標結果當本輪比較。

## 7. 給下一個對話的啟動指令

> 接手《靈契紀元》`zaza147a/spirit-pact-era`，只在 `feature/spirit-tamer-single-pet` 開發。先讀 `docs/HANDOFF_SPIRIT_SINGLE_PET_2026-11-05_V2.md` 與 `docs/SPIRIT_SINGLE_PET_SIX_FUSION_WORKER_2026-11-05.md`。繼續萬靈唯一融合夥伴的三技能定位（主攻／範圍／終結）與六融合最優技能配置，並驗證君王技能特色及兩職生存。210 首領卡暫不列入平衡計算；使用合法可得裝備與其他王卡、契印 0、實際 Worker 戰鬥含生怪時間與首領。不要更動 `main` 或正式網站，不必每小項停下確認。所有修改附可重現測試與數值，再提交測試分支。
