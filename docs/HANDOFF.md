# 京都專案交接入口

更新：2026-11-11。這是**唯一的目前狀態入口**；各輪細節在 `agent-runs/`，舊狀態以 Git 歷史為準，不再在文件頂端堆疊「最新狀態」。新對話依序讀 `../AGENTS.md`、本檔、`AGENT_EXECUTION_PLAN.md`，以及 `PLAN.md` 中指定的任務。

## 1. Git 狀態

| 項目 | 狀態 |
|---|---|
| 主線 | `main`：包含十一區文庫（`6d6a132`）、UI 翻新規劃文件（`1608263`）、T4-M5 手機 UI、UI 翻新 P1 文箱放大（`bc688c3`）與 P3 背景（すやり霞）。實際 HEAD 以 `git log -1 main` 為準 |
| 工作分支 | `ux-unify`（尚未合併 `main`、尚未 push）：手勢（`03a4f36`）、卷軸統一與文箱解耦（`6b790e2`）、各區紋樣與短句（`b838d89`）、渲染器拆分與 `npm test`（`2a1ecc0`）、合約更新（`f237c25`），以及其後的文件更新。實際內容以 `git log main..ux-unify` 為準 |
| 遠端與部署 | `origin/main` 是否已同步，用 `git status -sb` 與 `git ls-remote origin refs/heads/main` 確認；push 需要使用者另外授權。GitHub Pages 由 `.github/workflows/deploy.yml` 在 push `main` 時自動部署（`643a816`） |
| 已合併分支 | `codex/phase4-data-audit`、`codex/mobile-bunko-ui` 都已併入 `main`，可刪；刪遠端分支屬於 push，需要授權 |
| 不提交 | `.claude/`、`dist/`、`node_modules/`、驗收截圖與日誌 |

```powershell
Set-Location C:\Git\Kyoto-Tactical-Guide
git fetch --prune; git status -sb; git log --oneline -5
Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
# 3000 沒有 listener 時才啟動：
npm run dev -- --host 127.0.0.1 --strictPort
```

預覽：首頁 `/`，獨立文箱展示 `/toji-study/index.html`。

## 2. 目前產品狀態

| 範圍 | 狀態 |
|---|---|
| 資料 | 809 筆，`validate_data.js --strict` ERROR 0／WARN 0。綠燈不代表全庫事實查核完成 |
| 首頁文庫 | 十一區文箱（原生 WebGL 2.5D 浮雕）；單指盒面移光（撫摩），長拖沿隱形軌道跟手換函（死區 14px、跟隨比 0.6、位移達畫布寬 26% 且上限 200px 放手換函，無 TAB 或按鈕換函，左右方向鍵換函保留；首頁畫布 `touch-action:none`）；雙指捏合／滾輪／快捷鍵放大（上限 3 倍）；點蓋／Enter／空白鍵開蓋直入 `DetailView`（該行政區的卷，無文字搜尋，原本 `library.ts` 書卷對話框已刪除）；文箱核心（`mountBunko`）與展示頁外殼（`mountStudy`）解耦；月光預設、閒置移光 |
| 全站 UI | 手機優先、深色預設；暖日／月光、語系、減少動態全站共用（`App.tsx` → `.kyoto-app[data-theme]`，色票唯一來源為 `src/theme.css`）；卷軸外觀由 `ScrollRoller.tsx` 統一（`DetailView` 與御秘帖標籤結果頁 overlay）；詳細頁固定底部列表／地圖切換；地圖縮放與全區按鈕 |
| 程式審查與 UI 統一 | 2026-11-09 完成：修地圖重繪跳回全區、返回焦點；刪死碼、未用依賴與 1 MB 原型圖；色票集中 `src/theme.css`、文案集中 `i18n.ts`。已併入 `main`，見執行紀錄 |
| 歲時記 | 只有[計畫](SEASONAL_PLAN.md)；首頁入口已移除，舊頁 `public/seasonal.html` 已刪除（Git 歷史可取回） |
| UI 翻新 | P1 文箱放大（`bc688c3`）與 P3 背景（すやり霞＋和紙，霞帶飄移，金箔／銀塵微粒）已併入 `main`。`ux-unify` 再加上十一區各自的紋樣、霞帶配置與一行短句（`src/studies/toji/ward-art.js`；配對與短句是主代理的設計稿，待使用者看過）。P2 蒔繪光澤、`src/lib/spring.ts` 尚未做。規劃見[總計畫](UI_RENEWAL_PLAN.md)、[架構](UI_RENEWAL_ARCHITECTURE.md)、[美術](UI_RENEWAL_ART.md) |
| 文箱架構 | `study.js`（`mountBunko`：手勢、移光、縮放、換函、開蓋）、`renderer.js`（WebGL）、`interaction.js`／`view.js`（純函式）、`backdrop.js`＋`ward-art.js`（背景）、`template.ts`（`BUNKO_STAGE`）。獨立展示頁另由 `study-chrome.js`（`mountStudy`）包一層控制，主站不載入 |

