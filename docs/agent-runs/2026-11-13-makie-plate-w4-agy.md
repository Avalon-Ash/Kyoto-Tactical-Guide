# 蒔繪浮雕盤 W4 補驗報告（agy）

- **任務／PLAN ID**：`docs/MAKIE_PLATE_HANDOFF.md` §8.4 W4
- **狀態**：完成（僅驗收，未修改原始碼／測試／`scripts/`）
- **請求模型／強度**：`gemini-4-hydrogen-high`（實際環境設定：`Gemini 4 Hydrogen (High)`）
- **工作區／base SHA**：`C:\Git\_wt_kyoto_w4`（`9b2c31b`）
- **驗收時間**：2026-11-13
- **變更檔案**：
  - 新增驗收腳本：`.claude/dispatch/w4.mjs`
  - 新增截圖與日誌：`.shots/w4/{open,reduced,focus,nowebgl2,nowebgl,swipe}/`（含各情境 `log.json`）
  - 新增本報告：`docs/agent-runs/2026-11-13-makie-plate-w4-agy.md`

---

## 1. 總表（情境 × 區）

每格僅標示「通過」、「有問題（編號）」或「未驗」（非該情境目標區或技術限制未測者標「未驗」，詳見 §5 未驗清單）。

| 情境 \ 區 | 北 (`W_KITA`) | 上京 (`W_KAMIGYO`) | 左京 (`W_SAKYO`) | 中京 (`W_NAKAGYO`) | 東山 (`W_HIGASHIYAMA`) | 下京 (`W_SHIMOGYO`) | 南 (`W_MINAMI`) | 右京 (`W_UKYO`) | 西京 (`W_NISHIKYO`) | 山科 (`W_YAMASHINA`) | 伏見 (`W_FUSHIMI`) |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `open`（首頁鍵盤開蓋／閱讀／Esc） | 通過 | 通過 | 通過 | 通過 | 通過 | 通過 | 未驗 | 未驗 | 未驗 | 未驗 | 通過 |
| `reduced`（減少動態十一區開蓋／Esc） | 通過 | 通過 | 通過 | 通過 | 通過 | 通過 | 通過 | 通過 | 通過 | 通過 | 通過 |
| `focus`（Tab 至 `#scene` 內側金框 1440/375） | 未驗 | 未驗 | 未驗 | 未驗 | 未驗 | 未驗 | 通過 | 未驗 | 未驗 | 未驗 | 未驗 |
| `nowebgl2`（停用 WebGL2 退回舊浮雕） | 通過 | 通過 | 通過 | 通過 | 通過 | 通過 | 通過 | 通過 | 通過 | 通過 | 通過 |
| `nowebgl`（停用全部 WebGL 顯示失敗訊息） | 未驗 | 未驗 | 未驗 | 未驗 | 未驗 | 未驗 | 通過 | 未驗 | 未驗 | 未驗 | 未驗 |
| `swipe`（拖曳換函交接中間幀） | 未驗 | 未驗 | 未驗 | 未驗 | 未驗 | 未驗 | 有問題（W4-01） | 有問題（W4-01） | 未驗 | 未驗 | 未驗 |

---

## 2. 各情境實測證據摘要

