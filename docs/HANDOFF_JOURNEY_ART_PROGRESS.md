# 旅程分鏡逐張重繪交接

分支：`feature/companion-homecoming`。僅在此分支提交，不合併 main、不部署正式版。

## 最新斷點

已完成並接入 **36／36** 張。本次完成 `support-defense-3.webp`。

**下一步：圖片、桌面旅程及八節點自然戰鬥瀏覽器初驗已完成；接續十二條任務的完整對話／交付獎勵／第四技能解鎖瀏覽器流程。**

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

圖片位於 `dist/assets/homecoming/journeys/`，由 `dist/homecoming-art.js` 的 `HOMECOMING_JOURNEY_ART` 接入。提示詞紀錄：`docs/homecoming-art/journey-redraw-log.json`。已檢查解碼與尺寸，素材／沙盒／主遊戲回歸 52／52 通過。首次旅程、續讀、抵達及接受委託的實際桌面 Chromium 驗收已通過，證據見 `docs/homecoming-browser/REPORT.md`；八個戰鬥節點的盧恩騎士自然瀏覽器初驗已通過，見 `docs/homecoming-natural-browser/REPORT.md`；不同投資程度與多種子的難度驗證仍待後續。

## 原始起點

基底 `3014278` 僅有 4 張：support-attack 1/2、attack-support 2/3。逐張重繪由 attack-magic 第 1 頁開始。第一張提交 `a23bf238e229588b788b7ed3840b764dbe327b5a`。

## 整套素材核對

36 張均可完整解碼且為 1280×720，36 個檔案雜湊互不相同；原有四張保留。32 張新繪提示詞已記錄。`docs/homecoming-art/journey-asset-audit.json` 提供檔案大小、SHA-256 及 Git blob SHA，供下一階段核對。

## 目前驗證與完成斷點

- `node --test tests/homecoming-assets.test.mjs tests/homecoming-state.test.mjs tests/homecoming-preview.test.mjs tests/homecoming-game.test.mjs`：52／52 通過。
- 實際桌面 Chromium 141.0.7390.37：來源提交 `c2838ce103e58bdf5e29fd9a6ccad798161bbb80`，Actions `42219342703` 成功。
- 12 路線 × 3 頁 × 1440／1280 兩種桌面寬度：72 次主遊戲圖片顯示、24 組真實操作流程，另驗證沙盒 36 張。
- 每組檢查第 2 頁重整、第 3 頁關分頁重開、對應 NPC、抵達接受委託、匯出、重新進入不重播；腳本錯誤與失敗請求均為 0。
- 修正主遊戲仍顯示 4／36、沙盒仍說待製作的舊提示。目視截圖發現後方路線被未收取卡片推到很下面，已把目前旅程置頂、未收到的來信預設收合；修正後重新通過實際瀏覽器驗收。
- 永久保存的原始報告、代表截圖與 36 張瀏覽器總覽：`docs/homecoming-browser/`。完整截圖也在 Actions artifact（保留 14 天），後續應優先讀取分支中的報告。

## 八節點自然戰鬥完成斷點

- 實際瀏覽器來源 `dbf83efddcc3cf266f3ba5215a3b1637698700dd`，Actions `42222421359` 成功。
- 盧恩騎士、210 等、200 神話 SSS／最高合法詞條與首領卡、對應 SSS 融合夥伴、契印 8、第四技能未解鎖：8／8 自然勝利。三首領為 43.433／53.244／36.844 秒，八場沒有夥伴倒下。
- 另做 2／2 合法卸裝戰敗控制：免費回對應家鄉、滿血、節點不變、匯出重登與關閉離線收益均正確。
- 有實際傷害戰報，未注入傷害或直接勝利；沒有額外經驗／金幣／卡片／故事掉落。
- 完整原始數據與代表截圖已永久保存在 `docs/homecoming-natural-browser/`，不得只依賴 14 天到期的 Actions artifact。
- 單職八場原生亂數僅是瀏覽器初驗，不能宣稱全職／任意配裝穩定性已完成。這輪沒有更改怪物數值、傷害公式或掉落。

## 下一階段接續

1. 圖片 36／36 已齊全；桌面旅程 24 組／72 次顯示與八節點自然戰鬥已通過，不要重新生成圖片或重跑舊的 160 場矩陣。
2. 下一步是十二條任務從對話選擇到回城交付的完整瀏覽器流程，檢查獎勵只領一次、人物傳承、第四格技能解鎖與存讀。先讀 `tests/homecoming-state.test.mjs` 的 `plans`、`dist/homecoming-adventures.js`、`scripts/browser/homecoming-combat-acceptance.mjs`，沿實際按鈕與正常戰鬥推進，不能用直接修改節點或強制傷害冒充完整通關。
3. 難度後續可針對多種子與不同投資程度做比較，但必須先以同套合法配裝實證通關曙光，再比較返鄉，不能把未達曙光基準的失敗當削弱依據。既有證據見 `docs/homecoming-post-dawn/REPORT.md`。
4. 所有修改只提交 `feature/companion-homecoming`，不合併 main、不部署正式版；未來合併須先檢視最新 main，避免覆蓋其他更新。
5. 本機 Chromium 的 socket() 受環境拒絕（EPERM），使用 GitHub Actions；旅程工作為 `homecoming-browser.yml`，自然戰鬥為 `homecoming-combat-browser.yml`。後者只在本分支驗收腳本／工作自身修改或手動啟動時執行，不隨每次一般遊戲／圖片更新重跑。
