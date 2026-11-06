# 京都專案交接入口

## 2026-11-06 主線交付

使用者已明確授權「寫好合併推上 GIT」，並再次確認最後合回主線。本輪交接目標為 **`main`／`origin/main`**，包含先前 `11c0947` 及本輪程式提交 `08478c3`（地圖柔和選取）、`6d6a132`（十一區文庫與統一檢索）。以下「未 commit／merge／push」均為各階段當時的歷史狀態，不是本輪 Git 授權限制。

- **完成**：十一區文庫首頁、清水寺接面修正、雙語真實書卷、直接拖動／鍵盤換函、月光預設／閒置循環／手動換函立即播放、平面金銀圖紋篩選、名所目錄與御秘帖統一介面。
- **驗收**：本輪重新執行 lint、strict、32 項測試與 build，全數通過；809 筆、ERROR 0、WARN 0。程式來源 hash 與 T4-M4c 畫面證據完全一致，因此本輪文件／Git 作業不重拍相同畫面。
- **待製作**：[歲時記年度活動計畫](SEASONAL_PLAN.md)，含年度總表、季節及日期區間。首頁入口已移除，舊個人行程頁保留；未實作年度資料庫。
- **待體驗／未測**：新圖紋辨識與整體手感；真實手機觸控、OS 減少動態、Safari／iOS、其他 GPU。WebGL 簡化浮雕不等於完整建築模型或 Rust 重構。
- **接手入口**：`npm run dev -- --host 127.0.0.1 --strictPort`（先檢查 3000），首頁 `/`、獨立展示 `/toji-study/index.html`；相關渲染在 `src/studies/toji/`，React 入口為 `BunkoEntrance.tsx`，共用資料與導航規則維持。
- **證據與 Git**：[本輪整合紀錄](agent-runs/2026-11-06-phase04-main-release.md)。`.claude/phase04n/` 與 `.claude/phase04-release/` 僅在原本機，不在遠端；`dist/`、`node_modules/` 與暫存不提交。發布結果以本機 `main` 與 `git ls-remote origin refs/heads/main` 的 SHA 相等為準。


> 2026-11-06 **最新狀態 T4-M4c**：書卷改為平面金銀圖紋篩選；名所目錄、御秘帖及標籤結果統一文庫配色字體；手動換函立即展開並播放。歲時記入口已移除，舊頁保留，年度活動／季節／日期區間另列計畫、尚未實作。lint／strict／build 與 32/32 測試通過；1440px／375px 雙語日夜及滑鼠鍵盤完成，新美術待體驗，實機觸控／OS reduced-motion 未測。主代理單獨實作，未 commit／merge／push。[本輪紀錄](agent-runs/2026-11-06-phase04-bunko-index.md)；[歲時記計畫](SEASONAL_PLAN.md)。證據 `.claude/phase04n/`。以下為歷史狀態。

> 2026-11-06 **最新狀態 T4-M4b**：首頁已依使用者回饋移除介紹、換函列、測試工具及開卷按鈕，改為直接左右拖動文庫／點蓋開卷。預設月光；閒置持續播放，操作時讓出控制，停止操作 1.8 秒後恢復；遵循減少動態並限制閒置繪製頻率。題字採 Shippori Mincho B1，繁中內文採 Noto Serif TC。四項命令、31/31 測試及 1440px／375px 正式建置驗收通過；新節奏與字體待使用者體驗，實機觸控及 OS 偏好未測。主代理單獨完成，未 commit／merge／push。[最新紀錄](agent-runs/2026-11-06-phase04-bunko-moonlight.md)；[前段精簡／拖動紀錄](agent-runs/2026-11-06-phase04-bunko-direct-drag.md)。證據 `.claude/phase04m/`，以下為歷史。

> 2026-11-06 **最新狀態 T4-M4**：使用者已接受清水寺及其餘地標，並授權繼續原任務。十一區文庫已整合主站首頁 `/`，共用原浮雕／書卷與 809 筆資料，銜接既有詳細篩選與地圖；返回保留選區、語言、日夜及減少動態。四項命令與 27/27 測試、1440px／375px 及正式建置流程驗收通過。新首頁編排待使用者體驗；實機觸控、OS reduced-motion 未測。主代理單獨完成，無新依賴、未 commit／merge／push。[本輪紀錄](agent-runs/2026-11-06-phase04-bunko-home.md)。證據 `.claude/phase04k/`。以下「首頁未整合」等為歷史狀態。

