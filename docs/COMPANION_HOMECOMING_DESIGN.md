# 夥伴返鄉篇：十二封來信

狀態：已完成十二支線企劃、概念圖與六組第四格戰鬥原型V2及固定配裝矩陣；任務入口、領獎、UI與存檔遷移仍未實作。
基準 main：e9bea48c524fa8b2837b5c3b89a348e6829d4fb8
測試分支：feature/companion-homecoming
正式版與 Pages 部署不變。

## 最新平衡範圍與驗收方向
本輪只處理原有十職：盧恩騎士、皇家禁衛、星界咒術師、元素使、十字斬首者、逐影者、聖域大主教、修羅、遊俠、詩人／舞孃三轉路線。靈契君王、萬靈宗師及任何雙夥伴組合完全排除本輪設計與測試。
使用者已接受人物羈絆傳承方案；夥伴統一傷害 +20% 的方案撤回。下方 v1 的夥伴核心覺醒與百分比特性僅保留設計歷史，不可接入遊戲。
新的方向是返鄉任務解放第四格專屬技能／特殊 BUFF，利用職業與夥伴的互動讓六組無序融合各有擅長的職業與情境，而非所有組合取得相同 DPS。
已完成現有十職 × 六組基準與第四格原型V2測試；原型以測試補丁載入，普通遊戲尚未啟用。每職固定合法配裝，依清怪、首領長戰與加壓生存分開評估，以第一名的職業覆蓋率為主要指標，落後不超過 5% 僅作候選診斷，不能視為達標。固定配裝結果不能當成所有武器／配點的全球最優解。
驗收目標（使用者最新要求）：六組融合各自至少成為一個舊職業的最佳搭檔，即實測第一名；僅進入最佳 5% 內不算完成。以正常後期主要用途驗證，不可僅在極端測試壓力中有用。遇到生存達標時仍只剩攻魔，應設計能配合不同職業節奏的輸出／功能循環。基準是否達標由實測決定，不預先指定每職必須使用某組寵物。
測試腳本：scripts/homecoming-affinity-audit.mjs；僅由測試分支的 homecoming-affinity 工作流程執行，不觸發 Pages 發布。

### 第四格的職業分工目標（設計提案，非目前實測排名）
| 融合 | 優先設計成為其最佳搭檔的職業 | 主互動 |
|---|---|---|
| 攻魔 | 十字斬首者 | 暴擊／爆發推進雙極技能 |
| 攻防 | 盧恩騎士、逐影者 | 近戰連段、破甲後由夥伴破城追擊 |
| 攻輔 | 遊俠、修羅 | 獵鷹／連擊帶動追獵接力 |
| 魔防 | 星界咒術師、皇家禁衛 | 施法／護盾帶動星壁砲擊 |
| 魔輔 | 元素使、詩人／舞孃 | 自詠／演奏推進共奏 |
| 防輔 | 聖域大主教 | 治療／守護行為推進夥伴主動裁決，滿血仍能有限運作 |

以上先分配十職設計方向，不能透過職業硬鎖、未列職業不能裝備、僅對指定職業直接加傷等方式製造第一。最終歸屬須由第四格原型與合法配裝最佳化後的實測判定，可隨結果調整。
每種至少有一職的正常後期主力用途第一，並跨種子確認；單輪隨機第一不算。清怪看真實擊殺效率，打王看可穩定完成的擊殺時間／持續輸出；保留現有來源分類，不能把治療等值冒充傷害。其餘搭檔可接近，不必故意拉大差距。人物傳承維持已接受方案，本輪只設計舊有十職，雙夥伴職業排除。

