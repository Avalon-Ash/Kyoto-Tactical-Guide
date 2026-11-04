# Kyoto Tactical Guide — 執行計畫（2026 Q4）

新對話先讀 [交接入口](HANDOFF.md)，不要從歷史完成項重新執行。

2026-11-05 最新交付：前批資料 `a0a94f7`、跨市模型 `a1eeb99`、互動蒔繪 `86d852b` 已提交；使用者已授權將本批程式與文件推送至 `codex/phase4-data-audit`，未授權合併 main。本輪結果及限制見 [跨市與蒔繪紀錄](agent-runs/2026-11-04-phase04-location-makie.md)。新入口使用 WebGL 單一漆面，行政區選取與地標回饋合併；Phase 3 的 SVG 規格保留為歷史，不再是目前入口。


> 本文件是給 IDE 代理人（執行者）逐步執行的工作清單。
> 撰寫：Claude（規劃）／審核：Ash（決策與最終確認）
> 基準 commit：`ef5ad2c`（P0 修正已完成：TYPE_TAG_GROUP_MAP、夜巡圖資、NS-034、KT-073→KG-085、ClusterMap 導航連結、validate_data.js 完整稽核）

---

## 0. 執行者守則（每個任務前必讀）

> 2026-10-28 補充：先讀根目錄 `AGENTS.md` 與 `docs/AGENT_EXECUTION_PLAN.md`。前者是執行合約，後者定義任務類型、建議模型／強度、並行與升級規則。本文件保留功能清單；子代理只交 diff，由主代理整合。此次文件更新不表示已啟動實作。

1. **一次只做一個任務**，依編號順序執行。不得合併任務、不得跳號、不得「順手」修改任務未列出的檔案。
2. 每個任務完成後執行 **驗收指令**，全部通過才 commit：
   ```bash
   npm run lint
   npx tsx validate_data.js
   npm run build
   ```
   - `npm run lint` = `tsc --noEmit`。**不要用 `npx tsc`**：沒裝依賴時 npx 會下載到同名的錯誤套件 `tsc@2.0.4`。
   - `validate_data.js` 必須輸出 `Health Check Passed`，且 **WARN 數量不得高於任務開始前**。
3. **每個任務一個 commit**，訊息格式：`<type>(<task-id>): <摘要>`，例如 `fix(T1.1): mirror ZH tags to schema`。
   子代理不 commit；主代理取得該輪提交授權後依任務分批 commit。進度表可同次打勾，該次 commit hash 在後續紀錄補上，不反覆 amend 尋求自我引用。**不要 push**，push 由 Ash 決定。
4. **禁止修改**（README「封閉操作」）：`src/data/tags.ts`、`src/data/types.ts`、`src/data/areas.ts`、`src/data/wards.ts`、`src/data/index.ts`、`src/types.ts`。本計畫沒有任何任務需要改它們。
5. 不得 commit `.claude/`、`dist/`、`node_modules/`。
6. 同一任務驗收失敗 **兩次** → 停止，依「回報格式」回報錯誤訊息，不要自行改變計畫。
7. 標示 **【Ash 決策】** 的項目：先看「決策點」區的決定欄；若決定欄是空的，**跳過該項**並在回報中列出。
8. 程式碼片段為實作參考；在指定範圍內可修正型別、生命週期、平台語法問題並記錄原因。不得以照抄為由保留錯誤，亦不得擴張功能範圍。

### 回報格式（每個任務結束時輸出）
```text
任務：T?.? <名稱>
狀態：✅ 完成 / ⏸ 跳過（原因） / ❌ 失敗（錯誤訊息）
變更檔案：<清單>
驗收：tsc ✅ / validate ✅ (ERROR 0, WARN n) / build ✅
commit：<hash> <message>
需 Ash 確認：<無 或 項目>
```

---

## 1. 決策點（Ash 已於 2026-10-15 全數決定）

| 編號 | 問題 | 建議（預設） | 決定 |
|---|---|---|---|
| D1 | ZH locale 有、schema 沒有的**已登記**標籤（8 筆，見 T1.2）要補進 schema，還是從 ZH 刪掉？ | **補進 schema**（都是事實正確的標籤，補完都 ≤ 6 個） | ✅ **補進 schema** |
| D2 | 51 筆 JA name 帶括號（例「嵐山駅 (阪急)」「晴明神社 (ACG聖地)」）。導航網址組裝已自動剝除括號，實際功能不受影響。 | **A：放寬規則**，允許括號作為消歧義/ACG 標記，驗證器移除此警告（T1.5）。B：逐筆改名（不建議，ACG 重複點會變同名）。 | ✅ **A：放寬規則** |
| D3 | NK-004 二条城被標了「寺院」標籤（二条城是城郭）。 | **把「寺院」換成「歷史」** | ✅ **換成「歷史」** |
| D4 | YS-031（山科）與 NS-010（西京）JA name 都是「正法寺」。 | 導航會帶入行政區名，不會搜錯；Ash 人工確認 YS-031 實體 | ✅ **刪除 YS-031**（實體無法確認，見 T1.6） |
| D5 | Phase 3 首頁新地圖完成後，舊的方塊版 MapCanvas 要保留切換嗎？ | **不保留**（git 歷史可回溯） | ✅ **不保留** |

---

## Phase 0 — 環境準備

### T0.1 安裝依賴、同步鎖檔、忽略 .claude/
- 目前 `package-lock.json` 與 `package.json` 不同步，`npm ci` 會失敗。
- 執行 `npm install`（會更新 `package-lock.json`），完成後執行 `npm ci` 必須成功。
- `.gitignore` 新增一行 `.claude/`。
- 執行 0 節的三個驗收指令，**記錄基準值**：validate 應為 `ERROR：0　WARN：91`，並記下 `npm run build` 輸出中 `index-*.js` 的大小（約 642 kB）。若基準值不符，停止並回報。
- **commit**：`chore(T0.1): sync package-lock and ignore .claude`

---

## Phase 1 — 資料品質清理（核准目標：WARN 91 → 1）

> 2026-10-28 使用者追加決策 D6：SK-078 營運狀況未確認，保留原資料、列待查；接受該筆 1 個 ZH 鏡射警告。其餘目標維持不變，收尾預期 810 / ERROR 0 / WARN 1。

### T1.1 ZH tags 補齊 schema 已有的標籤
- **檔案**：`src/data/locales/zh/*.ts`（只改 `tags` 字串）
- **做法**：在下列 ID 的 ZH `tags` 字串**尾端**加上指定標籤（空格分隔）。不要改 schema、不要改 JA。

