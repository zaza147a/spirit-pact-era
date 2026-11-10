# 十二職業新基準測試｜分段交接 01

日期：2026-11-10；分支：`test/12-jobs-optimal-loadout-20261110`

## 本輪唯一有效的測試條件

- 全十二職、Lv.210、總配點 438、單項 150。
- Lv.200 神話裝備與夥伴裝備，全部 SSS；契印 8。
- **僅一隻融合夥伴**，等級 200、神話 SSS、高階人形，返鄉任務完成。
- 人物非武器裝備固定優先六詞：`DEF / MDEF / FLEE / LUK / STR|INT|DEX / HP%`。攻擊屬性依近戰／魔法／遠距選一項。
- 武器保留必要的主攻詞條，優先 `LUK`、對應主攻屬性；最高特殊詞條比較 `暴擊傷害` 與 `攻速加成`。杖劍保留雙攻固有規格。
- 卡片以合法槽位的首領卡為第一優先，按職業與攻防用途選擇，不重複使用同一張唯一卡。
- 輸出、承傷、清怪必須透過實際戰鬥引擎；不得把公式分數冒充實戰結果。

## 已完成（第 1 段）

- 建立新的獨立測試分支，不修改正式版。
- 新增 `tests/fixtures/twelve-job-loadout-policy.mjs`，集中設定配裝、首領卡及合法性檢查。
- 新增 `tests/twelve-job-loadout-policy.test.mjs`，測試十二職業的暴傷／攻速雙方案，共 24 套詞條政策驗證。
- 正式的神話裝備每件為五條普通詞加一條特殊詞；不能任意超出六條。
- 既有歷史測試與排名保留供追溯，但**新測試完全不引用舊排名作為結果**。

## 尚未完成（不得宣稱有新排名）

1. 將返鄉 `claimed` 路線與對應夥伴 `homecomingEvolved` 納入每個新候選存檔，驗證其實際加成。
2. 搜尋每職合法武器形態（包括盾、雙短、拳刃、遊俠三武器）及六種單融合夥伴；君王主攻依最終夥伴實際物攻／魔攻判定。
3. 優化 438 合法配點、技能施放順序、角色／寵物 SSS 裝備和首領卡。
4. 同一最終配置跑單體、201～210 含首領混戰、受傷壓力三種**真實戰鬥**，多種隨機種子，記錄 DPS、擊殺數、剩餘 HP／復活、承傷界線。
5. 產出新的十二職業排序與配置、測試限制；每階段更新本文件並另行提交／推送。

## 注意

- 歷史 `tests/spirit-201-mixed-build-search.mjs` 和 `tests/fixtures/spirit-high-level-player.mjs` 還有舊雙夥伴內容，不得直接當本輪實戰排名。
- `tests/fixtures/homecoming-player.mjs` 已具單夥伴、SSS 裝備、契印 8 的近似條件，但 `fourth:true` 的歷史簡化欄位尚待核對現行 `homecoming.routes[route].phase='claimed'` 計算方式。
- 目前尚未進行新十二職業的 DPS／承傷／清怪實測。舊測試結果全部視為不適用。

## 回歸指令

`node tests/twelve-job-loadout-policy.test.mjs`

## 分段交接 02：舊跑分與五連戰報告清理

- 使用 GitHub 連線正式建立並上傳此分支（第 1 段遠端提交 `dcd5a2d`）；主分支不變。
- 清除舊五連戰跑分、Lv210 排名、DPS 最佳化報告與配套批次腳本；不再重跑、不再引用舊排名。
- 移除舊排名在 GitHub Actions 的排程項目、以及已停用的完整五連戰矩陣工作流程。
- **保留** `dist` 內的實際五連戰／極限試煉戰鬥功能，以及它們的行為回歸測試。這不是移除遊戲中的試煉。
- 保留仍由武器補償測試產檔工具引用的 `scripts/optimized-dps-simulator.mjs`；它只是一個工具相依，不作為新排行榜來源。
- 測試：本輪 12 職配裝政策、`extreme-trials-integration`、`homecoming-state` 均通過。
- 刪除的檔案仍能由 Git 歷史還原，但不再存在本測試分支最新版本中。
- 下一段仍須完成真實單體、清怪與承傷測試；不要將目前的配裝政策檢驗解讀為完整戰鬥驗收。

