# 京都專案交接入口

更新：2026-11-14。這是**唯一的目前狀態入口**；各輪細節在 `agent-runs/`，舊狀態以 Git 歷史為準，不再在文件頂端堆疊「最新狀態」。新對話依序讀 `../AGENTS.md`、本檔、`MAKIE_PLATE_HANDOFF.md`（文箱蒔繪盤，§8.1 是接手清單）。

## 1. Git 狀態

| 項目 | 狀態 |
|---|---|
| 主線 | `main`：2026-11-14 併入蒔繪盤的網格重構（p1 鳥居與清水柱網、p2 屋宇與塔、p3 燈籠）與 three.js 渲染器（`?three=1` 才啟用）。實際 HEAD 以 `git log -1 main` 為準 |
| 工作分支 | `claude/great-brahmagupta-ye2uqt`：2026-11-14 與 `main` 同一個 commit（使用者同意合併並 push）。後續 three.js 工作在此分支或新分支 |
| 分支清理 | 2026-11-13 刪除已併入 `main` 的本機 `ux-unify` 與遠端 `claude/relaxed-feynman-lh5xnr`；agy 用的 worktree（`C:\Git\Kyoto-agy`、`Kyoto-agy2`）、舊 clone `C:\Git\_wt_kyoto_chores` 與 `.shots/` 截圖一併刪除（使用者同意） |
| 臨時 clone | `C:\Git\_wt_kyoto_rebuild`（`rebuild`）、`_wt_kyoto_p2`（`p2`）、`_wt_kyoto_three`（`three`）的內容都已併入；保留到使用者確認後再刪。各 clone 的 `.claude/dispatch/` 有派工單、gate 日誌、審查與截圖 |
| 遠端與部署 | `origin/main` 是否已同步，用 `git status -sb` 與 `git ls-remote origin refs/heads/main` 確認；push 需要使用者另外授權。GitHub Pages 由 `.github/workflows/deploy.yml` 在 push `main` 時自動部署（`643a816`） |
| 已合併分支 | `codex/phase4-data-audit`、`codex/mobile-bunko-ui` 都已併入 `main`，可刪；刪遠端分支屬於 push，需要授權 |
| 改名 | 2026-11-13 專案改名 Kyoto Bunko 京洛文庫：GitHub repo 改為 `Avalon-Ash/Kyoto-Bunko`（Pages：`https://avalon-ash.github.io/Kyoto-Bunko/`），本機 remote 已指向新網址。門面 README 改成英／繁中／日三語（`README.md`、`README.zh-TW.md`、`README.ja.md`，附圖在 `docs/images/`）；原本的開發者長文移到 `docs/DEVELOPMENT.md`。本機資料夾已於 2026-11-13 深夜改名為 `C:\Git\Kyoto-Bunko`（使用者手動） |
| 不提交 | `.claude/`、`dist/`、`node_modules/`、驗收截圖與日誌 |

