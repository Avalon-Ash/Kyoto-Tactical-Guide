# 蒔繪浮雕盤・交接（本機接續用）

更新：2026-11-12（本機接續後）。接手者先讀 `../AGENTS.md`、`HANDOFF.md`，再讀本檔。本檔只講首頁文箱改畫為蒔繪浮雕盤這條工作線；逐項驗收紀錄在 [雲端 P0–P1](agent-runs/2026-11-12-makie-plate-p0-p1.md) 與 [本機接續](agent-runs/2026-11-12-makie-plate-p1-local.md)。

## 1. 現況一句話

南區（東寺）已重畫為 WebGL2 浮雕盤原型。使用者看過第一版後指出「邊線浮起」與「紙片感，要厚實的積體感」，部品已改為膨脹實體；**這一版停在關卡等使用者過目**，本機 commit 尚未 push。其餘十區、以及沒有 WebGL2 的裝置仍走舊的浮雕網格。

## 2. 取得程式

```powershell
Set-Location C:\Git\Kyoto-Tactical-Guide
git fetch origin claude/great-brahmagupta-ye2uqt
git switch claude/great-brahmagupta-ye2uqt
npm ci
npm run dev -- --host 127.0.0.1 --strictPort
```

| 項目 | 值 |
|---|---|
| 分支 | `claude/great-brahmagupta-ye2uqt`（已 push；未開 PR、未合併 `main`） |
| 原型 commit | `24a9836`（雲端）；本機接續 `9d8763a`、`4da66bd`、`a2d63da`（未 push） |
| 基底 | `4ca3adb`，內容等同 `HANDOFF.md` 所說的 `ux-unify` |
| 預覽 | 首頁 `/` 預設就是南區；獨立展示頁 `/toji-study/index.html` |

本機 `ux-unify` 與 `main` 都在 `4ca3adb`（2026-11-12 確認），所以 `ux-unify` 已無獨有內容；`HANDOFF.md` 第 1 節已改。

## 3. 使用者已定案的事

1. 舊版立體建築只當造形借鑑，新版全部重畫為蒔繪。
2. 設計語言是初音調度：肉合研出蒔繪，輔以各種梨地與刑部地、切金切銀、平文，少許青貝。
3. 所有有體積的物件都要有動態與互動。
4. 部品體積要「誇張」。參考：故宮 3D 文物的百寶嵌文具盒（嵌件厚、圓、明顯高出地子，箱側也有紋飾）<https://theme.npm.edu.tw/3d/Content.aspx?sno=04009258&l=1>
5. WebGL2 為基線；要有鶯。
6. 分工：技術與美術由主代理做（靜寫、蒔看成品、內部來回後才交付）；agy 只做雜工。
7. 換函要有軌跡光與回饋感、背景要加環境光影（尚未開始，見第 8 節）。
8. 部品不能像紙片：要厚實的積體感，像 2D 轉 3D 的真實微縮模型（2026-11-12 看過第一版後）。

## 4. 架構

所有新程式在 `src/studies/toji/plate/`。

| 檔案 | 職責 |
|---|---|
| `vocab.js` | 繪畫語彙：`hill`、`stream`、`suyari`、`rock`、`roof`、`storey`、`pagoda`、`hall`、`pine`、`bird`、`shell`。只產生純資料部品（多邊形與折線），不碰 DOM |
| `minami.js` | 南區構圖：呼叫語彙排出 52 個部品 |
| `parts.js` | `PLATES` 登記表、`preparePlate` 驗證、`partAt` 點選查表、`createLife` 彈簧模擬 |
| `spring.js` | 臨界阻尼（不回彈）與欠阻尼（小回彈）彈簧 |
| `bake.js` | Canvas 2D 烘焙成貼圖，並產生部品編號圖 |
| `shaders.js` | GLSL ES 3.00；同一份片段著色器依 `MODE` 編成七支精簡版本 |
| `renderer.js` | WebGL2 繪製流程、箱體網格 `buildBox`（含紐金具、懸子）、部品實體網格 `solidMesh` |
| `cord.js` | 組紐：節點鏈模擬與管狀網格，純函式 |

接線點：

- `src/studies/toji/renderer.js`：先取 `webgl2`，取不到退 `webgl`。`hasPlate(ward)` 為真就交給浮雕盤，否則畫舊網格。浮雕盤建構失敗會 `console.warn` 並全面退回舊網格。
- `src/studies/toji/study.js`：每幀多傳 `presence`（手或閒置光是否在場）；近觀單點呼叫 `poke`。
- `src/studies/toji/bunko.css`：`canvas[data-plate="true"]` 關掉 CSS `drop-shadow`。

