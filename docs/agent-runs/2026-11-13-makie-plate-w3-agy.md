# 蒔繪浮雕盤 W3 語彙輸入防呆 — 執行報告

- 任務：`docs/MAKIE_PLATE_HANDOFF.md` §8.3 W3（R02、R03）／完成
- 請求模型／強度：`gemini-4-hydrogen-high`（Gemini 4 Hydrogen High）；實際設定：未確認（執行環境未提供工具查詢目前模型設定）
- 工作區／base SHA：`C:\Git\_wt_kyoto_w3`（分支 `w3-guards`，base SHA `ac06b40`）

## 變更檔案與行為（附檔案與行號）

1. `src/studies/toji/plate/parts.js`
   - `preparePlate`（`src/studies/toji/plate/parts.js:42-52`）：在既有的 `fills` 驗證迴圈中，對頂點數 `>= 3` 的每個 `fill` 以鞋帶公式計算多邊形面積；若 `Math.abs(area) * .5 < 1e-6`，推入 `${p.id}: zero-area fill` 到 `errors`。純線條（`lines`）不檢查。

2. `src/studies/toji/plate/vocab.js`
   - `stream`（`src/studies/toji/plate/vocab.js:58-59`）：檢查 `stream` 實作（`vocab.js:62-66`）後確認 `i` 涵蓋 `0 .. points.length - 2`，並透過 `lerp(widths[i], widths[i + 1], u)` 讀取 `widths[0 .. points.length - 1]`，與 `points` 為一對一對應（且至少需 2 個點才不會使 `i` 為負）。因此在函式開頭加入：
     - `points.length < 2` 丟出 `Error(\`stream(${id}): points must have at least 2 points\`)`
     - `widths.length !== points.length` 丟出 `Error(\`stream(${id}): widths length (${widths.length}) must equal points length (${points.length})\`)`
   - `roof`（`src/studies/toji/plate/vocab.js:131`）：開頭檢查 `!(tiles >= 1)`，丟出 `Error(\`roof(${id}): tiles must be >= 1\`)`。
   - `storey`（`src/studies/toji/plate/vocab.js:148`）：開頭檢查 `!(bays >= 1)`，丟出 `Error(\`storey(${id}): bays must be >= 1\`)`。
   - `kakezukuri`（`src/studies/toji/plate/vocab.js:248`）：開頭檢查 `!(posts >= 2)`，丟出 `Error(\`kakezukuri(${id}): posts must be >= 2\`)`。
   - `shell`（`src/studies/toji/plate/vocab.js:466`）：開頭檢查 `!spots.length`，丟出 `Error(\`shell(${id}): spots must not be empty\`)`。
   - `steppingStones`（`src/studies/toji/plate/vocab.js:519`）：開頭檢查 `!points.length`，丟出 `Error(\`steppingStones(${id}): points must not be empty\`)`。
   - `stoneSteps`（`src/studies/toji/plate/vocab.js:641`）：開頭檢查 `!(count >= 1)`，丟出 `Error(\`stoneSteps(${id}): count must be >= 1\`)`。

3. `scripts/plate.test.mjs`
   - 頂部引入新增的七個語彙函式（`scripts/plate.test.mjs:5`），未改動或刪除任何既有測試。
   - 檔尾新增兩組測試（`scripts/plate.test.mjs:247-262`）。

## 新增測試名稱清單

1. `preparePlate reports zero-area fills while ignoring pure line work`（`scripts/plate.test.mjs:247-252`）
   - 驗證共線多邊形與退化同點多邊形皆回報 `zero-area fill`，且純 `lines` 部品不報錯。
2. `vocab builders reject invalid counts, mismatched widths, and empty arrays`（`scripts/plate.test.mjs:254-262`）
   - 分別對 `roof`（`tiles: 0`）、`storey`（`bays: 0`）、`kakezukuri`（`posts: 1`）、`stoneSteps`（`count: 0`）、`stream`（`widths` 長度不符）、`shell`（空陣列）、`steppingStones`（空陣列）以 `assert.throws` 驗證拋出含函式名稱與參數名稱的錯誤訊息。

## 檢查紀錄

1. `node --test scripts/plate.test.mjs`
   - 退出碼：`0`
   - 結果：16 passed, 0 failed, 0 skipped（含既有 14 個測試全數通過；十一區現有構圖與「bakes the same every time」皆通過）
2. `npm run lint`（`tsc --noEmit`）
   - 退出碼：`0`
   - 結果：ERROR 0、WARN 0

## 被還原的檢查與原因

- 無。十一區既有構圖與全部既有測試皆未觸發任何新檢查。

## 資料來源／未確認項／問題

- 僅依派工單執行 `node --test scripts/plate.test.mjs` 與 `npm run lint`；`validate_data.js`、`npm test` 全套、`npm run build` 尚未在此工作區由本代理執行（留待主代理整合驗收）。
- 問題：無。

## 交接

- 剩餘工作：由主代理審閱 diff 並執行整合驗收（`npm run lint`、`npx --no-install tsx validate_data.js`、`npm test`、`npm run build`）後依授權 commit。
- 本子代理未執行任何 `git commit`、`push`、切分支、stash 或 reset，所有變更保留為工作樹 diff。