| ID | 檔案 | 加上 |
|---|---|---|
| FS-019 | zh/fushimi.ts | 現代 |
| FS-047 | zh/fushimi.ts | 拉麵 |
| FS-049 | zh/fushimi.ts | 現代 |
| FS-057 | zh/fushimi.ts | 拉麵 |
| HY-003 | zh/higashiyama.ts | ACG |
| HY-004 | zh/higashiyama.ts | ACG |
| HY-006 | zh/higashiyama.ts | ACG |
| HY-007 | zh/higashiyama.ts | 國寶 |
| KT-001 | zh/kita.ts | ACG |
| KT-005 | zh/kita.ts | ACG |
| KT-008 | zh/kita.ts | ACG |
| KT-015 | zh/kita.ts | ACG |
| KT-027 | zh/kita.ts | 溫泉 |
| UK-009 | zh/ukyo.ts | 博物館 |
| UK-015 | zh/ukyo.ts | 經典 |
| UK-057 | zh/ukyo.ts | 博物館 |
| UK-075 | zh/ukyo.ts | 名物 |

- **另外兩筆是「改寫」**：
  - `SK-078`（zh/sakyo.ts）：原訂改為 `"洋菓子 打卡"`；依 D6 **本輪保留原資料，不執行此修改**。
  - `UK-077`（zh/ukyo.ts）：`tags` 改為 `"正餐 蕎麥"`（「蕎麦」「老舗」是錯字/未登記）
- **驗收**：`npx tsx validate_data.js` 中上列 ID 的「ZH tags 未鏡射」警告消除，**SK-078（D6 保留）及 UK-075 除外**：它的「老舖」差異要等 T1.2 補入 schema 才消除。
- **commit**：`fix(T1.1): mirror ZH tags to schema tagIds`

### T1.2 【Ash 決策 D1】把 ZH 已有的已登記標籤補進 schema
- **檔案**：`src/data/spots/*.ts`（只改 `tagIds`）
- **做法**：在下列 ID 的 `tagIds` 陣列**尾端**加上標籤：

| ID | 檔案 | 加上 | 加完數量 |
|---|---|---|---|
| KG-029 | spots/kamigyo.ts | '國寶' | 2 |
| MN-036 | spots/minami.ts | '博物館' | 2 |
| NK-121 | spots/nakagyo.ts | '現代' | 4 |
| SG-046 | spots/shimogyo.ts | '歷史', '老舖' | 4 |
| UK-075 | spots/ukyo.ts | '老舖' | 4 |
| YS-006 | spots/yamashina.ts | '歷史' | 6 |
| YS-007 | spots/yamashina.ts | '歷史', '賞花', '打卡' | 5 |
| YS-012 | spots/yamashina.ts | '歷史' | 2 |

- 若 D1 決定為「從 ZH 刪掉」：改為從對應 ZH `tags` 刪除這些字，schema 不動。
- **注意**：KG-029 加上「國寶」後，會產生一個新的「未註冊 SPOT_POSITIONS」警告，這在 T1.3 會補上，屬正常現象。
- **驗收**：「ZH tags 未鏡射」警告只剩 SK-078（D6）。
- **commit**：`fix(T1.2): add registered tags from ZH locale into schema`

### T1.3 地標座標：修正錯位 + 補齊 14 個世界遺產/國寶

> 2026-10-28 已執行：下表為歷史候選值，部分已證實偏離。實際登記值與來源見 `docs/agent-runs/2026-10-28-landmarks.md`，維護以 `map-centers.ts` 為準，不得重新套用本表候選值。
- **檔案**：`src/data/map-centers.ts`（只改 `SPOT_POSITIONS`）
- **步驟 1（修 bug）**：`'NK-006': { lat: 35.0142, lng: 135.7482 }, // 二条城` 的 key 是錯的（NK-006 是先斗町），改成 `'NK-004'`，註解保留「二条城」。
- **步驟 2（順手修註解）**：`'KT-005'` 那行註解改為 `// 金閣寺`，並把整行移到 `// Kita` 區塊（`'KT-015'` 下一行）。
- **步驟 3（新增）**：依行政區區塊加入下列座標。

| ID | 名稱 | lat | lng | 放入區塊 |
|---|---|---|---|---|
| KT-006 | 大徳寺 | 35.0437 | 135.7462 | Kita |
| KG-003 | 相國寺 | 35.0336 | 135.7626 | Kamigyo |
| KG-029 | 千本釋迦堂（大報恩寺） | 35.0318 | 135.7434 | Kamigyo |
| SK-005 | 永観堂 | 35.0147 | 135.7941 | Sakyo |
| SK-038 | 比叡山 延暦寺 | 35.0703 | 135.8412 | Sakyo |
| SK-080 | 大悲山 峰定寺 | 35.2003 | 135.7741 | Sakyo |
| NK-018 | 二条城 二の丸庭園 | 35.0139 | 135.7466 | Nakagyo |
| HY-006 | 建仁寺 | 34.9988 | 135.7736 | Higashiyama |
| UK-004 | 大覚寺 | 35.0283 | 135.6779 | Ukyo |
| UK-024 | 高山寺 | 35.0602 | 135.6785 | Ukyo |
| UK-082 | 常照皇寺 | 35.1795 | 135.6508 | Ukyo |
| YS-005 | 勧修寺 | 34.9513 | 135.8073 | Yamashina |
| YS-006 | 隨心院 | 34.9424 | 135.8164 | Yamashina |

- **校對**：若執行環境能上網，逐筆用 Google Maps 搜尋名稱核對，誤差 > 0.002 度就改用 Google Maps 的值。**SK-080、UK-082 為山區寺院，必須校對**。表中數值是候選值，不是已核實資料；記錄來源與查核日期。無法核實時保留原資料、列為未完成，不把估計值寫入並宣稱驗收通過。
- 格式範例：`'KT-006': { lat: 35.0437, lng: 135.7462 }, // 大徳寺`
- **驗收**：「未在 SPOT_POSITIONS 註冊座標」警告數 = 0。
- **commit**：`fix(T1.3): fix NK-004 landmark key and register missing landmark coordinates`

### T1.4 【Ash 決策 D3】二条城標籤修正
- **檔案**：`src/data/spots/nakagyo.ts`、`src/data/locales/zh/nakagyo.ts`、`src/data/locales/ja/nakagyo.ts`
- **做法**：NK-004
  - schema：`tagIds` 中的 `'寺院'` 換成 `'歷史'`
  - zh `tags`：`寺院` 換成 `歷史`
  - ja `tags`：`寺院` 換成 `歴史`
- **commit**：`fix(T1.4): replace 寺院 tag on Nijo Castle with 歷史`

### T1.5 【Ash 決策 D2】JA name 括號規則
- **D2 = A（放寬規則）時**：
  1. `validate_data.js`：刪除這一行（含註解中對應描述「JA name 帶括號後綴」）：
     ```js
     if (/[()（）]/.test(jaLoc.name)) warn(`${s.id}: JA name 帶括號後綴「${jaLoc.name}」`);
     ```
     並把檔頭 WARN 說明改為 `JA name 重複`。
  2. `README.md` 第「3. 內容層 Locale 命名絕對約束」節，把「禁止為了 UI 排版美觀而加入無效的視覺後綴（例：…）」那句改為：
     > 括號附註僅允許用於**消歧義**（如車站業者「嵐山駅 (阪急)」、別名「東寺 (教王護国寺)」、ACG 聖地標記「晴明神社 (ACG聖地)」）；Query Assembly System（`buildGoogleMapsUrl`）會自動剝除括號內容。仍禁止純裝飾用途的後綴（例：禁止「清水寺 (秋季夜觀)」，必須填寫「清水寺」）。
  3. 同步修改 README「7. 執行前自我檢查」中 WARN 項目的描述（拿掉「帶括號後綴」）。