### `open`（`.shots/w4/open/log.json`）
- **伏見 (`W_FUSHIMI`)**：`W_FUSHIMI-reading.png` 顯示「伏見區」閱讀頁（57/57 處）；Esc 後 `W_FUSHIMI-back.png` 回到伏見箱面，`afterDataset.ward === "W_FUSHIMI"`、`sameWardAfterEsc: true`、`focusAfterEsc.isScene: true`、`matchesFocusVisible: true`。
- **北 (`W_KITA`)**：`W_KITA-reading.png` 顯示「北區」（51/51 處）；Esc 後 `W_KITA-back.png` 回到北區，`afterDataset.ward === "W_KITA"`、`sameWardAfterEsc: true`、`focusAfterEsc.isScene: true`。
- **上京 (`W_KAMIGYO`)**：`W_KAMIGYO-reading.png` 顯示「上京區」（69/69 處）；Esc 後 `W_KAMIGYO-back.png` 回到上京區，`afterDataset.ward === "W_KAMIGYO"`、`sameWardAfterEsc: true`、`focusAfterEsc.isScene: true`。
- **左京 (`W_SAKYO`)**：`W_SAKYO-reading.png` 顯示「左京區」（91/91 處）；Esc 後 `W_SAKYO-back.png` 回到左京區，`afterDataset.ward === "W_SAKYO"`、`sameWardAfterEsc: true`、`focusAfterEsc.isScene: true`。
- **中京 (`W_NAKAGYO`)**：`W_NAKAGYO-reading.png` 顯示「中京區」（122/122 處）；Esc 後 `W_NAKAGYO-back.png` 回到中京區，`afterDataset.ward === "W_NAKAGYO"`、`sameWardAfterEsc: true`、`focusAfterEsc.isScene: true`。
- **東山 (`W_HIGASHIYAMA`)**：`W_HIGASHIYAMA-reading.png` 顯示「東山區」（84/84 處）；Esc 後 `W_HIGASHIYAMA-back.png` 回到東山區，`afterDataset.ward === "W_HIGASHIYAMA"`、`sameWardAfterEsc: true`、`focusAfterEsc.isScene: true`。
- **下京 (`W_SHIMOGYO`)**：`W_SHIMOGYO-reading.png` 顯示「下京區」（98/98 處）；Esc 後 `W_SHIMOGYO-back.png` 回到下京區，`afterDataset.ward === "W_SHIMOGYO"`、`sameWardAfterEsc: true`、`focusAfterEsc.isScene: true`。
- 七區 `beforeDataset.plate` 與 `afterDataset.plate` 均為 `"true"`，`afterDataset.bookState === "closed"`。

### `reduced`（`.shots/w4/reduced/log.json`）
- 十一區（`W_MINAMI`、`W_UKYO`、`W_NISHIKYO`、`W_YAMASHINA`、`W_FUSHIMI`、`W_KITA`、`W_KAMIGYO`、`W_SAKYO`、`W_NAKAGYO`、`W_HIGASHIYAMA`、`W_SHIMOGYO`）全部實測。
- 各區 `beforeDataset.still === "true"`、`afterDataset.still === "true"`、`lift === "0.820"`、`opening === "0.000"`、`autoplay === "false"`；`enterMs` 介於 123–344 ms、`escMs` 介於 287–343 ms，皆直接切換而無開蓋／淡入動畫；Esc 後全數 `sameWardAfterEsc: true`、`focusAfterEsc.isScene: true`。
- 已實看截圖：`W_MINAMI-reading.png`、`W_MINAMI-back.png`、`W_YAMASHINA-reading.png`、`W_YAMASHINA-back.png` 及全部十一區 `*-back.png`，部品皆平躺且金色焦點框可見。

### `focus`（`.shots/w4/focus/log.json`）
- **1440×900 (`dpr: 1`)**：Tab 7 次抵達 `#scene`（`activeId: "scene"`、`matchesFocusVisible: true`），`outline: "rgb(210, 187, 137) solid 2px"`、`outlineOffset: "-6px"`、`stageOverflow: "hidden"`。實看 `focus-1440.png`：四邊金色內縮焦點框皆完整落於舞台內側，未被裁切。
- **375×812 (`dpr: 2`)**：Tab 7 次抵達 `#scene`（`activeId: "scene"`、`matchesFocusVisible: true`），`outline: "rgb(210, 187, 137) solid 2px"`、`outlineOffset: "-6px"`、`stageOverflow: "hidden"`。實看 `focus-375.png`：手機寬度下四邊金色內縮焦點框同樣完整可見、無裁切。

