# 《靈契紀元》御靈使雙夥伴／42 共鳴／離線優化 — GitHub 交接 V2

> 截止：2026-11-03（Asia/Taipei）。這是接續 `docs/HANDOFF_SPIRIT_TAMER_2026-11-03.md` 的第二版實際開發交接。請先讀 V1，再讀本檔，以 GitHub 分支的最新實際程式與 Actions 紀錄為準。

## 0. 新對話立即執行指令

1. 專案：`zaza147a/spirit-pact-era`。**只修改與提交 `feature/spirit-tamer-dual-pets`**。
2. **不得合併 main、不得更新 GitHub Pages 正式站、不得覆蓋其他分支**；除非使用者明確新授權。
3. 先核對 branch HEAD / main HEAD、讀兩份交接與現有程式，取得最新 GitHub Actions 工作紀錄，再修目前 benchmark 的 UID 一致性失敗。
4. 修正後讓 Node 回歸與 benchmark 同時綠燈，再做 1／6／12／24 小時合法存檔測試、實戰平衡與 UI 實測。
5. 使用者說「繼續」表示可自主接續下一個安全項目；不必逐項停下詢問。必須報 **真實 GitHub SHA、實際測試結果**，不能把新增測試檔視為已通過。

## 1. 最新 GitHub 基準

- 正式站：<https://zaza147a.github.io/spirit-pact-era/>（本系列**未部署**）
- 倉庫：<https://github.com/zaza147a/spirit-pact-era>
- 唯一開發分支：`feature/spirit-tamer-dual-pets`
- 本交接寫入前最近程式提交：`cde226f097d0b8423a9336e1f7658ef92347f459`
- 本交接寫入前 compare：`main@006e22522f6419fe082e3b1e4bb710f75560bb70`；測試分支 **ahead 144、behind 0、變更 39 檔**。本交接提交後 ahead 再加 1。其他對話可能改動 main，開始前重新 compare。
- 原交接基準：`27e21918c286a36357b48780d342147c42e77ef3`，當時 V1 交接後 ahead 91。

## 2. 不可更動的設計共識

- 第 11 職一轉御靈使 `spiritist` 即可帶 **兩隻夥伴**；其餘十職只有一隻。
- 路線 A：`pactWarrior` 靈契戰使→靈契戰將→三轉**靈契君王**。人物主攻，兩寵各自協戰／同化。
- 路線 B：`spiritCommander` 雙靈指揮官→雙靈統御者→三轉**萬靈宗師**。雙寵主攻。
- 六種無序融合，兩隻融合寵配對共 21 種（含同類型不同個體），兩職系共 42 組。正／逆融合能力相同，外觀可不同。
- 兩融合寵同時出戰＋雙生靈契 24 擊殺支線才可三轉；仍須原本 Base／轉生 Job／主城／聖印條件。支線 Base140 蒼穹樞城接取，兩寵存活共同擊敗 Lv101–150 敵人。
- 原十職掉裝種類 90/10；御靈使前期 80/20、後期 70/30。**不提高總裝備掉落率、品質、數量**。
- 基礎雙寵係數：一轉第二寵 0.5、指揮官第二寵 0.7（短超載 1.0）、戰使協戰 0.5／0.35；同化寵停止獨立攻擊。這些仍是待實戰驗證的測試參數。
- 御靈使左側 UI：人物上、兩寵下，人物旁進度；盡量不垂直捲動。只擴御靈使 UI，其他十職不改。
- **戰術不納入平衡目標**（模擬清除 `player.tacticEffect`），但正常職業技、寵技、被動、三轉共鳴仍計算。
- 平衡基準：合法配點、裝備與卡片；刻印／契印 0；減傷上限 40%；ASPD193 = 每秒 50/7 次；暴擊率用期望值、不可假設全部 100%；LUK／穿防／攻速共用規則。不得削弱舊十職或降低怪物難度。
- 完全體目標：靈契君王單體／首領前三、清怪前五；萬靈宗師清怪前三、首領前五。**必須以實際戰鬥計時／死亡率證明**，不因目標直接增加無條件倍率。

## 3. 已實作及實測通過

### 3.1 42 組共鳴

