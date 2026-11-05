# 夥伴返鄉篇：十二封來信

狀態：設計提案與概念圖階段；未實作任務入口、戰鬥、獎勵或存檔遷移。
基準 main：e9bea48c524fa8b2837b5c3b89a348e6829d4fb8
測試分支：feature/companion-homecoming
正式版與 Pages 部署不變。

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

## 獎勵建議與平衡邊界
大陸城鎮訪問在首次抵達時開放，不作為通關獎勵。通關優先給故鄉背景、回憶插圖、夥伴稱號與後日談，不先加全職通用戰鬥倍率。若後續需要新成長，單獨討論專屬養成上限與 12 條等價性；不可為收齊故事強迫玩家犧牲慣用夥伴。
本階段不新增 210 以上等級，不調怪物或職業平衡，不啟動大型 DPS 矩陣。

## 後續實作與驗證範圍
先做資料驅動的任務狀態與一條完整可玩的樣板，再接入其餘 11 條。必要驗證：門檻未滿不可領、滿足才提示、12 routeId 唯一、正反路線不共用進度、雙夥伴來信排隊、領獎冪等、舊存檔兼容、離線結算不跳故事、正式部署保持 main。新增必要驗證：首次觸發才出現對應大陸、12 個大陸與城鎮一對一、逐張切換與斷點續播、首次抵達只落城鎮、回訪不重播、拒絕或延後委託不封鎖城鎮、既有大陸不受影響。
概念圖由對話交付；本提交不宣稱圖片已進入 GitHub。實作前將選定素材另行接入測試分支並建資產清單。