## 分段交接 03：舊最優存檔依賴完全退役

- 應使用者要求，**無盡之塔歷史跑分工具亦移除**；保留 `dist` 遊戲內功能，日後需要測試時以新規格重建。
- 刪除原 `legacy-best-v6559` 十職 Lv210 存檔、舊君王／萬靈 `spirit-single-pet-optimal-210` 存檔與壓力報告。
- 移除所有直接引用上述檔案的舊分析、極限試煉探針、舊瀏覽器驗收，以及後續依賴探針的排名驗證。
- 移除已完成的新職業／返鄉合併前專用 Actions（`spirit-premerge-browser.yml`、`homecoming-premerge.yml`），以及已停用的舊披風、返鄉待測矩陣工作流程。
- 使用 `rg` 確認 `.github`、`scripts`、`tests`、`dist` 無 `legacy-optimal-player`、`legacy-best-v6559`、`spirit-single-pet-optimal-210`、`spirit-premerge-acceptance` 或舊塔腳本引用。
- 新配裝政策測試、返鄉狀態、極限試煉整合、無盡之塔遊戲功能整合均通過。
- **未刪除任何 `dist` 遊戲功能。** 仍保有與舊最優存檔無關的必要功能回歸測試。
- 尚未重跑十二職業單體／承傷／清怪實戰；不引用舊報告數據。

## 分段交接 04：全新合法存檔產生器

- 新增 `tests/fixtures/current-210-endgame-player.mjs`：以現行程式建立單融合 SSS 寵物、十二條返鄉 `claimed`、進化標記、契印8、神話 SSS 六詞條與合法首領卡候選，**不讀取任何舊最優存檔**。
- 新增 `tests/current-210-endgame-fixture.test.mjs`，驗證十二職 × 六無序融合 × 兩種武器特殊詞，共 **144/144** 份候選構造通過。
- 不再引用任何舊最佳存檔，已驗證十二職單寵、返鄉標記與 144 份候選合法性。
- 尚須核對君王的實際物魔主攻判定與對應 STR／INT 換裝、職業多武器選擇、王卡更完整的效果評分、合法配點搜尋。

## 分段交接 05：唯一驗收模式改為極限試煉

- 使用者已明確撤回野外測試；`scripts/current-12-job-field-screen.mjs` 與 `docs/current-12-job-field-screen-20261110.json` 已從分支移除。**禁止引用野外 DPS、擊殺數作為排名。**
- **唯一有效結果是遊戲既有四域極限試煉最高通關層數**：
  - `ATK`：物理承傷最高通關層數。
  - `MATK`：魔法承傷最高通關層數。
  - `HP`：單體持續輸出最高通關層數（達傷害門檻）。
  - `CLEAR`：清怪最高通關層數（達擊殺門檻）。
- 測試必須使用 `dist/game.js` 的 `startExtreme`／`spawnExtremeBoss`／`tickExtreme` 正式流程，以及 `dist/extreme-trials.js` 的階段進度和判定；不得自訂替代怪物或壓力倍率。
- 四項目允許各自使用不同最優配置；尚未得出任何正式最高層數。
- 新增 `tests/current-extreme-trials-entry.test.mjs`，使用 `runtime31-helper` 加載真正的 `dist/game.js`，呼叫遊戲的 `startExtreme`，以實際 `combatTick` 推進 31 秒。
- 四個模式都成功入場及由遊戲內流程更新進度；這只驗證真實試煉入口與結算，**尚非最高層數排名**。
- 下一段：直接用同一引擎持續挑戰至第一次失敗，並對四模式分別最佳化配點／武器／融合／王卡；每段都保存原始配置、種子、最高通關層、失敗原因。

## 分段交接 06：真正的連續極限試煉

