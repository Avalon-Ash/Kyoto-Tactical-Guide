# 2026-11-13 蒔繪浮雕盤 P2 前半（軌道回饋與背景光影）

任務：蒔繪浮雕盤 P2／部分完成（三函同框未做）
請求模型／強度：主代理直接執行，未派子代理；實際設定：未確認
工作區／base SHA：`C:\Git\Kyoto-Tactical-Guide`，`claude/great-brahmagupta-ye2uqt`／`6dd0f12`
授權：使用者 2026-11-13 回覆「對，進 P2」（確認膨脹實體方向）。push、PR、合併未授權也未執行。

## 變更檔案與行為

| 檔案 | 內容 |
|---|---|
| `src/studies/toji/template.ts` | 舞台加 `#track` |
| `src/studies/toji/study.js` | `syncTrack`：十一枚刻度、軌跡光位置（`--at`）、過門檻時刻度發亮、箱子輕頓（`scale .985`）、`navigator.vibrate(10)` |
| `src/studies/toji/bunko.css` | 軌道、刻度、軌跡光的樣式與餘韻；減少動態時不顯示軌跡光；開蓋或近觀時軌道淡出 |
| `src/studies/toji/backdrop.js` | `paintRoom`：障子格光、卓面暗光澤、箱底金色反光；色票加 `shoji*`、`table*`、`gleam*` |

## 檢查（綁定本次 diff）

| 檢查 | 結果 |
|---|---|
| `npm run lint` | exit 0 |
| `npx --no-install tsx validate_data.js --strict` | exit 0；ERROR 0、WARN 0 |
| `npm test` | exit 0；scripts 89/89、src/lib 6/6 |
| `npm run build` | exit 0 |

## 畫面驗收

工具同前一輪（本機 Chrome 無頭、真實 GPU、主代理未提交的臨時腳本，以滑鼠事件模擬拖曳）。

| 情境 | 結果 |
|---|---|
| 1440 月光：拖到門檻前 | `--at` 6.000→5.092，軌跡光跟手；刻度未亮 |
| 1440 月光：過門檻 | 第 5 枚刻度 `data-armed=true`、`canvas.style.scale=0.985`；截圖已看（刻度、軌跡光、障子格光、卓面光澤、組紐擺動） |
| 1440 月光：放手 | `bookState=switching` → 換到下京區，目前刻度 6→5，軌道歸位 |
| 1440 暖日、375 寬 | 同上三步以狀態屬性確認；**截圖未看** |
| 減少動態 | **未驗**（樣式與程式有處理，沒有實跑） |
| 觸控拖曳、真機震動 | **未驗**（只用滑鼠事件；無頭環境無法確認震動） |
| 背景對比是否低於文箱明暗差的三分之一（美術文件的禁區） | **未量**，只有目視月光版一張 |

## 問題

- PLAUSIBLE：障子格光在月光版左側看得出格子，可能比「永遠退在後面」的要求明顯；待使用者與蒔再看。
- PLAUSIBLE：軌跡光在第一函往前、最後一函往後拖時會滑出刻度列之外（換函會繞回）。
- 驗收過程的插曲：拖曳一度被取消，查事件記錄是測試腳本殘留一行不帶按鍵的滑鼠移動造成 `lostpointercapture`，不是程式問題。

## 交接

- P2 未做：前、現、後三函同框繪製。需把畫布的 CSS 平移改為相機平移並同時持有三區的幾何，會動到 `study.js` 的拖曳、`renderer.js` 與 `scripts/bunko-integration.test.mjs`。
- 未 push。
