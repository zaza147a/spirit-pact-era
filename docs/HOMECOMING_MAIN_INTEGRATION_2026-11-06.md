# 返鄉分支與 main 整合紀錄

分支：feature/companion-homecoming。此項只將 main 整合至測試分支，不合併 main，不部署正式網站。

## 已處理

- 共同基底 e9bea48c524fa8b2837b5c3b89a348e6829d4fb8；原返鄉分支 902d48fc3488ab9ee86399239d2fd6f2d1ec8fc2。
- 三方合併的 game.js（13區塊）、index.html（3區塊）、offline-worker.js（1區塊）已處理。
- 保留 main 的單夥伴職業、卡片同步、穿防傷害、攻擊類型顯示、金幣外觀優先、完成三轉提示清理與村莊場景。
- 保留返鄉地圖／旅程恢復、特殊怪物圖、任務擊殺推進、帳號回饋、第四格技能與獨立存檔。
- 返鄉 HP／防禦加成排除於能力轉移與防禦轉攻計算之外，維持原返鄉獎勵範圍。
- 正常村莊使用 main 的場景與 NPC；返鄉城鎮保留各自圖片與任務 NPC。

整合 main 來源：df50e5d2bff54535198f7ff950044dadea077352，另保留本輪新增的36張金幣外觀正規化、圖鑑樣式與快取更新。

## 驗證

- 合併後語法檢查通過。
- 返鄉相關測試 102／102 通過。
- main 相關職業、卡片、創角、武器、倉庫與村莊測試 60／60 通過。
- 金幣外觀／版本11項、攻擊類型／背包／杖劍掉落15項通過；上述共188項。
- 瀏覽器驗收待此整合提交的 GitHub Actions；歷史十二任務與72旅程圖片驗收不能替代本次整合驗收。

## 交接

下一步先檢查此提交的 Homecoming flow、Homecoming desktop browser acceptance、Homecoming twelve complete browser stories。失敗時依工作日誌修正，通過後保存新的報告／截圖／實際匯出存檔與來源提交。保持 main 不變。

原圖片已完成36／36，不需重新生成。其餘未驗證範圍仍見 HANDOFF_JOURNEY_ART_PROGRESS.md，尤其錯誤選項、第四技能實際能量／SP／冷卻與跨職業最佳融合排名。