## 第四格原型 V2 進度
報告：docs/homecoming-fourth/REPORT.md；數據：docs/homecoming-fourth/results.json。
第二輪原型固定配裝下，六組各自至少在一個舊職的正常清怪與首領長戰取得單獨第一，而且代表職業在兩個種子都維持第一。目標在此基準下通過，尚未宣稱涵蓋全部最優配裝。
- 攻魔：皇家禁衛、十字斬首者；修羅清怪。
- 攻防：逐影者清怪與首領、盧恩騎士首領。盧恩騎士清怪與攻魔平均並列，不能算穩定第一。
- 攻輔：遊俠清怪與首領、修羅首領。
- 魔防：星界咒術師清怪與首領。
- 魔輔：元素使、詩人／舞孃清怪與首領。
- 防輔：聖域大主教清怪與首領。
目前僅有六組基礎第四格，不包含同組第二條支線解鎖的技能分支版本。真正任務完成與UI尚未接入，不能把原型旗標當成已完成的遊戲任務系統。

## 現況確認
- dist/pet-true-form.js 定義 12 個有序外觀身分。
- dist/pet-fusion.js 的 fusionKey 仍將能力歸為 6 組無序融合；正反外觀的故事應獨立，能力不因此改變。
- 高階人形：trueForm === true 且 humanoidStage === 3（SSS）；契印為角色 player.dawnSigil，最高 8，不是每隻寵物各有契印。
- 本次返鄉入口是新增需求，不能將現有高階人形或契印系統描述成已實作返鄉任務。

## 開啟與進度規則
角色契印達 8、指定融合夥伴已達高階人形，回城時顯示該夥伴來信。一次只展示一封，其餘收入夥伴故事頁；不在戰鬥或離線結算中打斷畫面。雙夥伴各自檢查。
故事依 fusion.main + '-' + fusion.sub 建立 12 個獨立 routeId，不能用無序 fusionKey 合併。建議同角色同路線共用完成紀錄，另綁定同行 petId；更換夥伴不抹除紀錄，重複同型夥伴不重複領獎。完成圖鑑可供帳號共用，但首輪任務進度與獎勵仍依角色；此共用方式待確認。
已開啟故事不因卸裝倒退。任務期間需要對應夥伴同行；不能找到原夥伴時提供符合條件的同型夥伴續接，避免存檔卡死。

## 十二片獨立大陸與首次抵達流程（本輪確認）
十二位夥伴各對應一片不同大陸；每片至少有一座自己的城鎮，城鎮之外的探索區域另行設計。既有十二個家鄉名稱均為該大陸的首站城鎮，不是同一大陸的十二座村莊。大陸正式名稱暫未定案，不直接把城鎮名稱當成大陸名稱。

首次流程：
1. 條件達成並由玩家觸發該夥伴支線後，才在大陸選單開啟該大陸項目；不一次開啟其餘十一片，原有大陸選單維持原功能。
2. 夥伴提出返鄉邀請，玩家選擇「與夥伴啟程」；也可稍後再出發。尚未啟程的已開啟項目顯示「首次旅程」，不能直接傳送。
3. 首次旅行逐張顯示獨立過程圖：啟程圖 → 途中圖 → 抵達圖。每張搭配短敘述／夥伴對話，按「繼續」才切換；最後一張按「進入城鎮」。正式畫面不可同時並排三張。
4. 到達目的大陸後，落點一定是該大陸城鎮，不直接進野外或首領戰；完成首次抵達後才開放大陸選單的正常直達。
5. 城鎮顯示夥伴引導與當地接待 NPC；玩家先交談了解實情，再查看任務目標、區域與獎勵，按「接受委託」或「稍後再說」。返鄉邀請與到城後的正式委託是兩個階段。
6. 接下委託後才依任務進度開放相應探索區域。選擇稍後不撤銷大陸解鎖，能留在城鎮整理並再次與 NPC 對話。
7. 往後透過大陸選單前往，一律直接到該大陸城鎮，不自動重播首次旅程圖，也不重複跳出首次接待與已接受委託。每片大陸分別判定第一次。

