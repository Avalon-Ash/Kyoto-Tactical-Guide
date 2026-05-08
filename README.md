# Kyoto Tactical Guide ⛩️
### 類 MMORPG 任務地圖概念的京都觀光入口網站

「Kyoto Tactical Guide」是一個將京都觀光資訊「遊戲化」的實驗專案。我們將京都市的各個行政區視為 RPG 遊戲中的「分區地圖 (Zones)」，將景點視為「任務 (Quests)」。透過標籤化系統（如清晨、深夜、體力需求、預算等級等），使用者可以像在玩 open-world 遊戲一樣，有系統地規劃屬於自己的京都冒險路徑。

---

## 🏗️ 核心架構：ECS 與 SSOT 原則

本專案採用 **ECS (Entity Component System)** 的設計思想來管理繁雜的旅遊資料，並嚴格遵守 **SSOT (Single Source of Truth)** 確保資料的一致性與可維護性。

### 1. SSOT (唯一事實來源) 原則
為了應對多語系與大量景點資料，我們將「結構」與「內容」徹底解耦：
- **Schema (結構層)**: 存放於 `src/data/spots/`。這裡定義了景點的「幾何與分類資訊」，如 ID、所屬行政區 (Ward)、所屬大分區 (Area)、景點類型 (Type)。它**完全不包含語系文字**，是統計運算與邏輯判斷的唯一基準。
- **Locales (內容層)**: 存放於 `src/data/locales/`。按語系與行政區拆分，僅存放與 ID 對應的翻譯文字（名稱、描述、標籤串）。
- **Metadata (元數據)**: 行政區 (Wards)、分區 (Areas)、類型 (Types) 各自擁有獨立的設定檔，確保全域定義統一，避免硬編碼。

### 2. ECS (實體組件系統) 架構
將旅遊景點視為「遊戲物體 (Game Objects)」，而非傳統的網頁元件：
- **Entities (實體)**: 每個「景點 (Spot)」本質上只是一個 ID。
- **Components (組件)**:
  - **Spatial**: `wardId`, `areaId` (導航與地理屬性)
  - **Categorical**: `typeId` (分類屬性，如寺社、咖啡、現代設施)
  - **Presentation**: 由語系層動態混入的 `name`, `desc`, `tags`
- **Systems (系統)**:
  - **Assemble System (`spots-loader.ts`)**: 負責在導航發生時，動態裝配 Schema 與 Locale，產出 UI 消耗的資料物件。
  - **Kyoto Tactical Engine (`useKyotoEngine.ts`)**: 應用的「大腦」。負責管理過濾邏輯（Filtering）、搜尋（Searching）、語系狀態、以及計數器更新。

---

## 🛠 技術堆疊

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)

---

## 📂 目錄結構

```text
src/
├── App.tsx             # 應用程式入口與狀態路由
├── hooks/
│   ├── useKyotoEngine.ts    # 【系統層】資料篩選與狀態管理樞紐
│   └── useWindowSize.ts     # 響應式佈局監聽
├── data/
│   ├── index.ts             # 資料對外統一入口
│   ├── spots-loader.ts      # 【組件裝配層】實現 Schema 與 Locale 的合併負載
│   ├── wards.ts / areas.ts  # 【元數據】行政區與地圖分區定義
│   ├── types.ts             # 【元數據】景點分類定義 (HUB, SHOP, TEMPLE...)
│   ├── i18n.ts              # UI 介面靜態翻譯
│   ├── spots/               # 【SSOT: 結構】純地理/分類資料 (.ts)
│   └── locales/             # 【SSOT: 內容】各語系文本夾 (zh, ja)
├── components/
│   ├── MapCanvas.tsx   # 行政區 SVG 分區地圖 (世界地圖入口)
│   ├── HomeView.tsx    # 地圖選擇與分區引導
│   ├── DetailView.tsx  # 任務列表主介面 (包含分類過濾與搜尋)
│   ├── SpotCard.tsx    # 景點任務卡片 (漆藝視覺風格)
│   └── ...
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

## 🗺 行政區 (Game Zones) 關鍵字

- **中京區**: 咖啡散步・居酒屋夜戰
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
