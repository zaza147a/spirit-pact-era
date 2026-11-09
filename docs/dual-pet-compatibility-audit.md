# 御靈使第二輪相容性核對 — 2026-11-03

狀態：只讀核對正式版 `main@006e2252`；尚未修改遊戲程式、尚未跑模擬。所有待辦只在 `feature/spirit-tamer-dual-pets` 實作。

## 已核對
1. `dist/job-skills.js`：技能模板支援 `kind`、`power`、`cooldown`、`aoe`、`targets`、`attackCycle`、`branch`、`thirdOnly`、`rebornOnly`，但 `initialJobSkills`、`supersededSkill`、`JOB_SKILLS`、`REBIRTH_MAIN_REPLACES` 都需要納入新職。既有十職業的三轉曲線、主攻替換和技能動作間隔不可破壞。
2. `dist/auto-skill-rules.js`：自動技能使用單一排序隊列，護盾會互斥。新職的主角技能隊列可沿用，但兩隻夥伴必須各自獨立處理技能與 CD，不能錯當「兩隻額外出手都在主角技能排序」。
3. `dist/jobs.js`：`SECOND_JOBS` 的 `parent` 與 `transferEligibility` 決定二轉，需把一轉 `spiritist` 映射至兩個二轉分支，並處理新職武器允許類型。
4. `dist/adventure-progression.js`：`jobLevelCap` 目前寫死十個二轉職業；新職若未加入，轉生二轉 Job 等級無法到 70，造成三轉資格永久卡住。\n5. `dist/frontier.js`：`thirdJobError` 目前所有職業共用 Base 150／轉生二轉 Job 70／蒼穹樞城／天極覺醒聖印 1 枚。新職必須在**保留既有條件**後額外要求兩隻融合寵及完成「雙生靈契」支線，不得讓其他十職受影響；三轉後若卸寵，維持轉職身分，僅停用雙融合專屬技。
6. `dist/pet-fusion.js`：六種正向融合＋六種反向展示，明確註解逆向僅名稱與外觀不同，屬性／技能內容複製正向；因此三轉分類要先用 `fusionKey` 正規化，六種無序融合形成 21 配對，避免把 12 個 display key 誤算為 78 種。
7. `dist/character-slots.js`：八存檔、格式 version 2、透過 normalize/valid。雙寵欄位與試煉旗標應透過向後相容的 normalize 遷移；不可提高 version 並讓舊八格存檔被拒絕。
8. `dist/loot.js`：一般裝備掉落總量基準 20%，內部分人物 18%、夥伴 2%；boss 類型抽選 90:10。已另存比例設計；需追查 `dist/game.js` 內 `equipmentDrop` 所有呼叫點，包括離線與連續試煉，才可以改。
9. `dist/offline-rules.js`：24h 離線、100ms step；掉落調整若只掛在 UI 事件或每幀畫面流程，離線收益會錯。應用角色職業被動的純函式判定。
10. `dist/combat-balance.js`：ASPD 193 約 140ms；新職每個 actor 各自限制攻擊循環，不能把第二夥伴造成的傷害算成免費、超出 ASPD 上限的連鎖事件。

## 新發現與風險
- 直接新增 job key 不足以成為完整可玩職業：角色創建、初始技能、技能 UI、武器、存檔 normalize、轉生、三轉、離線、戰鬥、NPC 都需同步涵蓋。
- `dist/frontier.js` 的 `PET_REVIVE_MS` 常數目前為 10000ms，可能與使用者先前要求的 3 秒寵物復活規則存在不同層級覆寫；開發時必須查實執行路徑，不能假定常數就是實際運作。
- `dist/pet-fusion.js` 的逆向名稱可能不同，但能力等價；新增 21 組要以 canonical key 分組。
- `dist/auto-skill-rules.js` 的重複護盾互斥群機制可直接沿用，防止雙寵同化／護盾無限疊加。

## 下一步的驗證門檻
A. 先做只讀十職業基準測試（同級、同裝備階級、合法技能／配點），把純 DPS、三目標時間、死亡率列出。不得用本規劃倍率當作實測成績。
B. 在分支上新增職業資料和存檔遷移測試，先只跑一轉兩隻非融合寵（各自 HP／SP／CD／復活）；通過再加入二轉與進階二轉。
C. 接入所有掉落通路後，注入可重現 RNG 驗證原本十職業 9:1、新職 8:2／7:3，且裝備總掉率不變。
D. 最後才開三轉雙融合條件和 21×2 技能，防止前期平衡被混合機制污染。

所有發現未經實測前均不代表功能已完成。