中途關閉或重新整理需保存當前分鏡，從尚未完成處續播，不能因已觸發就漏掉抵達步驟。儲存狀態需區分：未開啟／受邀／旅途中及目前圖序／已抵達／委託進度。首次抵達不等於支線完成；不以一個 completed 布林值混用。
建議自願回看放在回憶圖鑑，不影響只在首次自動播放的規則。帳號共用解鎖尚未確認，先按各角色保存。
當地 NPC 職責提案：燼星龍城守爐長、赤羽天都引航官、玄關壁城守關隊長、赤砧爐堡工匠代表、玉穗原鄉村長、丹旌武鄉代理教頭、晶歌深城記憶司書、環符祕城結界監察官、白羽聖港守燈人、雲織仙鄉織雲長者、翠庭樹城樹庭長老、磐泉隱村守泉人。具名角色與對話後續撰寫。

## 共通章節與獨立內容
五章：來信／啟程／抵達與調查／各自的危機／故鄉後日談。
每條都有獨立家鄉、美術、動機、NPC、事件與結局。不以同一座城改色；不以打相同數量怪物作唯一玩法。
首輪美術為每條一張三幕概念分鏡：啟程、旅途障礙、首次抵達。共 12 張概念圖。它們用來審閱風格，不是裁切後直接上線的正式素材。
正式首次旅程需每條至少 3 張獨立 16:9 圖（啟程、途中、抵達），十二片共至少 36 張，逐張生成、逐張切換。來信、高潮、後日談的額外插圖另行擴充；既有三聯圖僅為概念參考。環境圖用實色背景，角色立繪另外透明疊合，避免職業與玩家性別被固定。
第一批概念圖不重畫夥伴正臉；正式有人物的場景須參考 assets/true-forms/SSS 對應圖，保持種族特徵、服裝與外觀一致。

## 十二條獨立支線（家鄉與劇情皆為新增提案）
### 1. 星焰真契者｜熄滅的祖爐
- routeId：attack-magic
- 家鄉：燼星龍城
- 返鄉理由：家鄉送來一枚冰冷的龍焰石；維持全城供暖的祖爐正在熄滅。
- 三幕：沿黑曜石古道攀登火山 → 穿越熄火的熔岩橋 → 抵達覆著冷灰的龍城
- 任務方向：護送最後一顆火種，查明祖爐熄滅的原因，選擇修復供能而非犧牲守爐者。
- 圖像提示：obsidian volcanic road at twilight, a cold ember stone in a travel satchel; crossing a monumental basalt bridge above dim lava with ash snow; arrival at a terraced dragon city inside a volcanic caldera, central ancestral furnace ominously dark, scattered amber windows

### 2. 赤曜星羽姬｜無法歸巢的候鳥
- routeId：magic-attack
- 家鄉：赤羽天都
- 返鄉理由：年度歸巢之夜沒有一隻星羽鳥回來，送信的幼鳥帶著破碎的天都航標。
- 三幕：乘風帆升空 → 穿過雷暴與斷裂航標 → 看見失去光環的浮空羽城
- 任務方向：沿空中航道救回鳥群，修復引航裝置，揭開有人故意改寫星路的真相。
- 圖像提示：a wind-sail vessel leaving a cliff aerie with a broken feather beacon; crossing violet thunderclouds between shattered aerial navigational rings, distant lost glowing birds; arrival at a majestic floating phoenix city of red feather-shaped towers and suspended golden bridges, its great halo extinguished

### 3. 鎮界龍衛｜最後一道關門
- routeId：attack-defense
- 家鄉：玄關壁城
- 返鄉理由：昔日守關同袍寄來斷裂的軍徽，關門外的地脈裂縫正在擴大。
- 三幕：沿荒原軍道返鄉 → 穿越撤離車隊與崩裂峽谷 → 抵達巨大多重城牆
- 任務方向：先接應城外居民，再重啟三座鎮界錨；重點是守住撤離路線。
- 圖像提示：a rugged military road through ochre badlands, a broken insignia beside a map; approaching a cracked canyon with refugee wagons and fallen stone watchtowers; arrival at an immense layered frontier fortress built into cliffs, dragon-carved gates and blue ward anchors, grounded military architecture

