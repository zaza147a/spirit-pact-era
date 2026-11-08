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
