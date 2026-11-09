# 京都專案交接入口

更新：2026-11-09。這是**唯一的目前狀態入口**；各輪細節在 `agent-runs/`，舊狀態以 Git 歷史為準，不再在文件頂端堆疊「最新狀態」。新對話依序讀 `../AGENTS.md`、本檔、`AGENT_EXECUTION_PLAN.md`，以及 `PLAN.md` 中指定的任務。

## 1. Git 狀態

| 項目 | 狀態 |
|---|---|
| 主線 | `main`：包含十一區文庫（`6d6a132`）、UI 翻新規劃文件（`1608263`），以及 T4-M5 手機 UI。實際 HEAD 以 `git log -1 main` 為準 |
| 遠端 | `origin/main` 是否已同步，用 `git status -sb` 與 `git ls-remote origin refs/heads/main` 確認；push 需要使用者另外授權 |
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
| 首頁文庫 | 十一區文箱（原生 WebGL 2.5D 浮雕），拖動換函、點蓋展卷；真實書卷檢索；月光預設、閒置移光 |
| 全站 UI（T4-M5） | 手機優先、深色預設；暖日／月光、語系、減少動態全站共用（`App.tsx` → `.kyoto-app[data-theme]`，色票在 `src/bunko-ui.css`）；詳細頁固定底部列表／地圖切換；地圖縮放與全區按鈕 |
| 程式審查與 UI 統一 | 2026-11-09 完成：修地圖重繪跳回全區、返回焦點；刪死碼、未用依賴與 1 MB 原型圖；色票集中 `src/theme.css`、文案集中 `i18n.ts`。已併入 `main`，見執行紀錄 |
| 歲時記 | 只有[計畫](SEASONAL_PLAN.md)；首頁入口已移除，舊頁 `public/seasonal.html` 保留存檔 |
| UI 翻新 | P3 背景（すやり霞＋和紙，霞帶飄移，金箔／銀塵微粒）已完成並併入 `main`（2026-11-09，使用者看過第三版後同意合併推送）。其餘只有規劃：[總計畫](UI_RENEWAL_PLAN.md)、[架構](UI_RENEWAL_ARCHITECTURE.md)、[美術](UI_RENEWAL_ART.md)。**未授權實作**；放大互動已決定（手勢優先），其餘三項見總計畫 §6 |

## 3. 最近一次驗收（2026-11-09，T4-M5 合併前）

| 檢查 | 結果 |
|---|---|
| `npm run lint` | exit 0 |
| `npx --no-install tsx validate_data.js --strict` | exit 0；ERROR 0、WARN 0 |
| `node --test --test-concurrency=1 scripts/makie-scene.test.mjs scripts/location-navigation.test.mjs scripts/toji-study.test.mjs scripts/toji-library.test.mjs scripts/bunko-integration.test.mjs` | exit 0；35/35 |
| `npm run build` | exit 0；main 347.65 kB（gzip 112.29）、ClusterMap 204.87 kB、study 148.68 kB |
| 內建瀏覽器 375×812 | 月光首頁、名所目錄、東寺・九条詳細（99 筆）、地圖（縮放／全區按鈕 44×44）、切暖日＋日文（`theme-color` 同步 `#eee8db`）；scrollWidth 375，無主控台錯誤，可見按鈕都 ≥44px |
| 內建瀏覽器 1440×900 | 暖日日文詳細頁地圖滿版、返回名所目錄、京洛文庫 canvas 正常；無橫向溢出 |

未測：真實手機觸控、Safari／iOS、OS 層級減少動態、其他 GPU、FPS。觀察到的小問題：從詳細頁返回名所目錄後，焦點落在 `body`，不會回到原本的項目（PLAUSIBLE，排入 UI 翻新 P4）。

## 4. 下一步（依序）

1. 使用者看 P3 霞帶的實際效果（美術由人判斷）；通過後合併。已決定：放大互動手勢優先、背景先做すやり霞。彈簧自寫、順序 P0 → P1 → P2 → P4 照建議預設。
2. 依 `UI_RENEWAL_ARCHITECTURE.md` §0，主代理先寫 `src/lib/spring.ts`、`view.js` 骨架與 `scripts/ui-renewal.test.mjs` 紅色測試，再分包派工。
3. P0 設計 token 已於 2026-11-09 集中到 `src/theme.css`（`--entry-*`、`--hira-*`，主站與文庫共用）；之後的和色調整只改這一份，不另起色票。
4. 其他 Phase 4 工作（全庫事實查核、個別景點點位、MapLibre 評估、歲時記資料庫）照 `PLAN.md` Phase 4，各自需要授權。

## 5. 不變條件（摘要；全文見 `AGENTS.md` §2）

- 十一區、古地名與地標保留；蒔繪和區界是同一畫面，不恢復切換或下方清單當主要入口。
- WebGL 浮雕是 2.5D 原型，不是真實 3D 或 Rust 重寫，回報時不得混稱。
- `municipalityId: 'M_OTSU'` 是唯一授權過的受保護型別擴充；其餘受保護檔案仍不可改。
- 所有導航共用 `buildGoogleMapsUrl`；地標座標只讀 `SPOT_POSITIONS`。
- `theme.css`、`index.css`、`bunko-ui.css`、`ClusterMap.tsx`、`study.css`、`study.js` 屬同一視覺工作線，同時只能有一個寫入者。

## 6. 執行紀錄索引

| 期間 | 紀錄 |
|---|---|
| Phase 0–3 | `agent-runs/2026-10-28-*.md`、`2026-10-29-phase03.md` |
| Phase 4 資料與地圖 | `2026-11-04-phase04-data.md`、`2026-11-04-phase04-location-makie.md` |
| 文庫首頁（T4-M1～M4c） | `2026-11-05-phase04-*.md`、`2026-11-06-phase04-*.md`；主線交付見 `2026-11-06-phase04-main-release.md` |
| 手機 UI（T4-M5） | [2026-11-06-mobile-bunko-ui.md](agent-runs/2026-11-06-mobile-bunko-ui.md)（含 11-09 補驗） |
| UI 翻新 P3 背景 | [2026-11-09-ui-renewal-p3-backdrop.md](agent-runs/2026-11-09-ui-renewal-p3-backdrop.md) |
| 程式審查與 UI 統一 | [2026-11-09-code-review-ui-unify.md](agent-runs/2026-11-09-code-review-ui-unify.md) |
