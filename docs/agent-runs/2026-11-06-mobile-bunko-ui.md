# T4-M5 — 手機優先、深色預設與全站文庫介面

日期：2026-11-06。任務狀態：**實作完成，整體驗收部分完成**。

- 使用者授權：依已提出計畫，手機優先、深色預設，把所有現行頁面 UI 統一並驗收。排除既有歲時記私人行程存檔與年度活動資料庫。
- 工作區：`C:/Git/Kyoto-Tactical-Guide`；分支 `codex/mobile-bunko-ui`；base `aa2db59`。
- 主代理單獨實作。核心視覺由單一寫入者整合；未使用子代理，未修改執行模型／強度，工具未確認實際設定。
- 無 commit／merge／push 授權，全部保留為未提交 diff。沒有新增依賴、修改景點資料、保護檔案或十一區浮雕幾何。

## 變更

| 範圍 | 行為與檔案 |
|---|---|
| 全站主題 | `App.tsx`、`BunkoTools.tsx`、`bunko-ui.css` 共用暖日／月光、語系與減少動態。主站與獨立展示預設月光；主站首頁、詳細頁、地圖共用日夜設定。主題保留在本次開頁期間，重新整理恢復預設。 |
| 首頁／目錄／御秘帖 | `HomeView.tsx` 保留三個入口，所有模式都有主題及語系工具；標籤結果改用共用景點條目。對話框開啟時背景 inert，關閉後在 DOM 更新後恢復焦點。 |
| 書卷 | `BunkoEntrance.tsx`、`study.js` 增加受控偏好同步，不重建控制器。`study.css` 的書卷／文字／分類／搜尋／卷軸同步深色；搜尋 input 16px，手機減少邊框留白，內容維持獨立捲動。 |
| 詳細列表 | `DetailView.tsx` 改為標題、原生橫向分類、副標籤、閱讀區及固定底部列表／地圖切換。從名所目錄進入後返回原模式；詳細頁進入時聚焦標題。 |
| 景點條目 | `SpotCard.tsx`、`MakieIcon.tsx` 共用金銀圖紋、類型、完整標籤、預約提示與至少 44px 導航；移除厚重黑金卡片、發光條與浮動 emoji。導航仍使用同一 `buildGoogleMapsUrl`。 |
| 地圖 | `ClusterMap.tsx` 共用全站日夜；增加放大／縮小／全區按鈕。手機地圖填滿剩餘空間、底部景點面板；桌機側面板 CSS。面板為非模態 dialog，Escape 可關閉，地圖在面板展開時 inert，主站工具及返回仍可使用。 |
| 動態與樣式 | 手動減少動態及系統偏好作用於文庫、頁面切換、地圖移動及面板。清除已無使用者的舊卡片／按鈕／標籤 CSS。新增手機瀏覽器 theme-color，隨日夜同步。 |

## 自動檢查

最終命令日誌保存於本機忽略目錄 `.claude/phase04-mobile-ui/`，以 `evidence.json` 的 source hashes 綁定當前版本。

| 命令 | 最終結果 |
|---|---|
| `npm run lint` | exit 0 |
| `npx --no-install tsx validate_data.js --strict` | exit 0；809 筆、ERROR 0、WARN 0 |
| `node --test --test-concurrency=1 scripts/makie-scene.test.mjs scripts/location-navigation.test.mjs scripts/toji-study.test.mjs scripts/toji-library.test.mjs scripts/bunko-integration.test.mjs` | exit 0；35/35 |
| `npm run build` | exit 0 |
| `git diff --check` | exit 0 |

新增三項實際控制器／DOM 回歸：開卷後改偏好保留搜尋、結果與 canvas，且不回呼造成更新迴圈；系統減少動態不能被手動播放覆蓋；獨立展示預設月光並可切暖日。沒有修改既有測試門檻。

開發中 lint 兩次指出新面板 Tab 清單的型別推論問題，明確標註容器後通過。後續採非模態面板，不攔截 Tab；Escape 與關閉後焦點回復保留。這是操作語意調整，不是弱化檢查。

## 瀏覽器觀察與停止原因

