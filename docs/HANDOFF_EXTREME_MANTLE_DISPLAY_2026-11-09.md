# 極限試煉48套V2戰袍：遊戲內顯示尺寸修正交接（2026-11-09）

## 原因與範圍

- V2原畫為1024×1536的直式透明背景全身圖；`compact-v5.css` 將通用角色欄圖像縮成約70×80，直式戰袍因此顯得過小。
- 只針對 `.extreme-outfit-equipped` 在 `dist/extreme-trials.css` 新增覆蓋規則：桌面遊戲角色欄115×170、窄畫面96×144；衣櫃戰袍預覽從108×114提高到126×150。
- 原本CSS的 `object-fit:contain` 保留。未重畫、裁切或重新壓縮48張WebP；一般、金幣、SSS其他時裝不變。
- `dist/index.html` 把專用CSS版本更新為 `2-mantle-portrait-size`，避免舊快取影響觀察。
- 新增 `tests/extreme-mantle-display-size.test.mjs`，並重跑極限試煉回歸以驗證圖片解析與角色顯示選擇器。

## 萬軍魔主（CLEAR）戰鬥畫面附帶修正

- 玩家截圖顯示「萬軍魔主」大型肖像蓋滿戰鬥區，導致清怪軍勢不在可見範圍。原因是此Boss特例使用 `img.extreme-boss-art`，未繼承無盡塔通用 `.art-monster` 的160×150尺寸限制，直接以WebP原始尺寸撐大版面。
- 在同一 `dist/extreme-trials.css` 補齊 `#encounter .tower-monster-portrait img.extreme-boss-art`：桌面最大160×150、小螢幕高度110，保持完整等比例呈現、不裁切；軍勢區 `.extreme-minion-grid` 固定在可用寬度內（寬度100%、最小寬度0）。
- 新增靜態回歸：確認Boss圖尺寸限制、仍保留軍勢網格及五欄布局。未修改軍勢數量、擊殺門檻、首領數值或戰鬥判定。

## 其他留意事項

- 從2026-11-09的遠端main匯出時，既有 `docs/HANDOFF_EXTREME_MANTLES_V2_2026-11-08.md` 內容是非UTF-8的二進位資料，無法以純文字補寫。本次新增本檔，保留原檔不覆寫，後續應另外調查其Git儲存內容。
- 本次不涉及試煉通關、掉落、獎勵、角色平衡或已完成最高層計算。
- 本地完整極限試煉專項測試 `node --test tests/extreme-*.test.mjs`：**98／98通過**（含新增的角色圖尺寸與萬軍魔主清怪畫面驗證）。先前單獨執行六個顯示、資產及切換測試也全部通過；這些屬於98項的子集合，不能重複加總。
- GitHub修正分支、提交SHA與正式版發布驗證應於實際完成後再加註。
