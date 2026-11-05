# 魔力護體「低 HP 危急承傷」201 地圖實測

## 比較條件

- 巫師／賢者 Lv210、契印 8、SSS 神話裝及攻魔融合夥伴，VIT 無額外投資（基礎 VIT=1）。
- 自然生怪，含首領，每組 600 秒，種子 `42,137,731,2026,2027,2028`；禁用自動復活、鎖血與精神集中自動施放。
- 魔力護體開關開啟，平時吸收護盾後剩餘 HP 傷害的 30%；每 1 SP 抵擋 30 傷害、每擊最多使用最大 SP 10%、保留 15% SP。候選方案在 HP 小於等於最大值的 30% 時，將當次吸收比例提高到 60%。
- 護盾、回魔、藥水、敵人及其他技能不更動。

## 六種子結果

| 候選 | 巫師存活 | 巫師平均有效 DPS | 賢者存活 | 賢者平均有效 DPS |
|---|---:|---:|---:|---:|
| 基準：固定 30% | 2/6 | 250,947,958 | 2/6 | 306,387,208 |
| 危急 60%／冷卻 12 秒 | 3/6 | 304,001,534 | 2/6 | 394,667,715 |
| 危急 60%／冷卻 4 秒 | 3/6 | 304,001,534 | 2/6 | 370,080,444 |
| 危急 60%／**無冷卻** | **5/6** | **451,584,917** | **6/6** | **502,213,644** |

備註：有效 DPS 是整場傷害／600 秒，含戰敗後停機；無法將 DPS 差異視為技能的直接輸出加成。無冷卻候選的巫師仍在種子 137 死亡（最後一擊後剩餘 SP 約 66.77%），顯示 SP 不是唯一生存限制。

無冷卻版本平均每場消耗在魔力承傷的 SP：巫師 **32,773**、賢者 **50,756**；平均 HP 傷害吸收：巫師 **976,991**、賢者 **1,511,669**。此為累計消耗，包含自然回復或其他補給，不代表角色可同時持有如此多 SP。

## 判斷與限制

12 秒／4 秒冷卻候選在連續受擊時頻繁失效，即使死亡前仍有充足 SP，致命一擊也可能只能承傷 30%。移除冷卻後兩職存活率大幅提升。保留 15% SP、安全上限每擊 10%、1 SP 抵擋 30 傷害，因此並非無成本減傷。

目前將 **30% 常態／HP 低於 30% 持續 60%** 作為僅限測試分支的暫定候選；尚未驗證其他 VIT、低 SP 存檔、不同裝備階級、200 試煉、長時間離線掛機與全職業生存對比。不得依六種子結果直接部署 main。

## 重現

```sh
node scripts/audit-legal-210-survival-recovery.mjs --jobs=wizard,sage --shifts=0 --vit-zero --tag=mana-guard-emergency60-no-cooldown-vit-zero --seeds=42,137,731,2026,2027,2028 --seconds=600
node --test tests/mage-mana-guard.test.mjs tests/frontier-v6.test.mjs tests/skill-runtime-v402.test.mjs
```

逐種子原始資料：`docs/legal-210-survival-recovery-wizard-sage-mana-guard-emergency60-vit-zero-checkpoint.json`、`docs/legal-210-survival-recovery-wizard-sage-mana-guard-emergency60-cd4-vit-zero-checkpoint.json`、`docs/legal-210-survival-recovery-wizard-sage-mana-guard-emergency60-no-cooldown-vit-zero-checkpoint.json`。