- 新增 `scripts/current-extreme-continuous-benchmark.mjs`：建立新合法單夥伴存檔，在 `dist/game.js` 內呼叫真實 `startExtreme`，每 100ms 執行 `combatTick`，從第1層持續至首次失敗；可指定職業、融合、暴傷或攻速、測試模式。
- 嚴格區分 `stopped='first-failure'`（已確認最高層）與 `stopped='safety-ceiling'`（僅下界，不可稱為最高層）。
- 第一份單候選流程驗證：盧恩騎士、攻擊＋魔法、暴傷武器，其實際 `ATK` 139 層（140 戰敗）、`MATK` 120 層（121 戰敗）、`HP` 33 層（34 傷害不足）、`CLEAR` 35 層（36 擊殺不足）。**僅一套候選的流程驗證，不是職業最佳解或排名**。
- 上述數字是工具 stdout 煙霧驗證，尚待多種融合／武器／配點和隨機種子複測；不能據此平衡遊戲數值。
- 下一段：逐職逐模式搜尋最優候選並記錄完整原始配置。四模式各自可以有不同最優配置。

## 分段交接 07：四職業完整四域基準

- 新增 `scripts/current-extreme-baseline-batch.mjs`，多程序執行 `current-extreme-continuous-benchmark.mjs`，僅以**真實極限試煉最高通關層數**為資料來源。
- 修正測試器：支援固定種子及真正亂數決策，並區分 `first-failure`、`floor-ceiling`、`time-ceiling`；舊零亂數測試不得混為相同成績。
- 第一批盧恩、皇家、星界、元素共 16 項，皆從第1層打到首次失敗；原始結果 `docs/current-extreme-baseline-batch1-20261110.json`。
- **尚非最優配置**：六種融合只用了攻擊＋魔法、武器只用預設型態／暴傷詞、固定配點、單一種子20261110。這份資料只用於確認工具能跑出四域全程結果與建立優化前基準。
- 下一段應繼續其他八職業，然後逐項選擇真正最優配裝；沒有複測前禁止發布最終排名。

## 分段交接 08：第二批四職業基準

- 斬首、逐影、主教、修羅四職，共 16 項皆為正式四域試煉從第1層打到首次失敗。
- 結果：`docs/current-extreme-baseline-batch2-20261110.json`；條件仍是攻擊＋魔法、暴傷武器、固定合法配點、同一種子，不是最佳解。
- 已完成 8／12 職初始基準，餘下遊俠、天籟、君王、萬靈；完成後開始各模式配裝優化。

## 分段交接 09：十二職業初始四域基準完整

- 完成最後四職業（遊俠、天籟、君王、萬靈），原始輸出 `docs/current-extreme-baseline-batch3-20261110.json`；至此全十二職 × 四域 = **48 個從第1層打到首次失敗的真實試煉樣本**。
- **重大限制**：每職只有攻擊＋魔法、預設武器、暴傷特殊詞、固定配點、一個種子；不能視為各職業真正最佳配置，也不適合直接用來調整職業傷害。
- 君王在固定攻魔組合出現 `HP=0`、`CLEAR=2`，與使用者 HP 已達40層的實際紀錄不符。更換攻擊＋輔助後同一測試器得到 `HP=33`、`CLEAR=34`，證明融合選擇影響極大；**不得引用前述攻魔君王作為弱職結論**。
- 下一段立即進行六融合 × 暴傷／攻速，再比較各合法武器與配點；尤其君王必須驗證依 ATK/MATK 決定主攻的規則，直到找到不低於使用者實測的合理配置，否則標示未收斂。

## 分段交接 10：君王 HP／CLEAR 十二候選搜尋

- 新增 `scripts/current-extreme-candidate-search.mjs`，直接跑遊戲極限試煉（非野外測試），搜尋六種無序融合 × 暴傷／攻速兩種武器特殊詞。
- `docs/current-extreme-candidates-pactWarrior-20261110.json` 保存 12 套候選、24 個四域結果（HP/CLEAR），全部到首次失敗。
- 本輪固定配點、預設杖劍、首領卡選擇規則下，`attack-support + aspdPct` 的候選最高：**HP 35、CLEAR 37**。
- **使用者已實測君王 HP ≥40**，故本輪尚未找到真正最佳配置；不得將 35 層作為君王最高層或用來做職業平衡。
- 下一階段要搜尋 STR/INT 主攻切換、438 點合法配點、可用首領卡組合、技能優先順序與多亂數種子，並保留使用者 HP40 這一個最低驗收門檻。

