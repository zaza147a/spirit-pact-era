# 極限試煉48套V2戰袍：遊戲內顯示尺寸修正交接（2026-11-09）

## 原因與範圍

- V2原畫為1024×1536的直式透明背景全身圖；`compact-v5.css` 將通用角色欄圖像縮成約70×80，直式戰袍因此顯得過小。
- 只針對 `.extreme-outfit-equipped` 在 `dist/extreme-trials.css` 新增覆蓋規則：桌面遊戲角色欄115×170、窄畫面96×144；衣櫃戰袍預覽從108×114提高到126×150。
- 原本CSS的 `object-fit:contain` 保留。未重畫、裁切或重新壓縮48張WebP；一般、金幣、SSS其他時裝不變。
- `dist/index.html` 把專用CSS版本更新為 `2-mantle-portrait-size`，避免舊快取影響觀察。
- 新增 `tests/extreme-mantle-display-size.test.mjs`，並重跑極限試煉回歸以驗證圖片解析與角色顯示選擇器。

## 萬軍魔主（CLEAR）戰鬥畫面附帶修正

- 玩家截圖顯示「萬軍魔主」大型肖像蓋滿戰鬥區，導致清怪軍勢不在可見範圍。原因是此Boss特例使用 `img.extreme-boss-art`，未繼承無盡塔通用 `.art-monster` 的160×150尺寸限制，直接以WebP原始尺寸撐大版面。
- 在同一 `dist/extreme-trials.css` 補齊 `#encounter .tower-monster-portrait img.extreme-boss-art`：桌面最大160×150、小螢幕高度110，保持完整等比例呈現、不裁切；軍勢區 `.extreme-minion-grid` 固定在可用寬度內（寬度100%、最小寬度0）。
- 新增靜態回歸：確認Boss圖尺寸限制、仍保留軍勢網格及五欄布局。未修改軍勢數量、擊殺門檻、首領數值或戰鬥判定。

## 其他留意事項

- 從2026-11-09的遠端main匯出時，既有 `docs/HANDOFF_EXTREME_MANTLES_V2_2026-11-08.md` 內容是非UTF-8的二進位資料，無法以純文字補寫。本次新增本檔，保留原檔不覆寫，後續應另外調查其Git儲存內容。
- 本次不涉及試煉通關、掉落、獎勵、角色平衡或已完成最高層計算。
- 本地完整極限試煉專項測試 `node --test tests/extreme-*.test.mjs`：**98／98通過**（含新增的角色圖尺寸與萬軍魔主清怪畫面驗證）。先前單獨執行六個顯示、資產及切換測試也全部通過；這些屬於98項的子集合，不能重複加總。
- GitHub修正分支、提交SHA與正式版發布驗證應於實際完成後再加註。

## 依玩家實際截圖第二次修正（2026-11-09）

- 戰袍第一次擴大角色欄左側圖像後，玩家實際截圖顯示圖像與名稱、稱號、名稱框交錯重疊；已撤回「角色卡左側115×170＋文字左移」的布局，改為**角色卡上方獨立立繪區**（桌面約124×174，卡片預留188px上方空間；名稱與稱號位於下方），保持圖像比例並避免遮蔽身分資訊。
- 第二張CLEAR王截圖證實：首領圖已縮到正常尺寸，**小怪仍完全不顯示**。原先軍勢 `.extreme-minion-grid` 置於首領卡外部；此次將軍勢列表嵌入 `.tower-encounter` 卡片內的 `extreme-minion-roster`，在Boss資訊下方顯示「場上軍勢 · 點擊指定目標」。保留每隻小怪點擊選取與HP資訊。
- `dist/index.html` 更新CSS和 `game.js` 載入版本，避免玩家拿到新CSS卻仍使用舊JS。新增結構測試，保證軍勢網格在首領卡**內部**，可避免舊布局再度出現。
- 先前已推送main的提交 `22d7cf55e89df1087cfc5ee769982e23ddee194e` 仍是第一版；本段是後續修正，新的分支／SHA／部署狀態需要另行核對後才可宣稱上線。

