# 雙夥伴實際戰鬥接入前的狀態隔離核對（2026-11-03）

目前正式版 `dist/game.js` 的 `combatTick` 約在 1116～1120 行，只有 `activePet()` 一名角色，先執行 `petAutoAbility`、再 `petAttack`。不可以單純重複呼叫這兩個函式。

## 實際發現的共用狀態
- `timers.pet` 單一攻擊時間；`timers.petAbility` 單一技能門檻。
- `petSkillTimers[skill.id]` 只按技能 ID 建立 CD；兩個同種類融合寵會共用相同技能 ID，導致彼此互相卡技能。
- `petEffects` 單一物件包含護盾、標記、流血、祝福、守護、持續恢復；第二隻夥伴直接共用會覆寫第一隻效果。
- `dealPetDamage` 現在以 `companionRole(activePet())` 和 `fusionDirectOutputFactor(activePet())` 計算；第二隻夥伴若直接呼叫會錯用第一隻的類型與增傷。
- `healPetParty` 目前僅有主人與一隻 `activePet()`，雙寵治療需要按三個實際目標與當前 HP 比例分配。
- `enemyAttack` 目前怪物只在主人／一隻出戰夥伴之間選擇承傷；需修改成主人／兩隻夥伴但不得無故降低主角被攻擊的總機率。
- `combatTick` 同時處理在線與離線每 100ms 模擬，因此只需一套完整狀態隔離，不能為離線另外撰寫不一致的簡化公式。
- `activePetId` 目前被放生、更換、技能編輯及 UI 多處直接引用；第二寵也必須被保護，換寵時清理各自暫存狀態。

## 必須先完成的重構順序
1. `petActorContext(pet)`：明確傳入出手夥伴、獨立時鐘、技能 ID namespace、效果狀態與傷害係數；舊職業繼續由 `activePet()` 包裝進此介面。
2. `dealPetDamage` 改為接受 sourcePet，第一寵／第二寵各用自己的 companionRole、融合倍率和暴擊、穿防，再套用新職業傷害係數；避免用共鳴修正再次放大。
3. `petAutoAbility` 改為每 actor 技能 CD 與 effects；兩隻相同融合寵的同名技能不得共用 CD 或互蓋 DoT。
4. `petAttack` 以 actor clock 施放，順序可固定（第一、第二），但不可讓前者在同 tick 多出免費行動；兩隻各自受 ASPD 193 約 140ms 限制。
5. `enemyAttack` 依目前 `chooseMonsterTarget` 的權重擴充兩寵分配；雙防寵要重點驗證生存效益。
6. 護盾、治療、回城、死亡復活、捕捉、放生、切換與離線 24 小時完整覆蓋。
7. 以上通過才開放 UI 第二欄位和一轉雙寵，避免推出表面可裝備但戰鬥實際用第一寵數值的版本。

## 本輪修正
`dist/dual-pet-formation.js` 現在人物主攻二轉「靈契戰使」的協戰輸出係數依第一／第二夥伴分別為 50%／35%；若該夥伴選擇同化，直接輸出係數為 0。這是待實測初稿。原先的版本對人物主攻第一夥伴錯給了 100%，已修正。

## 不變條件
- 所有職業普通轉生、裝備、卡片、復活、存檔與三轉聖印規則維持原樣；御靈使額外需要兩隻融合寵與專屬支線。
- 十職業不應受到雙寵時鐘、傷害係數或裝備類型變動影響。
- 新職仍只在 `feature/spirit-tamer-dual-pets` 內修改；未授權前禁止合併或正式部署。

本文件為核對與實作順序，非戰鬥整合已完成的證明。
