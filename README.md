# 靈契紀元 V6.1.0

單人放置RPG：十種進階職業、四角色獨立存檔、寵物進化／變異與雙靈融合。

正式網址：https://zaza147a.github.io/spirit-pact-era/

重新整理即可載入更新；進入角色後才開始戰鬥與掛機。資料存於各玩家自己的瀏覽器，請定期匯出備份。

- 伊卡洛斯大陸1–99；蒼穹彼岸101–200，蒼穹樞城設三轉導師及寵物融合。
- 150級首領5%掉天極覺醒聖印，10枚三轉；三轉人物上限200、Job70。
- 兩隻不同系列150級神話寵融合，六種玩法、12種外觀；寵物融合後才可突破150、上限200。
- 人物死亡等待15秒、寵物10秒；離線掛機最多24小時，支援金幣自動復活。
- 三轉職業五個主動各10級、四個被動各5級；獨立技能點數池，裝備／卡片／舊技能保留。

- 六種融合寵各六招選三招，可設定施放順序；共36招，保留舊配置並開放第三個技能位置。
- 進階二轉60種融合戰契；三轉60種獨立共鳴，分別改變主攻、範圍及終結技。
- 新貢獻評分記錄有效增傷、治療、吸收、承傷與有上限的減傷；融合BUFF可作用於最後一擊及AOE。

本次規則：[V6.1更新說明](docs/v61-release.md)、[完整平衡報告](docs/fusion-balance-v61.md)、[原始模擬樣本](docs/fusion-balance-v61.json)、[六選三篩選](docs/fusion-screen-v61.json)。

歷史：[V6.0三轉與新大陸](docs/v6-release.md)、[V6.0歷史平衡報告](docs/balance-v6.md)。舊版測試報告為歷史紀錄，當前來源驗證以V6.1為準。

## 本機驗證

使用Node24或更新版本，無需套件安裝。

`node --test --test-concurrency=4 tests/*.test.mjs`

`node scripts/screen-fusion-v61.mjs`

`node scripts/audit-fusion-v61.mjs`

靜態網站入口為dist/index.html；GitHub Actions驗證後發布dist至GitHub Pages。

歷史版本：[V5.0.8](docs/v508-release.md)、[V5.0.7界限進化](docs/ascension-v507.md)。
