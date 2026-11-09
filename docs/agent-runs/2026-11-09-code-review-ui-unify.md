# 全面程式審查、修正與 UI 統一

日期：2026-11-09。任務狀態：**實作與驗收完成；使用者同意「合併推上」，已提交、快轉併入 `main` 並推送**。

- 使用者授權：「之前都是 gpt 在寫這邊，你詳細檢查一下 code，優化和修 bug，還有把 ui 統一」。
- 工作區 `C:/Git/Kyoto-Tactical-Guide`；分支 `review/code-ui-cleanup`，base `00577f7`（`main`＝`origin/main`）。
- 主代理（Claude）單獨審查與實作：審查是主代理的職責；UI 統一要一次決定色票與 class 架構；Codex 額度見底。沒有派子代理，沒有新增依賴。

## 審查範圍

逐檔讀過 `src/`（資料檔除外）、`scripts/`、`vite.config.ts`、`package.json`、`index.html`。`study.js`、`library.ts`、`interaction.js` 的文箱邏輯沒有找到需要修的錯誤，維持不動。

## 修正的 bug

| 問題 | 重現 | 修正 |
|---|---|---|
| 地圖每次重繪都跳回全區（CONFIRMED） | 詳細頁地圖放大到 16 級 → 點叢集或切日夜 → 跳回 14 級全區 | engine 的 `t` 每次 render 都是新函式，連帶讓叢集、中心點、邊界每次都重算；`MapController` 又把它們放進 effect 依賴。改成 `t` 用 `useCallback([lang])`，`MapController` 只在邊界字串（`toBBoxString`）改變時才 fit。瀏覽器驗證：14 → 放大 16 → 切日夜 16 → 點叢集 16 |
| 從名所目錄進詳細頁再返回，焦點掉到 `<body>`（CONFIRMED，11-06 紀錄的 PLAUSIBLE） | 名所目錄 → 岡崎・平安神宮 → 歸 | engine 記住 `returnFocusId`；首頁掛載時聚焦對應的目錄項（文庫模式聚焦畫布）。驗證：返回後焦點在 `A06` |
| 分區沒有景點時，類型計數沿用上一區（PLAUSIBLE） | 讀取完成但 0 筆時回傳舊計數 | 只在讀取中沿用舊計數，0 筆時回傳空 |
| 改寫中造成的退步：關閉御秘帖結果後焦點遺失 | 關閉時目錄仍是 `inert`，聚焦失敗 | 改回 render 後再聚焦。驗證：關閉後焦點回到「燒肉」標籤 |

## 優化

- 刪除死碼：`MapCanvas.tsx`、`makie-renderer.ts`、`geo-svg.ts`（含測試）、`useWindowSize.ts`、`makie-scene.ts` 中只給渲染器用的兩個函式，以及約 120 行舊屏風／蒔繪入口 CSS。
- 刪除兩張只有舊原型使用、但每次都會發佈的圖（`kyoto-makie-relief.jpg` 642 KB、`toji-makie-study.webp` 380 KB）：`dist` 約 2.2 MB → 1.2 MB。
- 移除 AI Studio 範本留下、從未使用的依賴：`@google/genai`、`express`、`dotenv`、`cheerio`、`autoprefixer`、`@types/express`；`jsdom` 移到 devDependencies，重複的 `vite` 合併。lockfile 少 151 個套件，其餘版本完全不變。`vite.config.ts` 移除 `GEMINI_API_KEY` 注入與亂碼註解；刪 `.env.example`。
- Google Fonts 合併成一個請求，拿掉未使用的 Noto Sans JP 與 300 字重。
- 景點排序改用模組常數與 `Intl.Collator`；統計數字改模組常數，不每次 render 重算。
- 主程式 CSS：58.67 kB → 42.96 kB；主 JS：347.65 kB → 343.00 kB。

## UI 統一

- 新增 `src/theme.css`：唯一色票（`--entry-*`、`--hira-*`，晝夜兩組），套用在 `:root[data-theme]`、`.kyoto-app[data-theme]`、`.bunko.night`。主站與獨立展示頁都匯入；`study.css` 的 `--paper`、`--ink` 等改成引用 token，不再各自寫一套。`<html>` 也帶 `data-theme`，捲動過頭、捲軸、瀏覽器列顏色跟著主題走。
- 首頁改成語意 class（`app-header`、`mode-tabs`、`home-body`、`catalog-overlay` 等），移除寫死顏色的 Tailwind 工具類，以及三層互相覆蓋的舊規則。三個分頁由同一份定義產生。
- 地圖標記、叢集印章、區界線改用 token（Leaflet 用的字面色值註明「mirrors theme.css」）。
- 所有介面文案集中到 `i18n.ts` 的 `UI_DICT`，新增 `translate()`；刪除 16 個沒人用的 key，元件內的中日文三元運算全部移除。

## 檢查

| 命令 | 結果 |
|---|---|
| `npm run lint` | exit 0 |
| `npx --no-install tsx validate_data.js --strict` | exit 0；ERROR 0、WARN 0 |
| `node --test --test-concurrency=1 scripts/makie-scene.test.mjs scripts/location-navigation.test.mjs scripts/toji-study.test.mjs scripts/toji-library.test.mjs scripts/bunko-integration.test.mjs scripts/ui-renewal.test.mjs scripts/app-core.test.mjs` | exit 0；48/48（新增 `app-core.test.mjs` 5 項） |
| `npm run build` | exit 0 |
| `git diff --check` | exit 0 |

新測試 `scripts/app-core.test.mjs`：`translate()` 的退回規則；元件用到的每個 key 在中日兩語都存在；元件不得有中日文三元運算；className 不得有色碼或 Tailwind 色彩工具類；`theme.css` 晝夜兩組 token 名稱一致。

瀏覽器（內建瀏覽器，Vite dev）：375×812 月光首頁（文庫、霞帶、分頁）、名所目錄 → 詳細 → 返回聚焦、御秘帖結果開關聚焦、詳細頁地圖縮放保持；1440×900 暖日名所目錄兩欄、詳細頁；獨立展示頁 `--paper` 取自 token、印章色 `--entry-seal`。重新載入後無主控台錯誤（先前的 Hooks 順序錯誤是改 engine 時 HMR 殘留）。

## 未做／建議後續

- 專案沒有 `@types/react`，React 元件的型別檢查其實很弱（JSX 大多是 any）。補上會出現一批型別錯誤要修，建議另開一輪。
- `study.css` 書卷內的紙色、捲軸等美術色值仍是字面值（屬 P4 書卷翻新範圍）。
- `metadata.json` 是 AI Studio 部署用，描述已過時（「MMORPG-style」），是否還用 AI Studio 需要使用者確認。
- 真實手機、Safari／iOS 未測。

回退：本輪是 `main` 上的單一提交，可用 `git revert` 整筆撤回；刪除的檔案也可從該提交的父版本取回。