- `dist/dual-fusion-resonance.js` 現有 21 個配對 `signature`，兩條路線各 21 個不同 `routeEffect` ID。
- `dist/game.js` 的 `triggerDualSpiritResonance` 在**原本同一次共鳴**內執行配對條件與路線效果，不額外給一次攻擊行動、不自觸發新共鳴。
- 路線 A 偏首領破綻／追擊／控制多怪；路線 B 偏雙寵護盾、治療和續航。現行機制仍大量共用少數基礎操作（破綻／護盾／治療），**不能宣稱 42 組都已完成高品質玩法平衡或有完全獨立動作系統**。
- 補上跨職業事件隔離、防 CD 重複、傷害信用歸屬、42 組正反條件驗證。測試檔：`tests/dual-pet-combat-regression.mjs`、`tests/dual-pet-resonance-signature.test.mjs`、`tests/dual-fusion-resonance.test.mjs`。
- GitHub Actions 使用 Node22 真正跑過：42／42 配對條件及 42／42 路線條件正反案例通過。**這是實際函式的受控戰鬥測試，不是 200／210 地圖全場實戰排名**。

### 3.2 雙寵／UI／相容性

- 雙寵可各自戰鬥／HP-SP／冷卻／復活／裝備指向，老十職維持單寵。
- 戰使寵物姿態在暫時離隊後保存，重選仍保留協戰／同化；已刪除寵物的無效姿態會清。
- 左側「雙生靈契」卡可展開下一步，保留展開狀態；內容不變時避免反覆重建 DOM。只套御靈使。
- 相關 Node 模組回歸與 UI 字串渲染測試通過；**尚未做桌面高 DPI／窄螢幕／實際瀏覽器畫面、整套雙寵裝備比較及八存檔回歸實測**。

### 3.3 真實離線 Worker 測試

