# UI 翻新・架構文件（靜）

> 2026-11-09。給本機主代理（Opus）拆包、派給 Gemini CLI 長線執行用。
> 配套文件：`docs/UI_RENEWAL_PLAN.md`（總計畫與 FeralUI 萃取）、`docs/UI_RENEWAL_ART.md`（美術需求，視覺判斷以它為準）。
> 合約以 `AGENTS.md` 為最高位階；本檔只補這次翻新的架構邊界、介面與驗收。

## 0. 給主代理的派工原則

- 一包最多 3 個任務，每包要有能讓指令失敗的驗收（測試或腳本退出碼）。不能只寫「看起來對」這種條件，它攔不住代理。
- **主代理先做**：§2 的新模組骨架（型別、匯出簽名、空實作）和 §6 的紅色測試。Gemini 只補實作，不改測試，也不改簽名。
- `study.js`、`study.css`、`index.css` 同一時間只能有一個寫入者（`AGENTS.md` §3）。P1、P2 都動 `study.js`，**必須排成先後，不能並行**。P3 只新增檔案，可以和 P2 並行。
- 視覺結果（質感、色調、強弱）收回主代理判斷，不交 Gemini 自評。
- 提示詞要寫明：讀檔一律用內建檔案工具，不用終端機；碰到清單外的指令或驗收失敗就停下回報，不自行放寬。

## 1. 現況（關鍵事實）

| 項目 | 位置 | 事實 |
| :-- | :-- | :-- |
| 文箱控制器 | `src/studies/toji/study.js` `mountBunko(root, options)` | 單一閉包，持有 RAF、手勢、書卷狀態；`destroy()` 釋放所有資源 |
| 渲染 | 同檔 `init()` → `render(time, moving)` | 原生 WebGL1；**正交相機** `ortho(-halfW, halfW, -halfH, halfH)`，`halfW = max(475, 340·aspect)`；`eye=[430,720,920]` 看向 `[0,40,0]` |
| 解析度 | `render()` | `dpr = min(devicePixelRatio, 1.5)`；陰影貼圖固定 1024² |
| 指標狀態 | `tick()` | `tx,ty`（目標，−1～1）→ `px,py` 以 `1−exp(−dt/170)` 逼近；`lift`（浮雕高度）同法 |
| 開蓋 | `interaction.js` `progressToward` | 線性 1150ms，shader 端套 smoothstep |
| 手勢 | `study.js` `point()`、`interaction.js` | 拖動軸鎖定；`cabinetDragDirection` 門檻 `clamp(width·0.12, 44, 100)`；點蓋 `isTap`＋`onLid` |
| 閒置 | `idlePlaybackAllowed` | 閒置 1.8 秒後自動移光，30fps 上限 |
| 背景 | `study.css` `.stage` | 單層 radial-gradient；晝／夜兩組 |
| React 接口 | `src/components/BunkoEntrance.tsx` | React 只管導航與偏好，畫布歸控制器；偏好變更走 `controller.setPreferences()`，不重建控制器（T4-M5） |
| 全站主題（T4-M5） | `src/App.tsx`、`src/bunko-ui.css`、`src/components/BunkoTools.tsx` | `cabinetPreferences {night, paused}` 是唯一來源 → `.kyoto-app[data-theme]`、`MotionConfig reducedMotion`、`theme-color`；色票 `--entry-*`、`--hira-*` 晝夜兩組 |
| 測試 | `scripts/*.test.mjs`（node:test） | 沒有 `npm test`，指令見 §6 |

## 2. 新模組與介面

### 2.1 `src/lib/spring.ts`（全站唯一彈簧實作）

```ts
export interface SpringState { x: number; v: number }
export interface SpringTuning { k: number; c: number }
export const SPRING = {
  soft:    { k: 170, c: 17 },   // 預設，輕微過衝
  settled: { k: 320, c: 36 },   // 減少動態：臨界阻尼，不回彈
  zoom:    { k: 210, c: 26 },
} as const satisfies Record<string, SpringTuning>;
/** 半隱式 Euler，1/240 秒子步；原地改寫 s 並回傳 s。 */
export function stepSpring(s: SpringState, target: number, t: SpringTuning, dtSec: number): SpringState;
/** |target−x|<eps 且 |v|<vEps 時貼齊並回傳 true。 */
export function settle(s: SpringState, target: number, eps?: number, vEps?: number): boolean;
/** 放手預測：x + v·lookahead（預設 0.22）。 */
export function projectRelease(s: SpringState, lookahead?: number): number;
/** 與幀率無關的指數逼近係數：1 − (1−rate)^(dt·60)。 */
export function approach(rate: number, dtSec: number): number;
```

