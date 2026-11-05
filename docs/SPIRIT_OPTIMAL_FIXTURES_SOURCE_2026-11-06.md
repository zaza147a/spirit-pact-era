# 210 等十職基準：唯一有效的舊職業最佳存檔來源

來源：使用者提供的 `spirit-pact-legal-survival-first-10-v6559(1).zip`，原封不動存放於 `tests/fixtures/legacy-best-v6559/`。其中包含 `manifest.json` 和十份 `*-210-sss-sigil8-legal.json`。

**切勿重新用「通用模擬配裝」產生舊十職最優存檔。** 先讀取 `manifest.json` 選定職業，從存檔內的 `player` 取得所有配點、武器、盾牌、卡片、六條詞條、技能與夥伴配置；新職業君王與萬靈才需要另外搜尋。

本次已移除下列不準確、非最優演算法的測試入口及其臨時排名報告：

- `tests/fixtures/spirit-ranking-offensive-player.mjs`
- `tests/spirit-build-component-audit.mjs`
- `tests/spirit-twelve-job-120s-comparable.mjs`
- `tests/spirit-twelve-job-boss-four-120s.mjs`
- `docs/SPIRIT_TWELVE_JOB_120S_MATCHED_PROVISIONAL_2026-11-06.md`

唯一檢查入口：`node --test tests/spirit-legacy-optimal-fixtures.test.mjs`。它只做存檔合法性與對應裝備查驗，不會重寫玩家資料。

注意：原始 `manifest.json` 標明 **stage-one candidate optimum**，通過三個 240 秒種子的混戰生存檢查，並非對所有裝備、卡片詞條做過數學上的全組合證明；不要將清單中的舊 DPS 當成新版程式的即時 DPS。使用目前分支程式時，仍須由上述真實存檔重新跑同條件實戰。