內建瀏覽器開啟 `http://mobile-bunko.localhost:3000/`。環境有既存縮放，viewport API 600×1299 對應實際 `innerWidth=375`、`innerHeight=812`、DPR 約 1.6；以頁面量測為準。截圖 API 後續出現內容縮小與右／下黑邊，原始檔僅留作問題證據，**不得當成完整像素／版面驗收通過**。

停止前已實際走過：

- 深色首頁 → Enter 開南區書卷 → 地圖與完整篩選 → 南區列表 → 探索地圖 → Enter 開東寺・九条 44 筆面板 → Escape 關閉。
- 切日文 → 切暖日，DOM 確認主站與地圖同為 light；頁面無水平溢出。
- 返回列表，以鍵盤 Enter 選最末「幻夢・絵草紙」，顯示 2 筆；日文長名稱保留完整文字。
- 375×812 詳細頁量測：標題及篩選區約 278px，主要內容區約 474px，底部切換仍可見。

後續嘗試透過原生 Chrome 複驗時，Computer Use 回報：**無法可靠判定目前 Windows 瀏覽器網址，已停止本輪 Computer Use**。已停止所有 UI 操作，沒有改用其他自動化繞過限制。這是工具安全停止，不是網站測試通過，也不是自動批准審查拒絕。

停止後補上焦點恢復時機、非模態面板語意、手動減少動態傳遞、標籤結果背景 inert，以及上述三項控制器測試；僅完成本機測試／build，**這些後續修正尚未在瀏覽器重驗**。

## 接續驗收與回退

尚需在可正常使用的瀏覽器完成最終版本 375px／1440px、中日文／暖日月光全矩陣，包含名所目錄、御秘帖結果、空結果、地圖縮放／歸位、面板焦點回復、十一區切換與正式 build 預覽。真實手機觸控、Safari／iOS、OS 實際減少動態與其他 GPU 未測。本輪不可標記為 UI 全部驗收完成。

預覽：本輪自有 Vite session 1670，`http://127.0.0.1:3000/`（交接時仍開啟）；接手先檢查 3000，避免重啟競爭。獨立頁 `/toji-study/index.html`。

回退參考：基準 `aa2db59` 與 `main` 均未更動；比較本分支工作區 diff 即可。不要直接 reset 或覆蓋使用者後續修改。新檔為 `src/bunko-ui.css`、`src/components/BunkoTools.tsx`、`src/components/MakieIcon.tsx` 及本紀錄；本機 `.claude/`、`dist/`、日誌／截圖不提交。

## 2026-11-09 補驗與合併

- 工作區在 2026-11-09 20:08 由 `pull --rebase origin main` 自動暫存後快轉到 `1608263`（UI 翻新規劃文件），本輪 diff 原樣保留，沒有衝突。
- 主代理（Claude）重跑：`npm run lint` exit 0；`validate_data.js --strict` exit 0，ERROR 0／WARN 0；五份 node 測試 35/35；`npm run build` exit 0；`git diff --check` exit 0。
- 內建瀏覽器（Vite dev，`localhost:3000`）補做先前停下的畫面驗收：
  - 375×812：月光首頁（canvas、三個入口與工具按鈕 44px 以上）→ 名所目錄 → 東寺・九条詳細（99 筆、進入時焦點在標題）→ 探索地圖（縮放／全區按鈕 44×44、地圖高 485px）→ 切暖日＋日文（`data-theme=light`、`lang=ja`、`theme-color #eee8db`）。全程 scrollWidth 375，無主控台錯誤，詳細頁沒有小於 44px 的可見按鈕。
  - 1440×900：暖日日文詳細頁地圖滿版 → 返回名所目錄（回到原模式）→ 京洛文庫 canvas 正常；無橫向溢出、無主控台錯誤。
- 觀察：從詳細頁返回後，焦點落在 `body`，沒有回到原本的目錄項目（PLAUSIBLE，小問題，排入 UI 翻新 P4）。
- 仍未測：真實手機觸控、Safari／iOS、OS 層級減少動態、其他 GPU、FPS。
- 依使用者「該合併的合併」，本輪 diff 由主代理 commit 到 `codex/mobile-bunko-ui` 並快轉併入本機 `main`；push 另行詢問。
