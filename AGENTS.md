# Kyoto Bunko — 代理執行合約

更新：2026-11-11。適用於主代理、Codex 子代理及 IDE 執行代理。
本合約參照 FFT 專案的分工方法，規則已依京都專案調整；不依賴 FFT 的工具、hook 或測試。

## 1. 開工入口與權限

- 先讀本檔、`docs/HANDOFF.md` 的目前狀態、`docs/AGENT_EXECUTION_PLAN.md`、`docs/PLAN.md` 的指定任務，以及 `docs/DEVELOPMENT.md` 的資料錄入規範。
- 使用者當次指令與已核准的 D1–D5 優先；代理流程依本合約及派工計畫，功能需求依 PLAN。發現真正衝突，回報具體段落，由主代理處理，不自行放寬驗收。
- 規劃任務只產出文件，不代表已授權啟動實作、子代理或發布。實作啟動時明確記錄本輪任務與子代理授權。
- 主代理負責派工、整合、驗收與 Git 操作。子代理只在派工單指定的絕對路徑與檔案範圍工作。
- 子代理不得 commit、push、merge、rebase、reset、stash、切換分支、刪除工作樹或再派子代理。結果保留為 diff，交主代理審查。
- 主代理僅依使用者授權 commit／push；舊輪次已完成的 push 授權不自動涵蓋新工作。
- Gemini 在某個 checkout 執行時，其他代理不得寫入該 checkout，也不得同時操作它的測試瀏覽器。

## 2. 專案不變條件

- Schema（`src/data/spots/`）只存結構；名稱、描述在中日 locale。不得加入 `name`、`desc`、`mapQuery` 等欄位到 schema。
- 景點 ID 穩定；刪除後不重編號。新增、移轉、刪除需同步 schema 與兩語 locale，先搜尋所有引用。
- `tagIds` 只用登記值且最多 6 個；ZH tags 依 schema 鏡射。T_FOOD 不得使用世界遺產標籤。
- `src/data/tags.ts`、`types.ts`、`areas.ts`、`wards.ts`、`index.ts` 及 `src/types.ts` 為受保護檔案；目前計畫未授權修改。
- 地圖座標集中於 `map-centers.ts`；GeoJSON 順序是 `[lng, lat]`，Leaflet 點位通常是 `[lat, lng]`，不得混用。
- 導航共用現有 `buildGoogleMapsUrl`，不在其他元件複製拼接規則。
- 查證身分、地址、座標要提供來源與查核日期。未知資料不得當作精確值提交；既有錯誤標籤不應靠新增虛構座標消除警告。
- 食處變更遵守 `docs/DEVELOPMENT.md` 的 Tabelog 查核要求。查不到或來源衝突時列為未確認，不推測仍在營業。
- 不新增大型繪圖依賴、不重寫整體狀態架構、不順手整理無關檔案。
- 不新增 `as any` 逃避型別檢查；PLAN 中範例若含此寫法，應以適當 GeoJSON 型別或驗證取代並說明。

## 3. 子代理與成本控制

- 模型、強度與各任務分工見 `docs/AGENT_EXECUTION_PLAN.md`；本檔不修改執行環境的模型設定。
- 最多兩個子代理同時進行（不含主代理），不是必須開滿。幾次工具呼叫可完成的工作由主代理直接做。
- 只委派可與主代理工作並行、範圍明確的工作。主代理不重做同一份探索，不把下一步立即依賴的核心工作派出去後空等。
- 每個檔案同時只有一個寫入者。`theme.css`、`index.css`、`bunko-ui.css`、`ClusterMap.tsx`、`studies/toji/bunko.css`、`studies/toji/study.css`、`studies/toji/backdrop.js`、`studies/toji/ward-art.js` 屬同一視覺整合工作線，不能分派成多套互相競爭的美術修改。
- 寫入代理的工作區由主代理預備並核實；共享 checkout 只可在不重疊 write set 下使用，否則先隔離。不得假定工具自動提供隔離。
- 模型升級必須有失敗證據、新假設及範圍。不得因任務長就開高強度或把同一問題重複派給多名代理。
- 子代理完成就關閉；需要相同上下文的後續工作才重用。

## 4. 必填派工單

每次派工必須包含：

```text
任務／PLAN ID：
角色、請求模型、推理強度、選用理由：
工作區絕對路徑、分支、base SHA：
前置任務是否完成：
必讀檔案／已確認事實：
可修改檔案（精確列舉；只讀任務寫「無」）：
禁止操作／不能改變的行為：
交付結果與來源證據：
驗收指令、瀏覽器情境與逾時：
探索範圍、重試上限、停止條件：
回報位置或格式：
```

主代理在回報中區分「請求的模型設定」與工具確認的實際設定；不得用模型自稱作為執行證據。

## 5. 驗收、停損與 Git

- 整合每個 T 任務後執行 `npm run lint`、`npx --no-install tsx validate_data.js`、`npm test`、`npm run build`。缺依賴先由主代理處理 T0.1，子代理不私自安裝。
- `npm test` 跑 `scripts/*.test.mjs` 與 `src/lib/*.test.ts`（node:test），CI 也跑同一個指令；不得照搬 FFT 的測試或 perf 指令。新增測試僅針對有實際風險的邏輯。
- ERROR 必須為 0；WARN 總數不得上升，並追蹤警告種類。T1.2 的 KG-029 地標警告為計畫內已知過渡項，必須由 T1.3 解決。
- Phase 1 收尾另跑 `npx --no-install tsx validate_data.js --strict`。WARN 0 不等於所有旅遊資訊已完成事實查核。
- 地圖改動必須驗收桌機 1440px、手機 375px、日夜／語系／區域切換、鍵盤、減少動態效果。提供截圖與實際觀察，不以 build 成功代替畫面驗收。
- 檢查證據綁定 base SHA 與當前 diff；相關修改後重跑受影響檢查。只改文件時用文件、連結及 diff 檢查，不必重跑應用 build。
- 同一檢查最多兩次失敗或逾時：子代理停止並交出日誌；主代理判斷原因，受影響任務不得標完成。獨立工作可以繼續。
- 參考逾時：lint 120 秒、validate 120 秒、test 180 秒、build 180 秒、安裝 300 秒、抓邊界 180 秒、單組瀏覽器驗收 300 秒。到期先檢查進度與網路，不盲目重開同一指令。
- 長指令用環境提供的執行 session 接續取結果，不高頻輪詢、不重複啟動、不在結果未知時宣稱成功。不得終止無關使用者程序。
- 每個 T 任務由主代理審核後獨立 commit（取得該輪授權時）；不要把自己的 commit hash 寫入同一個 commit，後續進度更新再記錄。
- 不提交 `.claude/`、`node_modules/`、`dist/`、金鑰或臨時驗收產物。保留既有 UTF-8、換行風格及無關使用者變更。

## 6. 結果格式

```text
任務：ID／完成、部分完成或阻塞
請求模型／強度：；實際設定：工具確認值或「未確認」
工作區／base SHA：
變更檔案與行為：
檢查：命令、退出碼、ERROR/WARN、日誌或截圖位置
資料來源／未確認項：
問題：可重現情境、檔案位置、CONFIRMED 或 PLAUSIBLE
交接：剩餘工作；子代理未 commit／push
```