## 分段交接 11：君王配點搜尋達到使用者實測

- `tests/fixtures/current-210-endgame-player.mjs` 新增合法 438 點／單項150的副屬性配置候選：`reference`、`agi-vit`、`luk-vit`、`dex-vit`、`agi-luk`、`vit-luk`、`dex-luk`。
- `scripts/current-extreme-candidate-search.mjs` 及連續測試器可透過 `EXTREME_PROFILES`／`EXTREME_ATTRIBUTE_PROFILE` 搜尋與複測。
- 在君王 `attack-support` 配合暴傷／攻速兩種詞，十四候選、28 次真實 HP/CLEAR 試煉中，`agi-luk + aspdPct` 得到 **HP 40（41傷害不足）、CLEAR 43（44擊殺不足）**。
- 此組人物基礎配點：**STR 150、AGI 150、LUK 141，其餘1**。結果 `docs/current-extreme-king-attributes-20261110.json`。
- 已達使用者君王 HP40 的已知下界，證明先前固定 VIT 配點會低估君王；**這仍是有界候選搜尋，並非全局最佳或跨種子穩定成績**。
- 下一段：固定此候選先做多種子複測，再搜尋其他職業與更多合法武器／首領卡／技能優先序。

## 分段交接 12：君王四種子複測

- 對 `attack-support`、`aspdPct`、`agi-luk`（STR150、AGI150、LUK141）使用四組種子 20261110／471122／93217／81733，全部以正式 HP/CLEAR 試煉從第1層打至失敗。
- HP 通關層：**40、41、41、41**；CLEAR 通關層：**43、43、43、43**，詳見 `docs/current-extreme-king-multiseed-20261110.json`。
- 此配置已跨四種子達到使用者 HP40 的下界，且 CLEAR43 穩定；但是仍不能稱為全局最優（其他武器、王卡、技能排序尚未全面搜尋）。
- 下一段先比較其他職業的 `agi-luk` 等配點與融合，再對各模式做真正的配置收斂；**不得拿原本固定 VIT 的 12 職基準表直接做最終排名**。

## 分段交接 13：主教四域候選搜尋與斷點續跑

- `scripts/current-extreme-candidate-search.mjs` 新增每完成一套配置即更新 JSON 的**可續跑檢查點**；重啟後按同一組搜尋條件跳過已完成配置，避免工作中斷重算。不同搜尋簽章會拒絕覆蓋原結果。
- `docs/current-extreme-priest-search-20261110.json`：主教六種無序融合 × 武器暴傷／攻速 × `reference`／`agi-luk` 兩種合法配點，共 **24 套配置、96 項正式四域極限試煉**，均從第1層跑到首次失敗；種子 20261110。
- 本次有界搜尋的各域最高通關層：**ATK 170**（攻防融合＋暴傷）、**MATK 131**（攻防融合＋攻速）、**HP 33**（防輔融合＋攻速）、**CLEAR 35**（防輔融合＋暴傷）。各域可能使用不同配點，精確配置以結果 JSON 的 `best` 為準。
- **不是主教全局最優**：尚未比對其他五種合法配點、全部可用武器型態、王卡替代組合、技能順序與多種子；不得拿這一輪有界結果作最終全職排名。
- 下一段：逐職搜尋其餘十一職，君王還須補完 ATK／MATK；搜尋器可在中斷後依完全相同環境變數與輸出路徑續跑。每一職完成後更新此交接並推送測試分支，正式 `main` 不變。

## 分段交接 14：盧恩／皇家搜尋進行中（可續跑檢查點）

- 已啟動 `knight` 與 `crusader` 兩職，搜尋條件：六融合 × `critDmg`／`aspdPct` × `reference`／`agi-luk`，每套均跑 ATK/MATK/HP/CLEAR 四域，種子20261110。
- `docs/current-extreme-knight-search-20261110.json` 與 `docs/current-extreme-crusader-search-20261110.json` 在每套配置完成後自動更新，**目前仍為 PARTIAL**，不得用 `best` 作最終成績。
- 原執行指令：`EXTREME_JOB=knight EXTREME_CONCURRENCY=2 EXTREME_PROFILES=reference,agi-luk EXTREME_MODES=atk,matk,hp,clear EXTREME_OUTPUT=docs/current-extreme-knight-search-20261110.json node scripts/current-extreme-candidate-search.mjs`；皇家以 `crusader` 取代 `knight`。可重啟續跑，既有結果不會重算。
- 下一段須等待兩職各完成24套，記錄四域最強候選，更新交接並再次推送；不修改 `main`。