### 部品與層

- 盤面座標：x 向右 ±360，z 向下（朝觀者）±230，是一張正面觀看的畫。
- `layer 0` 是地子本身（土坡、流水、青貝），只會隆起，不會立起。
- `layer 1–3` 是貼圖槽：1 放霞與岩，2 放堂、塔、松幹，3 放葉簇與鶯。同一槽內靜止的部品可以重疊；會擺動的部品之間要留間距。
- 每個部品的欄位：`kind`、`group`、`order`、`mat`、`thick`（厚度）、`bias`（沿法線的微偏移）、`reach`（編號圖外擴）、`attach`（搭在哪一組上，鶯用）。
- 一組部品共用一條「腳線」（該組畫面最低的 z）。立起就是整張畫沿腳線往上掀。
- 實體：每組每層一張 2 單位的網格（`solidMesh`），頂點沿部品法線推出 `厚度 × body()`。`body()` 由模糊剪影決定：畫的輪廓外約 2 單位起一道圓牆，往內是圓頂；太細而鼓不起來的形狀（相輪、鶯腳）保留一層薄體。同組相鄰部品共用網格，之間沒有縫。
- 編號圖的 `reach` 現在也是牆的空間：立起的部品 `reach` 至少 4。

### 繪製順序（`renderer.js` 的 `draw`）

1. 箱子落地影、箱體、組紐、蓋面地子（地子頂點依模糊高度位移）。
2. 部品陰影：投影到蓋面，模板緩衝確保每個像素只變暗一次。
3. 部品實體：先只寫深度（alpha-to-coverage 處理輪廓），再用 `EQUAL` 深度測試上色，每個取樣只著色一次。部品之間的前後由深度緩衝決定，不再靠層序。
4. 霞：半透明，最後畫，不寫深度。

### 貼圖

| 貼圖 | 內容 |
|---|---|
| `fine`（RGBA8 陣列，4 層） | R 未模糊的隆起、G 清晰浮雕、B 線描、A 覆蓋 |
| `soft`（R16F 或 R8，四分之一解析度） | R 經 GPU 高斯模糊；地子用它當土坡高度，立起的部品用它當枕形剖面 |
| `ident`（RG8，二分之一解析度，最近點取樣） | R 部品編號、G 材質；CPU 端同一份資料用於點選 |

寬度：畫布寬小於 700px 用 1152，否則 1536。

## 5. 調整旋鈕

| 想調什麼 | 位置 |
|---|---|
| 立起角度上限（弧度） | `parts.js` 的 `HINGE`：屋宇 `.92`、松與鶯 `.84` |
| 靜止時的微仰 | `parts.js` 的 `STAND_REST = .14` |
| 停留多久觸發 | `parts.js` 的 `DWELL_MS = 400` |
| 立起、沉回的快慢 | `parts.js` `update` 裡 `stepSpring(s.stand, …)` 的 `5.5`（起）與 `2.4`（落）；塔每層再除以 `1 + order * .28` |
| 各物件的招牌動作 | `parts.js` 的 `act` |
| 部品厚度 | `vocab.js` 各語彙的 `thick`：預設 24、岩 30、松幹 16、葉墊 24、鶯 16、窗 15 |
| 實體的剖面（牆多陡、頂多圓） | `shaders.js` 的 `BODY`（`bodyS`、`body`） |
| 沉睡時保留多少厚度 | `shaders.js` `partVert` 的 `thick=aPart.w*mix(.72,1.,A.z)*mix(.78,1.,A.y)` |
| 土坡隆起高度 | `shaders.js` 的 `SWELL = 17`（頂點與片段著色器各一處，要同步） |
| 環境光、主光、手邊光池 | `shaders.js` 的 `AMB`、`KEY`、`POOL`；光池範圍在 `setLight` 的 `d2/24000.` |
| 日夜的光色 | `shaders.js` `setLight` 的 `gKeyC`、`gPoolC`、`gAmbC`（夜間主光偏冷、手邊光近白，金只在手邊醒來） |
| 金屬反射的房間 | `shaders.js` 的 `room()` |
| 金、淡金、銀、漆、琥珀漆的顏色 | `shaders.js` 的 `GOLD`、`PALE`、`SILVER`、`LACQ`、`AMBER` |
| 梨地三層深度的顏色與密度 | `shaders.js` 的 `nashiji()`；地子密度是 `main` 裡的 `dens=.60+.16*vnoise(…)` |
| 漆面高光 | `shaders.js` 的 `coat()` |
| 光源高度 | `renderer.js` 的 `LAMP_H = 70` |
| 實體網格密度 | `renderer.js` `solidMesh` 的 `cell`（預設 2 單位，南區約 14 萬頂點） |
| 組紐長度、粗細、位置 | `cord.js` 的 `nodes`、`seg` 與 `cordTube` 的半徑；`renderer.js` 的 `FITTINGS` |
| 組紐對拖曳與換函的反應 | `renderer.js` `draw` 的 `pull`（`* .5`）與 `kick`（`* 420`） |
| 箱側紋飾 | `shaders.js` `MODE==0` 的 `m==20` 區塊 |

