# Kyoto Tactical Guide ⛩️
### 類 MMORPG 任務地圖概念的京都觀光入口網站

「Kyoto Tactical Guide」是一個將京都觀光資訊「遊戲化」的實驗專案。我們將京都市的各個行政區視為 RPG 遊戲中的「分區地圖 (Zones)」，將景點視為「任務 (Quests)」。透過類型分類（交通要津・寺社・商肆・食處・自然・近代設施・ACG 聖地）與自由文字標籤系統，使用者可依喜好快速篩選、搜尋景點，並一鍵跳轉 Google Maps 定位。

---

## 三大核心檢索模式

本應用提供三種互斥的檢索模式，透過頂部導航列（`HomeView.tsx`）切換，
各模式共用同一批 `filteredSpots` 狀態，由 `useKyotoEngine` 統一管理。

---

### 洛中洛外（Ward Mode）

**入口**：`mode === 'ward'`  
**資料來源**：`WARD_NAMES`（`src/data/index.ts`）、`getWardStats()`  
**渲染元件**：`MapCanvas.tsx`

以京都傳統地理分區「洛中・洛外」為索引，將全市分為 11 個行政區（Ward），
對應江戶時代的城市空間概念。使用者點擊地圖上的行政區塊即可進入該區的
`DetailView`，查看該區所有景點清單。

**規則與禁則：**
- 每個景點必須歸屬唯一的 `wardId`（於 `spots/*.ts` 的 `wardId` 欄位定義）
- `wardId` 的合法值集合定義於 `src/data/index.ts` 的 `WARD_NAMES`，
  禁止在資料檔中使用未登記的 wardId
- `MapCanvas` 的 SVG 區塊 id 必須與 `wardId` 精確對應，兩端需同步維護
- 行政區統計數字（`getWardStats()`）為動態計算，修改 spots 資料後自動反映

---

### 名所目録（Area Mode）

**入口**：`mode === 'area'`  
**資料來源**：`AREA_KEYS`、`AREA_NAMES`、`getAreaStats()`（`src/data/index.ts`）  
**渲染方式**：`HomeView.tsx` 直接渲染列表 → 點擊進入 `DetailView`（area 模式）

以京都觀光慣用的散策區域（Area）為索引，將全市細分為更小的遊覽單元
（例：嵐山、金閣寺周邊、祇園・清水等），共 15 個區域（`A01`–`A15`）。
Area 粒度比 Ward 更細，適合依據旅遊動線規劃單日行程。

**規則與禁則：**
- 每個景點必須歸屬唯一的 `areaId`（於 `spots/*.ts` 的 `areaId` 欄位定義）
- 合法 areaId 為 `A01`–`A15`，定義於 `src/data/index.ts`，禁止自創編號
- 一個景點只能同時屬於一個 Ward 與一個 Area，禁止多重歸屬
- Area 的中文顯示名稱（`AREA_NAMES`）為 UI 顯示層，不可與 `areaId` 混用作為外鍵

---

### 御秘帖（Tag Mode）

**入口**：`mode === 'tag'`  
**資料來源**：`TAG_REGISTRY`、`PINNED_GLOBAL_TAGS`（`src/data/tags.ts`）  
**渲染方式**：`HomeView.tsx` 渲染標籤選擇器 → 選中標籤後以全螢幕 overlay 展示結果

以「風物筆記」為隱喻的跨區域主題索引系統。使用者選擇標籤後，
系統從所有行政區中橫向篩選出符合條件的景點，不受地理分區限制，
適合以「目的」而非「位置」來規劃旅程（例：查詢全洛中的隱密老舖抹茶）。

**標籤分組（6 組）：**
| group | 中文顯示 | 說明 |
|---|---|---|
| `food` | 口福・食處 | 餐飲類型：正餐、懷石、抹茶、和菓子等 |
| `misc` | 旅行特質 | 旅遊屬性：名物、打卡、隱密、老舖等 |
| `culture` | 文化・信仰 | 人文歷史：神社、寺院、世界遺產、庭園等 |
| `nature` | 自然・風景 | 自然景觀：賞花、楓葉、山岳等 |
| `transport` | 交通要道 | 交通節點：鐵道、地鐵、巴士 |
| `acg` | 次文化 | ACG 聖地・動漫遊戲巡禮景點 |