- `tests/offline-worker-node-entry.mjs` 是 Node Worker 專用 shim，實際 import `dist/offline-worker.js` → `dist/game.js`，不複製戰鬥公式。
- `tests/offline-worker-smoke.mjs`：非合格離線狀態不執行，原樣返回。GitHub Actions 通過。
- `tests/offline-worker-combat-smoke.mjs` + `tests/fixtures/starter-player.mjs`：Lv1 御靈使基本起始 fixture，**真實離線戰鬥 12 秒／擊殺 6 隻**。GitHub Actions 通過。
- `tests/offline-optimizer-regression.mjs`：補怪時序、空閒跳格、寵技冷卻、掉落 RNG、雜物任務保留、怪物池快取等通過。
- 1 小時起始場景真實 Worker benchmark 首次成功（Actions [#41604711504](https://github.com/zaza147a/spirit-pact-era/actions/runs/41604711504)）：**牆鐘 603ms、模擬完整 3,600,000ms、3378 擊殺、Base XP +68361、Job XP +58227、金幣 +6757、裝備 696 件、Worker heap 14MB、進度回報 16 次**。這是無雙寵、無分解的 Lv1 起始場景，不能用來推斷 200／210 或 24 小時高負載。

## 4. 目前最新 blocker：完整結果重跑不一致（務必優先修）

GitHub Actions workflow `.github/workflows/spirit-tamer-regression.yml` 有兩個 job：

1. `regression`：Node22 回歸全部通過。可參照 [#41604551047](https://github.com/zaza147a/spirit-pact-era/actions/runs/41604551047)。
2. `benchmark-starter`：現在自動跑 1／6／12／24h、每段同 seed 重跑兩次（`SPIRIT_BENCH_REPEAT=2`）。**最新是 FAILURE，且 fail-fast 停在 1h，尚未跑到 6／12／24h。**

重現數據（Actions [#41604904347](https://github.com/zaza147a/spirit-pact-era/actions/runs/41604904347)）：
- 1h 第一次 482ms、第二次 440ms（不同 runner 各次會變）；均 3378 擊殺、同 XP、同金幣、同裝備 696 件。
- **完整 player SHA-256 不同**。安全差異路徑列出 `bag.5.uid`、`bag.7.uid` ...；目前已觀察到差異集中於裝備實體識別碼。
- `dist/loot.js` 的裝備 UID 形如 `g-${Date.now()}-${Math.random().toString(36).slice(2,10)}`（寵裝 `pg-`）。
- 為了不碰正式遊戲，已在 **測試專用** `tests/offline-worker-node-entry.mjs` 支援固定 clock，且 `tests/offline-worker-benchmark.mjs` 傳入 `clock=epoch`。最新 `cde226f` 後的 Actions [#41605027058](https://github.com/zaza147a/spirit-pact-era/actions/runs/41605027058) **仍因 UID 路徑不同失敗**。因此根因尚未完全證明；可能另有亂數來源／執行順序，不能憑猜測宣布修復。
- 下一步：先看最新 Actions job logs，**比對差異不只 path，也要在測試中安全地分析 UID 的時間段與亂數段，避免輸出用戶真實資料**。考慮讓 benchmark 對比兩種雜湊：完整狀態，以及「僅將新掉落 UID 以穩定順序正規化」後的語義狀態；同時驗證所有裝備的詞條／位置／品質／數量、卡片、經驗、金幣、HP/SP、任務都完全一致。**不得在正式遊戲中更改 UID 生成邏輯來使測試變綠**。
- 如果完整 hash 未一致，應標示原因並保留嚴格失敗，不可單純忽略所有 UID（UID 的重複與引用完整性也需測）。
- 目前 `tests/offline-worker-benchmark.mjs` 已能輸出耗時、heap、RSS、進度時點、擊殺、XP、金幣、消耗品、裝備／卡片數、完整 player SHA-256；有 `SPIRIT_BENCH_HOURS`、`SPIRIT_BENCH_REPEAT`、`SPIRIT_BENCH_SEED`、`SPIRIT_BENCH_TIMEOUT_MS`。執行規範在 `docs/offline-worker-benchmark-runbook.md`。

## 5. 最新優先待辦

1. **修復 benchmark UID 不一致／建立語義狀態嚴格對照；讓 regression + benchmark 兩個 GitHub Actions job 綠燈**。先用起始 fixture 1h ×2，再 6／12／24h ×2；查看是否因 bag 接近 1900 格提前停止，**不可把提前停止當完整 24h**。
2. **合法 200／210 存檔場景**：從真正遊戲匯出／驗證存檔，覆蓋兩寵、補血、補給、裝備掉落、自動分解／自售、背包滿、死亡復活、連續試煉。不要將個人真實存檔提交到公開倉庫。需要同 seed 優化前後逐欄位一致性。
3. **職業實戰平衡**：原十職 + 御靈使兩條三轉路線；200 等 191–200 五連戰、210 等 201–210 清怪與首領；合法資源投入，另做同養成時數；分人物、寵1、寵2、共鳴、總 DPS，死亡率／通關時間。Buff 增傷不可重複算獨立 DPS。原十職不得削弱，怪物難度不動，戰術排除。
4. **42 共鳴精緻化與平衡**：已有 42 條件化 route config，但仍多數是破綻／護盾／治療組合。需要多階段內部 CD、互動特色及真實戰鬥效應的逐組驗證，避免純名稱或小數倍率差異。
5. **UI／相容性**：雙寵立繪與 HP/SP、裝備兩欄切換／比較、同化停攻、死亡復活、窄版與高 DPI、八存檔和倉庫／卡片回歸。實體手機／Safari 可按使用者先前指示略過，除非另行要求。
6. 有安全完成項目就提交唯一測試分支，報 SHA、Actions run ID、真實耗時／失敗原因；不得提交到 main 或部署正式站。

## 6. 新增的關鍵提交（按功能）

- CI 工作流程：`a7cb736`；早期離線測試修正：`603e2d7`；真實 Node 回歸失敗修復：`804e50d`。
- 共鳴跨職業防誤觸與回歸：`f194373`、`33f17db`。
- 21 配對／42 route 效果：`c1b849a`、`55adece`、`a3c6a0d`、`2469bb8`；正反測試：`790545f`、`40d406d`。
- UI：`43ad4e3`、`09556b0`、`a4f2d17`、`ea50ac0`；姿態持久化：`8be9188`。
- 離線 Node shim／benchmark：`67d3953`、`a20d11f`、`728e42f`；短戰鬥 smoke：`1503c9d`、`7632f14`；起始 fixture：`1ecfadb`；1h 實測 workflow：`f864d03`；1／6／12／24h ×2：`b907c7f`。
- UID 差異報告：`364f8b3`；只在 benchmark worker 固定 clock：`42c8b9a`、`cde226f`，**仍未修復嚴格結果差異**。

## 7. 可直接貼給新對話的啟動語

> 請直接讀 GitHub `zaza147a/spirit-pact-era` 的 `feature/spirit-tamer-dual-pets` 測試分支，以及 `docs/HANDOFF_SPIRIT_TAMER_2026-11-03.md` 和 `docs/HANDOFF_SPIRIT_TAMER_2026-11-03_V2.md`。不要合併 main、不要更新正式站。現有 Node 回歸與真實 12 秒離線 Worker smoke 已在 Actions 通過，Lv1 起始場景 1h 實測 603ms／3378 擊殺；但 1／6／12／24h ×2 的 benchmark 現在因新掉落裝備 UID 不同而停在 1h。先查看最新 Actions logs，修 benchmark 的嚴格與語義一致性驗證，絕對不要為測試改正式 UID 生成。再跑長時數、合法雙寵存檔、200／210 實戰平衡、42 共鳴精緻化、雙寵 UI。所有改動只提交測試分支，持續自主測試並回報 SHA、Actions run、數據。