### 追加更正提交與驗收

- 本次更正以原main `22d7cf55e89df1087cfc5ee769982e23ddee194e` 為父提交，先推送備份分支 `fix/extreme-roster-and-mantle-layout-20261109` 至 `bc7779b426444ce2c22336803de4be1c7628b33a`，再以expected SHA安全快轉main至同一版，未覆寫其他main功能。
- `node --test tests/extreme-*.test.mjs` **98／98通過**；包含角色戰袍獨立上方區域、CLEAR首領圖片尺寸與軍勢DOM必須位於首領卡內的新增驗證。
- 實際正式網站CSS／JS與遊戲登入後畫面**尚待部署完成並再次確認**。不能僅憑靜態測試宣稱玩家端小怪已恢復顯示。

### 正式站新版靜態資源驗證（2026-11-09）

- 正式站 `index.html` 已讀到 `extreme-trials.css?v=2-mantle-layout-and-roster`，不再是舊CSS版本；正式 `game.js` 也已讀到「場上軍勢 · 點擊指定目標」標記，正式 `extreme-trials.css` 可讀到 `padding:188px 10px 12px!important` 的獨立立繪排版。
- 因此前端最新版已由 GitHub Pages 提供；但**尚未以實際已登入角色進行畫面點選驗收**，若玩家仍發現小怪消失，需要保留截圖與當時關卡、清快取後再追查。

## 第三次修正：小怪被固定戰鬥視窗裁切、角色卡偏移（2026-11-09）

- 玩家再次截圖證實：軍勢已進入Boss卡片，但只露出卡片上半截，下半截被面板邊界裁切。根因是通用 `compact-v5.css` 把桌面 `.encounter` 設為高度236px（較矮螢幕202px），`entry-fusion.css` 為350px最大高，`endless-tower.css` 又設 `.enemy-lineup` 與首領卡 `overflow:hidden!important`；光把軍勢移入Boss卡並不足以解決。
- 現在只有**存在 `.extreme-minion-roster` 的清怪試煉**讓 `#encounter`、`.enemy-lineup`、`.tower-encounter` 設 `height:auto!important`、`max-height:none!important`、`overflow:visible!important`；五個軍勢目標固定小型卡片高度114px，避免戰鬥面板裁切。其他王、一般野外、天空／無盡塔照舊固定高度。
- 角色欄上一版採絕對定位 `left:50%`，玩家實際截圖仍顯偏移；改為戰袍圖片 `position:relative`、`display:block`、`left:auto`、`margin:0 auto`，作為角色卡正常文件流的第一個居中元素，稱號／名稱框自然排在下方，不與圖像疊在一起。維持完整原圖與 `object-fit:contain`。
- 更新 `dist/index.html` 的CSS查詢版本到 `2-mantle-centered-clear-height`，靜態測試新增 `#encounter` 高度與裁切規則斷言。此處是新的待發布修改，不能以先前部署檢查當成本次已上線證明。
- 重新執行 `node --test tests/extreme-*.test.mjs`：**98／98通過、0失敗**。目前執行環境未安裝 Playwright Chromium 可執行檔，因此這次無法在本機瀏覽器對實際角色存檔截圖驗收；需要正式站有對應存檔的瀏覽器再次驗證。

## 第四次修正：首頁V2戰袍偏小、遊戲內人物與光環錯位（2026-11-10）