- **D2 = B 時**：跳過本任務並回報，由 Ash 另行指定改名清單。
- **驗收**：WARN 只剩 2（正法寺重名由 T1.6 處理；SK-078 依 D6 保留）。
- **commit**：`docs(T1.5): allow disambiguation brackets in JA names`

---

### T1.6 【Ash 決策 D4】刪除 YS-031（無法確認實體的正法寺）
- **檔案**：`src/data/spots/yamashina.ts`、`src/data/locales/zh/yamashina.ts`、`src/data/locales/ja/yamashina.ts`
- **做法**：三個檔案中各刪除 `'YS-031'` 那**一整行**。不要動 NS-010，也不要把後面的 ID 重新編號（ID 允許跳號）。
- **刪除前確認**：全專案 grep `YS-031`，除了這三個檔案和 `docs/PLAN.md` 之外不應有其他引用；若有，停止並回報。
- **驗收**：`npx tsx validate_data.js` 輸出 `ERROR：0　WARN：1`（只允許 D6 的 SK-078），景點總數 811 → 810；strict 預期 exit 1 且原因只能是此筆。
- **commit**：`fix(T1.6): remove unverifiable YS-031 duplicate 正法寺`

---

## Phase 2 — 架構修正

### T2.1 ClusterMap：叢集面板狀態重置 + 移除死碼
- **檔案**：`src/components/ClusterMap.tsx`
- **步驟 1**：在 `const [selectedClusterKey, ...]` 宣告之後加入：
  ```tsx
  // 切換行政區/分區時關閉面板
  useEffect(() => {
    setSelectedClusterKey(null);
  }, [activeId, mode]);
  ```
- **步驟 2**：在 `clusters` 的 `useMemo` 之後加入：
  ```tsx
  // 篩選條件改變導致選取的叢集消失時，關閉面板
  useEffect(() => {
    if (selectedClusterKey && !clusters.some(c => c.key === selectedClusterKey)) {
      setSelectedClusterKey(null);
    }
  }, [clusters, selectedClusterKey]);
  ```
- **步驟 3**：`MapController` 中刪除這個空的 effect 與 `geoJsonLayer` prop（含呼叫端 `geoJsonLayer={geoJsonData}`）：
  ```tsx
  useEffect(() => {
    // If we have a GeoJSON layer, ...
  }, [geoJsonLayer, map]);
  ```
- **手動驗收**：`npm run dev` → 進入東山區 → 地圖 → 點「祇園・清水寺」叢集開啟面板 → 切到「交通要津」tab 再切回 → 面板若該叢集已無景點則自動關閉，不會出現 `undefined (0)`。
- **commit**：`fix(T2.1): reset cluster panel on scope/filter change`

### T2.2 行政區邊界改為靜態資料（已落地）

- **實作**：`scripts/fetch-ward-geo.mjs`；拒收與寫入失敗測試：`scripts/fetch-ward-geo.test.mjs`。
- **產物**：`src/data/geo/ward-boundaries.ts`、`ward-boundaries.sources.json`；來源、授權、政策與重建限制見同目錄 `README.md`。此節取代舊版僅取第一個 relation 的示範碼，以實際產生器為準。
- 從既有 `wards.ts` 讀取11區。查詢必須是唯一的 OSM administrative boundary relation、admin_level=8、精確區名、日本／京都府／京都市；身分缺漏或歧義即停止。
- 全部頂點、閉環、自交、洞、MultiPolygon分量與外框都須通過檢查；不裁剪北部山區、不手填座標。採服務的0.0005簡化結果，不再四捨五入。
- 一次性查詢須遵守 Nominatim 當時政策：單機、單執行緒、至少1.1秒間隔、含專案網址的User-Agent、持久快取、不自動重試。不可放入前端、CI或定期排程。
- **重建**：`node scripts/fetch-ward-geo.mjs` 優先使用 `.claude/ward-geo-cache/`；`node scripts/fetch-ward-geo.mjs --offline` 禁止請求、缺少快取就失敗。參數不符時拒絕覆寫快取；不要為調簡化程度重新查同一組資料。
- 產物約37KiB，低於150KiB上限；若日後超限，從快取離線簡化並重新驗證。兩份產物全部暫存後才發布；寫入失敗恢復原配對，恢復失敗保留 recovery 檔並停止。並非跨檔案斷電原子交易。
- **ClusterMap**：刪除 runtime fetch與相關state，以useMemo取靜態geometry及Leaflet bounds，採GeoJSON型別，不使用`as any`；GeoJSON以activeId作key。地圖保留可見OSM署名。
- **驗收**：`node --test scripts/fetch-ward-geo.test.mjs`、離線重建、lint／validate／build；逐區開啟11區顯示紅色區界。實作及正式JS包不包含Nominatim端點；本輪未直接擷取Network紀錄，證據類型詳見執行紀錄。
- **commit**：`d637d47`；失敗回復修正 `9b99c30`。

### T2.3 ClusterMap 延遲載入（縮小主程式包）
- **檔案**：`src/components/DetailView.tsx`
- **步驟**：
  1. 刪除 `import { ClusterMap } from './ClusterMap';`
  2. 在 import 區之後加入：
     ```tsx
     const ClusterMap = React.lazy(() =>
       import('./ClusterMap').then(m => ({ default: m.ClusterMap }))
     );
     ```
  3. 把 `<ClusterMap engine={engine} width={width} />` 包成：
     ```tsx
     <React.Suspense fallback={
       <div className="h-[65vh] flex items-center justify-center font-serif tracking-[0.5em] text-gold-light/40">{t('loading')}</div>
     }>
       <ClusterMap engine={engine} width={width} />
     </React.Suspense>
     ```
- **驗收**：`npm run build` 輸出中 `index-*.js` 主檔小於修改前（T2.2 修改後基準 649.07 kB；T2.3 為446.20 kB），並出現獨立的 `ClusterMap-*.js` chunk。回報中寫出前後大小。
- **commit**：`perf(T2.3): lazy-load ClusterMap and Leaflet`

