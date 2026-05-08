# Kyoto Tactical Guide ⛩️
### 類 MMORPG 任務地圖概念的京都觀光入口網站

「Kyoto Tactical Guide」是一個將京都觀光資訊「遊戲化」的實驗專案。我們將京都市的各個行政區視為 RPG 遊戲中的「分區地圖 (Zones)」，將景點視為「任務 (Quests)」。透過類型分類（交通要津・寺社・商肆・食處・自然・近代設施・ACG 聖地）與自由文字標籤系統，使用者可依喜好快速篩選、搜尋景點，並一鍵跳轉 Google Maps 定位。

---

## 🏗️ 核心架構：ECS 與 SSOT 原則

本專案採用 **ECS (Entity Component System)** 的設計思想來管理繁雜的旅遊資料，並嚴格遵守 **SSOT (Single Source of Truth)** 確保資料的一致性與可維護性。

### 1. SSOT (唯一事實來源) 原則
為了應對多語系與大量景點資料，我們將「結構」與「內容」徹底解耦：
- **Schema (結構層)**: 存放於 `src/data/spots/`。這裡定義了景點的「實體識別資訊」：ID、wardId、areaId、typeId、mapQuery。所有視覺呈現屬性（如類型顏色）均由 TYPES 元數據動態衍生，Schema 不含任何渲染指令。它是統計運算與邏輯判斷的唯一基準。
- **Locales (內容層)**: 存放於 `src/data/locales/`。按語系與行政區拆分，僅存放與 ID 對應的翻譯文字（名稱、描述、標籤串）。
- **Metadata (元數據)**: 行政區 (Wards)、分區 (Areas)、類型 (Types) 各自擁有獨立的設定檔，確保全域定義統一，避免硬編碼。
- **Tags (標籤元數據)**：存放於 `src/data/tags.ts`。定義 `TAG_REGISTRY`（型別 `TagMeta`：id、多語系 label `I18nText`、group 分組 `food/transport/culture/ nature/acg/misc`、顯示 emoji），確保標籤系統的全域定義統一。另有 `PINNED_GLOBAL_TAGS` 陣列，定義首頁御秘帖模式的固定置頂標籤順序。

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
│   ├── index.ts             # 資料對外統一入口；`getWardStats()` / `getAreaStats()` 採用 lazy getter 模式，使用模組作用域快取，初次呼叫時才執行統計並快取結果，後續呼叫直接返回快取。
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

---

## 📁 根目錄檔案說明

- `metadata.json`：應用部署元資料，聲明應用名稱、描述及所需框架權限 (`requestFramePermissions` / `majorCapabilities`)，供宿主環境識別用。
- `.env.example`：環境變數模板，開發時複製為 `.env` 使用。

---

本專案採用獨特的「京都漆藝」視覺設計：
- **底色 (漆道)**：深沉的炭黑與暗紅背景。
- **邊界 (蒔繪)**：細緻的金箔與金屬質感邊框。
- **互動 (光影)**：卡片懸停時具有如漆器般溫潤的回饋感。

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
