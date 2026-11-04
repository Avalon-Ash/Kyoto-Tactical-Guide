# 京都專案交接入口

更新：2026-11-05（本輪自 11-04 跨日執行）。這是目前狀態入口；歷史紀錄不覆寫。新對話先讀本檔，再讀 `../AGENTS.md`、`AGENT_EXECUTION_PLAN.md` 與對應執行紀錄。

## 使用者最新決策

- 繁體中文；先做能自行完成的驗證，再回報。
- 2026-11-05 使用者明確授權「這批程式和交接文件 commit & push，不包含 .claude/」。交付目標為目前分支 `codex/phase4-data-audit`，包含前批資料 commit；未授權合併 main，也不延伸為後續新修改的 push 授權。
- 地圖入口追求平安京都意象與肉合研出蒔繪的黑漆、金銀粉、浮雕質感；不宣稱歷史考證復原。
- **行政區仍為十一區，保留古地名與地標。蒔繪和區界必須是同一畫面：移入行政區時漆面與代表地標回應，直接點畫面進入。不要恢復「蒔繪／區界」切換，也不要回到下方清單作為主要入口。**
- 使用者提出 Rust／混合 2D、3D 管線；本輪先以原生 WebGL 2.5D 做可評估實作，沒有批准或完成全站 Rust 重寫。
- `.claude/` 不提交。合併 main 與 push 都需各自明確授權；舊 push 授權不延用。

## Git 與預覽

| 項目 | 狀態 |
|---|---|
| 工作區 | `C:/Git/Kyoto-Tactical-Guide` |
| 分支 | `codex/phase4-data-audit` |
| 程式基準 | `86d852b`；本交接文件在後續文件提交中，最新 HEAD 以 `git log -1` 為準 |
| 前批 commit | `fix(data): verify phase 4 records and disambiguate station navigation` |
| main／origin/main 最後確認 | `12d3bfcb2f963833a3131eaa075b6dd5ed541337`；2026-11-05 已 fetch 確認，未合併 main |
| 本輪程式 commits | `a1eeb99` 跨市模型／導航；`86d852b` 互動蒔繪 |
| 交付遠端分支 | `origin/codex/phase4-data-audit`；交付時推送程式與後續文件提交，新對話以 `git status -sb`、`git log '@{upstream}..HEAD'` 確認同步 |
| 本機預覽 | `http://127.0.0.1:3000/` |
| Dev server | 本輪已啟動隱藏背景 Vite；新對話需先檢查 3000 埠，避免重開競爭 |

```powershell
Set-Location C:\Git\Kyoto-Tactical-Guide
git status --short
git log -1 --oneline
Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
# 僅在 3000 沒有 listener 時啟動：
npm run dev -- --host 127.0.0.1 --strictPort
```

IAB 預覽曾多次關閉／尺寸隨面板改變。新對話不要沿用舊 tab ID。程式碼修改後若 HMR 未更新，重新整理；不要以舊畫面驗收。瀏覽器是否開啟與 Vite 是否存活是兩件事。

## 完成與未完成

| 工作 | 實際狀態 |
|---|---|
| T4.1 資料批次 | 已 commit `a0a94f7`，納入本輪分支推送；未 merge main；809 筆、ERROR 0、WARN 0 |
| T4.2 延曆寺跨市 | 已 commit `a1eeb99`，回歸及桌機／窄版抽查完成 |
| 蒔繪／區界單畫面 | 已 commit `86d852b`：原生 WebGL、同投影命中、區域金粉反光、十一區地標回饋 |
| 視覺定稿 | **仍是 2.5D 原型，使用者尚未驗收美術水準**。背景建築為生成意象，十一個地標是另外繪製的象徵紋樣，未完成逐棟精細建模或真實高度／法線素材 |
| Rust | 未導入；不得回報為 Rust／WASM 或完整 3D 重寫 |
| 其餘 Phase 4 | 全庫事實查核、個別景點全座標、MapLibre 評估、歲時記尚未完成；不要把資料綠燈當成全庫事實正確 |

## 本輪變更檔案責任表

下列檔案已分入本輪程式／文件提交，並非待重新實作清單。新對話先用 `git status --short` 確認是否另有使用者變更；沒有仍在寫入的子代理。

| 類別 | 檔案 |
|---|---|
| 市域模型 | `src/types.ts`、`src/data/municipalities.ts`、`src/data/spots/sakyo.ts` |
| 導航與詳圖 | `src/components/SpotCard.tsx`、`src/components/ClusterMap.tsx`、`src/lib/map-clusters.ts` |
| 稽核 | `validate_data.js`、`scripts/audit-data.ts`、`scripts/location-navigation.test.mjs` |
| 蒔繪入口 | `src/components/MapCanvas.tsx`、`src/components/HomeView.tsx`、`src/lib/makie-scene.ts`、`src/lib/makie-renderer.ts`、`scripts/makie-scene.test.mjs` |
| 共用畫面 | `src/index.css`、`src/data/i18n.ts` |
| 美術資產 | `public/art/kyoto-makie-relief.jpg` |
| 文件 | `AGENTS.md`、`README.md`、`docs/PLAN.md`、`docs/AGENT_EXECUTION_PLAN.md`、本檔及本輪執行紀錄 |

