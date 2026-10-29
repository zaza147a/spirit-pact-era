# 《靈契紀元》GitHub Pages 發布

本專案為純 HTML/CSS/JavaScript，使用相對資源路徑，支援GitHub Pages的專案子目錄。玩家不需GitHub帳號即可玩公開網站。發布後仍是每個瀏覽器各自存檔。

建議新建獨立公開專案 `spirit-pact-era`，避免改動既有其他用途的專案。推送本專案後，在 Settings → Pages → Build and deployment → Source 選 GitHub Actions。`.github/workflows/github-pages.yml` 會在推送 main 時發布 `dist/`，也可從Actions手動執行。

對於新建的空白GitHub專案，先將原始碼套件解壓至本機，再使用GitHub Desktop的Add Local Repository／Publish Repository，或依新專案頁的Git推送指令上傳。不要把整份ZIP當成遊戲入口直接上傳；Pages需要其中的實際檔案。

原始碼套件僅包含遊戲、測試、文件及Pages工作流程，不含Sites專案識別、Git遠端、登入憑證或任何玩家存檔。以GitHub Free發布Pages時需要公開repository，網站的前端原始碼及圖片也會公開。

注意：GitHub Pages是另一個網域，瀏覽器不會自動搬移舊網址的存檔。已有角色請先在舊網址匯出，再至新網址導入。

官方說明：https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