### 4. 赤曜鎧聖｜不再回響的鐵鎚
- routeId：defense-attack
- 家鄉：赤砧爐堡
- 返鄉理由：故鄉的鍛造師全數受困地下，仍在運轉的空盔甲卻開始巡行街道。
- 三幕：搭礦軌車入山 → 穿過無人鍛造廊 → 抵達山腹中的巨型爐堡
- 任務方向：解除失控守衛，救出工匠，發現祖傳鎧甲保存著一段被掩蓋的往事。
- 圖像提示：a mine rail cart entering a mountain at dusk, rescue lantern and smith hammer; a deserted monumental forge passage with empty animated suits of armor in the distance; arrival at an enormous subterranean foundry town, iron bridges, waterwheel hammers, molten orange channels and smoke-lit stone vaults

### 5. 聖瑞麟劍士｜被切斷的豐收路
- routeId：attack-support
- 家鄉：玉穗原鄉
- 返鄉理由：收穫祭前夕，返村商隊失蹤，保護田野的麟靈也停止回應。
- 三幕：走過金色梯田 → 沿古林追尋商隊 → 抵達被荊棘封路的村莊
- 任務方向：尋回補給與失蹤村民，調解村民與林靈的誤會，重開共同守護的古道。
- 圖像提示：a golden terraced farmland trail with a harvest ribbon tied to a pack; following abandoned merchant wagon tracks into a lush sacred forest; arrival at a warm rural jade-roofed village encircled by enormous thorn vines, lanterns and harvest granaries, gentle kirin motifs, sunset pastoral atmosphere

### 6. 赤曜麟武姬｜遲到的歸旗人
- routeId：support-attack
- 家鄉：丹旌武鄉
- 返鄉理由：師父失蹤，只留下一封要求她帶回舊戰旗、參加祭典的信。
- 三幕：行經紅楓山道 → 穿越廢棄練武台 → 抵達百旗飄揚的山城
- 任務方向：循三位故人留下的線索找回師父，最後由夥伴決定是否承接守鄉之名。
- 圖像提示：a crimson maple mountain path with a wrapped old battle banner on a travel bundle; abandoned martial training terraces and stone steps under falling red leaves; arrival at a compact highland martial village with hundreds of scarlet banners, circular sparring courtyards and red timber halls, crisp autumn sunlight

### 7. 星岩晶詠者｜逐漸失聲的城市
- routeId：magic-defense
- 家鄉：晶歌深城
- 返鄉理由：城鎮的共鳴水晶不再發聲，居民開始遺忘彼此的名字。
- 三幕：搭升降籠深入地底 → 沿發光晶河前進 → 抵達靜默水晶城
- 任務方向：收集散落的記憶音節，修復共鳴序列，找出自願替全城承受雜音的歌者。
- 圖像提示：an ancient lift cage descending into a vast crystal cavern; a small ferry on a luminous turquoise underground river between amethyst formations; arrival at a crystalline subterranean city with translucent cathedral spires and silent resonator crystals, indigo and cyan atmosphere, living dwellings integrated into crystal

### 8. 星曜符衛｜結界之內的陌生人
- routeId：defense-magic
- 家鄉：環符祕城
- 返鄉理由：城門結界將居民逐一判定為入侵者，連求援信也只能偷渡出來。
- 三幕：穿越石碑荒漠 → 追蹤移動的符文道路 → 抵達不斷重組的環形城門
- 任務方向：潛入三座符塔尋找錯誤誓文，救出被結界隔離的居民，重訂守護的定義。
- 圖像提示：a pale sandstone desert scattered with carved monoliths; a shifting road of floating blue runestones leading through a mirage; arrival at a geometric circular arcane city of concentric sandstone walls and rotating segmented gates, intricate cyan ward lattices isolating residential blocks, architectural mystery

### 9. 聖光羽靈姬｜沒有黎明的燈塔
- routeId：magic-support
- 家鄉：白羽聖港
- 返鄉理由：引導亡者與迷航者的聖燈熄滅，濃霧裡每晚都傳來求救聲。
- 三幕：乘夜船越海 → 靠近霧中沉默燈塔 → 抵達白羽拱廊港城
- 任務方向：分辨真實求援與霧中幻象，護送迷航船入港，讓被遺忘的守燈人得到回應。
- 圖像提示：a small night sailing boat on an ink-blue sea with a white feather lantern; approaching a towering unlit lighthouse in thick silver sea mist with distant ghostly ship silhouettes; arrival at an elegant white-stone coastal harbor with feather-shaped arches, wet marble docks and pale dawn light, solemn maritime sanctuary

