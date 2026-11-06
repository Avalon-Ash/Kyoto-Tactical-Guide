# T4-M4 — 十一區文庫整合首頁

日期：2026-11-06；工作區 `C:/Git/Kyoto-Tactical-Guide`；分支 `codex/phase4-data-audit`；base／HEAD `11c0947`。使用者接受清水寺修正，回覆「這次ok了，其他我看過沒有穿插。繼續原本任務」，據此接續既定的首頁整合。主代理單獨實作，核心渲染單一寫入，無派工；請求模型／強度不適用，實際主代理設定未經工具確認，未切換。保留前輪及使用者修改，未 commit／merge／push。

## 完成範圍

- 主站 `/` 的行政區入口改為「京洛文庫」：十一區循環換函，保留古地名、代表地標及固定構圖，點蓋／Enter 開卷。沿用使用者已接受的十一函幾何，沒有重製或擴展地標。
- 使用者先前已採納「一區一函、左右切換」方向，因此取代早期行政區輪廓合成的首頁原型。沒有恢復蒔繪／區界切換；完整地理區界仍在既有詳細地圖。
- `BunkoEntrance.tsx` 銜接 React；`study.js` 改為可掛載／卸載的 `mountBunko` 控制器。首頁與獨立展示共用 `template.ts`、幾何、材質及資料，不複製第二套渲染程式。
- CSS 限定於 `.bunko`，日夜樣式限定於文庫首頁；獨立展示保留平面／浮雕和三種底地比較，首頁隱藏展示用材質與保存工具。調整桌機標題留白與畫面高度，1440×900 可看見完整文庫和開卷按鈕。
- 書卷新增「地圖與完整篩選」入口，進入既有行政區 DetailView，再用原有地圖按鈕切換 Leaflet。名所目録／御秘帖保留。
- 首頁與書卷共用中日語言；返回首頁保留行政區、日夜與手動減少動態設定。這些是目前 App 執行期間狀態，重新整理仍使用預設值。
- 卸載時取消事件、觀察器、動畫／RAF、讀卷請求回寫及 WebGL 資源；避免 StrictMode 或重複進出頁面遺留操作。WebGL 不可用仍可用按鈕讀卷。
- 沒有新增依賴、Rust 或大型引擎；仍是原生 WebGL 固定構圖的簡化幾何浮雕，不是建築測繪／歷史復原。

## 驗收

| 命令 | 結果 | 本輪日誌 |
|---|---|---|
| `npm run lint` | exit 0 | `.claude/phase04k/lint.log` |
| `npx --no-install tsx validate_data.js --strict` | exit 0；809 筆、ERROR 0、WARN 0 | `validate.log` |
| `node --test --test-concurrency=1 scripts/makie-scene.test.mjs scripts/location-navigation.test.mjs scripts/toji-study.test.mjs scripts/toji-library.test.mjs scripts/bunko-integration.test.mjs` | exit 0；27/27 | `tests.log` |
| `npm run build` | exit 0；主站及獨立頁皆輸出 | `build.log` |
| `git diff --check` | exit 0 | `diff-check.log` |

新增兩個有實際風險的生命週期測試：無 WebGL 時仍能開卷／同步語言與選區／卸載釋放資源；換函動畫未完成就卸載時，不回寫舊主頁，且可重新掛載。測試使用專案既有 jsdom 與真實資料載入器。第一次測試因測試伺服器關閉時尚有延遲載入而未結束；修正測試前置資料等待，沒有改產品行為或刪減斷言。

使用既有 3000 dev server；另啟動本輪 3001 production preview 驗收正式產物，驗收後關閉自有 preview。瀏覽器控制台 warn／error 為 0。

| 情境 | 實際結果 |
|---|---|
| 桌機 1440×900、手機 375×812 | DPR 1 的正式產物截圖；手機無橫向溢出，開卷入口可見 |
| 十一區逐一輪轉 | canvas 的 ward／renderedWard 全數一致；每次只有一個文庫 canvas；清水寺 70,362 頂點 |
| 滑鼠拖曳盒面 | pointerType=mouse、光跡 9 筆，畫面更新；沒有誤開書卷 |
| 鍵盤 | 左右換函、Enter 開卷；手動減少動態保留浮雕並停用位移／光跡 |
| 語系、日夜 | 首頁／書卷中日同步，日夜與減少動態返回後保留 |
| 書卷 → 詳細頁 → 地圖 → 返回 | 東山區 84 筆，Leaflet 實際載入；卸載後無舊 canvas／開啟的 dialog，返回仍為東山區 |
| 其他首頁模式及重複進出 | 名所目録、御秘帖可用；三輪退出／重新掛載後一個 canvas、WebGL 正常 |
| 獨立展示正式入口 | 平面／浮雕、刑部梨地、日夜、日文與南區 45 筆開卷可用；不顯示首頁專用詳細檢索按鈕 |

本輪新證據在 `.claude/phase04k/`，不提交：

- `home-desktop-zh.png`、`home-desktop-night-ja.png`：首頁日夜與中日。
- `home-mobile-zh.png`、`home-mobile-ja.png`、`reader-mobile-ja.png`、`map-mobile-ja.png`：375px 流程。
- `standalone-desktop-ja.png`：保留的獨立展示。
- `ward-render-cycle.json`、`remount-checks.json`、`browser-state.json`：實際 UI 狀態；`evidence.json` 綁定 base、來源和截圖雜湊。
- 既有 dev tab 的自訂縮放導致工具截圖縮小／黑邊；最終證據改由新開 production tab，以 DOM 確認 DPR 1 與尺寸後重新拍攝，沒有使用失真的截圖充當驗收。

## 交接與限制

**完成**：首頁整合、可用瀏覽器驗收、四項命令與 27 項回歸。清水寺穿插及其他地標的使用者體驗已獲本輪明確確認。資料 schema／locale／受保護檔案均未修改；幾何與 shader 雜湊相較 T4-M3b 未變。

**待使用者體驗**：此次整合後的首頁編排與完整閱讀流程；不將命令通過當作新首頁美術已獲接受。

**未測**：真實手機觸控、OS 層 prefers-reduced-motion、Safari／iOS、不同實體 GPU 與 FPS。手動減少動態已驗收，不能代替上述實機結果。

接續從本輪首頁體驗回饋修整；不重做已接受的十一函，不自行 commit／合併 main／push。舊獨立入口 `/toji-study/index.html` 作材質與深度比較，主入口已是 `/`。
