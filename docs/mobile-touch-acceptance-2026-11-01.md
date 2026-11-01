# 手機觸控補驗結果

來源提交：`f91a94767e148ec477eccddd08ffdbbd4587322e`；Actions `41292277243`，Chromium與WebKit均成功。

| 視窗 | Chromium | WebKit | 設定頁水平寬度 |
|---|---|---|---|
| 320×568 | 11組touchstart／touchend／觸控pointer，通過 | 同左，通過 | 320，無溢出 |
| 360×800 | 11組，通過 | 11組，通過 | 360，無溢出 |
| 430×932 | 11組，通過 | 11組，通過 | 430，無溢出 |
| 844×390 | 11組，通過 | 11組，通過 | 844，無溢出 |

觸控路徑包含選角色、進入、夥伴管理、切另一隻再切回、當前夥伴、設定、輸入框焦點及存檔。輸入37後保持值與焦點；設定頁無水平溢出。人工檢查WebKit320及Chromium橫向截圖。這沒有驗證原生手機鍵盤或所有頁面的所有裝置排版。

原有完整驗收亦在同一腳本重跑：各72張實際人形顯示、四角色存讀、匯出重匯入、付費逐階進化、忠誠度演出、背景離線結算、戰鬥輸入焦點、連戰失敗只耗一券且停止重入，全部成功。

紀錄位於`browser-qa/touch-chromium-acceptance.json`與`browser-qa/touch-webkit-acceptance.json`。報告新增明確`passed`欄位；斷言失敗會保留錯誤與已量測情境，不能以`errors:[]`或圖片列數單獨宣稱成功。

## 量測與前置條件補正

- 預先驗圖已改變出戰夥伴，測試不可假設第一隻仍出戰；遊戲點擊已出戰夥伴會收回，出戰後又會自動切到當前頁。測試現在完整走管理頁、切換與回切，不改遊戲的預期互動。
- Headless的`navigator.maxTouchPoints`在兩引擎回報0，但每輪均收到11次真實touchstart／touchend及pointerType=touch；以實際事件與操作結果作驗收，不修改裝置回報。原始0值保留在報告，不視為實體裝置證據。

## 實機操作包

兩個成功artifact皆附`device-fixtures/`：四個基本存檔與`continuous-failure-QA.json`。共五檔各自的SHA256及正常化後存檔有效性已驗證；第五檔覆蓋第4格，沒有不存在的第5角色格。

- Chromium artifact：`13077014440`。
- WebKit artifact：`13077379704`。
- 產生器：`node scripts/browser/export-device-fixtures.mjs`。
- 實機步驟及待填結果：`mobile-device-acceptance.md`。

此批沒有修改`dist/`或既有遊戲測試，正式玩法與平衡沿用先前505/505回歸及同版2400矩陣的版本；本次CI的Full existing regression suite步驟亦成功。尚未完成的仍是實體手機、實體Safari及原生鍵盤操作。main未修改、未發布。