- `study.js` 是 JS，用 `import {stepSpring} from '../../lib/spring'` 由 Vite 處理即可；node 測試以 `tsx` 執行。
- 減少動態時**換成 `SPRING.settled` 參數**，不是直接跳到終點（跳終點只用在開蓋這類必須立即完成的狀態）。

### 2.2 文箱視圖狀態：`src/studies/toji/view.js`（新檔，純函式、可測試）

```js
// zoom: 1（全景）～ ZOOM_MAX；pan: 世界座標中心偏移，受 lid 邊界約束
export const ZOOM_MAX = 2.6, ZOOM_NEAR = 2.2;
export function viewBox(aspect, zoom, pan)        // → {halfW, halfH, cx, cz}；zoom=1 時須與現行 halfW 公式一致
export function clampPan(pan, zoom, aspect)       // → 蓋面不離開畫面；超界回傳 {pan, overflow} 供橡皮筋
export function rubberBand(overflow, dimension)   // → 衰減後的位移（0.55 係數的經典公式）
export function gestureMode(zoom)                 // → 'switch'（zoom≈1）| 'pan'
export function renderScale(zoom, deviceDpr)      // → min(deviceDpr, zoom>1.2 ? 2 : 1.5)，並遵守 §4 面積上限
```

`study.js` 只負責接線：把 `zoom`、`pan` 兩個 `SpringState` 放進 `tick()`，`render()` 改用 `viewBox()` 算正交投影。**`groundPoint()` 的點擊反投影必須用同一個投影矩陣**，否則放大後點蓋會點偏。

### 2.3 光澤 uniform（P2）

在 `program()` 的 `names` 陣列新增：`pointerLight`（vec2，0～1 畫面座標）、`active`（float 0～1）、`zoom`（float）。
- `pointerLight`、`active` 在 `tick()` 以 `approach(0.15, dt)`、`approach(0.10, dt)` 逼近（取自 Hologram 的參數）。
- 閒置掃光改寫 `pointerLight` 的目標值，`active` 目標設 0.12；不另開 RAF。
- `zoom` 傳進 shader，讓梨地雜訊頻率和金粉粒徑跟著倍率調整（放大不能糊）。

### 2.4 背景層：`src/studies/toji/backdrop.ts`（新檔）

```ts
export interface BackdropOptions { night: boolean; reducedMotion: boolean; seed?: number }
export interface Backdrop {
  resize(width: number, height: number, dpr: number): void; // 只在這裡重烘靜態層
  setNight(night: boolean): void;
  setParallax(x: number, y: number): void;                  // −1～1，只做 transform，不重烘
  setActive(active: boolean): void;                         // 讀卷、背景分頁、減少動態時 false
  destroy(): void;
}
export function mountBackdrop(host: HTMLElement, o: BackdropOptions): Backdrop;
```