**規則與禁則：**
- 標籤定義的唯一來源（SSOT）為 `src/data/tags.ts`，禁止在任何其他檔案硬編碼標籤字串
- `spots/*.ts` 中的 `tagIds` 陣列只能使用 `TAG_REGISTRY` 中已登記的 `id` 值
- 禁止使用語意模糊的標籤（如「美食」）；食物類應指定具體類型（如「拉麵」「懷石」）
- `T_FOOD` 類型景點禁用「世界遺產」標籤
- 單一景點的 `tagIds` 建議不超過 5 個，避免標籤膨脹稀釋篩選精度
- `PINNED_GLOBAL_TAGS` 控制御秘帖首頁的置頂展示順序，修改不影響資料完整性

---

## 🏗️ 核心架構：ECS 與 SSOT 原則

本專案採用 **ECS (Entity Component System)** 的設計思想來管理繁雜的旅遊資料，並嚴格遵守 **SSOT (Single Source of Truth)** 確保資料的一致性與可維護性。

### 1. SSOT (唯一事實來源) 原則
為了應對多語系與大量景點資料，我們將「結構」與「內容」徹底解耦：
- **Schema (結構層)**: 存放於 `src/data/spots/`。這裡定義了景點的「實體識別資訊」：ID、wardId、areaId、typeId、mapQuery。所有視覺呈現屬性（如類型顏色）均由 TYPES 元數據動態衍生，Schema 不含任何渲染指令。它是統計運算與邏輯判斷的唯一基準。
- **Locales (內容層)**: 存放於 `src/data/locales/`。按語系與行政區拆分，僅存放與 ID 對應的翻譯文字（名稱、描述、標籤串）。
- **Metadata (元數據)**: 行政區 (Wards)、分區 (Areas)、類型 (Types) 各自擁有獨立的設定檔，確保全域定義統一，避免硬編碼。
- **Tags (標籤元數據)**：存放於 `src/data/tags.ts`。定義 `TAG_REGISTRY`，
  包含每個 tagId 的多語系 label（I18nText）、分組（food/transport/culture/
  nature/acg/misc）與顯示 emoji。另有 `PINNED_GLOBAL_TAGS` 陣列，
  定義首頁御秘帖模式的固定置頂標籤順序。

  **雙層 Tags 設計（重要）**：
  - `schema.tagIds`（中文 key，如 `['和菓子', '老舖']`）：篩選系統的唯一基準，
    供 `useKyotoEngine` 的 filter、`localTags`、`tagCounts` 使用，語系無關。
  - `locale.tags`（各語系顯示文字）：純顯示用途，渲染於 SpotCard 的 tag chip，
    不參與任何篩選邏輯。
    ZH locale 的 tags 須與 schema.tagIds 鏡射（key 完全相同）；
    JA locale 的 tags 使用對應日文（映え / 穴場 / 甘味 等），
    與 schema.tagIds 語意對應但字面不同，此為刻意的多語系設計。

### 2. ECS (實體組件系統) 架構
將旅遊景點視為「遊戲物體 (Game Objects)」，而非傳統的網頁元件：
- **Entities (實體)**: 每個「景點 (Spot)」本質上只是一個 ID。
- **Components (組件)**:
  - **Spatial**: `wardId`, `areaId` (導航與地理屬性)
  - **Categorical**: `typeId` (分類屬性，如寺社、咖啡、現代設施)。對應的 `SpotTypeMetadata` 還包含 `sortOrder`（整數，決定 filteredSpots 的類型排序順序）與 `emoji`（類型圖示，供 SpotCard 印章顯示備選）。
  - **Map**: `mapQuery`（Google Maps 搜尋關鍵字，由 SpotCard 的 Query Assembly System 清洗組裝後使用）
  - **Presentation**: 由語系層動態混入的 `name`, `desc`, `tags`。合併後的 FlatSpot 另含選填的 `jaName`，供 Query Assembly System 在非日文模式下輔助地圖搜尋精度。