### 10. 星羽瑞雲仙｜落向大地的故鄉
- routeId：support-magic
- 家鄉：雲織仙鄉
- 返鄉理由：故鄉寄來的雲紗變成了雨水，承托村莊的雲海正在消散。
- 三幕：乘天河小舟 → 跨越斷裂雲橋 → 抵達緩緩下沉的雲上村落
- 任務方向：找回四季風線，協助村民收攏散落的屋舍，再重織能承載眾人的雲脈。
- 圖像提示：a delicate wooden skiff sailing along a celestial river above clouds with a spool of cloud silk; crossing broken cloud bridges and drifting fabric ribbons under immense pastel skies; arrival at a floating cloud-weaver village with airy pavilions, loom terraces and waterfalls evaporating into mist, some platforms sinking, lavender peach dawn

### 11. 碧玉聖庭守望者｜世界樹的空心處
- routeId：defense-support
- 家鄉：翠庭樹城
- 返鄉理由：長老的求援不是外敵入侵，而是城鎮根部突然出現無法癒合的空洞。
- 三幕：循巨大樹根入林 → 穿越枯萎內庭 → 抵達樹幹中的層層聚落
- 任務方向：救援根穴中的居民，調查生命被抽走的方向，保住老樹與新生幼苗。
- 圖像提示：a mossy path winding between enormous ancient roots with a green distress lantern; an interior root garden with withered leaves and a huge hollow wound; arrival at an inhabited world-tree city of layered wooden balconies, jade terraces and hanging gardens built around an immense trunk, warm inhabited windows against a troubled emerald canopy

### 12. 聖岩麟角賢者｜冬天之前的最後泉水
- routeId：support-defense
- 家鄉：磐泉隱村
- 返鄉理由：山村的溫泉逐一冰封，守泉者請夥伴在大雪封山前帶回古老的泉印。
- 三幕：隨雪地商隊入山 → 跨過冰封吊橋 → 抵達只有一口暖泉的石村
- 任務方向：開出避難路線、修復地下水道，與守泉靈訂立新的共生誓約。
- 圖像提示：a small caravan ascending snowy alpine foothills carrying a sealed stone spring talisman; crossing an ice-encrusted suspension bridge over a deep ravine in snowfall; arrival at a sheltered mountain stone village with one steaming hot spring, snow-covered slate roofs, ancient horn-shaped standing stones, warm amber lights against blue winter dusk

## 任務與成長獎勵提案 v1（夥伴獎勵已撤回，人物傳承保留）
本節依使用者最新方向取代原本僅外觀獎勵的建議：以夥伴成長為主，人物獲得少量可累積提升。以下數值是測試起點，尚未實作、未實測，不宣稱已修正人物與夥伴 DPS 差距。所有大陸名稱、NPC 與首領名稱仍為提案。

### 共通任務規則
抵達各自城鎮、與專屬 NPC 確認事件後才接受正式委託。每條包含調查或解謎、分段事件、高潮戰、返城交付與後日談；沿用文字 RPG 的對話選項、區域事件及既有戰鬥，無須自由移動或 2.5D 系統。護送以分段遭遇與通過檢查表現，不新增即時跟隨 AI。解謎錯誤可重試，不永久扣獎；故事選擇不讓玩家錯失成長獎勵。
每階段完成即存檔，可暫停、回城及續接，失敗只重試當前事件。任務關鍵物品固定取得，不靠低掉率；不要求夥伴尾刀。首輪劇情手動確認，尚未設計離線自動通關。十二條可任意順序完成，首領以未取得本系統獎勵的合法 210／SSS／契印8存檔可通關為設計目標，避免須先通關才能獲得通關能力。
整條結束返城一次領取覺醒解鎖、人物傳承與紀念外觀，重複挑戰不重複增加數值。