- Canvas 2D，插在 `.stage` 內、WebGL canvas 之前（`z-index` 在下）。WebGL canvas 保持 `alpha:true` 透明清除。
- 靜態層（底色、霞帶、紙紋）在 `resize`／`setNight` 時烘成離屏畫布，之後只做 `drawImage`。
- 動態層（微粒）是可選項：自己的 RAF，閒置時降到 30fps，`setActive(false)` 時完全停止。
- 由 `mountBunko` 建立和銷毀（`destroy()` 內呼叫），不經 React。
- 視覺內容依 `UI_RENEWAL_ART.md` §4。
- **2026-11-09 實作（已併入 `main`；以下為使用者回饋後的版本）**：實際檔案是 `src/studies/toji/backdrop.js`（和鄰近的 `interaction.js` 一樣用 JS，node 測試可直接匯入）。介面：`mountBackdrop(host,{night,motion,seed?})` → `{element, resize(width,height,dpr,keep), setNight(night), setMotion(on), compose(ctx,w,h), destroy()}`。
  - 結構：`.stage` 裡第一個子元素 `.backdrop`，內含一張和紙畫布，每條霞帶各一張 sprite 畫布。只在尺寸改變或晝夜切換時重畫。
  - 動態：每條霞帶用 Web Animations 的 `translateX` 左右飄移（幅度 `clamp(寬×0.08, 24, 60)`px，單程 24～36 秒，彼此錯相），由合成器執行，不跑 JS 逐格。減少動態、開卷／讀卷時 `pause()`，回到合函再 `play()`，不會跳位。
  - 形狀：每條霞帶是 2～3 段圓端長帶的聯集（主帶加上下錯開的短帶），形成繪卷式的段差；外框只留聯集外緣。
  - 版面：四個候選列，左右邊緣交錯伸入（頂列從右側進，避開左上的印章和左下的說明文字）。可以從文箱兩端後面穿過，但連同飄移幅度都不能進入文箱輪廓中央 50% 的寬度；每條在文箱旁至少露出 2.5 倍帶高，而且始終被自己那側的邊緣裁切。
  - 禁區用 `CABINET_SILHOUETTE`：十一函與素函全部頂點在固定相機下的凸包（15 個世界座標點），透過 render() 共用的 `cameraMatrix()` 投影。改了幾何或相機 `EYE` 要重算；測試會逐點檢查。
  - 「保存畫面」用 `compose()`，以靜止位置的和紙加霞帶當底。
  - 第三版（使用者要「再熱鬧一點」）：霞帶最多 5 條；加上微粒，暖日是旋轉落下的切金，月光是上升的銀塵，數量 16～32，同樣用 Web Animations 驅動，減少動態時隱藏。微粒不進「保存畫面」。

### 2.5 設計 token

- `src/index.css` 的 `@theme`：新增 `--color-washi-*`、`--color-urushi-*`、`--color-kin-*`、`--color-gin-*` 晝夜兩組（色值依美術文件 §2）。
- `study.css` 的 `.bunko` 變數（`--paper`、`--gold`……）改成引用上述 token，不再寫死。
- 新色值一律進 token，元件裡不寫 hex。
- 2026-11-09 補：T4-M5 已在 `src/bunko-ui.css` 建立 `--entry-*`、`--hira-*` 晝夜兩組，由 `.kyoto-app[data-theme]` 切換。P0 以它為起點：把色值搬進 `@theme` 的和色 token，`bunko-ui.css` 與 `study.css` 改成引用，**不另起第三套**。晝夜切換仍只認 `cabinetPreferences.night`。
- `bunko-ui.css` 和 `index.css`、`study.css` 屬同一視覺工作線，包 A 寫入時其他包不碰。

## 3. 手勢狀態機（P1）

```
zoom≈1 ──拖動(水平)──> 換函（現行行為，不變）
zoom≈1 ──捏合/滾輪/雙擊/＋鍵/放大鈕──> zoom→ZOOM_NEAR
zoom>1 ──單指拖動──> pan（clampPan＋rubberBand；放手用 projectRelease 帶慣性）
zoom>1 ──雙擊/Esc/0鍵/縮小鈕──> zoom→1、pan→0
zoom>1 ──點蓋──> 開蓋（先回 zoom=1 再開，或直接開，由美術文件決定；預設：先回再開）
任何狀態 ──書卷開啟中──> 忽略縮放
```

- **優先序（使用者 2026-11-09 決定）**：手勢與滑鼠都做，衝突時手勢優先（主要是手機用戶）。例如雙擊縮放的判定窗口、`touch-action` 切換、滾輪攔截，都以不干擾觸控為準；包 C 驗收先過 375px 觸控，再看滑鼠與鍵盤。
- 捏合用兩個 pointer 的距離比，縮放中心＝兩指中點（換成世界座標後固定該點不動）。
- 滾輪：`ctrlKey`（觸控板捏合）或一般滾輪都接，但只在指標位於畫布上時 `preventDefault`。
- `touch-action`：zoom≈1 時維持 `pan-y`（頁面可以上下捲）；zoom>1 時設成 `none`。
- 雙擊判定和現有 `isTap` 共用門檻（8px、700ms 內兩次），不能讓雙擊的第一下觸發開蓋：點蓋要延遲到雙擊窗口結束，或只在 zoom≈1 時接受單擊開蓋。**這是預設最容易出錯的地方，測試必須涵蓋。**

## 4. 效能與資源預算