- **Systems (系統)**:
  - **Assemble System (`spots-loader.ts`)**: 負責在導航發生時，動態裝配 Schema 與 Locale，產出 UI 消耗的資料物件。
  - **Query Assembly System (`SpotCard.tsx`)**: 負責將原始 `mapQuery` 清洗、去除冗餘地理前綴、依固有名詞特徵判斷查詢策略，並拼接 Google Maps Search API URL。
    
    ## 🗺 Query Assembly System — 地圖搜尋規則
    **SSOT 原則：所有搜尋關鍵字組裝必須以日文/日文漢字為唯一基準。**
    
    組裝流程共四步驟：
    1. **雜訊清洗（Noise Strip）**：
       - 移除靜態地理前綴：`京都府京都市`、`京都府`、`京都市`
       - 移除當前行政區的日文名與中文名（來自 `WARD_NAMES` SSOT）
       - 移除殘留的「京都」（後接非地名漢字時）
       - 移除導航觸發字元：`→ ← から まで via to from`
    2. **固有名詞判斷（Proper Noun Detection）**：
       - 條件：cleanQuery ≥ 3 字元且含日文字元，或以常見地名後綴結尾（駅寺院社宮堂公園橋通町）
       - 固有名詞型：`cleanQuery，京都市{行政區日文名}` （日文錨點在後）
       - 通用型：`京都市{行政區日文名} cleanQuery` （行政區前綴增強定位）
    3. **英文/羅馬字 ACG 景點處理**：
       - 當 cleanQuery 含英文且 `spot.jaName` 有值時：`{jaName} {cleanQuery}，京都`
       - 日文名稱永遠在前，英文名稱作輔助識別
    4. **URL 格式**：
       - 固定使用 `https://www.google.com/maps/search/?api=1&query={encodeURIComponent(finalQuery)}`
       - **禁止**使用 `maps/dir/`（點對點導航端點）
  - **Kyoto Tactical Engine (`useKyotoEngine.ts`)**: 應用的「大腦」。負責管理過濾邏輯（Filtering）、搜尋（Searching）、語系狀態、以及計數器更新。管理的導航模式包含 `'ward' | 'area' | 'tag'`：
    - `tag` 模式（御秘帖）為第三條獨立導航路徑：使用者在首頁選取全域標籤後，Engine 以 `Promise.all` 並行載入全部 11 個行政區的 FlatSpot，跨行政區篩選符合該 tagId 的景點，結果以全螢幕 Overlay 呈現，不受任何 ward/area 限制。
    - **雙軌 Tag 計數機制**：回傳 `localTags`（當前選定分區/行政區內出現的 tagId 集合，動態重算，供 DetailView 的局部 TagSelector 使用）與 `tagCounts`（以 `loadAllSchemasSync()` 一次性讀取全部 Schema 計算的靜態全域計數，供首頁御秘帖的 badge 數字顯示使用，只計算一次）。

---