### T2.4 spots-loader：移除與靜態 import 重複的 lazy glob
- **檔案**：`src/data/spots-loader.ts`
- **原因**：schema 已被 `loadAllSchemasSync()` 靜態 import 進主程式包，`SCHEMA_MODULES` 的 lazy glob 毫無效果（Vite 也會因此警告）。
- **步驟**：
  1. 刪除 `const SCHEMA_MODULES = import.meta.glob('./spots/*.ts', { eager: false });`
  2. 把檔案下方 11 個 `import { XXX_SCHEMA } ...` 移到檔案頂部 import 區。
  3. 新增：
     ```ts
     const SCHEMAS_BY_WARD: Record<WardKey, SpotSchema[]> = {
       W_KITA: KITA_SCHEMA, W_KAMIGYO: KAMIGYO_SCHEMA, W_NAKAGYO: NAKAGYO_SCHEMA,
       W_SAKYO: SAKYO_SCHEMA, W_HIGASHIYAMA: HIGASHIYAMA_SCHEMA, W_SHIMOGYO: SHIMOGYO_SCHEMA,
       W_MINAMI: MINAMI_SCHEMA, W_UKYO: UKYO_SCHEMA, W_NISHIKYO: NISHIKYO_SCHEMA,
       W_YAMASHINA: YAMASHINA_SCHEMA, W_FUSHIMI: FUSHIMI_SCHEMA,
     };
     ```
  4. `loadSpotsByWard` 的「1. 動態 import 對應的 schema 檔」整段換成：
     ```ts
     const schemaSpots = SCHEMAS_BY_WARD[wardId];
     if (!schemaSpots) {
       console.error(`Unknown wardId: ${wardId}`);
       return [];
     }
     ```
  5. `loadAllSchemasSync()` 改為 `return Object.values(SCHEMAS_BY_WARD).flat();`
  6. 檔頭註解「動態 import 路徑含 `.ts` 副檔名…」那兩行刪除，改寫為「Schema 為靜態匯入（統計需要全量）；Locale 依語系 lazy 載入」。
- **驗收**：三項指令通過；手動切換中/日文、開啟任一行政區與任一分區，景點正常顯示。
- **commit**：`refactor(T2.4): load schemas statically, keep locales lazy`

### T2.5 地圖相關硬編碼文字 i18n
- **檔案**：`src/data/i18n.ts`、`src/components/DetailView.tsx`、`src/components/ClusterMap.tsx`
- **i18n.ts 新增**：
  ```ts
  view_map:   { zh: "地圖", ja: "地図" },
  view_card:  { zh: "卡片", ja: "カード" },
  view_hint:  { zh: "叢集", ja: "一覧" },
  btn_to_map: { zh: "切換地圖", ja: "地図に切替" },
  map_day:    { zh: "日輪", ja: "日輪" },
  map_night:  { zh: "夜巡", ja: "夜巡" },
  btn_back_map: { zh: "返回地圖", ja: "地図に戻る" },
  ```
- **替換**：
  - DetailView：`{viewMode === 'card' ? '地圖' : '卡片'}` → `{t(viewMode === 'card' ? 'view_map' : 'view_card')}`；`{viewMode === 'card' ? '叢集' : '叢集'}` → `{t('view_hint')}`；`切換地圖` → `{t('btn_to_map')}`
  - ClusterMap：`'夜巡' : '日輪'` → `t('map_night') : t('map_day')`；`返回地圖` → `{t('btn_back_map')}`
  - ClusterMap 中的 `setMapTheme(t => ...)` 的參數名 `t` 會遮蔽翻譯函式，改名為 `prev`。
- **commit**：`fix(T2.5): localize hard-coded map UI strings`

### T2.6 README 與程式碼不一致處修正
- **檔案**：`README.md`
- 逐項修改：
  1. 「洛中洛外」規則：`MapCanvas 的 SVG 區塊 id 必須與 wardId 精確對應` → 改為「MapCanvas 的行政區元素以 wardId 呼叫 onOpen」（Phase 3 完成後在 T3.6 再更新為 SVG 說明）。
  2. 「Query Assembly System — 地圖搜尋規則」整節改寫為現行實作：函式 `buildGoogleMapsUrl`（`src/components/SpotCard.tsx`），步驟為「剝除括號附註 → 先斗町特例 → 廣域名稱（嵐山/祇園/哲学の道/鴨川）只加『京都』，其他加『行政區日文名 + 京都』 → `maps/search/?api=1&query=`」；ClusterMap 與 SpotCard 共用。
  3. 「⚠️ 已知技術注意事項」：刪除第 1 項（已改用 glob/靜態匯入）、第 2 項（已是模組層 lazy getter）、第 4 項（經驗證 `toChineseNumerals(101)`=一百零一、`110`=一百一十，正確）；第 3 項改為「`closeDetail()` 會將 mode 重置為 `'ward'`」。
  4. 「🏗️ 核心架構」中 Query Assembly System 的說明同步第 2 點。
- **commit**：`docs(T2.6): align README with current implementation`

---

## Phase 3 — 地圖美術升級（洛中洛外図屏風風格，SVG 即時繪製）

**設計目標**：首頁地圖從 11 個方塊改為「真實行政區輪廓 + 金雲 + 墨線河川 + 山稜」的屏風畫風；全部以程式產生的 SVG 繪製，無圖片素材。
**前置條件**：T2.2 完成（需要 `WARD_BOUNDARIES`）。

### 視覺規格（全 Phase 共用）
| 元素 | 規格 |
|---|---|
| 底色 | 漆黑 `#0c0b0a` → `#1a1714` 徑向漸層，疊 2–4% 和紙雜訊 |
| 行政區 | 填色 `rgba(26,23,20,0.88)`，邊線金 `rgba(200,160,74,0.45)` 1.5px |
| 懸停/聚焦 | 填色朱 `#b1352b` 85%，金色外框沿輪廓「畫出」(0.6s)，外發光 |
| 河川 | 群青銀 `rgba(140,170,200,0.55)` 主線 5px + 內線 1.5px 較亮；墨暈濾鏡 |
| 山稜 | 3 層剪影，`#2b2b2b`→`#1a1714`，透明度 0.35/0.25/0.15 |
| 金雲（すやり霞） | 金箔漸層 `#fffdf0 → #e8c96a → #c8a04a → #8b6820`，疊切金方格紋，緩慢水平漂移 30–60s |
| 文字 | Noto Serif JP，金色漸層（同 `.maki-e-text`），計數以小朱印呈現 |
| 動態 | 一律遵守 `prefers-reduced-motion: reduce`（停止漂移與描線動畫） |

