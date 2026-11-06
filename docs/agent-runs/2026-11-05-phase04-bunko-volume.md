# T4-M2b：文庫開盒與南之卷

日期：2026-11-05。**實作與本機可用驗收完成；新增開盒／展卷美術待使用者體驗。**

## 授權、分工與基準

- 使用者對 T4-M2a 東寺獨立展示回覆「這版OK!這樣發展下去」，已接受浮雕／材質方向。本輪延伸開盒、展卷、收卷，其他地標不擴展，首頁尚未整合。
- 工作區 `C:/Git/Kyoto-Tactical-Guide`，分支 `codex/phase4-data-audit`，base／HEAD `11c0947`。保留既有未提交修改，未 reset／clean。
- 核心渲染、資料整合、驗收均由主代理單獨執行；沒有派工，請求模型／強度不適用，工具未確認實際主代理設定，未自行切換。
- 使用 3000 既有 Vite；另以 3001 暫時執行 production preview。無新增依賴，未 commit／merge／push。

## 變更與成本

| 檔案 | 行為 |
|---|---|
| `toji-study/index.html` | Vite 第二 HTML 入口；圖上開盒按鈕與原生 modal dialog |
| `src/studies/toji/geometry.js` | 原有東寺浮雕加上獨立底盒、內壁、三支卷軸，137982 頂點／45994 三角形 |
| `src/studies/toji/shaders.js` | 蓋面連同建築提起並向後移，底盒留在原位；陰影 pass 使用同一變換 |
| `src/studies/toji/study.js` | closed → opening → unrolling → reading → closing；點蓋／Enter 開盒，Escape 收卷、返回焦點；減少動態即時切換 |
| `src/studies/toji/interaction.js` | 點按／拖曳區分，取消／長按不開盒，開閉進度可反轉 |
| `src/studies/toji/library.ts` | 共用 `loadSpotsByWard` 載入南區兩語 45 筆；搜尋、類型、詳情、共用 Maps URL、載入失敗重試；語系請求防止舊結果覆蓋 |
| `src/studies/toji/study.css` | 紙卷、卷軸、375px 排版與常駐收卷控制；表單字體至少 16px |
| `vite.config.ts` | 加入第二入口，正式建置可處理既有 TypeScript loader／locale chunks |
| `scripts/toji-study.test.mjs`、`scripts/toji-library.test.mjs` | 更新來源路徑／幾何範圍，新增真實資料、搜尋、請求版本、點按及開閉測試 |

原 `public/toji-study/` 程式移至上述 source 與 HTML 位置，避免複製景點 JSON；網址仍為 **http://127.0.0.1:3000/toji-study/index.html**。沒有改景點 schema、locale 或受保護 metadata，也沒有抽換首頁架構。

正式建置展示入口 JS 約 255.57 kB（gzip 71.72 kB），含與主站共用 chunk；開盒時另載入選定語系。主站 main＋共用 chunk 合計約 498.79 kB（gzip 146.30 kB），上輪為 498.92 kB（gzip 144.89 kB）；不能只比較 main chunk 就宣稱減少一半。沒有大型新依賴。仍是簡化原生 WebGL 浮雕，不是東寺精確測繪模型；紙卷閱讀層使用 HTML。

## 命令驗收

日誌及新截圖位於 `.claude/phase04f/`，不提交；`evidence.json` 綁定 base SHA、當前來源與證據雜湊。

| 指令 | 結果／日誌 |
|---|---|
| `npm run lint` | exit 0，`lint.log` |
| `npx --no-install tsx validate_data.js --strict` | exit 0；809／ERROR 0／WARN 0，`strict.log` |
| `node --test --test-concurrency=1 scripts/makie-scene.test.mjs scripts/location-navigation.test.mjs scripts/toji-study.test.mjs scripts/toji-library.test.mjs` | exit 0；19/19，`tests.log` |
| `npm run build` | exit 0，`build.log` |

最後調整紙卷固定標題、手機字級及重新開卷的捲動位置後，重跑 lint／build；純邏輯未變。資料與兩組既有回歸仍通過。

## 瀏覽器實測與新證據

- 1440 × 1200：點蓋確實提起整片浮雕、露出底盒與卷軸，然後顯示南之卷；固定相機，沒有區域切片。`opening-00.jpg` 至 `opening-11.jpg` 是連續實際頁面截圖，進度在 `opening-frames.json`；其中 `opening-08.jpg` 可觀察盒蓋／底盒分離。不是另外生成的效果圖。
- 桌機中文 45 筆展卷：`desktop-volume-final.jpg`。搜尋「東寺」＋寺社類型得到 MN-001 一筆；切換日文保留篩選；空結果／清除回 45 筆已驗證。Maps href 的 query 為「東寺 南区 京都」，未操作外部導航。
- 375 × 812 日文／月光／手動減少動態：`mobile-volume-final.jpg`。頁面及紙卷均無橫向溢出；輸入字體 16px，收卷按鈕高度 44px，捲動後仍可使用。開盒立即完成，lift 0.820、trails 0。
- 鍵盤 Enter 開盒、搜尋欄初始焦點、Escape 關閉、焦點回到開盒觸發者有效。使用 native modal，背景不參與頁面操作；Shift+Tab 在邊界可移向瀏覽器 chrome，未宣稱自行實作循環 focus trap。
- 減少動態／閒置時 frame counter 停止增加；沒有進行 FPS 或功耗量測。
- 3001 production preview：兩語 45 筆與篩選成功，無 console error／warn；主首頁成功載入 809 筆與十一區入口。桌機／手機 final 圖均由本輪最後建置產生。
- 本輪前段 `desktop-open.jpg`、`desktop-ja-filter.jpg`、`mobile-ja-night-still.jpg` 早於最後紙卷樣式微調，僅保留調整過程；正式排版以兩張 final 圖為準。opening 連續圖的渲染程式此後未變。

## 未測、待驗收與接續

- 新增開盒／書卷的使用者體驗尚待評價；T4-M2a 浮雕方向已接受，不再標成整體未獲認可。
- 真實手機觸控、Safari／iOS、OS `prefers-reduced-motion` 設定切換、GPU context loss／無 GPU 與載入失敗分支未做實機觸發。手動減少動態及純函式測試不能替代上述情境。
- 初音調度材質研究來源見 [研究紀錄](2026-11-05-phase04-hatsune-research.md)。本輪沿用既有景點資料，沒有新增旅遊事實查核；809 筆 strict 綠燈不等於全庫史實正確。
- 下一階段才整合首頁十一區／古地名／圖上入口；展示頁材質對照工具不是首頁的必經選單。其他地標暫不擴展。
- 本輪不 commit、merge main 或 push；維持全部 diff 供使用者檢視。
