# 天穹終境前 30 層美術交接（2026-11-07）

## 範圍與限制

- 測試分支：`feature/endless-tower-1-30`；嚴禁直接合併 `main`。
- 1～30 層獎勵限外觀、稱號、名稱框、背景、收藏與便利；不得提高攻防或 DPS。
- 角色選單現已將「稱號」「名稱框」「背景」「角色外觀」獨立分頁。
- 第 30 層限定角色時裝仍屬未開放功能；**未滿 12 職業前不要將不完整的時裝選項接到玩家選角頁。**

## 已完成：三個區域背景

路徑均在 `dist/assets/tower/`，尺寸 **1600×900 WebP**：

1. `background-dawn.webp` — 第 1～10 層破曉聖域，金藍色聖殿。
2. `background-flame.webp` — 第 11～20 層熾焰迴廊，赤金色火焰宮殿。
3. `background-frost.webp` — 第 21～30 層永凍王庭，冰藍色水晶宮殿。

UI：`dist/game.js` 的 `TOWER_BACKGROUND_STYLES` 與 `dist/endless-tower.css` 已指向上述 WebP，圖片載入失敗時沿用底色。需進行瀏覽器視覺驗收與快取版本更新。

## 已完成：第 30 層專屬永凍時裝（十二職）

路徑均在 `dist/assets/tower/`，尺寸 **1024×1504 WebP，帶 alpha 真透明**：

| 職業 | 新素材 | 設計 |
|---|---|---|
| 皇家 / crusader | `outfit-crusader-frost.webp` | 女性銀白冰晶聖騎士，大型紋章冰盾＋單手長劍 |
| 騎士 / knight | `outfit-knight-frost.webp` | 女性冰龍槍騎士，雙手冰龍長槍與藍銀披風 |
| 大法師 / wizard | `outfit-wizard-frost.webp` | 女性冰晶大法師，冰霜法杖與雪花魔法陣 |
| 賢者 / sage | `outfit-sage-frost.webp` | 女性冰系魔拳賢者，元素拳套與四元素浮空法書 |
| 十字斬首者 / assassin | `outfit-assassin-frost.webp` | 女性冰影刺客，雙腕拳刃與低姿態突襲造型 |
| 流氓 / rogue | `outfit-rogue-frost.webp` | 女性冰霜遊俠型流氓，華麗羽帽、手弩與短刃 |
| 主教 / priest | `outfit-priest-frost.webp` | **依玩家第三次回饋從頭重新繪製**：自然三分之四側身站姿、隨著頭部透視貼合髮際的短型主教冠帽與披肩、冰晶十字杖及治療祝禱；重點為整體佩戴無違和感，不刻意要求立正置中 |
| 修羅 / monk | `outfit-monk-frost.webp` | **已重新繪製差異版**：男性短髮赤膊冰紋武僧、粗獷獸首雙拳套、巨型念珠與銅色曼荼羅；刻意區分賢者的女性四元素魔拳 |
| 遊俠 / hunter | `outfit-hunter-frost.webp` | 女性冰雪弓手，銀藍長弓、冰箭與雪鴞羽披風 |
| 舞孃 / performer | `outfit-performer-frost.webp` | 男性冰晶樂師，銀藍豎琴與冰雪音律長袍 |
| 君王 / pactWarrior | `outfit-pactWarrior-frost.webp` | 男性冰霜契約君王，長型魔法杖劍與單枚浮空契約晶體 |
| 萬靈 / spiritCommander | `outfit-spiritCommander-frost.webp` | 女性寒霜萬靈指揮官，雙契約印記魔典與銀藍戰術長衣 |

十二張均使用現有 `dist/assets/cosmetics/fixed-<job>-0.webp` 作為職業識別／精緻度參考；新圖逐張獨立生成並保留真透明。修羅因初版與賢者辨識度不足，已依需求全面重繪。**素材已齊，尚待完整換裝接入與 UI 驗收。**

美術已完成，全部為獨立生成的 1024×1504 透明 WebP，不能把舊版修羅重新接回。注意君王與萬靈現為**單夥伴職業**，圖片只表現職業技能／契約意象，沒有要求雙夥伴角色立繪。

## 第 30 層時裝已接入測試分支（待瀏覽器視覺驗收）

1. 新增 `dist/tower-costumes.js` 管理十二職業的永凍時裝、30 層通關和三轉驗證、手動穿戴互斥；不參與任何戰鬥數值。
2. `dist/game.js` 角色外觀選單加入單張本職業永凍時裝；未通關顯示鎖定，通關後可選擇或取消。
3. 首頁角色立繪與登入選角按同一 `towerCostume` 存檔欄位顯示；已有原階級／金幣外觀時互斥，選用塔時裝會清掉其他穿著設定。
4. 新增 `tests/tower-costumes.test.mjs` 純邏輯及原介面整合回歸；測試通過不等於已完成實際瀏覽器驗收。
5. **待辦：** 啟動測試頁，測試未解鎖／第 30 層通關／更換職業／登入選角／重新載入／尺寸對齊及存檔流程，尤其精靈雙職立繪。尚未合併 `main`。

## 既有邏輯驗證

- 前 30 層首通合計 2,130 塔幣，重複挑戰每日上限 150。
- 天穹商店可買名稱框、背景、三首領收藏；稱號和名稱框不可疊加。
- 先前 52/52 項塔／外觀相關邏輯測試通過；本地某些既有時裝檔案因 sparse checkout 缺失，不能把未執行的圖片全量驗證說成通過。