### T3.1 幾何與程序繪圖工具
- **新增** `src/lib/geo-svg.ts`，內容如下（照抄）：
  ```ts
  /**
   * 首頁屏風地圖的投影與程序繪圖工具。
   * 座標慣例：函式參數的 [lat, lng] 為「緯度, 經度」；GeoJSON 原始資料為 [lng, lat]。
   */
  import type { WardGeometry } from '../data/geo/ward-boundaries';

  /** 顯示範圍：裁掉京北/花背等北部山區，讓市中心比例變大（北緣以金雲遮蓋） */
  export const VIEW_BBOX = { minLat: 34.88, maxLat: 35.13, minLng: 135.60, maxLng: 135.87 };
  const K = Math.cos(((VIEW_BBOX.minLat + VIEW_BBOX.maxLat) / 2) * Math.PI / 180);
  const SCALE = 4000; // 每 1 度緯度 = 4000 viewBox 單位
  export const VIEW_W = Math.round((VIEW_BBOX.maxLng - VIEW_BBOX.minLng) * K * SCALE);
  export const VIEW_H = Math.round((VIEW_BBOX.maxLat - VIEW_BBOX.minLat) * SCALE);

  const r1 = (v: number) => Math.round(v * 10) / 10;

  export function project(lat: number, lng: number): [number, number] {
    return [r1((lng - VIEW_BBOX.minLng) * K * SCALE), r1((VIEW_BBOX.maxLat - lat) * SCALE)];
  }

  function ringToPath(ring: number[][]): string {
    return ring.map(([lng, lat], i) => {
      const [x, y] = project(lat, lng);
      return `${i === 0 ? 'M' : 'L'}${x},${y}`;
    }).join('') + 'Z';
  }

  /** GeoJSON Polygon / MultiPolygon → SVG path d（搭配 fill-rule="evenodd"） */
  export function geometryToPath(geom: WardGeometry): string {
    const polys = geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates;
    return polys.map(rings => rings.map(ringToPath).join('')).join('');
  }

  /** 經過各點的平滑曲線（Catmull-Rom → 三次貝茲），points 為 [lat, lng] */
  export function smoothLinePath(points: [number, number][]): string {
    const p = points.map(([lat, lng]) => project(lat, lng));
    if (p.length < 2) return '';
    let d = `M${p[0][0]},${p[0][1]}`;
    for (let i = 0; i < p.length - 1; i++) {
      const p0 = p[i - 1] ?? p[i], p1 = p[i], p2 = p[i + 1], p3 = p[i + 2] ?? p2;
      const c1x = r1(p1[0] + (p2[0] - p0[0]) / 6), c1y = r1(p1[1] + (p2[1] - p0[1]) / 6);
      const c2x = r1(p2[0] - (p3[0] - p1[0]) / 6), c2y = r1(p2[1] - (p3[1] - p1[1]) / 6);
      d += ` C${c1x},${c1y} ${c2x},${c2y} ${p2[0]},${p2[1]}`;
    }
    return d;
  }

  /** 可重現的亂數（同 seed 每次畫出同樣的雲與山） */
  export function mulberry32(seed: number): () => number {
    return () => {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /** すやり霞：上緣為連續圓弧凸起、下緣為較緩弧線的水平雲帶（viewBox 座標） */
  export function cloudBandPath(x0: number, x1: number, y: number, h: number, rand: () => number): string {
    let d = `M${r1(x0)},${r1(y)}`;
    let x = x0;
    while (x < x1) {
      const w = 24 + rand() * 48;
      const nx = Math.min(x + w, x1);
      const rx = (nx - x) / 2;
      d += ` A${r1(rx)},${r1(rx * (0.55 + rand() * 0.45))} 0 0 1 ${r1(nx)},${r1(y)}`;
      x = nx;
    }
    d += ` L${r1(x1)},${r1(y + h)}`;
    while (x > x0) {
      const w = 40 + rand() * 70;
      const nx = Math.max(x - w, x0);
      const rx = (x - nx) / 2;
      d += ` A${r1(rx)},${r1(rx * 0.35)} 0 0 1 ${r1(nx)},${r1(y + h)}`;
      x = nx;
    }
    return d + 'Z';
  }

  /**
   * 山稜剪影（封閉區域）。side='top' 沿上緣、'left'/'right' 沿左右緣。
   * depth 為山體向內延伸的最大深度（viewBox 單位）。
   */
  export function ridgePath(side: 'top' | 'left' | 'right', depth: number, rand: () => number, steps = 48): string {
    const len = side === 'top' ? VIEW_W : VIEW_H;
    const ph = [rand() * 6.28, rand() * 6.28, rand() * 6.28];
    const pts: string[] = [];
    for (let i = 0; i <= steps; i++) {
      const s = (len * i) / steps;
      const n = 0.5 + 0.25 * Math.sin(s * 0.012 + ph[0]) + 0.15 * Math.sin(s * 0.029 + ph[1]) + 0.1 * Math.sin(s * 0.067 + ph[2]);
      const dd = r1(depth * n);
      const [x, y] = side === 'top' ? [r1(s), dd] : side === 'left' ? [dd, r1(s)] : [r1(VIEW_W - dd), r1(s)];
      pts.push(`${i === 0 ? 'M' : 'L'}${x},${y}`);
    }
    const close = side === 'top' ? `L${VIEW_W},0 L0,0` : side === 'left' ? `L0,${VIEW_H} L0,0` : `L${VIEW_W},${VIEW_H} L${VIEW_W},0`;
    return pts.join(' ') + ' ' + close + ' Z';
  }
  ```
- **驗收**：`npm run lint` 通過（本任務尚未被任何元件使用，build 不受影響）。
- **commit**：`feat(T3.1): add projection and procedural drawing helpers`

### T3.2 新首頁地圖：真實行政區輪廓（先不加美術層）
- **檔案**：`src/components/MapCanvas.tsx`（整檔替換）、`src/index.css`
- **MapCanvas.tsx**（props 介面不變，HomeView 不用改）：
  ```tsx
  import React, { useMemo } from 'react';
  import { toChineseNumerals } from '../lib/numerals';
  import { WARD_BOUNDARIES } from '../data/geo/ward-boundaries';
  import { WARD_NAMES } from '../data/index';
  import { VIEW_W, VIEW_H, project, geometryToPath } from '../lib/geo-svg';

  interface MapCanvasProps {
    onOpen: (id: string, mode: 'ward' | 'area') => void;
    stats: Record<string, number>;
    t: (key: string, dict?: any) => string;
  }

  /** 標籤錨點（人工指定，避免不規則形狀的重心落在區外） */
  const WARD_LABELS: Record<string, { lat: number; lng: number; text: string }> = {
    W_KITA:        { lat: 35.075, lng: 135.735, text: '北' },
    W_KAMIGYO:     { lat: 35.030, lng: 135.755, text: '上京' },
    W_SAKYO:       { lat: 35.075, lng: 135.810, text: '左京' },
    W_NAKAGYO:     { lat: 35.008, lng: 135.748, text: '中京' },
    W_HIGASHIYAMA: { lat: 34.993, lng: 135.783, text: '東山' },
    W_SHIMOGYO:    { lat: 34.990, lng: 135.753, text: '下京' },
    W_MINAMI:      { lat: 34.970, lng: 135.735, text: '南' },
    W_UKYO:        { lat: 35.050, lng: 135.665, text: '右京' },
    W_NISHIKYO:    { lat: 34.965, lng: 135.670, text: '西京' },
    W_YAMASHINA:   { lat: 34.975, lng: 135.815, text: '山科' },
    W_FUSHIMI:     { lat: 34.930, lng: 135.775, text: '伏見' },
  };

  export const MapCanvas: React.FC<MapCanvasProps> = ({ onOpen, stats, t }) => {
    const wards = useMemo(() => Object.entries(WARD_BOUNDARIES).map(([id, geom]) => {
      const label = WARD_LABELS[id];
      const [lx, ly] = label ? project(label.lat, label.lng) : [0, 0];
      return { id, d: geometryToPath(geom), label: label?.text ?? id, lx, ly };
    }), []);

    return (
      <div className="ward-map">
        <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="ward-map-svg" role="group" aria-label={t('tab_ward')}>
          <defs>
            <clipPath id="ward-map-clip"><rect width={VIEW_W} height={VIEW_H} /></clipPath>
          </defs>
          {/* T3.3 的美術層（山、河、雲）插入此處與下方 */}
          <g clipPath="url(#ward-map-clip)">
            {wards.map(w => (
              <g
                key={w.id}
                className="ward"
                role="button"
                tabIndex={0}
                aria-label={`${t(w.id, WARD_NAMES)} ${stats[w.id] ?? 0}`}
                onClick={() => onOpen(w.id, 'ward')}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(w.id, 'ward'); }
                }}
              >
                <path className="ward-fill" d={w.d} fillRule="evenodd" />
                <path className="ward-outline" d={w.d} fillRule="evenodd" pathLength={1} />
                <text className="ward-label" x={w.lx} y={w.ly} textAnchor="middle">{w.label}</text>
                <g className="ward-seal" transform={`translate(${w.lx}, ${w.ly + 14})`}>
                  <rect x={-22} y={0} width={44} height={20} rx={2} />
                  <text x={0} y={14} textAnchor="middle">{toChineseNumerals(stats[w.id] ?? 0)}</text>
                </g>
              </g>
            ))}
          </g>
        </svg>
        <div className="ward-map-attribution">© OpenStreetMap contributors</div>
      </div>
    );
  };
  ```