## 分段交接 15：盧恩騎士24套完整候選

- `docs/current-extreme-knight-search-20261110.json` 已由 `PARTIAL` 轉為 `BOUNDED SEARCH COMPLETE`：六融合 × 兩武器詞 × 兩種配點，共24套／96次四域真實試煉，均記錄首次失敗及下一層。
- 本輪各域最高：**ATK 187**（防輔＋暴傷）、**MATK 137**（攻防＋暴傷）、**HP 34**（攻防＋暴傷）、**CLEAR 38**（攻輔＋暴傷）。詳細最佳配點位於 JSON 的 `best`。
- 這是固定一個亂數種子、兩種配點及預設可用武器／王卡下的**有界最強候選**，不構成全局最優證明；其餘配點、武器型態、王卡及技能順序還待優化。
- 皇家搜尋仍進行中；空出的測試程序開始巫師（同24套四域條件）。

## 分段交接 16：皇家守衛24套完整候選

- `docs/current-extreme-crusader-search-20261110.json` 已完整結算24套／96項正式試煉，所有最佳值均首次失敗後取得。
- 本輪最高 **ATK 222**（魔防融合＋暴傷）、**MATK 162**（防輔融合＋暴傷）、**HP 33**（攻魔融合＋暴傷）、**CLEAR 36**（攻魔融合＋攻速），配點見 JSON `best`。
- 皇家目前呈現較強雙承傷定位，但僅能說是在同一批候選／種子內；尚未做全部武器、配點、王卡及多種子搜尋，不能作最終平衡判定。
- 巫師搜尋持續；賢者接上皇家空出的資源，兩職皆使用同樣的24套、四域、固定種子條件。

## 分段交接 17：大法師24套完整候選

- `docs/current-extreme-wizard-search-20261110.json` 已完整結算24套／96項正式試煉；四域最高 **ATK 155**（防輔＋攻速）、**MATK 118**（防輔＋攻速）、**HP 33**（魔防＋暴傷）、**CLEAR 37**（攻輔＋暴傷）。
- 每項最高皆由首次失敗確定；本輪仍僅兩組配點、預設武器／卡片、一個亂數種子，不能當作大法師全局最佳。
- 賢者繼續執行；斬首接替大法師進行同規格搜尋，之後逐一轉往剩餘職業。

## 分段交接 18：四職並行斷點保全

- 已啟動 `sage`、`assassin`、`rogue`、`monk` 四職的真實四域候選搜尋，均使用六融合、兩武器詞、`reference`／`agi-luk`、種子20261110；各自共24套，執行中 JSON 為 `PARTIAL`。
- 對應檢查點分別是 `docs/current-extreme-sage-search-20261110.json`、`docs/current-extreme-assassin-search-20261110.json`、`docs/current-extreme-rogue-search-20261110.json`、`docs/current-extreme-monk-search-20261110.json`。
- 所有輸出每完成一套即落盤；若程序消失可將 `EXTREME_JOB` 設為檔名職業、`EXTREME_OUTPUT` 指向同一結果檔，並指定 `EXTREME_CONCURRENCY=2 EXTREME_PROFILES=reference,agi-luk EXTREME_MODES=atk,matk,hp,clear` 重新執行 `node scripts/current-extreme-candidate-search.mjs`；會自動跳過已完成配置。
- **上述四職尚未完成24套，`best` 只是當下檢查點；禁止用於排名。** 完成時再更新最高層與提交完整資料。

## 分段交接 19：斬首24套完整候選

- `docs/current-extreme-assassin-search-20261110.json` 完成六融合×兩武器詞×兩配點，共24套／96項正式極限試煉；最高值均為首次失敗後所得。
- 本輪最高 **ATK 143**（防輔＋暴傷）、**MATK 121**（防輔＋攻速）、**HP 35**（攻魔＋暴傷）、**CLEAR 36**（攻魔＋暴傷）。完整最佳配點與失敗原因見 `best`。
- 仍不是全部武器、王卡及配點的全球最優；僅是與其他職相同範圍的有界候選比較。
- 遊俠接替斬首空出的資源；賢者、逐影及修羅尚在執行。

