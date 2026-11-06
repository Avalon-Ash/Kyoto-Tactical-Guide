# T4-M4c — 圖紋檢索、目錄統一與換函喚醒

日期：2026-11-06；工作區 `C:/Git/Kyoto-Tactical-Guide`；分支 `codex/phase4-data-audit`；base／HEAD `11c0947`。

依使用者授權改善書卷工具列、移除歲時記入口並另列年度計畫、手動換函立即播放、統一名所目錄及御秘帖。主代理單獨實作，無派工；請求模型／強度不適用，實際設定未經工具確認，未切換。保留先前全部修改，未 commit／merge／push。

## 完成內容

- 書卷搜尋／地圖／清除排成一列；類型改為平面金銀 SVG 圖紋與短標籤，完整名稱保留於 accessible name／title。手機可橫向捲動；鍵盤可直接選取末端類型。計數縮為「目前 / 全部」。圖形為平紋蒔繪意象的 UI 設計，非實物材質模擬。
- 搜尋與類型交集、日文切換保留類型、清除及 Google Maps 共用導航維持；閱讀列表仍獨立裁切／捲動。
- 手動換函的新 mesh 以展開高度呈現，轉場完成立即解除閒置等待。減少動態仍保留靜態浮雕，不啟動循環。瀏覽器量測鍵盤換函 559ms、滑鼠拖動含輸入 659ms 即已 autoplay，皆短於原 1.8 秒等待。
- 名所目錄改為圖紋／序號／地名／數量的語意按鈕；御秘帖改為圖紋分組與輕量標籤。三個模式共用月光／暖日、字體、紙色及細線；標籤結果亦使用同套樣式。結果對話框支援 Escape、Tab 循環及返回原標籤焦點。
- 首頁移除歲時記入口，保留 `public/seasonal.html` 原檔。研究確認它是六月個人行程；[年度計畫](../SEASONAL_PLAN.md)已列活動主檔／年度場次、季節、日期區間、取消／待公告、跨年與查核流程，**功能尚未實作**。
- 十一區地標幾何、清水寺接面與 shader 未變；無新依賴、無景點資料或受保護檔案修改。

## 驗收

| 命令 | 結果 |
|---|---|
| `npm run lint` | exit 0 |
| `npx --no-install tsx validate_data.js --strict` | exit 0，809 筆、ERROR 0、WARN 0 |
| `node --test --test-concurrency=1 scripts/makie-scene.test.mjs scripts/location-navigation.test.mjs scripts/toji-study.test.mjs scripts/toji-library.test.mjs scripts/bunko-integration.test.mjs` | exit 0，32/32 |
| `npm run build` | exit 0 |
| `git diff --check` | exit 0 |

新增真實 library DOM 回歸：點擊圖紋、關鍵字交集、切換語系保留類型、清除恢復資料及焦點。既有 reduced-motion／生命週期／地標測試保留。Lint 曾發現新鍵盤事件的 DOM 型別推論問題，明確指定容器型別後通過，未弱化檢查。

瀏覽器桌機 1440×900、手機 375×812、DPR 1；繁中／日文、暖日／月光、圖紋篩選、橫向末端項目、鍵盤、滑鼠拖動及結果對話框已驗收，手機無頁面橫向溢出。手機書卷工具區約 155px，列表仍有約 433px 可視高度。既有 bunko／127.0.0.1 網址有縮放設定，改用同服務 `style-review.localhost`，實際讀取 innerWidth／DPR 確認尺寸，沒有用縮放截圖冒充 1440px。

本輪證據 `.claude/phase04n/`：命令日誌、`wake.json`、`desktop-reader.png`、`mobile-reader-ja.png`、`mobile-catalog-ja.png`、`mobile-tags-ja.png`、`mobile-results-ja.png`、`desktop-catalog-day-ja.png`、`desktop-tags-day-zh.png`。證據皆本輪重拍，不提交忽略目錄。

**完成**：上述實作、年度計畫及命令／可用瀏覽器驗收。**待使用者體驗**：圖紋辨識、三頁整體風格與換函節奏。**未實作**：年度活動資料與查詢頁。**未測**：真實手機觸控、實際 OS reduced-motion、Safari／iOS 與其他 GPU；既有程式狀態測試不等於實機驗收。

正式建置以本輪 3001 preview 複驗主頁／御秘帖與獨立入口，console WARN／ERROR 0。獨立頁手動減少動態後換函：lift 0.820、autoplay false、trails 0；開卷、清除及空結果正常。另存 `desktop-tags-night-production.png`、`standalone-empty.png` 與綁定來源 hash 的 `evidence.json`。驗收後停止本輪自有 preview，保留 3000 原伺服器。