### `nowebgl2`（`.shots/w4/nowebgl2/log.json`）
- 十一區（`W_MINAMI` 至 `W_SHIMOGYO`）全數 `dataset.plate === "false"`、`dataset.renderer === "webgl"`，舊浮雕網格頂點數 `vertices` 介於 54438–137982。
- 實看十一張截圖（`W_MINAMI.png`、`W_UKYO.png`、`W_NISHIKYO.png`、`W_YAMASHINA.png`、`W_FUSHIMI.png`、`W_KITA.png`、`W_KAMIGYO.png`、`W_SAKYO.png`、`W_NAKAGYO.png`、`W_HIGASHIYAMA.png`、`W_SHIMOGYO.png`）：皆正確退回舊版 3D 浮雕網格繪製，光影與切換正常，無 WebGL／JS 錯誤。

### `nowebgl`（`.shots/w4/nowebgl/log.json`）
- `dataset.renderer === "failed"`、`dataset.ward === "W_MINAMI"`、`loadingHidden === false`、`loadingText === "無法啟用 WebGL。請使用支援硬體加速的瀏覽器。"`（對應 `bunko_failed`）。
- 實看 `nowebgl-failed.png`：深色面板中央清楚顯示失敗訊息，非空白畫面，且無未捕捉例外（`exceptions: []`）。

### `swipe`（`.shots/w4/swipe/log.json`）
- 初始：`W_MINAMI` 兩側鄰函快照已就緒（`neighbours[0].ward === "W_SHIMOGYO"`、`neighbours[1].ward === "W_UKYO"`，`plate: "true"`）。
- 拖曳期間（`swipe-00-down.png`～`swipe-10-drag.png`）：左拖 `489.6px`（畫布寬 `34%`），過門檻後 `armed === "1"`，右鄰函 `W_UKYO` 以 `opacity: 0.9` 自右側滑入，交界清楚無殘影。
- 放手後切換期間發生問題 **W4-01**（詳見 §3）。

---

## 3. 問題清單

### W4-01：拖曳換函放手後滑動途中，鄰函快照中途消失導致舞台短暫空白並突跳出現
- **編號**：W4-01
- **情境**：`swipe`
- **區**：`W_MINAMI` → `W_UKYO`（首頁軌道滑動換函共用邏輯，影響所有相鄰函切換）
- **截圖檔名**：
  - `.shots/w4/swipe/swipe-10-drag.png`（放手前：`W_MINAMI` 在 `-285.36px`，右鄰 `W_UKYO` 在 `895.44px`、`opacity: 0.9` 可見）
  - `.shots/w4/swipe/swipe-11-release.png`（放手後切換中：`bookState: "switching"`、`sceneTransform: matrix(1, 0, 0, 1, -1178.13, 0)`，原函已滑出左緣，右鄰 `W_UKYO` 卻變為 `opacity: "0"`、`transform: matrix(1, 0, 0, 1, 1180.8, 0)`，舞台幾乎全空）
  - `.shots/w4/swipe/swipe-12-post.png`（切換結束後：`W_UKYO` 直接出現在中央）
- **看到什麼**：
  - 滑鼠拖曳超過 26% 並放手觸發 `changeCabinet(1, canvas, offset)` 後，`#scene` 本身沿著 `switchAnimation` 往 `-1180.8px` 滑出畫面；但當 `#scene` 的右邊緣滑過靜止的游標位置（`x ≈ 547px`）時，瀏覽器對 `#scene` 觸發 `pointerleave`。
  - `src/studies/toji/study.js` 第 371 行 `listen(canvas, 'pointerleave', () => { if ((options.embedded || gesture?.panning) && gesture) return; endDrag(); returnCabinet(); release(); });` 因 `pointerup` 先呼叫了 `endDrag()` 將 `gesture` 設為 `null`，導致判斷式為假而沒有提早返回，進而執行 `returnCabinet()` → `placeTrack(0)`。
  - `placeTrack(0)` 取消了 `ghostAnimations`（`ghostAnimations.forEach(a => a.cancel())`）並把鄰函內聯樣式重置回 `opacity: 0` 與 `translateX(±1180.8px)`，但沒有停止 `#scene` 的 `switchAnimation`；於是 `#scene` 繼續向左滑出螢幕，而應該滑入接手的 `W_UKYO` 鄰函卻當場消失，直到 `switchAnimation.finished` 才突然閃現到中央。