## 分段交接 20：賢者24套完整候選

- `docs/current-extreme-sage-search-20261110.json` 完成六融合×兩武器詞×兩合法配點，共24套／96項正式四域試煉，四個最佳值均記錄首次失敗。
- 本輪最高 **ATK 157**（防輔＋暴傷）、**MATK 144**（防輔＋攻速）、**HP 34**（魔輔＋暴傷）、**CLEAR 36**（魔輔＋暴傷）；精確最佳屬性組合及失敗原因見 JSON。
- 仍是固定單種子和部分配裝空間的有界結果；尚待完整武器型態／王卡／所有配點／多種子複測，不能作最終平衡結論。
- 天籟接替賢者空出的測試資源，逐影／修羅／遊俠仍在執行。

## 分段交接 21：逐影24套完整候選

- `docs/current-extreme-rogue-search-20261110.json` 完整24套／96項四域真實試煉，全部從第1層跑到首次失敗。
- 本輪最高 **ATK 153**（防輔＋暴傷）、**MATK 122**（魔防＋攻速）、**HP 34**（攻防＋暴傷）、**CLEAR 37**（攻輔＋暴傷）；詳細配點、下一層失敗原因及種子見原始 JSON。
- 僅為此搜尋空間中的最強候選；其他合法配點、武器型態、王卡及技能優先序尚未搜尋，不可作全局最佳。
- 靈契君王接替逐影的資源，開始包含 ATK／MATK 的四域24套搜尋；已有的君王四種子 HP/CLEAR 配置仍作已知下界，不用舊基準覆蓋。

## 分段交接 22：修羅24套完整候選

- `docs/current-extreme-monk-search-20261110.json` 完整24套／96項真實四域試煉；均以從第1層連續打到首次失敗確定最高層。
- 本輪最高 **ATK 169**（防輔＋暴傷）、**MATK 131**（防輔＋攻速）、**HP 34**（攻輔＋暴傷）、**CLEAR 38**（攻輔＋暴傷）；完整最佳屬性與失敗原因見 JSON。
- 仍僅是固定種子、兩合法配點、預設武器／卡片的有界候選，不可稱為全局最優。
- 萬靈宗師接替修羅空出的資源，與遊俠、天籟、君王並行；四職全部有自己的可續跑檢查點。

## 分段交接 23：最後四職搜尋中途保全

- 目前進行 `hunter`、`performer`、`pactWarrior`、`spiritCommander`；結果分別保存於 `docs/current-extreme-hunter-search-20261110.json`、`docs/current-extreme-performer-search-20261110.json`、`docs/current-extreme-pactWarrior-search-20261110.json`、`docs/current-extreme-spiritCommander-search-20261110.json`。
- 搜尋條件與前八職相同：六融合 × 兩武器詞 × `reference`／`agi-luk` 配點 × ATK/MATK/HP/CLEAR，種子20261110，每職24套。每完成一套即更新結果檔，任何 `PARTIAL` 不可當最終成績。
- 若中斷，設定 `EXTREME_JOB=<job> EXTREME_CONCURRENCY=2 EXTREME_PROFILES=reference,agi-luk EXTREME_MODES=atk,matk,hp,clear EXTREME_OUTPUT=docs/current-extreme-<job>-search-20261110.json` 後執行 `node scripts/current-extreme-candidate-search.mjs`，自動跳過完成配置。
- 君王另有 `docs/current-extreme-king-multiseed-20261110.json` 的 HP40／CLEAR43 穩定下界；新24套搜尋須與此比較，不能把較弱候選當成最高通關。

## 分段交接 24：遊俠24套完整候選