- 玩家首頁並排截圖：相同角色選單尺寸下，V2極限戰袍畫面可見人物比其他時裝明顯小；針對 `.slot-select img.art-entry.extreme-outfit-equipped` 僅額外 `scale(1.18)`，仍採 `object-fit:contain` 並保留全部原畫，不影響其它角色／時裝。
- 玩家遊戲內截圖：人物改為正常文件流、置於卡片上部後，光環的 `::before`／`::after` 偽元素仍沿用整張 `.hero` 卡片的 `top:48%`／`top:10%`，隨稱號及名稱框把光環視覺中心往下拉；只針對同時有 `extreme-aura-*` 與 `img.extreme-outfit-equipped` 的角色卡，將光環固定於上方190px肖像區域（桌面中心約106px、直徑154px，較窄螢幕中心92px、直徑134px）。
- 沒有修改戰袍圖片、怪物、角色技能、戰鬥/解鎖資料或其他外觀種類。CSS查詢版本升 `2-mantle-aura-lobby-scale`，新增入口尺寸與光環位置的回歸斷言。
- 本段實際GitHub分支、main提交SHA和正式站部署／視覺驗收需於操作完成後記錄。不能拿前次靜態資源確認冒稱本次已部署。
- 本地極限試煉完整專項 `node --test tests/extreme-*.test.mjs`：**100／100通過、0失敗**。已保留前述清怪可視性與戰袍置中驗證，新增首頁放大與光環置中斷言。

### 第四次修正 GitHub 備份（2026-11-10）

- 從最新main `cac96f7d2270b28d7d21b9f3b022d028ba6bc9bf` 建立 `fix/extreme-mantle-lobby-aura-parity-20261110`，先推送 `e864afc9cdeb3e0a7538fee6c0c4a8a038fce479`；再用expected SHA快轉正式 `main` 至同一版，兩處修改皆未觸碰48張原畫。
- 更新後第一次正式網站 `index.html` 尚讀到舊CSS版本 `2-mantle-centered-clear-height`，**表示新部署／快取尚未切換，不能宣稱已完成線上驗收**。後續應核對 `index.html` 出現 `2-mantle-aura-lobby-scale`、CSS出現 `scale(1.18)` 與 `top:106px`，並使用擁有該外觀存檔的瀏覽器核對人物與光環位置。

## 第五次修正：新時裝角色欄仍小於舊時裝（2026-11-10）

- 玩家並排截圖：相同角色欄的舊時裝人物佔據較大的橫向與縱向比例，V2戰袍明顯較窄。根因是前一次將V2圖限制在 `width:138px;height:190px`，而舊款大立繪展示面積較大；本次僅角色欄V2提高至 `190×235px`，用上／下負margin控制與稱號區間距，保持文件流正常置中、原圖不裁切。
- 同步把同款戰袍專用光環中心改至人物肖像約112px位置、大小188×188，粒子區224×210；窄版改為人物158×198與光環158×158，以免人物放大後光環再度錯開。
- **首頁已於上一批校正，不再變更其放大比例**。其他金幣／SSS／天穹造型、48張WebP和試煉邏輯均不修改。CSS快取字串更換為 `2-mantle-hero-parity-20261110`。
- 本段新的分支／正式部署驗證需要在推送後補記；本地測試與實際畫面是兩種不同驗收。
- 已重跑 `node --test tests/extreme-*.test.mjs`：**100／100通過**，包含新增的V2專用尺寸與光環聯動斷言。

## 第六次修正：金幣典藏背景同步首頁選角（2026-11-10）

- 使用者指出已購買、已選用的金幣典藏背景沒有出現在首頁選角卡片。原因：`decorateTowerHonorEntry` 僅設定極限試煉背景，忽略 `cosmeticBackground`。
- 在首頁選角渲染時讀取 `readCosmeticCollection(localStorage).backgrounds`，只有角色已選用且確實持有的金幣背景才使用 `cosmeticBackgroundArt` 作為卡片背景，連動 `cosmeticBrightness`，並沿用 `extreme-entry-scene` 的展示設定。
- 原本選用規則及遊戲內顯示不變；對於有其他背景種類的角色，金幣典藏背景優先層級與遊戲內目前的 `applyCosmeticScene` 一致。
- `dist/index.html` 的 `game.js` 版本更新為 `7.1.9-gold-entry-background-20261110`，避免快取停留在舊 JavaScript。
- 先前 V2 戰袍尺寸修正 GitHub `main` 提交 `0edf3c5285e5383e4cddf2d20c34dde522224f99`；**GitHub Pages 尚停在 `e864afc`，未找到該次提交對應的 Publish workflow run**。必須由正式工作流程重新部署並查證網站載入新版資源才算完成。
