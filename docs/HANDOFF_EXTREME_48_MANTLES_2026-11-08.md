# 四域極限試煉｜48 套職業戰袍交接（2026-11-08）

## 分支與進度

- 工作分支：`feature/endless-trials-three-bosses`（實際為 ATK、MATK、HP、清怪四王）。
- 取得遠端時 HEAD：`9f8757f`；本批新提交 SHA 請以 `git log -1` 為準。
- 嚴禁合併 `main` 或發布正式網站，除非使用者另行授權。
- 保留原始工作樹既有未追蹤檔 `docs/.fusion-balance-v61.json.TgYpCT`，不可加入提交或刪除。

## 本批完成：48 套資料規格及接線

- 新增 `dist/extreme-mantle-catalog.js`：四首領 × 十二職業共 48 個唯一 ID、唯一預定圖片路徑。
- `dist/game.js` 選角、角色立繪、衣櫃預覽改用同一職業／首領圖片查詢函式；換裝選擇仍只存首領代碼，以維持舊存檔相容性。
- `tests/extreme-mantle-catalog.test.mjs` 驗證 48 組唯一映射及三個 UI 接點。
- **美術尚未完成**：目前只有 4 張通用原型 `dist/assets/extreme/outfit-{kind}.webp`。48 個預定路徑在 `dist/assets/extreme/mantles/{kind}-{job}.webp`，目前尚不存在；程式預設維持原 4 張實圖，避免破圖。不可宣稱已完成 48 張獨立美術。

## 後續順序

1. 逐批繪製 48 套真正對應職業的戰袍（建議每個王的 12 套為一批），每批完成上傳 GitHub 並更新本交接。
2. 對完成的圖片逐個檢查人物職業、尺寸、透明背景、手機及選角顯示，通過後才切換 `extremeMantleArt()` 使用該批圖片。
3. 檢查戰袍／背景／光環可互相獨立穿戴、離線及存讀檔一致、失敗停戰、30 階可取得所有核心獎勵，再跑整套回歸及瀏覽器實測。

## 已知限制

- 本批僅完成資料模型及對應接線，未修改美術、掉落、強度或正式版。
- 初步專項驗證：`node --test tests/extreme-mantle-catalog.test.mjs tests/extreme-trials-rewards.test.mjs tests/extreme-trials-ui.test.mjs tests/extreme-trials-integration.test.mjs`，15/15 通過。
- 每個階段都應在交接補上 commit SHA、專項測試與尚缺項，並 `git push` 後才告知已備份成功。

## GitHub 備份注意
本次環境 git push 因缺少 HTTPS 憑證失敗；變更以 GitHub connector 暫存補丁檔 `docs/EXTREME_48_MANTLES_STAGE1.patch` 備份。此文件存在不表示程式已部署。

## 2026-11-08 第二批補記（遠端接線完成）

- GitHub 已直接建立 `dist/extreme-mantle-catalog.js`、`tests/extreme-mantle-catalog.test.mjs`，並更新 `dist/game.js` 三處顯示接線。
- 程式推送成功：`115c96bacddd0512e5cb47899bade4399e7f33cd`（本批結束前的 GitHub SHA）。
- 原始 `.patch` 是可追溯備份，**已不再需要另行套用**，否則可能重複修改。
- 本地專項測試：15/15 通過；尚未做完整瀏覽器驗收。
- **待辦**：48 張職業專屬戰袍原圖；現有四張通用戰袍仍作畫面佔位，不等於 48 套美術完成。

## 2026-11-08 第三批補記（首張職業專屬戰袍）