- **狀態**：CONFIRMED（於 `swipe-11-release.png` 與 `swipe/log.json` 第 353–379 行直接觀測到 `bookState: "switching"` 下 `neighbours[1].opacity === "0"` 與空舞台）
- **建議修法**（僅供參考，未實作）：
  - 在 `src/studies/toji/study.js` 第 371 行 `pointerleave`（以及 `pointercancel`）監聽器中，加上 `if (!gesture || bookState !== 'closed') { release(); return; }`（僅在確實持有拖曳 `gesture` 且 `bookState === 'closed'` 時才執行 `endDrag()` 與 `returnCabinet()`），避免切換動畫進行中因畫布滑離游標而誤觸發 `placeTrack(0)` 取消鄰函動畫。

---

## 4. Console 錯誤與警告原文

### `open`（`.shots/w4/open/log.json`）
- **errors**（1 筆，皆為無 `favicon.ico` 的網路 404，無 JS／WebGL 錯誤）：
  - `log.error` (`network`, `http://127.0.0.1:3001/favicon.ico`): `Failed to load resource: the server responded with a status of 404 (Not Found)`
- **warnings**：無
- **exceptions**：無

### `reduced`（`.shots/w4/reduced/log.json`）
- **errors**（1 筆，同上 `favicon.ico` 404）：
  - `log.error` (`network`, `http://127.0.0.1:3001/favicon.ico`): `Failed to load resource: the server responded with a status of 404 (Not Found)`
- **warnings**（1 筆，開發模式下 `motion/react` 偵測到 `prefers-reduced-motion: reduce` 的套件提示）：
  - `warning`: `You have Reduced Motion enabled on your device. Animations may not appear as expected.. For more information and steps for solving, visit https://motion.dev/troubleshooting/reduced-motion-disabled`
- **exceptions**：無

### `focus`（`.shots/w4/focus/log.json`）
- **errors**（1 筆，同上 `favicon.ico` 404）：
  - `log.error` (`network`, `http://127.0.0.1:3001/favicon.ico`): `Failed to load resource: the server responded with a status of 404 (Not Found)`
- **warnings**：無
- **exceptions**：無

### `nowebgl2`（`.shots/w4/nowebgl2/log.json`）
- **errors**（1 筆，同上 `favicon.ico` 404；`Makie plate unavailable:` 未被觸發，因 `gl2` 為 `null` 直接走 WebGL1）：
  - `log.error` (`network`, `http://127.0.0.1:3001/favicon.ico`): `Failed to load resource: the server responded with a status of 404 (Not Found)`
- **warnings**：無
- **exceptions**：無

### `nowebgl`（`.shots/w4/nowebgl/log.json`）
- **errors**（3 筆：2 筆來自 React 開發模式 StrictMode 雙次掛載時 `study.js:428` 主動呼叫的 `console.error('Toji study:', error)`，另 1 筆為 `favicon.ico` 404）：
  - `error` (×2):
    ```text
    Toji study: Error: WebGL unavailable
        at createRenderer (http://127.0.0.1:3001/src/studies/toji/renderer.js:30:18)
        at init (http://127.0.0.1:3001/src/studies/toji/study.js:422:18)
        at mountBunko (http://127.0.0.1:3001/src/studies/toji/study.js:433:5)
        at http://127.0.0.1:3001/src/components/BunkoEntrance.tsx:18:22
        ...
    ```
  - `log.error` (`network`, `http://127.0.0.1:3001/favicon.ico`): `Failed to load resource: the server responded with a status of 404 (Not Found)`