## 🛠 技術堆疊

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)
![Lucide React](https://img.shields.io/badge/Lucide_React-f56565?style=for-the-badge&logo=lucide&logoColor=white)

- `lucide-react`：UI 圖示庫（ChevronLeft, GripHorizontal, Filter 等）
- `@google/genai`：Google AI SDK（預留依賴，目前未啟用）
- `express` + `dotenv`：本地開發伺服器輔助依賴

### ⚠️ 已知技術注意事項

1. **動態 import 含 `.ts` 副檔名**（`spots-loader.ts`）：
   Vite 開發環境正常運作，部分 production 打包設定可能找不到路徑，
   建議改為省略副檔名：`` `./spots/${wardFile}` ``。

2. **`tagCounts` 在 React StrictMode 下執行兩次**：
   `useMemo(fn, [])` 包住 `loadAllSchemasSync()`，StrictMode 下會執行兩次，
   建議移至模組頂層 lazy getter（與 `_wardStats` 同樣模式）。

3. **`closeDetail()` 不重置 `mode`**：
   返回 HomeView 時保留上一次的 ward/area 值，屬預期行為。
   若日後新增「從 Tag Overlay 進入 DetailView」路徑，
   需在 `closeDetail()` 補充 mode 重置，防止 `mode==='tag'` 與 `activeId!==null` 同時成立。

4. **`lib/numerals.ts` 三位數邊界值**：
   `toChineseNumerals()` 對 100 以上數字可能省略百位「一」，
   現行景點數不超過兩位數，不影響功能，擴充時需注意。

---

## 📂 目錄結構

```text
src/
├── App.tsx             # 應用程式入口與狀態路由
├── types.ts             # 全域 TypeScript 型別定義 (SpotSchema, FlatSpot, Lang...)
├── hooks/
│   ├── useKyotoEngine.ts    # 【系統層】資料篩選與狀態管理樞紐
│   └── useWindowSize.ts     # 響應式佈局監聽
├── data/
│   ├── index.ts             # 資料對外統一入口；`getWardStats()` / `getAreaStats()` 採用 lazy getter 模式，使用模組作用域快取，初次呼叫時才執行統計並快取結果，後續呼叫直接返回快取。注意：`tags.ts` 的 `TAG_REGISTRY` 與 `PINNED_GLOBAL_TAGS` 未在 `index.ts` re-export，`SpotCard.tsx` 與 `HomeView.tsx` 直接從 `../data/tags` 引用，是此統一入口原則的唯一例外。
│   ├── spots-loader.ts      # 【組件裝配層】實現 Schema 與 Locale 的合併負載
│   ├── wards.ts / areas.ts  # 【元數據】行政區與地圖分區定義；定義 A01–A19 共 19 個分區，AREA_BY_WARD / WARD_BY_AREA 互為逆映射，處理分區跨行政區的雙向歸屬。
│   ├── tags.ts              # 【元數據】TAG_REGISTRY：全域標籤定義、分組與 emoji；PINNED_GLOBAL_TAGS 置頂順序
│   ├── types.ts             # 【元數據】景點分類定義 (HUB, SHOP, TEMPLE...)
│   ├── i18n.ts              # UI 介面靜態翻譯
│   ├── spots/               # 【SSOT: 結構】純地理/分類資料 (.ts)
│   └── locales/             # 【SSOT: 內容】各語系文本夾 (zh, ja)
├── components/
│   ├── MapCanvas.tsx   # 行政區 SVG 分區地圖 (世界地圖入口)
│   ├── HomeView.tsx    # 地圖選擇與分區引導
│   ├── DetailView.tsx  # 任務列表主介面 (包含分類過濾與搜尋)
│   ├── SpotCard.tsx    # 景點任務卡片 (漆藝視覺風格)
│   └── TagSelector.tsx  # 水平可拖曳的 Tag 篩選條，支援 variant: 'global'|'local'
└── lib/
    └── numerals.ts     # 漢數字轉換工具
```

---

## 🎨 視覺風格：漆藝 (Urushi Style)

本專案採用獨特的「京都漆藝」視覺設計：
- **底色 (漆道)**：深沉的炭黑與暗紅背景。
- **邊界 (蒔繪)**：細緻的金箔與金屬質感邊框。
- **互動 (光影)**：卡片懸停時具有如漆器般溫潤的回饋感。

---

## 📁 根目錄檔案說明

- `metadata.json`：應用部署元資料，聲明應用名稱、描述及所需框架權限 (`requestFramePermissions` / `majorCapabilities`)，供宿主環境識別用。
- `.env.example`：環境變數模板，開發時複製為 `.env` 使用。

---

## 🗺 行政區 (Game Zones) 關鍵字

- **中京區**: 咖啡散步・燈火之宵
- **東山區**: 寺社密集・工藝重鎮
- **下京區**: 交通門戶・購物商圈
- **右京區**: 嵐山絕景・禪宗庭園
- **左京區**: 知識散策・森林秘境
- **北區**: 皇家園林・信仰核心
- **上京區**: 御所官府・紡織西陣
- **南區**: 鐵道要衝・下町風情
- **西京區**: 苔之靈域・竹之幽嶺
- **山科區**: 櫻花鐵道・山科古教
- **伏見區**: 清酒酒窖・千本鳥居