### 兩層獎勵
1. 夥伴「故鄉覺醒」：同一無序融合組任一返鄉支線完成後，該組符合高階人形條件的夥伴可啟用核心覺醒。核心建議：夥伴自有傷害 +20%、最大 HP +15%、自身治療與自身護盾額度 +15%。不提高面板 ATK／MATK／DEF／MDEF，不改主人增傷倍率。完成同組另一條不再疊加核心。
2. 每條支線另解鎖一個具名覺醒特性。同組正反兩種外觀均能選用已解鎖特性，一隻夥伴只裝一個；僅城鎮可切換，戰鬥中不切換。十二條任務、特性與人物傳承均獨立；為維持無序融合的戰鬥等價，解鎖後不限制只能原外觀使用。這是建議方案，不將 12 個特性全部加到同一隻夥伴。
3. 人物「羈絆傳承」：每條完成提供人物自有傷害 +0.25%，十二條同池相加共 +3%，不逐條連乘；另有十二項小型生存傳承如下。已領傳承在換寵、寵物死亡或未出戰時保留，不需要同時攜帶十二隻。不佔裝備、卡片或契印欄位。
4. 戰鬥獎勵先限當前角色，帳號共用仍待確認。以唯一 routeId 去重，重養或重複同型夥伴不能刷人物提升。同組新培養的高階人形夥伴可使用已解鎖覺醒，無須重複任務；未達高階人形不可提前套用。

### 數值與計算邊界
- 「夥伴自有傷害」指該夥伴普攻、直接技能、持續傷害、印記追加與其自身反擊；不含替人物增加的傷害、人物反傷／防禦轉傷、人物職業共鳴或同化後人物的攻擊。不可只看目前統計歸屬 petDamage 就套用，需依事件真正來源標記。
- 同一覺醒傷害池相加：核心 +20% 與特性某類 +15% 時，該類結果 ×1.35，非 1.20×1.15。其餘仍 ×1.20。特性並不意味總 DPS 再加 15%；取決於該類傷害占比、技能選擇與實戰目標。
- 核心 HP +15% 與根庭 HP +10% 同池為 +25%；新增最大 HP 僅供生存與既有上限判定，不重新帶入防禦、治療係數、傷害、同化或共鳴轉換，避免二次放大。切換覺醒不能免費補滿生命或洗出護盾。
- 治療與護盾增幅只落在夥伴自身額度；若原技能共用或分配給雙方，先依原規則分配再強化夥伴份額，額外量不得轉給人物。只計有效治療／實際吸收，保留原吸血、護盾與減傷限制。
- 人物十二條累積：自有傷害 +3%、最大 HP +4%、DEF／MDEF +4%、受到 HP 治療量 +4%（不含藥水、吸血、復活），每一項各自加總；不是 +15% 傷害。新 HP／防禦傳承不得再次轉為十字軍傷害或夥伴共享屬性，須有計算來源分離。減傷上限維持 40%。
- 人物 +3% 只乘人物自有傷害一次，排除夥伴印記、夥伴增傷與其他已獲覺醒的事件。必須防止一次命中在人物與夥伴兩側重複放大。
- 同化／協戰另列驗證。協戰兩隻各取得自己的覺醒，不將一隻獎勵廣播給另一隻；相同光環不疊加。固定同化職業不能因沒有夥伴直接出手而拿不到主要獎勵，也不能把覺醒加成傳入整份人物攻擊：同化適配方案須拆出夥伴來源的貢獻再計算，本輪不承諾倍率，未解決前不接入戰鬥。
- 單純夥伴攻擊傷害的起始增幅約 +20%～35%（依來源占比），防禦／回復型另看生存、有效治療、護盾和擊殺數，不能宣稱其 DPS 相同。
- 比例試算僅為示例：若原本人物／夥伴自有輸出為 70／30，人物 ×1.03、夥伴 ×1.30 後為 72.1／39；總輸出 +11.1%，夥伴占比約 35.1%，仍非 50%。未取得當前正式版同條件實測，不據此宣稱已補平差距。