```powershell
Set-Location C:\Git\Kyoto-Bunko
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
| 首頁文庫 | 十一區文箱（2026-11-13 起每區都是 WebGL2 蒔繪浮雕盤；沒有 WebGL2 時退回舊的 2.5D 浮雕）；單指盒面移光（撫摩），長拖沿隱形軌道跟手換函（死區 14px、跟隨比 0.6、位移達畫布寬 26% 且上限 200px 放手換函，無 TAB 或按鈕換函，左右方向鍵換函保留；首頁畫布 `touch-action:none`）；雙指捏合／滾輪／快捷鍵放大（上限 3 倍）；點蓋／Enter／空白鍵開蓋直入 `DetailView`（該行政區的卷，無文字搜尋，原本 `library.ts` 書卷對話框已刪除）；文箱核心（`mountBunko`）與展示頁外殼（`mountStudy`）解耦；月光預設、閒置移光 |
| 全站 UI | 手機優先、深色預設；暖日／月光、語系、減少動態全站共用（`App.tsx` → `.kyoto-app[data-theme]`，色票唯一來源為 `src/theme.css`）；卷軸外觀由 `ScrollRoller.tsx` 統一（`DetailView` 與御秘帖標籤結果頁 overlay）；詳細頁固定底部列表／地圖切換；地圖縮放與全區按鈕 |
| 程式審查與 UI 統一 | 2026-11-09 完成：修地圖重繪跳回全區、返回焦點；刪死碼、未用依賴與 1 MB 原型圖；色票集中 `src/theme.css`、文案集中 `i18n.ts`。已併入 `main`，見執行紀錄 |
| 歲時記 | 只有[計畫](SEASONAL_PLAN.md)；首頁入口已移除，舊頁 `public/seasonal.html` 已刪除（Git 歷史可取回） |
| UI 翻新 | P1 文箱放大（`bc688c3`）與 P3 背景（すやり霞＋和紙，霞帶飄移，金箔／銀塵微粒）已併入 `main`。`ux-unify` 再加上十一區各自的紋樣、霞帶配置與一行短句（`src/studies/toji/ward-art.js`；配對與短句是主代理的設計稿，待使用者看過）。P2 蒔繪光澤、`src/lib/spring.ts` 尚未做。規劃見[總計畫](UI_RENEWAL_PLAN.md)、[架構](UI_RENEWAL_ARCHITECTURE.md)、[美術](UI_RENEWAL_ART.md) |
| 蒔繪浮雕盤 | 預設仍是自寫 WebGL2 管線，但鳥居、清水舞台、屋宇、五重塔、門、迴廊、燈籠、高蒔繪岩已改成顯式網格（不再膨脹）。**2026-11-14 起改走 three.js**（使用者決定，AGENTS.md §2 例外）：網址加 `?three=1` 用新渲染器，盒身梨子地、地面浮雕、水、霞、樹、岩已遷移；狐、鳳凰、鶯仍是平塗佔位。入口文件 [`MAKIE_THREE_PLAN.md`](MAKIE_THREE_PLAN.md)（§2a 初音調度設計語言、§7 進度與待辦）。2026-11-14 雲端 session 依原作照片重做了地：蜂蜜色梨子地、漆面窗光、金色流水、銀的暗面與銀岸、切金接濃梨子地的漸層、盒側梨子地（[`MAKIE_GROUND_PLAN.md`](MAKIE_GROUND_PLAN.md)）；隨機填隙做了又撤回（[`MAKIE_COMPOSITION_PLAN.md`](MAKIE_COMPOSITION_PLAN.md) §7）；ThreeRT 參考渲染路線打通（[`MAKIE_THREERT_REFERENCE.md`](MAKIE_THREERT_REFERENCE.md)） |
| 文箱架構 | `study.js`（`mountBunko`：手勢、移光、縮放、換函、開蓋）、`renderer.js`（WebGL）、`interaction.js`／`view.js`（純函式）、`backdrop.js`＋`ward-art.js`（背景）、`template.ts`（`BUNKO_STAGE`）。獨立展示頁另由 `study-chrome.js`（`mountStudy`）包一層控制，主站不載入 |

## 3. 最近一次驗收（2026-11-14，工作分支 `4b8f9ea` 之後）

| 檢查 | 結果 |
|---|---|
| `npm run lint` | exit 0 |
| `npx --no-install tsx validate_data.js --strict` | ERROR 0、WARN 0 |
| `npm test` | `scripts/*.test.mjs` 121/121、`src/lib/*.test.ts` 6/6 |
| `npm run build` | exit 0；three 獨立成 `three-renderer-*.js`（gzip 約 145 KB），只有 `?three=1` 才載入 |
| 截圖 | 十一區舊管線與 `?three=1` 各 16–18 張（`C:\Git\_wt_kyoto_three\.shots\`），plate=true、無 console 錯誤 |

未測：實機手感、Safari／iOS、手機幀時間（three 版）。

## 4. 下一步（依序）

0. **地已定稿；部件光照第一輪完成**（2026-11-14 晚）：L1 接觸暗部、L2 金地反彈、屋頂窗光、L4 軟陰影、L5 盒側壓暗、岩與樹幹的網點切金與金銀兩面，都已併入 main（[報告](agent-runs/2026-11-14-threert-reference.md) §7、§8）。待使用者實機看；手機幀時間未量。小景只能依附於物、逐區設計，不可隨機撒。

1. three.js 待辦見 `MAKIE_THREE_PLAN.md` §7：T3 材質（銀偏灰、燈窗橙色、青貝）、岩頂面切金覆蓋、T4 狐／鳳凰／鶯、T5 設為預設並刪舊管線。主代理直接做（研究原作與視覺調整是 Opus 5.5 強項，不等外派）；Astra（Codex 約 11/21 重設）或 Fable 5.2（Fable 週額度約 11/15 21:00 重設）有額度時可整包派出；小而具體的包給 Hydrogen。各模型擅長見 `~/.claude/skills/agy-call/MODELS.md`。
2. 派夜間流水線前，先照 [`agent-runs/2026-11-14/pipeline-retro.md`](agent-runs/2026-11-14/pipeline-retro.md) 的 A–H 改好並乾跑。
3. 設計語言一律依初音調度（`MAKIE_PLATE_HANDOFF.md` §3、`MAKIE_THREE_PLAN.md` §2a）；美術取捨由主代理判斷，不必先問。
4. 其餘 Phase 4 工作照 `PLAN.md`，各自需要授權。

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
| 蒔繪浮雕盤 P0–P3 | [P0–P1 雲端](agent-runs/2026-11-12-makie-plate-p0-p1.md)、[P1 本機](agent-runs/2026-11-12-makie-plate-p1-local.md)、[P2](agent-runs/2026-11-13-makie-plate-p2a.md)、[P3 前半](agent-runs/2026-11-13-makie-plate-p3a.md)、[P3 後半（Codex 八區）](agent-runs/2026-11-13-makie-plate-p3b-astra.md)、[P3 收尾](agent-runs/2026-11-13-makie-plate-p3c.md)、[驗收與程式審閱（Codex）](agent-runs/2026-11-13-makie-plate-verify-astra.md)、[P3 晚間](agent-runs/2026-11-13-makie-plate-p3d.md) |
| UI 翻新 P3 背景 | [2026-11-09-ui-renewal-p3-backdrop.md](agent-runs/2026-11-09-ui-renewal-p3-backdrop.md) |
| 程式審查與 UI 統一 | [2026-11-09-code-review-ui-unify.md](agent-runs/2026-11-09-code-review-ui-unify.md) |