## 3. 最近一次驗收（2026-11-11，`ux-unify`）

| 檢查 | 結果 |
|---|---|
| `npm run lint` | exit 0 |
| `npx --no-install tsx validate_data.js --strict` | exit 0；ERROR 0、WARN 0（809 筆） |
| `npm test` | exit 0；`scripts/*.test.mjs` 67/67、`src/lib/*.test.ts` 6/6 |
| `npm run build` | exit 0 |
| 內建瀏覽器 375×812 | 短撫不換函、長拖換函、點蓋進入南區卷（45 筆、2 個軸頭、無輸入框）、換函後紋樣／霞帶／短句跟著換、暖日與月光兩版、展示頁可換函 |
| 內建瀏覽器 1440×900 | 首頁文箱、紋樣與短句正常，無橫向溢出 |

未測：真實手機觸控手感、Safari／iOS、1440px 詳細頁截圖、FPS。內建瀏覽器的動畫被節流，開蓋與換函的流暢度需實機判斷。

## 4. 下一步（依序）

1. 使用者實機確認手勢手感（參數在 `interaction.js`：`DRAG_DEAD`、`DRAG_FOLLOW`、`SWITCH_SHARE`、`SWITCH_MAX`）與卷軸動線。
2. 使用者過目十一區紋樣與短句（`ward-art.js`），不滿意的區再調。
3. 使用者同意後合併 `ux-unify` 進 `main` 並另外授權 push。
4. 其餘 Phase 4 工作（全庫事實查核、個別景點點位、MapLibre 評估、歲時記資料庫）照 `PLAN.md` Phase 4，各自需要授權。

## 5. 不變條件（摘要；全文見 `AGENTS.md` §2）

- 十一區、古地名與地標保留；蒔繪和區界是同一畫面，不恢復切換或下方清單當主要入口。
- WebGL 浮雕是 2.5D 原型，不是真實 3D 或 Rust 重寫，回報時不得混稱。
- `municipalityId: 'M_OTSU'` 是唯一授權過的受保護型別擴充；其餘受保護檔案仍不可改。
- 所有導航共用 `buildGoogleMapsUrl`；地標座標只讀 `SPOT_POSITIONS`。
- `theme.css`、`index.css`、`bunko-ui.css`、`ClusterMap.tsx`、`study.css`、`bunko.css`、`backdrop.js`、`ward-art.js` 屬同一視覺工作線，同時只能有一個寫入者。

## 6. 執行紀錄索引

| 期間 | 紀錄 |
|---|---|
| Phase 0–3 | `agent-runs/2026-10-28-*.md`、`2026-10-29-phase03.md` |
| Phase 4 資料與地圖 | `2026-11-04-phase04-data.md`、`2026-11-04-phase04-location-makie.md` |
| 文庫首頁（T4-M1～M4c） | `2026-11-05-phase04-*.md`、`2026-11-06-phase04-*.md`；主線交付見 `2026-11-06-phase04-main-release.md` |
| 手機 UI（T4-M5） | [2026-11-06-mobile-bunko-ui.md](agent-runs/2026-11-06-mobile-bunko-ui.md)（含 11-09 補驗） |
| UI 翻新 P3 背景 | [2026-11-09-ui-renewal-p3-backdrop.md](agent-runs/2026-11-09-ui-renewal-p3-backdrop.md) |
| 程式審查與 UI 統一 | [2026-11-09-code-review-ui-unify.md](agent-runs/2026-11-09-code-review-ui-unify.md) |