### 十二條任務與獎勵
### 1. 星焰真契者｜燼星大陸／燼星龍城
任務鏈：守爐長確認三座供熱塔停轉；在灰燼古道找回火種匣，分別修復供熱塔；護送守爐者進入祖爐，擊敗「噬焰空殼」，回城重燃祖火。
夥伴特性「祖焰續燃」：夥伴持續傷害的實際傷害額外 +15%；不增加跳數、不觸發額外印記。
人物傳承：自身傷害 +0.25%；另加最大 HP +1%。

### 2. 赤曜星羽姬｜赤羽大陸／赤羽天都
任務鏈：引航官交付最後航跡；依三個航標線索找出錯誤星路，救回迷航幼鳥；啟動歸巢信標，擊敗「逆風羽王」，帶鳥群返城。
夥伴特性「歸巢星火」：夥伴直接範圍技能對非主目標的傷害額外 +15%；不增加目標數。
人物傳承：自身傷害 +0.25%；另加DEF／MDEF +1%。

### 3. 鎮界龍衛｜玄關大陸／玄關壁城
任務鏈：守關隊長標出三處受困據點；玩家選擇救援順序，每段清除攔路敵人後護送居民；修復鎮界錨並擊退「裂隙攻城獸」，回城點名確認全員安全。
夥伴特性「鎮關破陣」：夥伴直接主動攻擊命中首領時傷害額外 +10%；不含反擊與持續傷害。
人物傳承：自身傷害 +0.25%；另加最大 HP +1%。

### 4. 赤曜鎧聖｜赤砧大陸／赤砧爐堡
任務鏈：工匠代表提供礦軌控制圖；切換三段運輸軌道，逐區救出工匠；利用找到的熔斷器停用空鎧軍團，擊敗「空心爐衛」，重開鍛造工坊。
夥伴特性「百鍊還擊」：夥伴自身反擊傷害額外 +15%；不提高防禦轉換係數、不縮短反擊間隔。
人物傳承：自身傷害 +0.25%；另加DEF／MDEF +1%。

### 5. 聖瑞麟劍士｜玉穗大陸／玉穗原鄉
任務鏈：村長交付商隊名冊；循車轍、遺落貨物與麟靈足跡找到失蹤者；回村確認祭田受到污染，再淨化荊棘巢、擊敗「枯穗棘獸」，讓商隊返回。
夥伴特性「巡獵長歌」：夥伴印記追加傷害額外 +15%；仍受原命中次數與冷卻限制。
人物傳承：自身傷害 +0.25%；另加受到 HP 治療量 +1%（不含藥水、吸血與復活）。

### 6. 赤曜麟武姬｜丹旌大陸／丹旌武鄉
任務鏈：代理教頭請求尋師；拜訪三位舊友並通過三場不同規則的演武，拼出師父的去向；救出守在禁地的師父，擊敗「吞旗戰魂」，回城完成歸旗儀式。
夥伴特性「麟血不息」：夥伴汲取類技能傷害額外 +10%，僅對夥伴自己的汲取治療量額外 +15%；保留原吸血上限。
人物傳承：自身傷害 +0.25%；另加受到 HP 治療量 +1%（不含藥水、吸血與復活）。

### 7. 星岩晶詠者｜晶歌大陸／晶歌深城
任務鏈：記憶司書請求找回失落名字；在三個晶穴收集記憶片段，依線索重排共鳴音序；解救被困歌者並擊敗「噤聲晶核」，回城恢復居民記憶。
夥伴特性「晶詠重奏」：夥伴直接主動攻擊命中首領時傷害額外 +10%；不含印記與持續傷害。
人物傳承：自身傷害 +0.25%；另加DEF／MDEF +1%。

### 8. 星曜符衛｜環符大陸／環符祕城
任務鏈：結界監察官暫時開放避難區；進入三座符塔取得原始誓文，對照錯字逐一解除居民封鎖；擊敗「失律裁定者」，由夥伴重寫守護誓約。
夥伴特性「符衛回響」：夥伴護盾的自身分配額外 +20%，夥伴自身反擊傷害額外 +10%；不增加給人物的護盾額度。
人物傳承：自身傷害 +0.25%；另加DEF／MDEF +1%。