- `docs/current-extreme-hunter-search-20261110.json` 已完成24套／96項正式四域極限試煉，所有最高值均以首次失敗確定。
- 本輪最高 **ATK 133**（防輔＋攻速）、**MATK 114**（防輔＋攻速）、**HP 35**（攻輔＋攻速）、**CLEAR 37**（攻輔＋攻速）。精確配點與失敗原因見 JSON `best`。
- 這是同一種子、兩配點、預設武器及首領卡組合的有界搜尋，不能作遊俠最終上限或調整職業傷害的唯一根據。
- 剩餘天籟、靈契君王、萬靈宗師仍進行中；最終還需核對十二職 JSON 的完整度、上限停機、產生比較表並測試。

## 分段交接 25：天籟24套完整候選

- `docs/current-extreme-performer-search-20261110.json` 完成24套／96項正式四域試煉，各最高值皆於首次失敗後記錄。
- 本輪最高 **ATK 135**（攻防＋攻速）、**MATK 123**（防輔＋攻速）、**HP 36**（魔輔＋攻速）、**CLEAR 38**（魔輔＋暴傷）；最佳配點及失敗理由在 JSON `best`。
- 同樣僅是六融合、兩武器詞、兩配點、一個種子、預設武器／王卡的有界搜尋；不代表舞孃／天籟真正全局最高。
- 目前已有十職完成本輪搜尋，剩君王、萬靈兩職；最後仍需整體比對及必需的回歸測試。

## 分段交接 26：君王／萬靈中途保全

- 前十職已是各24套完整有界搜尋，原始 JSON 與交接均已推送測試分支。
- `docs/current-extreme-pactWarrior-search-20261110.json` 與 `docs/current-extreme-spiritCommander-search-20261110.json` 仍屬 `PARTIAL`；兩職單獨執行，按六融合 × 兩武器詞 × 兩配點 × 四域，每完成候選就落盤，可依分段23的設定續跑。
- **特別注意**：君王先前四種子 HP40／CLEAR43 的候選是已知下界。這一輪搜尋包含所有融合及兩種配點，但不能以單種子低分候選否定既有下界。
- 待兩職完整完成，必須核對全部12職 `completed===tasks===24`、四項 `best.stopped==='first-failure'`，才可輸出暫定比較；不可稱為全局最佳。

## 分段交接 27：靈契君王24套四域完整候選

- `docs/current-extreme-pactWarrior-search-20261110.json` 完成24套／96項正式四域試煉，均從第1層跑到首次失敗。
- 本輪最高 **ATK 178**（魔輔＋攻速）、**MATK 156**（魔防＋暴傷）、**HP 40**（攻輔＋攻速）、**CLEAR 43**（攻輔＋攻速），配點見 JSON `best`。
- `HP40／CLEAR43` 與之前 `attack-support`＋`aspdPct`＋`agi-luk` 的結果相符，且該配置早已在四種子下得到 HP40／41／41／41、CLEAR43／43／43／43；**不可用本輪其他較差融合推翻已知下界**。
- 這仍只是兩種配點、固定杖劍／卡片與單種子之有界最強；君王其他配點及首領卡可再優化。萬靈宗師仍進行中，完成後才能建立十二職本輪同條件比較表。

## 分段交接 28：萬靈完成，十二職本輪候選全部收斂

- `docs/current-extreme-spiritCommander-search-20261110.json` 完成24套／96項正式四域試煉；本輪最高 **ATK 177**（防輔＋攻速）、**MATK 153**（防輔＋攻速）、**HP 38**（攻魔＋暴傷）、**CLEAR 41**（攻魔＋暴傷）。四項均以首次失敗確認。
- **十二職全部完成本次有界搜尋：12職 × 24套 × 4模式 = 1,152 次真實極限試煉。** 核對全部十二份 JSON，均 `completed=24`、`results.length=96` 且每一筆 `stopped=first-failure`；沒有任何安全上限或時間上限樣本混入比較。
- 新增 `docs/current-extreme-twelve-jobs-comparison-20261110.md`，列出全部十二職四域比較、測試條件、精確限制和下一步。這是**第一輪兩配點、有界候選最佳**，不是全局最優；不可用於直接砍君王或當成250等四轉平衡結果。
- `node --test tests/current-210-endgame-fixture.test.mjs tests/current-extreme-trials-entry.test.mjs` 全過（兩檔，144／144合法配置）；`git diff main...HEAD -- dist` 無異動。正式 `main` 不變。
- **仍待下一輪**：擴展全部合法配點／不同可用武器／更完整王卡及技能順序／多種子複測，才能稱「每職最佳配置」；四轉本源技能、250等與十二大陸怪物尚未在此測試分支動工。本輪沒有修改正式遊戲平衡。