- **warnings**：無
- **exceptions**：無（錯誤已被 `study.js` catch 並轉為 `bunko_failed` 畫面）

### `swipe`（`.shots/w4/swipe/log.json`）
- **errors**（1 筆，同上 `favicon.ico` 404）：
  - `log.error` (`network`, `http://127.0.0.1:3001/favicon.ico`): `Failed to load resource: the server responded with a status of 404 (Not Found)`
- **warnings**：無
- **exceptions**：無

---

## 5. 實際執行的指令與退出碼

| 指令 | 退出碼 | 備註 |
|---|---:|---|
| `curl -s -o NUL -w "%{http_code}" http://127.0.0.1:3001/` | 1 | 執行環境 shell 為 PowerShell，`curl` 被別名解析為 `Invoke-WebRequest`（報 `遺失 'SessionVariable' 參數的引數`）；後續改於 `w4.mjs` 內以 Node `fetch('http://127.0.0.1:3001/')` 實測確認回傳 HTTP 200 |
| `node .claude/dispatch/w4.mjs open` | 0 | `resultsCount: 7`, `errors: 1` (favicon 404), `warnings: 0`, `exceptions: 0` |
| `node .claude/dispatch/w4.mjs reduced` | 0 | `resultsCount: 11`, `errors: 1` (favicon 404), `warnings: 1` (motion/react), `exceptions: 0` |
| `node .claude/dispatch/w4.mjs focus` | 0 | `resultsCount: 2`, `errors: 1` (favicon 404), `warnings: 0`, `exceptions: 0` |
| `node .claude/dispatch/w4.mjs nowebgl2` | 0 | `resultsCount: 11`, `errors: 1` (favicon 404), `warnings: 0`, `exceptions: 0` |
| `node .claude/dispatch/w4.mjs nowebgl` | 0 | `resultsCount: 1`, `errors: 3` (WebGL unavailable ×2 + favicon 404), `warnings: 0`, `exceptions: 0` |
| `node .claude/dispatch/w4.mjs swipe` | 0 | `resultsCount: 1` (14 frames), `errors: 1` (favicon 404), `warnings: 0`, `exceptions: 0` |

---

## 6. 未驗清單與原因

1. **`open` 之南、右京、西京、山科四區**：本輪派工單指定補驗伏見、東山、北、上京、左京、中京、下京其餘七區（前四區依 `MAKIE_PLATE_HANDOFF.md` §7 已於前輪驗過，且該四區在本次 `reduced` 情境仍有開蓋／Esc 實測）。
2. **`focus` 之南區以外十區**：焦點框 CSS（`bunko.css` `.bunko canvas:focus-visible`）為共用的 `#scene` 與 `#stage`，派工單指定於首頁預設南區分別於 1440×900 與 375×812 驗收。
3. **`nowebgl` 之南區以外十區**：WebGL 不可用之錯誤處理發生於 `createRenderer` 初始化階段，各區共用同一入口；未逐一切換十一區。
4. **`swipe` 之其他十區／向南以外方向／高幀率 50 ms 實拍間隔**：
   - 本輪僅於首頁預設 `W_MINAMI` 往左拖曳至 `W_UKYO`（已抓到 W4-01 問題）。
   - 無頭 Chrome 執行 `Page.captureScreenshot`（1440×746 PNG）每張耗時約 340–440 ms，因此實際取樣間隔約 340–440 ms（共 14 幀），未能達到真正每 50 ms 一張之密度，極短暫（<300 ms）的中間幀跳動未完全覆蓋；然而於 345 ms 取樣點（`swipe-11-release.png`）已足以直接重現並確認 W4-01。
5. **W4-01 以外之「鄰函 vs 本函微幅對位／亮度（`.9` opacity）差異」**：因 W4-01 使鄰函在放手後直接歸零消失，交接瞬間本體與鄰函重疊對齊之微距視覺連續性需待修好 W4-01 後再複驗。
