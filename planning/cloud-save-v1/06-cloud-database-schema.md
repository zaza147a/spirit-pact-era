# 06｜雲端資料庫 V1：可落地的資料表設計

2026-11-02；**設計草案，非已建立的正式資料庫**。目的：500 帳號×8 角色；全部資產在雲端；角色資料不可任意覆蓋；24h 離線戰鬥。

## 從實際存檔得知
已提供的單格存檔包含：`player.bag` 61 筆（20 件有 uid 的裝備、41 種堆疊物）、`gear` 10 件、`pets` 3 隻（另有 6 件寵物穿戴裝備）、`cards` 76 種、`battleHistory` 12 筆、`autoSellJunk` 228 個物品 ID。裝備 UID 在這份樣本共 36 個且無重複。原始 46,736 bytes、精簡 27,518 bytes。

## 模型與權限
| 表 | 核心欄位 | 唯一／一致性約束 |
|---|---|---|
| accounts | id, auth_subject, status, created_at | auth_subject UNIQUE |
| characters | id, account_id, slot_index, save_version, ruleset_version, stats_json, settings_json | UNIQUE(account_id,slot_index), slot_index=0..7 |
| item_stacks | account_id, character_id?, location, item_id, quantity | UNIQUE(owner/location/item_id)，quantity>=0 |
| equipment_instances | uid, account_id, character_id?, pet_id?, location, slot?, item_id, level, rarity, tier, affixes_json, enhancement, power_version | uid PK，唯一當前歸屬／位置 |
| pets | id, account_id, character_id, species, rarity, evolution, iv_json, level, skills_json, loyalty, fusion_json, true_form, status_json | id PK |
| card_stacks | account_id, character_id?, location, card_id, quantity | owner/location/card_id UNIQUE |
| card_sockets | equipment_uid, socket_index, card_id | UNIQUE(equipment_uid,socket_index) |
| warehouses | account_id, version, settings_json | account_id PK |
| offline_sessions | id, account_id, character_id, started_at, last_settled_at, event_cursor, seed, ruleset_version, frozen_loadout_hash, status | 同角色同時最多 1 個活動 session |
| event_ledger | event_id, account_id, character_id, idempotency_key, action, before_version, after_version, result_hash, created_at | UNIQUE(account_id,character_id,idempotency_key) |
| battle_history | account_id, character_id, timestamp, summary_json | 限量、定期清理；不得成為遊戲權威資產 |
| game_rules | ruleset_version, build_hash, effective_at | 受控部署，客戶端不可修改 |

**位置定義：** `location` enum = `bag`／`equipped`／`warehouse`／`pet_equipped` 等；每一裝備實例只能有一個唯一位置，角色與寵物歸屬需要加 FK 和業務驗證。跨角色轉移在相同交易內完成所有權/位置更新，不能「複製+刪除」分兩次提交。

**卡片實裝：** 原存檔的 `sockets` 是角色裝備槽對應卡片 ID，不是裝備 UID 鏈結；移植前需確定遊戲現有換裝與轉卡規則，不能逕自改成裝備永久綁定卡片。

## 權威操作
- `equip(uid, target_slot, expected_version, idempotency_key)`：DB 查 uid、歸屬、職業與等級合法性，更新裝備欄與背包欄。
- `warehouse_transfer(uid_or_stack, source, target, expected_version, idempotency_key)`：在原子交易內完成扣與加。
- `enhance(uid, next_rank, expected_version, idempotency_key)`：伺服器驗證 D→C→B→A→S→SS→SSS 順序、材料與規則版本，交易扣材與升階。
- `pet_evolve(pet_id, ...)`：伺服器驗證等級、忠誠、進化、融合設定；不可依客戶端提交的最終值判定。
- `offline_claim(session_id, expected_version, idempotency_key)`：恢復凍結狀態與可信游標，依伺服器事件決定最終收益。

## 遷移映射
- `player.attributes`、`jobSkills`、`quests`、`trialClears`、`autoSkills`、`autoPotions`、`autoSellJunk` -> characters 的 stats/settings JSON（逐版驗證）。
- `player.bag[*].qty` -> item_stacks；`player.bag[*].uid` -> equipment_instances。
- `player.gear` -> equipment_instances（位置 equipped）。
- `player.pets` -> pets；`pet.gear` -> equipment_instances（位置 pet_equipped）。
- `player.cards` -> card_stacks；`player.sockets` -> 獨立槽位關聯（以現有規則為準）。
- `player.battleHistory` -> 可選 battle_history，不進高頻核心存檔。
- `player.offline.at` -> **不可當作正式權威離線起點**。首次雲端遷移由伺服器建立新 session。

## 待實測
D1 SQLite 對 4,000 角色、共享倉庫、30～100 件裝備／角色、極端 500 件裝備／角色的 SQLite 實際檔案體積、索引開銷、欄位行數、每次掛機發獎的讀寫量。不得只用 JSON 字串估容量。