## 分段交接 29（2026-11-11）：五種其餘合法配點針對性補測

- 新增 `scripts/current-extreme-profile-refinement.mjs`：讀取十二職第一輪各域最佳融合／武器詞，固定該候選，使用 `agi-vit`、`luk-vit`、`dex-vit`、`vit-luk`、`dex-luk` 五種先前沒跑的合法配點，在正式四域各自從第1層測到首次失敗。各域各5套、全部20項／職。
- 分域輸出到 `docs/current-extreme-refine-<job>-<mode>-20261111.json`，沿用檢查點恢復機制，不覆蓋第一輪報告；`EXTREME_JOB=<job> node scripts/current-extreme-profile-refinement.mjs` 即可恢復未完成的域。
- **靈契君王補測完成**：四域各5套、合計20項均為首次失敗；在固定第一輪各域最佳融合／武器詞的條件下，沒有超過原先 **ATK178／MATK156／HP40／CLEAR43**。原本已複測 HP40／41、CLEAR43 的已知下界仍成立。
- 皇家守衛與大主教正在執行同一補測；各職其他融合搭配新增配點、不同武器型態、卡片及技能排序仍未全面搜索，**不可據此宣稱全局最優**。
- 本段只新增獨立測試程式和文件，`dist` 與正式 `main` 不變。

## 分段交接 30：皇家守衛第二輪配點補測

- `docs/current-extreme-refine-crusader-{atk,matk,hp,clear}-20261111.json` 四份報告完成共20次正式試煉，全部首次失敗。
- **MATK 魔法承傷由162提升到168層**：原最佳 `defense-support`＋`critDmg` 不變，採 `agi-vit` 配點（其他裝備與首領卡政策仍固定）；ATK222、HP33、CLEAR36暫未超過。
- 這次證實只用前兩種配點會低估部分承傷職業，故先前十二職比較表需附註「第一輪」，不得當最終排名。
- 大主教與盧恩騎士的第二輪仍進行中；完成後逐職提交，避免任務中斷重做。

## 分段交接 31：大主教第二輪配點補測

- `docs/current-extreme-refine-priest-{atk,matk,hp,clear}-20261111.json` 四域共20次完整首次失敗試煉。
- **ATK 物理承傷由170提升到175層**，沿用攻防融合、暴傷武器，最佳新配點為 `dex-vit`；MATK131、HP33、CLEAR35未超過。
- 盧恩與大法師第二輪進行中。每職新配點只固定第一輪該域最佳融合／武器，不能排除「次佳融合＋新配點」成為真正最優的可能。

## 分段交接 32：盧恩騎士第二輪配點補測

- `docs/current-extreme-refine-knight-{atk,matk,hp,clear}-20261111.json` 四域各五種新配點，共20次首次失敗結算。
- 固定第一輪各域最佳融合和武器詞後，**ATK187／MATK137／HP34／CLEAR38** 均未被五種新配點超過；只說明這個固定條件下未改善。
- 大法師與賢者繼續補測，結果仍不代表全面最佳。

## 分段交接 33：大法師第二輪配點補測

- `docs/current-extreme-refine-wizard-{atk,matk,hp,clear}-20261111.json` 共20次真實極限試煉均首次失敗。
- **MATK 魔法承傷由118提升到129層**：保持防輔融合＋攻速武器詞，新配點 `luk-vit`；ATK155、HP33、CLEAR37未被新配點超過。
- 賢者與斬首正在執行第二輪五種配點；本輪只比較該域第一輪最佳融合／武器詞下的七種配點，不是全部融合×全部配點。

## 分段交接 34：元素賢者第二輪配點補測

- `docs/current-extreme-refine-sage-{atk,matk,hp,clear}-20261111.json` 共20項全部首次失敗。
- 固定原最佳融合／武器詞後，新增五種配點都沒超過 **ATK157／MATK144／HP34／CLEAR36**；仍待跨融合與武器型態交叉驗證。
- 斬首與逐影正在第二輪補測。
