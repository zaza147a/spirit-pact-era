# 靈契紀元 V6.0.0

單人放置RPG：十種進階職業、四角色獨立存檔、寵物進化／變異與雙靈融合。

正式網址：https://zaza147a.github.io/spirit-pact-era/

重新整理即可載入更新；進入角色後才開始戰鬥與掛機。資料存於各玩家自己的瀏覽器，請定期匯出備份。

- 伊卡洛斯大陸1–99；蒼穹彼岸101–200，蒼穹樞城設三轉導師及寵物融合。
- 150級首領5%掉天極覺醒聖印，10枚三轉；三轉人物上限200、Job70。
- 兩隻不同系列150級神話寵融合，六種玩法、12種外觀；寵物融合後才可突破150、上限200。
- 人物死亡等待15秒、寵物10秒；離線掛機最多24小時，支援金幣自動復活。
- 三轉職業五個主動各10級、四個被動各5級；獨立技能點數池，裝備／卡片／舊技能保留。

詳細規則、職業表、六種融合特色與新區表：[V6更新說明](docs/v6-release.md)。

驗證：[2,460場實際戰鬥模擬報告](docs/balance-v6.md)、[完整樣本](docs/balance-v6.json)、[初輪未達標結果](docs/balance-v6-initial.json)。

## 本機驗證

使用Node24或更新版本，無需套件安裝。

`node --test --test-concurrency=4 tests/*.test.mjs`

`node scripts/audit-balance-v6.mjs`

靜態網站入口為dist/index.html；GitHub Actions驗證後發布dist至GitHub Pages。

歷史版本：[V5.0.8](docs/v508-release.md)、[V5.0.7界限進化](docs/ascension-v507.md)。