## 6. 新增一區的步驟

1. 在 `plate/` 新增 `<ward>.js`，仿 `minami.js` 用語彙排構圖；缺的造形先加進 `vocab.js`。
2. 在 `parts.js` 的 `PLATES` 登記 `W_XXX: builder`。
3. `scripts/plate.test.mjs` 會自動驗證每個登記的區；其中「一隻鶯兩個棲點」是對每區的要求。
4. 部品上限 63 個（`MAX_PARTS = 64`，0 號留給地子）。

## 7. 驗證狀態

數字與逐項紀錄在 [本機接續紀錄](agent-runs/2026-11-12-makie-plate-p1-local.md)。綁定 `a2d63da`：

| 檢查 | 結果 |
|---|---|
| lint／validate `--strict`／test／build | 全部 exit 0；ERROR 0、WARN 0；`scripts` 89/89、`src/lib` 6/6 |
| 真實 GPU（RTX 4070，無頭 Chrome，D3D11，4× 多重取樣）1440×900 月光、暖日 | 已看 |
| 375×812 月光 | 已看 |
| 減少動態、語系切換、鍵盤、換區再回南區、開蓋後內部 | 以狀態屬性與截圖確認；部分截圖未逐張細看（見紀錄） |
| 閃爍量測 | 最大倍率下指標靜止 0.500、繞圈 0.512（逐幀平均差，0–255）；單點最大差 255 來源未定位 |

**仍未驗**：

- 真機觸控、iOS Safari、手機實際幀率（實體網格約 14 萬頂點）。
- 沒有 WebGL2 的退回路徑（程式未改，但沒重看）。
- 開蓋過程的中間幀、實體版在最大倍率下的逐幀並排目視。
- `scripts/shots.mjs` 從未實際產生過截圖（專案沒有 Playwright）。

無頭截圖的注意事項：有獨立顯示卡的機器用 `--use-angle=d3d11 --enable-gpu`；沒有的用 `--use-angle=swiftshader --enable-unsafe-swiftshader`。預設參數下只有約 1fps，彈簧幾乎不動，容易誤判成渲染器太慢。無頭環境的 rAF 不同步垂直更新（約 240 Hz），量測頁的暖機幀數要加大（`&warmup=900`）。

## 8. 待辦（依序）

### 8.1 關卡：待使用者回覆

- 「膨脹實體」是不是使用者說的「2D 轉 3D 的真實微縮模型」，還是要四面建模的真 3D 建築。
- 立起的最大角度（現約 53 度）要更誇張還是收一點。
- 確認後才進 P2。

### 8.2 已做（2026-11-12 本機）

蒔的四點（濃梨地、金的亮度與層次、松葉簇、岩）、組紐與紐金具、箱側紋飾、內梨地與懸子、蓋緣倒角浮起的錯誤。都還沒有經使用者過目。

### 8.3 蒔還想修的

- 懸子裡是空的；箱側切金在月光下偏白。
- 鶯在全景裡太小，看不出是鳥。
- 霞帶在蓋面上仍像撒粉，不像有邊的金霞。

### 8.4 之後的階段

| 階段 | 內容 |
|---|---|
| P2 | 換函：軌道上同框繪製前、現、後三函；拖曳軌跡光、十一枚切金刻度、過門檻回饋（刻度亮、輕頓、短震）。背景：黑漆卓面的接地影與反光、障子格光、浮塵 |
| P3 | 其餘十區構圖。主代理先做兩區當範本，其餘依構圖表轉錄，每批 2–3 區，逐批給使用者過目 |
| P4 | 效能、降級、刪除舊的 `geometry.js` 場景與 `landmarks.js` 建模（地標名稱文字保留）、改寫舊測試、更新 `HANDOFF.md` |

## 9. 已知問題