> 2026-11-06 **最新修正 T4-M3b**：已確認清水寺灰色基座與舞台頂面同高 79，前緣重疊導致深度衝突，上一輪屋頂修正未解決此處。基座連同殿身抬高 9，底下補木色承座；新增回歸先失敗再通過。四項命令、25/25 測試、四向傾斜與 1440px／375px 雙語日夜驗收通過。[本輪紀錄](agent-runs/2026-11-06-phase04-kiyomizu-plinth.md)。證據 `.claude/phase04j/`；實機觸控未測，未 commit／merge／push。

> 2026-11-06 **最新修正 T4-M3a**：清水寺屋頂改為連續曲面與平滑法線，瓦線貼合曲面，拉開簷口／牆頂間距；四向傾斜未再觀察到原三角暗塊。已恢復原材質、陰影與固定相機。四項命令與 24/24 測試通過，1440px／375px、雙語日夜及滑鼠鍵盤驗收完成；實機觸控未測，原操作手感待使用者體驗。[修正紀錄](agent-runs/2026-11-06-phase04-kiyomizu-roof.md)。證據 `.claude/phase04i/`；未 commit／merge／push。

> 2026-11-06 **目前狀態 T4-M3**：依使用者「依序把其他區地標作完」授權，十個素函已各自補上地標／庭園幾何浮雕，十一區皆可互動、開盒及讀取自己的真實書卷。修正快速換函時文字更新而 canvas 停在前函的問題。四項命令、23/23 測試、桌機 1440px／手機 375px、雙語日夜與正式建置驗收通過；十函美術待使用者體驗，實機觸控與 OS reduced-motion 未測。[本輪紀錄](agent-runs/2026-11-06-phase04-eleven-landmarks.md)。