### 9. 聖光羽靈姬｜白羽大陸／白羽聖港
任務鏈：守燈人提供失蹤船冊；調查三處海上信號，辨識真船與幻象；護送真實船隊靠岸，前往燈塔擊敗「無曙霧主」，回城點亮聖燈。
夥伴特性「引航星雨」：夥伴直接範圍技能對非主目標傷害額外 +15%；不增加目標數。
人物傳承：自身傷害 +0.25%；另加受到 HP 治療量 +1%（不含藥水、吸血與復活）。

### 10. 星羽瑞雲仙｜雲織大陸／雲織仙鄉
任務鏈：織雲長者展示崩解雲脈；在四處浮島尋回季風絲線，分段固定下沉屋舍；依線索重織雲橋，擊敗「斷雲蠶」，回村完成承天織儀。
夥伴特性「雲脈接力」：夥伴印記追加傷害額外 +15%，自身 SP 回復量額外 +15%；不延長人物增傷效果。
人物傳承：自身傷害 +0.25%；另加受到 HP 治療量 +1%（不含藥水、吸血與復活）。

### 11. 碧玉聖庭守望者｜翠庭大陸／翠庭樹城
任務鏈：樹庭長老請求勘查根穴；救出三處根室居民並找到生命流失源頭；玩家安排支撐根與幼苗保護的處理順序，擊敗「空根寄生者」，回城栽下新芽。
夥伴特性「根庭守誓」：夥伴最大 HP 額外 +10%、僅恢復夥伴自身的治療量額外 +15%；新增 HP 不作傷害轉換基礎。
人物傳承：自身傷害 +0.25%；另加最大 HP +1%。

### 12. 聖岩麟角賢者｜磐泉大陸／磐泉隱村
任務鏈：守泉人交付古泉圖；打通三條雪道並運送禦寒補給，依地圖接通地下水脈；擊敗堵住泉眼的「封泉霜魁」，回村與泉靈重新立約。
夥伴特性「磐泉長守」：夥伴護盾的自身分配額外 +20%，自身反擊傷害額外 +10%；不增加給人物的護盾額度。
人物傳承：自身傷害 +0.25%；另加最大 HP +1%。

### 平衡驗證計畫（未執行）
先同步最新正式版相關平衡至測試基準並排除無關改動，再用相同合法配裝比較未完成／完成一條／同組兩條／十二條全完成。固定同一技能優先、怪物、生怪時間與種子；HP／SP 自動補給均 90%。驗證 201 地圖含首領的實際擊殺數、人物直傷、夥伴直傷、共鳴、BUFF、有效治療與死亡次數，並對單體首領獨立測量。本輪只測原有 10 個職業，排除兩個雙夥伴職業。
不得用理論最大 DPS 或帳面屬性直接替代實戰結果，也不以每隻夥伴都達同一 DPS 當目標。先小規模驗證來源歸屬、同化適配與乘區，再按有問題的組合擴測，不因企劃修改啟動全面回歸或長時間矩陣。
本階段僅規劃，不調整正式版、等級上限、既有怪物難度或職業係數。

## 後續實作與驗證範圍
先做資料驅動的任務狀態與一條完整可玩的樣板，再接入其餘 11 條。必要驗證：門檻未滿不可領、滿足才提示、12 routeId 唯一、正反路線不共用進度、雙夥伴來信排隊、領獎冪等、舊存檔兼容、離線結算不跳故事、正式部署保持 main。新增必要驗證：首次觸發才出現對應大陸、12 個大陸與城鎮一對一、逐張切換與斷點續播、首次抵達只落城鎮、回訪不重播、拒絕或延後委託不封鎖城鎮、既有大陸不受影響。
概念圖由對話交付；本提交不宣稱圖片已進入 GitHub。實作前將選定素材另行接入測試分支並建資產清單。
