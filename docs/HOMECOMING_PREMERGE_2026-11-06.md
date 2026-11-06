# 返鄉功能合併 main 前驗收

main來源：89de7f774b09a00bff4b23fdbdbfbfece33fbab4。
返鄉來源：a0c6ef1bba735bebc0b9192244c903dc318e877f。

本次只把main的最新更新整合至feature/companion-homecoming，保留雙親紀錄，不更新main或正式網站。

## 候選變更

- 合併只有index.html內容衝突，已保留最新main的首頁人物清晰度、統一圖像區與名稱對齊CSS。
- 保留main部署25分鐘工作上限／20分鐘部署等待，以及36張人形PNG在有WebP時才排除上線打包的流程。
- 保留全部返鄉故事、36旅程圖片、第四技能與儲存／離線隔離。
- 統一候選顯示與程式／Worker快取為6.5.80-homecoming-premerge；標示合併前驗證。
- 新職業瀏覽器驗收改為透過現有村莊NPC對話與分頁操作，符合目前main的介面，不直接繞過NPC。

## 本機結果

- 33個檔案、215項定向回歸通過，包含現行Pages快速發布檢查與返鄉／新職業／倉庫／首頁／武器檢查。
- 遊戲與Worker語法通過。
- 按Pages規則打包驗證通過：574檔、150480187 bytes；排除36個已有WebP對應的PNG；166個模組相對引用存在，WIKI已整合。沒有上傳部署。

## 實際瀏覽器待收斂

查看此整合提交的Homecoming pre-MAIN acceptance、Homecoming flow、Homecoming desktop browser acceptance、Homecoming twelve complete browser stories。保存本次候選的結果與來源，不用重跑已完成的1200／180／720平衡矩陣。

## 既有觀察

先前所有待測範圍已跑完。唯一修羅攻魔候選配裝戰敗（0減傷），以及23組返鄉首領耗時較快／1組相同是已知平衡觀察，保留於原始報告；非未執行的測試。候選最佳排名不是所有裝備與配點的全域最優證明。

本次完成後僅提供合併前結論；需使用者後續指示才把返鄉功能合入main與發布。

## 合併前發現與修正

第一輪實際新職業／NPC操作發現村莊area::after裝飾層攔住倉庫按鈕，Playwright確認點擊位置被area截走。已讓裝飾層pointer-events:none，更新v2.css快取版本；保留視覺與NPC正常點擊。修正後重跑合併前流程，不用強制點擊繞過產品問題。

## 修正後驗收檢查點

候選程式來源68e2b6fc72861fe9dea858c0ff96ff1743d75cae。本機215項重驗通過。待查Actions：42239239619（desktop）、42239239986（pre-MAIN）、42239239890（flow）、42239239403（十二故事）。main仍為89de7f774b09a00bff4b23fdbdbfbfece33fbab4，已納入此候選父提交。

## 合併前最終驗收完成

程式來源68e2b6fc72861fe9dea858c0ff96ff1743d75cae，對應main89de7f774b09a00bff4b23fdbdbfbfece33fbab4。四組主要驗收均成功：pre-MAIN42239239986、flow42239239890、desktop42239239619、十二故事42239239403。215項定向回歸、首頁八格名稱對齊／金幣外觀保留、新職業創角與NPC轉職、倉庫、打包引用、24旅程流程、十二自然故事均通過。實際完成存檔再次valid，人物減傷35.2%、全部夥伴≤40%。

已修復area::after裝飾層攔截NPC點擊，正常操作重驗通過。對main比較behind_by=0，main為本分支祖先，無未處理合併衝突；驗收結束時main沒有新提交。報告、原始JSON、代表畫面與完整匯出存檔在docs/homecoming-premerge/。

目前沒有阻擋合併的必要測試缺口；已知候選配裝戰敗與首領耗時差異仍保留。未合併main、未部署。實際合併時可移除候選標題的「合併前驗證」文字，保留版本6.5.80與新快取。不要重跑舊平衡矩陣。