- **index.css**：
  1. 刪除 `.map-canvas`、`.ward-area`（含 hover 與 media query）、`.ward-label-text`、`.ward-count-text`、所有 `.pos-*` 規則。
  2. 新增：
  ```css
  .ward-map {
    position: relative;
    width: 100%;
    max-width: min(95vw, 680px);
    margin: 0 auto;
    border: 4px double rgba(200, 160, 74, 0.5);
    background: radial-gradient(circle at 50% 45%, #1a1714 0%, #0c0b0a 100%);
    box-shadow: inset 0 0 100px rgba(0,0,0,0.5), 0 30px 60px rgba(0,0,0,0.8);
    overflow: hidden;
  }
  .ward-map-svg { display: block; width: 100%; height: auto; }
  .ward { cursor: pointer; outline: none; }
  .ward-fill {
    fill: rgba(26, 23, 20, 0.88);
    stroke: rgba(200, 160, 74, 0.45);
    stroke-width: 1.5;
    transition: fill 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .ward-outline {
    fill: none;
    stroke: #e6c27a;
    stroke-width: 3;
    stroke-dasharray: 1;
    stroke-dashoffset: 1;
    transition: stroke-dashoffset 0.6s ease-out;
    pointer-events: none;
  }
  .ward:hover .ward-fill, .ward:focus-visible .ward-fill { fill: rgba(177, 53, 43, 0.85); }
  .ward:hover .ward-outline, .ward:focus-visible .ward-outline { stroke-dashoffset: 0; }
  .ward:hover, .ward:focus-visible { filter: drop-shadow(0 0 12px rgba(177, 53, 43, 0.6)); }
  .ward-label {
    font-family: var(--font-serif);
    font-weight: 700;
    font-size: 30px;
    letter-spacing: 0.15em;
    fill: #e6c27a;
    paint-order: stroke;
    stroke: rgba(0,0,0,0.7);
    stroke-width: 4px;
    pointer-events: none;
  }
  .ward:hover .ward-label, .ward:focus-visible .ward-label { fill: #fff; }
  .ward-seal { pointer-events: none; }
  .ward-seal rect { fill: #b1352b; stroke: rgba(255,255,255,0.6); stroke-width: 1; }
  .ward-seal text { font-family: var(--font-serif); font-size: 13px; font-weight: 700; fill: #fff; }
  .ward-map-attribution {
    position: absolute; right: 6px; bottom: 4px;
    font-size: 9px; color: rgba(230, 194, 122, 0.35);
    pointer-events: none;
  }
  @media (prefers-reduced-motion: reduce) {
    .ward-outline { transition: none; }
  }
  ```
- **手動驗收**：
  - 首頁「洛中洛外」顯示 11 區真實輪廓，標籤都落在各自區內，計數朱印正確。
  - 滑鼠懸停：該區變朱色、金框沿輪廓畫出；點擊進入該區 DetailView。
  - 鍵盤 Tab 可依序聚焦各區、Enter 進入。
  - 手機寬度（375px）下東山、下京等小區仍可點擊（若命中範圍太小，調整可點擊區或提供明確的行政區清單入口；不得只縮小文字當作解決。若需新增未列出的檔案，由主代理補充派工範圍）。
- **commit**：`feat(T3.2): render home ward map from real boundaries`

### T3.3 屏風美術層：和紙、山稜、河川、金雲
- **檔案**：`src/components/MapCanvas.tsx`、`src/index.css`
- **新增常數**（MapCanvas.tsx 頂部，座標為示意用的風格化路線，不需精確）：
  ```ts
  /** [lat, lng] 風格化河道 */
  const RIVERS: [number, number][][] = [
    // 鴨川（北→南）
    [[35.0600,135.7560],[35.0480,135.7640],[35.0400,135.7690],[35.0305,135.7720],[35.0200,135.7715],[35.0090,135.7712],[35.0000,135.7710],[34.9880,135.7695],[34.9750,135.7660],[34.9600,135.7600],[34.9450,135.7520],[34.9330,135.7400]],
    // 高野川（於出町柳匯入鴨川）
    [[35.0700,135.7950],[35.0550,135.7880],[35.0420,135.7790],[35.0305,135.7720]],
    // 桂川（保津峡→嵐山→南）
    [[35.0200,135.6450],[35.0160,135.6650],[35.0128,135.6778],[35.0000,135.6880],[34.9850,135.7000],[34.9700,135.7080],[34.9550,135.7150],[34.9400,135.7250],[34.9250,135.7350],[34.9100,135.7400]],
    // 宇治川
    [[34.8950,135.8050],[34.9050,135.7800],[34.9150,135.7600],[34.9100,135.7400]],
  ];
  ```
- **在 `useMemo` 內以固定 seed 產生**：
  ```ts
  const art = useMemo(() => {
    const rand = mulberry32(794); // 794 = 平安京遷都年，固定 seed 讓畫面每次相同
    return {
      ridges: [
        ridgePath('top', 140, rand), ridgePath('top', 100, rand), ridgePath('top', 60, rand),
        ridgePath('right', 110, rand), ridgePath('right', 70, rand),
        ridgePath('left', 120, rand), ridgePath('left', 75, rand),
      ],
      rivers: RIVERS.map(smoothLinePath),
      cloudsTop: [0, 1, 2].map(i => cloudBandPath(-80 + i * 60, VIEW_W * (0.55 + rand() * 0.35), 10 + i * 45, 34, rand)),
      cloudsBottom: [0, 1].map(i => cloudBandPath(VIEW_W * (0.1 + rand() * 0.3), VIEW_W + 80, VIEW_H - 70 + i * 32, 30, rand)),
      kirikane: Array.from({ length: 14 }, () => ({ x: rand() * 24, y: rand() * 24, s: 1 + rand() * 2.5, o: 0.25 + rand() * 0.5 })),
    };
  }, []);
  ```
  （記得從 `../lib/geo-svg` import `mulberry32, ridgePath, smoothLinePath, cloudBandPath`）