| 問題 | 狀態 |
|---|---|
| 部品邊緣抗鋸齒依賴 alpha-to-coverage；畫布沒拿到多重取樣的裝置會是硬邊 | PLAUSIBLE |
| 同組部品立起速度不同時，相鄰部品之間的網格會短暫被拉長 | PLAUSIBLE |
| 最大倍率下有單點逐幀差 255，來源未定位 | PLAUSIBLE |
| 組紐沒有落地影 | 已知取捨 |
| 點蓋開箱的命中判定沒算箱體傾斜（最大約 3 度） | PLAUSIBLE，影響應很小 |
| 立起的部品陰影只投在蓋面，不會投在其他部品上 | 已知取捨 |

## 10. agy 派工單（2026-11-12 已執行 A1、A2；A3 已派出，結果見本機接續紀錄）

實測：agy 只要跑一次允許清單外的終端機指令，整包就被終止。派工單開頭要寫明「讀檔與搜尋只用讀檔工具，終端機只在最後跑驗收指令」。

共同條件：

```text
角色、請求模型、推理強度、選用理由：機械性實作；Gemini 3.8 Flash high（agy）；範圍明確、可與主代理並行
工作區絕對路徑、分支、base SHA：另開工作樹（例 C:\Git\Kyoto-agy）；由 claude/great-brahmagupta-ye2uqt 的 HEAD 分出；base 以 git rev-parse HEAD 為準
前置任務是否完成：是（原型已 push）
禁止操作／不能改變的行為：不得 commit、push、切分支、再派子代理；不得修改 src/studies/toji/plate/shaders.js、plate/renderer.js、plate/vocab.js、plate/minami.js、backdrop.js、ward-art.js、bunko.css、study.css、theme.css、index.css、bunko-ui.css、ClusterMap.tsx 及 AGENTS.md §2 的受保護檔案；不得新增依賴
探索範圍、重試上限、停止條件：同一檢查失敗或逾時兩次即停，交出日誌
回報位置或格式：AGENTS.md §6 的結果格式，寫入 docs/agent-runs/2026-11-12-agy-<任務>.md
```

### A1 閃爍量測

```text
任務／PLAN ID：蒔繪浮雕盤 P0-A1 閃爍與幀時間量測
必讀檔案／已確認事實：src/studies/toji/standalone.ts、study-chrome.js、study.js、renderer.js、plate/renderer.js（只讀）
可修改檔案：src/studies/toji/study-chrome.js、src/studies/toji/standalone.ts；新增 src/studies/toji/probe.js、scripts/probe.test.mjs
交付結果與來源證據：展示頁網址帶 ?probe=flicker 時，固定倍率與指標位置，讓指標沿小圓微移 N 幀；以離屏 2D canvas drawImage 取樣主畫布（在繪製同一個 task 內），輸出相鄰幀平均絕對差、最大差、幀時間中位數與 95 百分位到頁面與 console。純計算部分（差值、百分位）放 probe.js 並附 node 測試。不帶參數時行為不變
驗收指令、瀏覽器情境與逾時：npm run lint（120 秒）、npm test（180 秒）；瀏覽器開 /toji-study/index.html?probe=flicker 取得一組數字（300 秒）
```

### A2 截圖矩陣

```text
任務／PLAN ID：蒔繪浮雕盤 P0-A2 截圖矩陣腳本
必讀檔案／已確認事實：本檔第 7 節的無頭瀏覽器參數；.gitignore
可修改檔案：新增 scripts/shots.mjs；必要時 .gitignore 加一行輸出目錄
交付結果與來源證據：有 Playwright 就用，沒有就印出說明並以非零碼結束（不安裝）。對已啟動的 127.0.0.1:3000 拍：1440×900 與 375×812 × 暖日／月光 × 中／日 × 一般／減少動態，各拍全景與指標停在盤面中央 6 秒後兩張；輸出到不提交的 .shots/
驗收指令、瀏覽器情境與逾時：npm run lint（120 秒）；實跑一次並列出產生的檔名（300 秒）
```

### A3 圖像來源

```text
任務／PLAN ID：蒔繪浮雕盤 P0-A3 初音調度技法圖像來源彙整
必讀檔案／已確認事實：docs/agent-runs/2026-11-05-phase04-hatsune-research.md
可修改檔案：docs/agent-runs/2026-11-05-phase04-hatsune-research.md（只在文末新增一節）
交付結果與來源證據：每項技法（肉合研出、濃梨地、村梨地、刑部梨地、切金、平文、青貝、葦手）各列 1–3 個可公開瀏覽的圖像或解說頁，附網址、館藏或出處名稱、查核日期；查不到的寫「未確認」，不推測
驗收指令、瀏覽器情境與逾時：只改文件；檢查連結可開與 diff 範圍
```