`src/lib/geo-svg.ts` 的暫時版面修改已撤回；舊工具保留給歷史測試，首頁不再使用它。不要因為檔名含 SVG 就誤認新入口仍靠 SVG 渲染。Leaflet 詳圖原有 SVG marker 不屬於這次入口替換。

## 設計與資料不變條件

- `wardId`／`areaId` 為旅遊目錄，SK-038 保留原 ID、W_SAKYO、A16。
- 新選填 `municipalityId: 'M_OTSU'` 表示真實所在地大津市；省略為京都市。文字在 registry，不塞入 schema。
- 使用者「繼續處理延曆寺的跨市模型和導航問題」授權本輪對受保護 `src/types.ts` 做這一個最小模型擴充；不是全面開放受保護檔案。
- 跨市景點必須有有效真實座標，未知市域直接報錯；原 ward／area／prefix 稽核仍保留。
- 所有導航仍用 `buildGoogleMapsUrl`。SK-038 查詢為 `比叡山 延暦寺 大津市 滋賀県`。
- 延曆寺在詳圖為自己的 1 筆叢集，從 A16 的京都市內叢集剝離；跨市點可見時保留行政區邊線、取消把市外目的地壓暗的遮罩。
- 新入口的行政區遮罩、CPU 點選、地標位置共用 `makie-scene.ts` 投影。不可分別改比例造成「點此亮彼」。
- 地標座標只讀既有 `SPOT_POSITIONS`。區界遮罩先量化 coverage 再寫 ID，避免反鋸齒產生第三區的假 ID。
- Shader 由底圖亮度近似材質起伏；這不是真實建築／地形高度。古地名與現代行政區同時標示，不把現代地標說成平安時期已存在。

## 已執行驗證

| 指令／情境 | 結果 |
|---|---|
| `npm run lint` | exit 0 |
| `npx --no-install tsx validate_data.js --strict` | exit 0，809／0／0 |
| `npm run build` | exit 0；主 JS 498.11 kB，gzip 144.44 kB；ClusterMap 165.77 kB |
| `node --test --test-concurrency=1 scripts/makie-scene.test.mjs scripts/location-navigation.test.mjs` | exit 0，9／9 通過 |
| `npx --no-install tsx scripts/audit-data.ts` | exit 0；45 景點座標、19 分區中心、0 硬錯誤、0 未說明越界、1 明確跨市項 |
| 1440px 桌機 | WebGL 狀態確認、鍵盤選取地標與金粉區域回饋；未宣稱完成 FPS 或 Lighthouse 測量 |
| 375×812 | scrollWidth 375，十一個入口皆至少 44×44、0 互相重疊；月光、靜止、中日切換通過 |
| 鍵盤 | 圖上銀閣寺 Enter 開啟左京區；延曆寺 marker Enter 開啟正確 1 筆面板 |
| 導航 | 桌機／窄版顯示滋賀縣／滋賀県・大津市，Google Maps href 正確；未點外部導航 |
| 收尾文件與預覽 | 6 份文件的 14 個相對連結皆有效，`git diff --check` 通過；HTTP 200，入口 WebGL、11 地標、入口內 0 個 SVG，已取消暫時 viewport 覆寫 |

2026-11-05 提交前重新執行 lint、strict、9 項回歸與 build 均通過；補回跨市提示 badge 樣式後另跑 build 通過。

本機證據檔在忽略的 `.claude/phase04b/`（不會隨 Git 推送，另一台機器需重拍／重跑）：`makie-interactive-mobile.jpg`、`otsu-desktop.jpg`、`inventory.json`。`makie-desktop.jpg` 是較早靜態版本，**不可當新互動版證據**。`before.jpg` 實際是右京詳情頁，不能拿來聲稱首頁改前比較。

限制：Safari／iOS 實機、真實觸控兩次點擊、OS reduced-motion 切換、GPU context loss／無 GPU 降級的實機測試未覆蓋；手動靜止已驗證，降級與恢復分支已有程式實作。原生座標拖曳受 IAB viewport 影響，沒有宣稱逐區完成滑鼠自動驗收；十一區命中由真實座標回歸測試覆蓋。

## 新對話接續順序

1. 先核對 Git 與本機預覽，不重做 T4.1，保留本輪已提交成果及後續使用者變更。
2. 以本機互動版和使用者確認美術方向。優先改善「代表地標紋樣與底圖建築融合」及有根據的材質素材，而非繼續堆 UI 按鈕或切回雙模式。
3. 若進一步做獨立地標 3D／法線材質，先定小範圍樣板（例如御所、東寺），量測實際效能後再擴展；不要把 Rust 本身當成美術提升。
4. 相關程式修改後重跑對應測試及 lint／strict／build，補新截圖與本檔；不要套用舊截圖或 Phase 3 Lighthouse 分數。
5. 這批 commit／push 已獲授權並作為本輪交付；後續修改需另取得 commit／push 授權，仍不可自行 merge main。
6. 視覺方向穩定後，回到 PLAN 的後續事實查核與個別點位工作。

詳細來源、派工模型及實作限制：[本輪執行紀錄](agent-runs/2026-11-04-phase04-location-makie.md)。

清理註記：審查用 `C:/Git/_wt_kyoto-art-review` 已從 `git worktree list` 移除且無檔案；Windows 移除根資料夾失敗，後續空資料夾清理被自動核准審查阻擋。不是仍在執行的代理或待合併工作樹，不影響主專案。
