# 全站 UI 翻新計畫（FeralUI 作法萃取）

> 2026-11-11 現況：P0 token、P1、P3 已完成；2026-11-11 UX 統一完成部分 P4；P2 與彈簧未做。
> 參考來源：feralui.dev 網站與 npm 套件 `feral-blinds@0.3.1`、`deskfolio@0.1.1`、`pullcord@0.1.0`、`feral-blob@0.2.0`（均為 MIT）。Hologram 只存在於網站打包檔，沒有發佈成套件，網站本身沒有標示授權，**只參考原理，不複製程式碼**。

## 1. 目標

1. 全站 UI 翻新，統一成「漆器・肉合研出蒔繪」的材質語言與手感。
2. 首頁文箱可以放大近看。
3. 首頁背景目前太空，要加入有層次、不搶戲的內容。

## 2. 從 FeralUI 萃取的作法

### F1　彈簧核心（`feral-blinds` 的 `spring()`）
- 半隱式 Euler 積分：`v += (K·(target−x) − C·v)·h; x += v·h`，固定 1/240 秒子步，不受幀率影響。
- 預設 `K=170, C=17`（輕微過衝）。減少動態時改用 `K=320, C=36`（臨界阻尼、不回彈），並把傾斜量歸零。**不是直接停掉動畫，而是換成不回彈的參數。**
- 甩動判定：放手時用 `x + v·0.22` 預測落點，再取最近的格位，所以輕甩能跳過一格以上。
- 收斂條件：`|target−x| < 0.05` 而且 `|v| < 0.5`，達到後直接貼齊並停掉 RAF。

### F2　Hologram 光澤疊層
- **深度圖驅動浮雕光**：灰階深度圖（暗＝高）→ SVG `feDiffuseLighting` 加上跟隨指標的 `fePointLight`，產生凹凸受光。原理和肉合蒔繪「高蒔繪和研出蒔繪同面並存」的立體感是同一件事。
- 狀態只有三個 CSS 變數：`--px`、`--py`（光點位置 %）和 `--active`（0～1，互動強度）。每幀用與幀率無關的插值逼近目標：`1 − (1−0.15)^(dt·60)`。
- 四層疊加：foil（色帶）、glitter（亮片貼圖乘上以指標為圓心的放射漸層，`screen` 混合）、glare（`soft-light` 放射高光）、內緣陰影（inset box-shadow）。
- 傾斜：`perspective(1100px) rotateX/Y(偏移/18)`，按住時 `scale(1.045)`，放開以 500ms 回正。
- 閒置：沒有互動時，光點沿餘弦曲線自己掃過，`--active` 降到 0.12。這和文庫現有的閒置移光同源，可以直接對齊。

### F3　DeskFolio 開合
- 用 `motion` 的 spring（`bounce` 0.2～0.42、`visualDuration` 0.35）驅動頁面 `rotateY`，搭配 `backface-visibility` 和 `perspective: 2200px`。
- `will-change` 只在動畫進行中開啟，平時關掉。

### F4　和色漸層背景（Gradients 工具）
- 傳統和色色票（月白、藍白、白鼠、桜色、鴇色……），用 Canvas 2D 的多個 `createRadialGradient` 疊成網格漸層，再加顆粒。
- 這是背景題材與色彩的參考，不是要照搬它的成品。

## 3. 京都現況（翻新的起點）

- 文箱：原生 WebGL，已有指標傾斜（`tx`、`ty`）和閒置移光。P1 文箱放大已完成（`bc688c3`，實作於 `src/studies/toji/view.js`），放大時 DPR 上限 2、畫布像素上限 2.2e6；陰影貼圖仍維持 1024²。
- 舞台高度與背景：展示頁為固定高度（桌機 570px、手機 450px）；首頁舞台高度則是填滿剩餘版面（`.bunko[data-embedded] .stage{height:100%}`）。背景 P3 已完成（`src/studies/toji/backdrop.js`，非 `.ts`），包含和紙＋すやり霞＋金箔／銀塵微粒（Web Animations 飄移），2026-11-11 加入各區紋樣與短句（`src/studies/toji/ward-art.js`：十一區各一種和紋樣、各一行短句，霞帶配置依區不同），不再是單層放射漸層。
- 手勢判定：首頁單指一律移光；盒子沿隱形軌道跟手（死區 14px、跟隨比例 0.6），中心位移達畫布寬 26%（上限 200px）放手才換函；舊的軸鎖定與 `clamp(width·0.12, 44, 100)` 門檻已移除。點蓋＝展卷（`onOpenVolume`）。
- 全站樣式與 Token：P0 設計 token 已完成，唯一來源為 `src/theme.css`（`:root[data-theme]`、`.kyoto-app[data-theme]`、`.bunko.night` 共用）。2026-11-11「UX 統一」完成部分 P4，書卷併入 `DetailView`（類型 TAB → 標籤 chip → 卡片，無文字搜尋），`ScrollRoller` 軸頭用於詳細頁與御秘帖結果頁。

## 4. 工作分期