| 項目 | 上限 |
| :-- | :-- |
| WebGL 畫布像素（放大時） | `w·h ≤ 2.2M`（約 1480×1480）；超過就降 dpr |
| 陰影貼圖 | zoom>1.5 時 2048²，否則 1024²；切換時重建，`destroy()` 一併釋放 |
| 背景離屏畫布 | 最多 2 張（晝、夜可只留當前一張）；`dpr ≤ 1.5` |
| 閒置 RAF | ≤30fps（沿用現行規則）；不可見、背景分頁、讀卷時 0 |
| 新增依賴 | 無（`motion` 已存在，可用在 React 端） |

## 5. 其他頁面（P4）的共用件

- `src/components/ui/TiltSheen.tsx`：精簡版 Hologram，只有傾斜加放射高光（CSS 變數 `--px`、`--py`、`--active`）。`(hover:hover) and (pointer:fine)` 才開傾斜；減少動態時只留靜態光。
- 卷軸開合、列表切換：用 `motion` 的 spring（`bounce ≤ 0.3`），移除 `@keyframes unroll`。
- 不改 `useKyotoEngine` 的狀態結構，也不動受保護的資料檔（`AGENTS.md` §2）。

## 6. 驗收指令（每包都跑）

```bash
npm run lint
npx --no-install tsx validate_data.js --strict
node --test --test-concurrency=1 scripts/makie-scene.test.mjs scripts/location-navigation.test.mjs scripts/toji-study.test.mjs scripts/toji-library.test.mjs scripts/bunko-integration.test.mjs scripts/ui-renewal.test.mjs
npm run build
```

新增 `scripts/ui-renewal.test.mjs`，**由主代理先寫，列為受保護**（2026-11-09 已建立，目前只有背景層的 8 項：輪廓包住所有頂點、霞帶連同飄移都不進中央且被邊緣裁切、手機至少四條、桌機至少五條且左右都有、每條 2～3 段且在自身框內、同 seed 結果固定、空間不足時不畫、強度上限與晝金夜銀、微粒方向與數量；下列 1～6 隨 P0、P1 補上）：
1. `stepSpring`：從 0 往 1 時，soft 有過衝且 3 秒內收斂；settled 無過衝；dt 用 1/30 或 1/144 跑，結果誤差 < 1e-3（與幀率無關）。
2. `viewBox(aspect, 1, 0)` 和現行 `halfW = max(475, 340·aspect)` 完全相等（全景零回歸）。
3. `clampPan`：任何 zoom、pan 下，蓋面四角都有至少 60% 留在視野內。
4. `gestureMode`：zoom ≤ 1.02 時是 `switch`。
5. 在放大後的投影下，`groundPoint` 反投影蓋面中心誤差 < 1 世界單位。
6. 雙擊不觸發開蓋（用純函式表達點擊序列的判定）。

畫面驗收由主代理執行（Playwright）：1440px、375px × 晝／月光 × 中／日；**錄放大、平移、放手回彈的連續畫面**，不能只看靜止截圖。另外確認減少動態下沒有任何回彈。

## 7. 分包建議（給 Gemini）

| 包 | 任務 | 可改檔案 | 前置 |
| :-- | :-- | :-- | :-- |
| A | `spring.ts` 實作；`.bunko` 變數改接 token | `src/lib/spring.ts`、`src/index.css`、`src/bunko-ui.css`、`study.css` | 主代理已建骨架與測試 |
| B | `view.js` 實作；`render()` 改用 `viewBox`；`groundPoint` 同步 | `view.js`、`study.js` | A |
| C | 捏合、滾輪、雙擊、鍵盤、按鈕的手勢接線；`touch-action` 切換 | `study.js`、`interaction.js`、`template.ts` | B |
| D | `backdrop.ts` 靜態層；由 `mountBunko` 掛載 | `backdrop.ts`、`study.js`（只加掛載和銷毀兩處）、`study.css` | A；**和 B、C 搶 `study.js`，排在 C 之後** |
| E | 光澤 uniform 與 shader | `shaders.js`、`study.js` | C |
| F | `TiltSheen` 與 P4 各頁 | `components/*`、`index.css` | A、美術確認 |

每包結束主代理審 diff、跑 §6、看畫面，才放下一包。

## 8. 不做的事

- 不換 WebGL2 或 three.js，不加繪圖依賴。
- 不改景點資料、schema、受保護檔案。
- 不重寫 `mountBunko` 的整體結構，只外移純函式。
- 不把 FeralUI 網站打包檔裡的程式碼貼進來（沒有授權），只依原理重寫。
