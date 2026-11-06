# 旅程分鏡逐張重繪交接

分支：`feature/companion-homecoming`。僅在此分支提交，不合併 main、不部署正式版。

## 最新斷點

已完成並接入 **36／36** 張。本次完成 `support-defense-3.webp`。

**下一步：圖片繪製已完成；接續完整瀏覽器視覺與互動驗收。**

每張圖片、接入設定、本文件與提示詞紀錄一起提交。若中斷，以遠端圖片和本文件最新版本為準，不依賴 scratch 或先前對話聲稱的數量。

## 規格與順序

依 `dist/homecoming-data.js` 路線順序，每路線 1→2→3，跳過已完成圖片。每張獨立生成，不以合圖裁切。成品 1280×720 WebP，16:9，不含文字、UI、水印，精緻手繪奇幻 JRPG 場景。既有 12 張任務場景與 7 張透明對手保留，不抵旅程分鏡數。

|順序|路線|頁|內容|狀態|
|---|---|---|---|---|
|1|attack-magic|1|沿黑曜石古道攀上火山。|已完成並接入|
|2|attack-magic|2|冷灰飄過熔岩橋，供熱塔的火光逐一消失。|已完成並接入|
|3|attack-magic|3|燼星龍城就在眼前，守爐長正等候最後的火種。|已完成並接入|
|4|magic-attack|1|登上離開崖港的風帆船。|已完成並接入|
|5|magic-attack|2|雷暴中，斷裂的航標指向相反星路。|已完成並接入|
|6|magic-attack|3|穿過雲層，赤羽天都的巨大光環黯淡無光。|已完成並接入|
|7|attack-defense|1|踏上荒原中的舊軍道。|已完成並接入|
|8|attack-defense|2|在崩裂峽谷旁接應撤離車隊。|已完成並接入|
|9|attack-defense|3|玄關壁城層層城門聳立，鎮界錨已出現裂痕。|已完成並接入|
|10|defense-attack|1|搭乘礦軌車深入山腹。|已完成並接入|
|11|defense-attack|2|無人的鍛造廊裡，鐵鎚仍規律敲擊。|已完成並接入|
|12|defense-attack|3|穿過鐵橋，赤砧爐堡的主爐仍在失控運轉。|已完成並接入|
|13|attack-support|1|走過金色梯田與收割後的小路。|已完成並接入|
|14|attack-support|2|循商隊留下的車轍進入古林。|已完成並接入|
|15|attack-support|3|玉穗原鄉的入口已被巨大的荊棘纏住。|已完成並接入|
|16|support-attack|1|沿紅楓山道帶著舊戰旗前進。|已完成並接入|
|17|support-attack|2|廢棄演武台上，仍留著師父的步痕。|已完成並接入|
|18|support-attack|3|丹旌武鄉的百旗迎風飄揚，練武場卻異常安靜。|已完成並接入|
|19|magic-defense|1|搭升降籠下降到地底晶穴。|已完成並接入|
|20|magic-defense|2|沿發光晶河前進，水聲掩蓋了原本的歌聲。|已完成並接入|
|21|magic-defense|3|晶歌深城的共鳴高塔一片寂靜。|已完成並接入|
|22|defense-magic|1|穿越佈滿石碑的砂海。|已完成並接入|
|23|defense-magic|2|追著不斷移動的符文道路走過蜃景。|已完成並接入|
|24|defense-magic|3|環符祕城的分段城門正反覆重組。|已完成並接入|
|25|magic-support|1|乘夜船越過深色海面。|已完成並接入|
|26|magic-support|2|無光燈塔在霧中浮現，遠處有真假難辨的船影。|已完成並接入|
|27|magic-support|3|白羽聖港的拱廊下，守燈人望著失去航線的船冊。|已完成並接入|
|28|support-magic|1|乘天河小舟進入高空雲海。|已完成並接入|
|29|support-magic|2|斷裂雲橋與飄散絲帶橫在前方。|已完成並接入|
|30|support-magic|3|雲織仙鄉的屋舍正隨浮台緩緩下沉。|已完成並接入|
|31|defense-support|1|沿巨大的樹根進入古林。|已完成並接入|
|32|defense-support|2|枯萎內庭的深處，有生命光點持續流失。|已完成並接入|
|33|defense-support|3|翠庭樹城依樹幹而建，最底層的燈火正在熄滅。|已完成並接入|
|34|support-defense|1|隨雪地商隊沿山路向上。|已完成並接入|
|35|support-defense|2|越過結冰吊橋，谷底已看不見流水。|已完成並接入|
|36|support-defense|3|磐泉隱村只剩最後一口冒著熱氣的暖泉。|已完成並接入|

## 接入與驗證

圖片位於 `dist/assets/homecoming/journeys/`，由 `dist/homecoming-art.js` 的 `HOMECOMING_JOURNEY_ART` 接入。提示詞紀錄：`docs/homecoming-art/journey-redraw-log.json`。已檢查解碼與尺寸；素材與沙盒測試逐批執行，完整瀏覽器驗收仍待完成。不可宣稱已完成真實瀏覽器驗收。

## 原始起點

基底 `3014278` 僅有 4 張：support-attack 1/2、attack-support 2/3。逐張重繪由 attack-magic 第 1 頁開始。第一張提交 `a23bf238e229588b788b7ed3840b764dbe327b5a`。

## 整套素材核對

36 張均可完整解碼且為 1280×720，36 個檔案雜湊互不相同；原有四張保留。32 張新繪提示詞已記錄。`docs/homecoming-art/journey-asset-audit.json` 提供檔案大小、SHA-256 及 Git blob SHA，供下一階段核對。

## 最後驗證

`node --test tests/homecoming-assets.test.mjs tests/homecoming-state.test.mjs tests/homecoming-preview.test.mjs tests/homecoming-game.test.mjs`：52／52 通過。素材測試已要求完整 36 張並逐頁檢查對應，所有圖片完整解碼通過。此為單元、VM 與 DOM 驗證，尚未替代真實瀏覽器驗收；下一階段先做瀏覽器視覺／互動驗收，不要重新繪製已完成的 36 張，也不要自行合併 main 或發布正式版。

## 桌面瀏覽器驗收接續中

已修正主遊戲仍寫 4／36、沙盒仍寫分鏡待製作的舊提示。新增 `scripts/browser/homecoming-acceptance.mjs` 與僅在此分支觸發的 `homecoming-browser.yml`。預計用實際 Chromium 檢查 12 路線 × 3 頁 × 1440／1280 桌面寬度，包含第 2 頁重整、第 3 頁關分頁重開、抵達 NPC、接受委託、匯出及再登入。此時尚未取得瀏覽器成功報告，不可宣稱驗收通過。

本機已確認 socket() 被環境拒絕（EPERM），不能在這裡啟動 Chromium。改由 GitHub Actions 執行並上傳 `homecoming-desktop-browser` 報告與截圖。仍不合併 main、不部署正式版。

## 第一輪實際瀏覽器結果與版面修正

Actions `42218688918`（來源 `725d707`）已通過：24 組桌面路線流程、72 次旅程圖片與沙盒 36 張；無腳本錯誤或失敗請求。截圖人工檢查發現後方路線會被未收取的卡片推到很下方。因此把進行中／目前夥伴路線置頂，未收到的來信收進可展開區塊。新版已補瀏覽器斷言，需以修正後的下一輪 Actions 結果為準，不以第一輪結果代替新版驗收。