| 期 | 內容 | 主要檔案 | 依賴 | 狀態 |
| :-- | :-- | :-- | :-- | :-- |
| P0 | 設計基礎：和色 token（唯一來源 `src/theme.css`，晝／月光兩套）、字體層級、動態偏好。`src/lib/spring.ts` 未做（動畫仍用指數逼近與 Web Animations） | `src/theme.css`、`study.css`、`src/bunko-ui.css` | — | token 完成，spring 未做 |
| P1 | 文箱放大：`src/studies/toji/view.js`（`ZOOM_MAX=3`、`ZOOM_STEP=1.4`，捏合／滾輪／`+` `−` `0`／雙擊回全景；放大時 DPR 上限 2、畫布像素上限 2.2e6；陰影貼圖維持 1024²） | `src/studies/toji/view.js`、`study.js`、`interaction.js` | P0 | 已完成（`bc688c3`） |
| P2 | 蒔繪光澤升級（F2 手法改寫成 shader） | `shaders.js`、`study.js` | P0，可與 P3 並行 | 待辦（未做） |
| P3 | 首頁背景：`src/studies/toji/backdrop.js`（非 `.ts`，和紙＋すやり霞＋金箔／銀塵微粒；2026-11-11 加上各區紋樣與短句 `ward-art.js`） | `src/studies/toji/backdrop.js`、`src/studies/toji/ward-art.js`、`bunko.css` | P0 | 已完成 |
| P4 | 其他頁面翻新：書卷併入 `DetailView`（類型 TAB → 標籤 chip → 卡片，無文字搜尋），`ScrollRoller` 軸頭用於詳細頁與御秘帖結果頁。卡片傾斜、彈簧切換等其餘項目未做 | `src/components/DetailView.tsx`、`src/components/ScrollRoller.tsx`、`src/bunko-ui.css` | P0、P2 | 部分完成（UX 統一） |
| P5 | 全面驗收與實機 | — | 全部 | 待辦 |

### P1　文箱放大（已完成）
- **做法**：在 WebGL 裡移動相機（推近＋縮小視角），不用 CSS `scale`，畫面才會銳利。實作在 `src/studies/toji/view.js`：`ZOOM_MAX=3`、`ZOOM_STEP=1.4`。放大時 DPR 上限從 1.5 提高到 2，同時設畫布像素上限 2.2e6（`PIXEL_CAP = 2.2e6`），避免手機記憶體爆掉。
- **狀態**：全景（zoom=1）→ 近觀（最大 3 倍）→ 開蓋展卷。縮放使用指數逼近逼近目標（`spring.ts` 未做）。
- **手勢分流**：zoom ≤ 1.02 時，拖動維持換函；放大後拖動改成平移（`clampPan`＋`rubberBand` 橡皮筋回彈）。雙指捏合、滾輪、鍵盤 `+` `−` `0`、雙擊皆能進出；雙擊或重設鈕回到全景。
- **陰影與細節**：陰影貼圖維持 1024²（未改 2048²）。
- **驗收**：375px 手機能捏合放大和平移，不誤觸換函；減少動態時直接跳到目標倍率；鍵盤用 `+`、`−`、`0` 操作。

### P2　蒔繪光澤（待辦）
- 把 F2 的 `--px`、`--py`、`--active` 改成 shader uniform（`pointerLight`、`active`），用插值逼近。
- 金粉亮片項：依視角和 hash 決定每顆金粉何時閃，取代均勻高光；研出面和高蒔繪面用不同的粗糙度。
- 放開後光點回到閒置掃光，沿用現有閒置循環的計時。

### P3　首頁背景（已完成）
- 實作於 `src/studies/toji/backdrop.js`（非 `.ts`），已完成すやり霞（含和紙底、金箔／銀塵微粒）。
- 做法：用 Canvas 2D 在尺寸改變時烘焙和紙與霞帶，動態飄移與微粒由 Web Animations 驅動（暖日切金、月光銀塵），減少動態時停止。
- 2026-11-11 加入十一區紋樣與短句（`src/studies/toji/ward-art.js`：十一區各一種和紋樣、各一行短句，霞帶配置依區不同）。

### P4　其他頁面（部分完成）
- **已完成（2026-11-11「UX 統一」）**：書卷併入 `DetailView`（類型 TAB → 標籤 chip → 卡片，無文字搜尋），`ScrollRoller` 軸頭用於詳細頁與御秘帖結果頁。
- **待辦（未做）**：卡片（SpotCard、名所目錄格子）精簡版 F2 傾斜加高光；列表切換與篩選的彈簧驅動；F1 彈簧核心（`src/lib/spring.ts` 未做）。
- 統一背景顆粒與和色 token，讓詳細頁和首頁看起來是同一套。

## 5. 驗收（每期都要）

- `npm run lint`、strict、測試、`npm run build`。
- 截圖：1440px 和 375px × 晝／月光 × 中／日，另外錄放大與拖動的連續畫面（不能只看靜止圖）。
- 效能：手機實機放大狀態的 FPS 和畫布記憶體；閒置時 RAF 確實降頻或停止。
- 無障礙：減少動態、鍵盤、焦點框、44px 觸控目標。

## 6. 待使用者決定

1. ~~**放大的互動**~~ **已決定（2026-11-09）**：手勢和滑鼠（含觸控板、鍵盤、按鈕）都要做；兩者衝突、只能擇一時，**手勢優先**。本 repo 主要是手機用戶，驗收以 375px 觸控為主。已實作於 `src/studies/toji/view.js`。
2. ~~**背景題材**~~ **已決定（2026-11-09）**：先做すやり霞（含和紙底、金箔／銀塵微粒）。實作於 `src/studies/toji/backdrop.js`，2026-11-11 加入十一區紋樣與短句（`src/studies/toji/ward-art.js`）。
3. **彈簧實作**：`src/lib/spring.ts` 目前未做，動畫與過渡仍使用指數逼近與 Web Animations。
4. **翻新順序**：實際執行順序為 P0（token）→ P1（文箱放大）→ P3（背景與區紋樣）→ P4 部分（UX 統一）；P2（蒔繪光澤）與彈簧未做。

## 7. 風險

- 放大會讓畫布面積變成平方倍，iPhone 分頁可能被回收：需要 DPR、面積上限和實機量測。
- 手勢衝突（換函、平移、頁面捲動）：`touch-action` 要依縮放狀態切換。
- 光澤做太強會變成全像卡，脫離漆器質感：每一版都要和真實肉合蒔繪的照片並排比對。
