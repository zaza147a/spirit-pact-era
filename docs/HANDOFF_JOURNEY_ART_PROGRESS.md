# 旅程分鏡逐張重繪交接

分支：`feature/companion-homecoming`。僅在此分支提交，不合併 main、不部署正式版。

## 最新斷點

已完成並接入 **36／36** 張。本次完成 `support-defense-3.webp`。

**下一步：旅程圖片與桌面旅程瀏覽器驗收已完成；接續八個戰鬥節點的自然戰鬥難度驗收。**

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

圖片位於 `dist/assets/homecoming/journeys/`，由 `dist/homecoming-art.js` 的 `HOMECOMING_JOURNEY_ART` 接入。提示詞紀錄：`docs/homecoming-art/journey-redraw-log.json`。已檢查解碼與尺寸，素材／沙盒／主遊戲回歸 52／52 通過。首次旅程、續讀、抵達及接受委託的實際桌面 Chromium 驗收已通過，證據見 `docs/homecoming-browser/REPORT.md`；八個戰鬥節點的自然實戰難度仍待驗收。

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

## 下一階段接續

1. 圖片 36／36 已齊全，不要重新生成或把舊四張刪掉。
2. 自然戰鬥難度仍待完成，先讀 `docs/HOMECOMING_FLOW_HANDOFF.md`、`docs/homecoming-post-dawn/REPORT.md`、`scripts/homecoming-combat-observation.mjs`。基準為合法 210 等、人物與夥伴 SSS、契印 8，返鄉挑戰應高於曙光野外；不能以 VM 測試強制大傷害冒充自然通關。
3. 本次桌面瀏覽器範圍是旅程、續讀、抵達與接受委託，不代表全部任務結局及八個戰鬥節點已在瀏覽器自然實戰驗收。
4. 所有修改只提交 `feature/companion-homecoming`，不合併 main、不部署正式版；未來合併時須先檢視最新 main，避免覆蓋其他更新。
5. 本機已確認 Chromium 必要的 socket() 會被環境拒絕（EPERM），不要反覆下載瀏覽器；使用已建好的 `.github/workflows/homecoming-browser.yml` 在測試分支執行。現有流程只測返鄉桌面，不會執行全職 DPS 大矩陣。

## 自然戰鬥瀏覽器驗收接續中

現有 `homecoming-post-dawn` 已有舊十職 × 八節點 × 兩種子共 160 場 VM 自然初驗，不重跑同一矩陣。本階段新增 `scripts/browser/homecoming-combat-acceptance.mjs`，以合法 210 等盧恩騎士、200 神話 SSS、對應 SSS 融合夥伴、契印 8、第四技能未解鎖，於真實 Chromium 正常時間完成八節點，另做祖爐／演武兩個合法卸裝戰敗控制。

腳本只匯入指定戰鬥節點的合法存檔，按前往與自動戰鬥；不注入傷害、直接勝利或加速時間。檢查自然戰報、勝利推進、零額外掉落／經驗／金幣、匯出重登與免費敗退回家鄉。卸裝戰敗控制不列入難度通關樣本。VM 僅用於準備合法滿 HP／SP 與驗證減傷上限。

新工作 `.github/workflows/homecoming-combat-browser.yml` 僅在本分支的這支驗收腳本／工作本身修改時觸發，或手動啟動，不在每次圖片或一般遊戲更新時重跑。尚未取得結果，不可宣稱八場瀏覽器自然戰鬥已通過。保持本分支，不合併 main、不部署正式版。
