# 01｜系統架構與安全信任邊界

## 候選基礎架構
```text
玩家手機 / PC 瀏覽器（不可信）
  └─ Cloudflare Pages：UI／圖片／動畫／文字戰報
       └─ HTTPS → Cloudflare Workers：認證驗證、授權、速率限制、規則運算、事件結算
             ├─ 身分提供者（候選：Firebase Authentication）
             └─ Cloudflare D1：帳號、八格角色、全部資產、倉庫、掛機、事件帳本
Private GitHub → 測試／預覽 → 受控發布 Pages 與 Workers
```

- GitHub **私有**不等於前端 JavaScript 私密；只部署需要在瀏覽器執行的程式。真正需要隱藏的演算法僅部署在 Worker。
- 前端只提交操作意圖（例如換裝、打怪、強化、使用藥水、進化、結算離線）；不能將 ATK、經驗、金幣、物品數量、時間或傷害當作權威結果上傳。
- Worker 對 ID Token 完整驗簽、檢查 issuer/audience/expiration，從身分推導 account_id；不可直接相信 request.body.owner_id。
- 每次 API 查詢和更新都以 account_id 做資料隔離，並加上輸入驗證、速率限制、重送保護、規則版本檢查。
- 服務端金鑰放 Secrets，禁止寫到前端、公開倉庫和文件。
- 高價值操作需使用資料庫交易、唯一事件 ID、請求冪等鍵與樂觀鎖，拒絕重複獲獎或倉庫複製。
- 系統不可提供「任意 JSON 覆蓋權威角色」的 API。舊存檔匯入只到獨立測試環境或待驗證遷移區。
- 若玩家開兩台設備，讀取可並行，但互斥更新依 `save_version` 拒絕舊版本；掛機 session 同時只能有一個可信寫入者。

## API 草案
| 方法 | 路徑 | 功能 |
|---|---|---|
| GET | /v1/me | 本人帳號／權限 |
| GET | /v1/characters | 8 格角色摘要 |
| POST | /v1/characters | 由服務端建立角色 |
| GET | /v1/characters/:id | 載入角色權威狀態 |
| POST | /v1/characters/:id/actions | 按規則處理裝備／寵物／冒險動作 |
| POST | /v1/characters/:id/offline/start | 保存掛機起點與規則快照 |
| POST | /v1/characters/:id/offline/advance | 分段模擬與持久游標 |
| POST | /v1/characters/:id/offline/claim | 原子發放可領取成果 |
| GET | /v1/warehouse | 查看帳號共用倉庫 |
| POST | /v1/warehouse/transfer | 原子移動物品 |
| POST | /v1/migration/preview | 僅預覽／隔離匯入舊版 JSON |

## 威脅測試
測試改 localStorage、攔截 HTTP 請求、重放同一 claim、雙開同時領、修改電腦時間、偽造材料／掉落／金錢、跨帳號猜角色 ID、Token 過期、舊版存檔覆蓋和網路斷線。任何一項成功改寫權威資產均視為不通過。