- 已生成並推送 **破軍 ATK × 騎士 knight** 專屬透明全身戰袍：`dist/assets/extreme/mantles/atk-knight.webp`（1086 × 1448，約 401 KiB）。來源為現有騎士時裝的風格／職業參考，新增紅金戰袍、破軍獅紋與熔金武器。
- 已將 `EXTREME_MANTLE_READY` 設為 `['atk_knight']`；只有騎士裝備破軍戰袍時顯示新專圖，其餘 47 組仍使用四王通用原型，絕不出現未完成圖的破圖。
- 影像提交 `dfb14acbceb1d114cde4c245888054a53317ce30`；啟用與測試提交 `f58f5083c8d60cb21ebb5cc7a4ad642a49e1a3d5`、`dddaa1bdd78e02572192929d651799528ade3be8`。
- 15/15 專項測試通過；未驗證實機瀏覽器視覺，正式版未更新。
- **進度：48 套資料規格已接線；獨立美術 1/48 完成，剩 47 套。** 下一張建議 `atk-crusader.webp`，接著依 `EXTREME_MANTLE_JOBS` 順序完成破軍 12 職，再製作 MATK、HP、清怪各 12 職。
- 上述每批提交均在測試分支。下一批務必讀此文件與遠端最新 HEAD，確認已完成美術路徑，避免重複繪製或重複套用補丁。

## 2026-11-08 第四批補記（破軍 × 十字軍）

- 新增 `dist/assets/extreme/mantles/atk-crusader.webp`（1035 × 1520，約 379 KiB）：銀髮聖騎士、盾劍、紅金破軍戰袍與金獅盾徽；有別於騎士長柄武器。
- 圖片提交 `9c0897dacb29be47e0ef73ca0a7ef5b21762e88f`；啟用提交 `730ea9150b459790ed088248b1b1b859f5402d2f`、`5723ed7547fa3677ded94cde403ca0452c87c136`。
- `EXTREME_MANTLE_READY` 現為 `['atk_knight','atk_crusader']`，其餘 46 組仍顯示既有通用原型；15/15 專項測試通過。
- **累計真正職業獨立戰袍 2/48，剩 46**；下張 `atk-assassin.webp`。仍需瀏覽器畫面驗證，尚未發布正式版。

## 2026-11-08 逐套備份 #3：破軍 × 刺客

- 新增 `dist/assets/extreme/mantles/atk-assassin.webp`，完整透明全身雙短刃刺客戰袍。
- `EXTREME_MANTLE_READY` 增至 3/48，只有已製作圖片啟用；其餘 45 套仍顯示原型。
- 下一套 `atk-rogue.webp`；每張美術與接線、交接須作為**同一 GitHub commit** 保存。

## 逐套備份 #4：破軍 × rogue

- 已完成 `dist/assets/extreme/mantles/atk-rogue.webp`，啟用和測試與圖片同一提交。
- 累計 4/48；下一套依職業／四王清單順序，不能重做已完成項目。

## 逐套備份 #5：破軍 × hunter

- 已完成 `dist/assets/extreme/mantles/atk-hunter.webp`，啟用和測試與圖片同一提交。
- 累計 5/48；下一套依職業／四王清單順序，不能重做已完成項目。

## 逐套備份 #6：破軍 × performer

- 已完成 `dist/assets/extreme/mantles/atk-performer.webp`，啟用和測試與圖片同一提交。
- 累計 6/48；下一套依職業／四王清單順序，不能重做已完成項目。

## 逐套備份 #7：破軍 × wizard

- 已完成 `dist/assets/extreme/mantles/atk-wizard.webp`，啟用和測試與圖片同一提交。
- 累計 7/48；下一套依職業／四王清單順序，不能重做已完成項目。

## 逐套備份 #8：破軍 × sage

- 已完成 `dist/assets/extreme/mantles/atk-sage.webp`，啟用和測試與圖片同一提交。
- 累計 8/48；下一套依職業／四王清單順序，不能重做已完成項目。

## 逐套備份 #9：破軍 × priest

- 新增 `dist/assets/extreme/mantles/atk-priest.webp`；圖片、啟用、測試與交接同一個 GitHub 提交。
- 累計 9/48；下張依資料模型順序，不可重做已完成項。

## 逐套備份 #10：破軍 × monk

- 新增 `dist/assets/extreme/mantles/atk-monk.webp`；圖片、啟用、測試與交接同一個 GitHub 提交。
- 累計 10/48；下張依資料模型順序，不可重做已完成項。

## 逐套備份 #11：破軍 × pactWarrior