- **`<defs>` 內加入**：
  ```tsx
  <filter id="washi" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={3} stitchTiles="stitch" />
    <feColorMatrix values="0 0 0 0 0.78  0 0 0 0 0.63  0 0 0 0 0.29  0 0 0 0.05 0" />
  </filter>
  <filter id="ink-bleed">
    <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves={2} seed={3} />
    <feDisplacementMap in="SourceGraphic" scale={4} />
  </filter>
  <linearGradient id="kin" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stopColor="#fffdf0" />
    <stop offset="0.3" stopColor="#e8c96a" />
    <stop offset="0.65" stopColor="#c8a04a" />
    <stop offset="1" stopColor="#8b6820" />
  </linearGradient>
  <pattern id="kirikane" width={24} height={24} patternUnits="userSpaceOnUse">
    {art.kirikane.map((k, i) => (
      <rect key={i} x={k.x} y={k.y} width={k.s} height={k.s} fill="#fffdf0" opacity={k.o} transform={`rotate(45 ${k.x} ${k.y})`} />
    ))}
  </pattern>
  ```
- **圖層順序**（由下而上，全部放在 `clipPath` 的 `<g>` 內）：
  1. 和紙：`<rect width={VIEW_W} height={VIEW_H} filter="url(#washi)" />`
  2. 山稜：`art.ridges.map((d, i) => <path key={i} d={d} className={`ridge ridge-${i % 3}`} />)`
  3. 行政區（T3.2 的 `wards.map`）— **行政區必須在山之上、河之下**
  4. 河川：每條畫兩次 — `<path className="river-body" d={d} />` + `<path className="river-glint" d={d} />`，外層 `<g filter="url(#ink-bleed)" pointerEvents="none">`
  5. 標籤與朱印：**從 T3.2 的行政區 `<g>` 中移出**成獨立一層放在河川之上（`<g pointerEvents="none">`，點擊仍由下方 `.ward` 處理）。移出後 `.ward:hover .ward-label` 規則已無作用，請從 index.css 刪除該行選擇器規則。
  6. 金雲：
     ```tsx
     <g className="clouds clouds-drift-a" pointerEvents="none">
       {art.cloudsTop.map((d, i) => (<g key={i}><path d={d} fill="url(#kin)" /><path d={d} fill="url(#kirikane)" /></g>))}
     </g>
     <g className="clouds clouds-drift-b" pointerEvents="none">
       {art.cloudsBottom.map((d, i) => (<g key={i}><path d={d} fill="url(#kin)" /><path d={d} fill="url(#kirikane)" /></g>))}
     </g>
     ```
- **index.css 新增**：
  ```css
  .ridge { fill: #2b2b2b; pointer-events: none; }
  .ridge-0 { opacity: 0.15; }
  .ridge-1 { opacity: 0.25; }
  .ridge-2 { opacity: 0.35; }
  .river-body { fill: none; stroke: rgba(140, 170, 200, 0.55); stroke-width: 5; stroke-linecap: round; }
  .river-glint { fill: none; stroke: rgba(220, 235, 245, 0.45); stroke-width: 1.5; stroke-linecap: round; }
  .clouds { opacity: 0.92; will-change: transform; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.6)); }
  .clouds-drift-a { animation: cloud-drift 48s ease-in-out infinite alternate; }
  .clouds-drift-b { animation: cloud-drift 36s ease-in-out infinite alternate-reverse; }
  @keyframes cloud-drift { from { transform: translateX(-24px); } to { transform: translateX(24px); } }
  @media (prefers-reduced-motion: reduce) {
    .clouds-drift-a, .clouds-drift-b { animation: none; }
  }
  ```
- **手動驗收**：
  - 上緣金雲遮住北部被裁切的邊界、下緣金雲壓住伏見南端；雲緩慢左右漂移。
  - 鴨川、桂川清楚可辨，壓在行政區之上；滑鼠移到河上方仍可點擊下方行政區。
  - 山稜只在三側邊緣，不遮擋行政區標籤。
  - DevTools → Rendering → 勾選 `prefers-reduced-motion` 後雲停止移動。
  - 手機（375px）捲動首頁無明顯卡頓；若卡頓，先把 `#ink-bleed` 濾鏡移除後再回報。
- **commit**：`feat(T3.3): add byobu-style art layers to home map`

### T3.4 ClusterMap 視覺：和紙日間圖磚、行政區聚光、金框
- **檔案**：`src/components/ClusterMap.tsx`、`src/index.css`
- **index.css 新增**：
  ```css
  /* 日輪圖磚：和紙色調 */
  .map-tiles-day { filter: sepia(0.35) saturate(0.6) brightness(1.02) contrast(0.95); }
  ```
- **ClusterMap**：
  1. TileLayer 的 `className` 改為 `mapTheme === 'dark' ? 'map-tiles-night' : 'map-tiles-day'`。
  2. 行政區外圍調暗（聚光燈）— 在 `geoJsonData` 之後加：
     ```tsx
     const outsideMask = useMemo(() => {
       if (!geoJsonData) return null;
       const outerRings = geoJsonData.type === 'Polygon'
         ? [geoJsonData.coordinates[0]]
         : geoJsonData.coordinates.map(poly => poly[0]);
       return {
         type: 'Feature',
         properties: {},
         geometry: {
           type: 'Polygon',
           coordinates: [[[-180, -85], [180, -85], [180, 85], [-180, 85], [-180, -85]], ...outerRings],
         },
       } as any;
     }, [geoJsonData]);
     ```
  3. 原本的 `<GeoJSON>`（紅色虛線）替換為三層：
     ```tsx
     {outsideMask && (
       <GeoJSON key={`mask-${activeId}-${mapTheme}`} data={outsideMask} interactive={false}
         style={{ stroke: false, fillColor: mapTheme === 'dark' ? '#000' : '#f2ede4', fillOpacity: 0.55 }} />
     )}
     {geoJsonData && (
       <>
         <GeoJSON key={`halo-${activeId}`} data={geoJsonData as any} interactive={false}
           style={{ color: '#c8a04a', weight: 7, opacity: 0.3, fill: false }} />
         <GeoJSON key={`line-${activeId}`} data={geoJsonData as any} interactive={false}
           style={{ color: '#e6c27a', weight: 1.5, opacity: 0.95, fill: false }} />
       </>
     )}
     ```