入口：[十一區文庫](http://127.0.0.1:3000/toji-study/index.html)；本輪可視預覽使用同伺服器 [localhost 入口](http://localhost:3000/toji-study/index.html)，避開舊網址縮放設定。證據 `.claude/phase04h/`。首頁仍未整合，未 commit／merge／push。以下「其他地標未製」等段落是歷史狀態，以本段為準。

> 2026-11-06 **目前狀態 T4-M2c**：修復書卷條目穿過標題的裁切問題，重做紙包卷軸與木端頭；獨立展示新增一區一函的十一區左右切換，各函讀取自己的真實中日資料。東寺保留原浮雕，其餘先用梨地素函，明示地標浮雕待製。四項命令、22/22 測試、1440px／375px 與 production preview 通過；新美術及換函手感待使用者體驗，真實手機橫滑及 OS reduced-motion 未測。[本輪紀錄](agent-runs/2026-11-06-phase04-cabinet-collection.md)。

入口仍為 [文庫展示](http://127.0.0.1:3000/toji-study/index.html)。本輪證據 `.claude/phase04g/`；首頁整合、其他地標浮雕尚未實作，未 commit／merge／push。以下段落為先前各輪紀錄，以本段為準。

> 2026-11-05 **目前狀態 T4-M2b**：使用者已回覆「這版OK!這樣發展下去」，接受 T4-M2a 東寺浮雕方向。本輪完成獨立頁「開盒 → 南之卷 → 收卷」，接上南區 45 筆真實中日資料；四項命令、19/19 測試、1440px／375px 與 production preview 通過。新開盒美術待體驗；實機觸控及 OS reduced-motion 未測。首頁與其他地標未擴展，未 commit／merge／push。[開盒執行紀錄](agent-runs/2026-11-05-phase04-bunko-volume.md)。

預覽：[東寺文庫](http://127.0.0.1:3000/toji-study/index.html)。來源已由 public 移至 `src/studies/toji/` 與 `toji-study/index.html`，正式 build 包含獨立入口。本輪證據 `.claude/phase04f/`。**以下較早狀態按輪次保留；「未實作開盒／美術待體驗」僅描述當時結果，以本段及最新紀錄為準。**

> 2026-11-05 最新成果：已建立 [東寺獨立展示](http://127.0.0.1:3000/toji-study/index.html)，可比較平面／立體浮雕、三種梨地、陰影與軌跡。**這次有實際網頁，首頁仍是舊版**；完整網址必須含 index.html。四項命令通過，含新增幾何測試共 14/14；桌機／窄版與手動減少動態已有新證據，實機觸控、OS reduced-motion 未測，美術待使用者體驗。[本輪紀錄](agent-runs/2026-11-05-phase04-toji-demo.md)。

> 2026-11-05 最新方向：使用者指定研究「初音調度」，首頁改以文庫收納京都書卷為意象；固定構圖，先驗證東寺的隆起／視差／陰影及滑鼠、觸控軌跡，不擴展其他地標。梨地／濃梨地／刑部梨地取代大面積黑色真塗主視覺。**研究完成，新材質與開盒尚未實作／驗收**；舊預覽不是新方向成果。見 [初音研究與文庫方案](agent-runs/2026-11-05-phase04-hatsune-research.md)。

> 2026-11-05 使用者看過東寺樣板後，認為差異不明顯、區域裁切堆疊礙眼；美術未通過。接續移除區域硬切亮面／描邊與地名底板，保留圖上命中及柔和漆光，暫不擴展其他地標。本次修正已完成四項命令及 1440px／375px 可用瀏覽器驗收，美術仍待使用者確認，紀錄見 [去除切片回饋](agent-runs/2026-11-05-phase04-soft-selection.md)。

> 2026-11-05 接續 T4-M1：以 `11c0947` 為基準，東寺樣板與共用漆面光照已實作，四項命令及可用瀏覽器驗收通過；OS reduced-motion 未測，完整驗收為部分完成。只授權實作與驗收，不 commit／merge／push。詳見 [東寺樣板紀錄](agent-runs/2026-11-05-phase04-toji-study.md)。

更新：2026-11-05（本輪自 11-04 跨日執行）。這是目前狀態入口；歷史紀錄不覆寫。新對話先讀本檔，再讀 `../AGENTS.md`、`AGENT_EXECUTION_PLAN.md` 與對應執行紀錄。


## 最新接續：T4-M1 東寺樣板（未提交）

- 基準 `11c0947`；開工時工作區乾淨、與遠端同步。這一輪只實作與驗收，不承接上一輪 Git 授權。
- 東寺新增透明五重塔／側殿／松樹金銀粉素材，地標與底圖合成後共用光照；取消圖示獨立浮起。其餘十座尚未精修，整體仍是 WebGL 2.5D 原型。
- 新增量化地標像素歸屬，修復東寺塔頂落在下京區底圖時選錯區；透明處仍依真實區界。十一區、古地名、圖上鍵盤按鈕保留。
- `lint`、`validate_data.js --strict`、兩份 node 回歸、`build` 皆 exit 0；809／0／0，11/11 tests。主 JS 499.53 kB／gzip 145.03 kB；新 WebP 380146 bytes，無新依賴。
- 實測 1440px、375×812、塔身 hover／點擊、11 區 Tab、中日文、日夜、手動靜止。375px 無橫向溢出、入口皆至少 44×44、無重疊。本輪截圖在 `.claude/phase04c/`。
- **完整驗收部分完成**：Computer Use 因無法可靠判定 Windows 瀏覽器網址而停止。OS reduced-motion、真實觸控、Safari／iOS、GPU context loss／資產失敗未測，沒有 FPS／Lighthouse 新數據。詳見 [完整紀錄與素材 prompt](agent-runs/2026-11-05-phase04-toji-study.md)。
- 後續先評估東寺樣板效果及補足上述驗收，再決定是否擴展，不重做已提交的資料與跨市模型。

## 使用者最新決策

- 繁體中文；先做能自行完成的驗證，再回報。
- 上一輪 2026-11-05 使用者明確授權「這批程式和交接文件 commit & push，不包含 .claude/」，已於 11c0947 完成交付。交付目標為目前分支 `codex/phase4-data-audit`，包含前批資料 commit；未授權合併 main，也不延伸為後續新修改的 push 授權。
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

## 上一輪已執行驗證（截至 11c0947；本輪見頁首）

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
2. 本輪東寺樣板已在未提交 diff；先看新紀錄與截圖評估融合效果，補足未測項後再擴展，不重做同一樣板。
3. 若進一步做獨立地標 3D／法線材質，先定小範圍樣板（例如御所、東寺），量測實際效能後再擴展；不要把 Rust 本身當成美術提升。
4. 相關程式修改後重跑對應測試及 lint／strict／build，補新截圖與本檔；不要套用舊截圖或 Phase 3 Lighthouse 分數。
5. 舊批至 11c0947 已交付；本輪東寺 diff 未獲 commit／push 授權，仍不可自行 merge main。
6. 視覺方向穩定後，回到 PLAN 的後續事實查核與個別點位工作。

詳細來源、派工模型及實作限制：[本輪執行紀錄](agent-runs/2026-11-04-phase04-location-makie.md)。

清理註記：審查用 `C:/Git/_wt_kyoto-art-review` 已從 `git worktree list` 移除且無檔案；Windows 移除根資料夾失敗，後續空資料夾清理被自動核准審查阻擋。不是仍在執行的代理或待合併工作樹，不影響主專案。