- 新增 `dist/assets/extreme/mantles/atk-pactWarrior.webp`；圖片、啟用、測試與交接同一個 GitHub 提交。
- 累計 11/48；下張依資料模型順序，不可重做已完成項。

## 逐套備份 #12：破軍 × spiritCommander

- 新增 `dist/assets/extreme/mantles/atk-spiritCommander.webp`；圖片、啟用、測試與交接同一個 GitHub 提交。
- 累計 12/48；下張依資料模型順序，不可重做已完成項。

## 逐套備份 #13：冥界 × knight

- `dist/assets/extreme/mantles/matk-knight.webp` 生成並啟用；同一 GitHub commit 連同對應測試、交接一起保存。
- 累計 13/48；下一張依四王 × 十二職順序，勿重做。

## 逐套備份 #14：冥界 × crusader

- `dist/assets/extreme/mantles/matk-crusader.webp` 生成並啟用；同一 GitHub commit 連同對應測試、交接一起保存。
- 累計 14/48；下一張依四王 × 十二職順序，勿重做。

## 逐套備份 #15：冥界 × assassin

- `dist/assets/extreme/mantles/matk-assassin.webp` 生成並啟用；同一 GitHub commit 連同對應測試、交接一起保存。
- 累計 15/48；下一張依四王 × 十二職順序，勿重做。

## 逐套備份 #16：冥界 × rogue

- `dist/assets/extreme/mantles/matk-rogue.webp` 生成並啟用；同一 GitHub commit 連同對應測試、交接一起保存。
- 累計 16/48；下一張依四王 × 十二職順序，勿重做。

## 逐套備份 #17：冥界 × hunter

- `dist/assets/extreme/mantles/matk-hunter.webp` 生成並啟用；同一 GitHub commit 連同對應測試、交接一起保存。
- 累計 17/48；下一張依四王 × 十二職順序，勿重做。

## 逐套備份 #18：冥界 × performer

- `dist/assets/extreme/mantles/matk-performer.webp` 生成並啟用；同一 GitHub commit 連同對應測試、交接一起保存。
- 累計 18/48；下一張依四王 × 十二職順序，勿重做。

## 逐套備份 #19：冥界 × wizard

- `dist/assets/extreme/mantles/matk-wizard.webp` 生成並啟用；同一 GitHub commit 連同對應測試、交接一起保存。
- 累計 19/48；下一張依四王 × 十二職順序，勿重做。

## 逐套備份 #20：冥界 × sage

- `dist/assets/extreme/mantles/matk-sage.webp` 生成並啟用；同一 GitHub commit 連同對應測試、交接一起保存。
- 累計 20/48；下一張依四王 × 十二職順序，勿重做。

## 逐套備份 #21：冥界 × priest

- `dist/assets/extreme/mantles/matk-priest.webp` 生成並啟用；同一 GitHub commit 連同對應測試、交接一起保存。
- 累計 21/48；下一張依四王 × 十二職順序，勿重做。

## 逐套備份 #22：冥界 × monk

- `dist/assets/extreme/mantles/matk-monk.webp` 生成並啟用；同一 GitHub commit 連同對應測試、交接一起保存。
- 累計 22/48；下一張依四王 × 十二職順序，勿重做。

## 逐套備份 #23：冥界 × pactWarrior

- `dist/assets/extreme/mantles/matk-pactWarrior.webp` 生成並啟用；同一 GitHub commit 連同對應測試、交接一起保存。
- 累計 23/48；下一張依四王 × 十二職順序，勿重做。

## 逐套備份 #24：冥界 × spiritCommander

- `dist/assets/extreme/mantles/matk-spiritCommander.webp` 生成並啟用；同一 GitHub commit 連同對應測試、交接一起保存。
- 累計 24/48；下一張依四王 × 十二職順序，勿重做。

## 逐套備份 #25：血淵 × knight

- `dist/assets/extreme/mantles/hp-knight.webp` 已繪製、接線啟用、測試對應與交接備份；每件單獨 commit。
- 累計 25/48；未完成外觀仍用原型圖片避免破圖。