- **手動驗收**：日輪為暖色和紙調；選定行政區外圍變暗，邊界為金色雙線；日夜切換時遮罩顏色跟著切換。
- **commit**：`feat(T3.4): washi day tiles and gold spotlight ward boundary`

### T3.5 ClusterMap 標記：朱印叢集 + 避免與地標重疊
- **檔案**：`src/components/ClusterMap.tsx`
- **步驟 1**：`createClusterIcon` 的數字圓改為朱印方章：
  - 外框 class 由 `w-8 h-8 rounded-full ...` 改為 `w-9 h-9 rounded-[3px] -rotate-3 ...`
  - 未選取：`bg-shuiro/90 border-white/60 text-white`；選取：`bg-shuiro border-gold-light text-white scale-110 shadow-[0_0_18px_rgba(230,194,122,0.6)]`
  - 數字改用 `toChineseNumerals(count)`（import `../lib/numerals`），`font-serif text-[0.7rem] font-black`
- **步驟 2**：叢集與地標重疊時上移叢集。`createClusterIcon` 增加參數 `lift: boolean`，最外層 `transform` 改為：
  ```ts
  `transform: translate(-50%, ${lift ? '-64px' : '-16px'}); position: absolute; pointer-events: none;`
  ```
  呼叫端計算：
  ```tsx
  const lift = landmarks.some(l =>
    Math.abs(l.pos[0] - cluster.pos[0]) < 0.0015 && Math.abs(l.pos[1] - cluster.pos[1]) < 0.0015);
  ```
- **手動驗收**：東山區「東山・知恩院」叢集與「知恩院」地標、「祇園・清水寺」叢集與「清水寺」地標不再重疊；朱印在日夜兩模式都清楚。
- **commit**：`feat(T3.5): hanko-style cluster markers with landmark collision offset`

### T3.6 收尾：文件、效能與跨裝置檢查
- **README**：
  - 「洛中洛外」節：渲染元件說明改為「`MapCanvas.tsx` 以 `src/data/geo/ward-boundaries.ts` 真實輪廓繪製 SVG（屏風風格：山稜、河川、金雲為 `src/lib/geo-svg.ts` 程序生成）；每區為 `<g class="ward">`，以 wardId 呼叫 onOpen」。
  - 目錄結構加入 `scripts/fetch-ward-geo.mjs`、`src/data/geo/`、`src/lib/geo-svg.ts`。
  - 「🎨 視覺風格」節加入「屏風地圖」一段（引用本文件 Phase 3 視覺規格表）。
- **檢查清單**（全部通過才 commit，結果寫入回報）：
  - [x] Chromium IAB 桌機 1440px、手機模擬 375px 首頁地圖顯示完整、無橫向捲動（窄版清單可向下捲動）
  - [ ] Safari/iOS（本環境不可測，未宣稱通過）
  - [x] Chrome Lighthouse 13.6.0 mobile 預設 Performance 94 → 94，達到不低於基準 −5 分
  - [x] `npm run build` 主程式包大小記錄於回報
- **commit**：`docs(T3.6): document byobu map and finalize phase 3`

**2026-10-29 實作差異與驗收**：見 [Phase 3 執行紀錄](agent-runs/2026-10-29-phase03.md)。T3.2 加入 11 區原生按鈕清單；T3.3 手動靜止模式與手機輕量濾鏡；T3.4 遮罩保留所有環、洞與分量；T3.5 使用像素矩形避讓及引線，取代固定經緯度閾值，不搬動真實座標。T3.6 移除首頁整頁淡入以恢復效能。無新增繪圖依賴；Safari/iOS 與真實 OS reduced-motion 切換列為未測，靜止控制與 CSS/程式分支已驗證。

---

## Phase 4 — 資料正確性優先，再擴充地圖

2026-11-04 使用者授權依建議順序啟動，先查 SK-078 與資料正確性，依合約分工，這輪不 push。最新全域派工合約優先；本輪執行與模型限制見 [資料查核紀錄](agent-runs/2026-11-04-phase04-data.md)。

1. **T4.1 第一批資料查核：本機完成。** 全庫結構清冊、前輪11個疑點，加上6個車站導航名稱，共17個ID。SK-078依新增閉店證據退役，809／ERROR 0／WARN 0；歷史D6原文保留。新增唯讀 `scripts/audit-data.ts`，不修改原稽核門檻。
2. **T4.2 跨市模型：本機完成，後續事實查核待續。** 使用者已授權處理SK-038；最小新增 municipalityId，分離旅遊索引／真實市域／導航地域。接著分批查文化財對象與餐飲身分／營業狀況，不能把結構綠燈視為全庫查證完成。
3. **T4.3 個別景點地圖：未啟動。** 先決定座標來源、授權、精度與密度策略；目前分區模式只有1個叢集點，現有45個真實景點座標不等於全庫都有點位。
4. **T4.4 MapLibre 評估：未啟動。** 向量底圖與自訂漆藝樣式先做成本、效能及視覺收益評估，再決定是否導入。
5. **T4.5 歲時記：未啟動。** `public/seasonal.html` 的季節更替另列內容任務。

T4.1 的 SK-038 所在地文字修正已提交；T4.2 模型與導航修復已完成本機驗收並 commit `a1eeb99`。上述後續工作不承接本批 push 授權；合併 main 仍需另行授權。

---

## 進度表（執行者每完成一項就打勾並填 commit）

| 任務 | 狀態 | commit |
|---|---|---|
| T0.1 依賴 + lock 檔 + .gitignore | ✅ | b634381 |
| T1.1 ZH tags 補齊 | ✅ D6 核准保留 SK-078，其餘完成 | e9c7a0c |
| T1.2 schema 補標籤（D1） | ✅ 8 筆完成；D6 例外 | a3982f5 |
| T1.3 地標座標 | ✅ 來源查證完成 | 8494a36 |
| T1.4 二条城標籤（D3） | ✅ | 9d6cc46 |
| T1.5 JA 括號規則（D2） | ✅ | fc519f6 |
| T1.6 刪除 YS-031（D4） | ✅ 資料驗收完成；畫面抽查限制見紀錄 | 92048bb |
| T2.1 叢集面板重置 | ✅ | 919e3a0 |
| T2.2 靜態行政區邊界 | ✅ | d637d47、9b99c30 |
| T2.3 ClusterMap 延遲載入 | ✅ | 61a0a28 |
| T2.4 spots-loader 靜態 schema | ✅ | 09a4a4b |
| T2.5 地圖文字 i18n | ✅ | 1c24cc1 |
| T2.6 README 對齊 | ✅ | 8e086dd |
| T3.1 繪圖工具 | ✅ | 7181500 |
| T3.2 真實輪廓首頁地圖 | ✅ | c39aca7 |
| T3.3 屏風美術層 | ✅ | fe09459 |
| T3.4 日間和紙 + 聚光 | ✅ | bd19e7a；圖層修正在 7fe4bc0 |
| T3.5 朱印標記 | ✅ | 7fe4bc0 |
| T3.6 收尾 | ✅ 可用環境驗收完成；平台限制見紀錄 | 本次提交 |
