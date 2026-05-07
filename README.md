# Kyoto Tactical Guide ⛩️
### 類 MMORPG 任務地圖概念的京都觀光入口網站

Kyoto Tactical Guide 是一個以「遊戲任務」感官設計的京都旅遊規劃工具。將現實世界的行政區轉化為大地圖分區，景點轉化為帶標籤的任務卡片，讓旅遊規劃像在玩線上遊戲一般直覺且有趣。

---

## 🎮 專案概念

設計邏輯參考 MMORPG 的三層架構：

1.  **行政區 (Ward)**：大地圖分區。使用者首先選擇感興趣的「區域」，類似遊戲中的世界地圖選區。
2.  **任務篩選 (Quest Filter)**：每個景點設有類型（如古剎、商舖、美食）與標籤（如櫻花、紅葉、二次元）。使用者可依標籤篩選，如同執行特定類型的「任務」。
3.  **卡片定位 (Card Positioning)**：最終呈現為精美的資訊卡片，點擊後可直接導向 Google Maps，模擬遊戲中「接取任務後的地點定位」。

---

## 🛠 技術堆疊

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Static Site](https://img.shields.io/badge/Static-Site-blue?style=for-the-badge)
![i18n](https://img.shields.io/badge/i18n-zh%20%7C%20ja-orange?style=for-the-badge)

---

## 📂 目錄結構

```text
src/
├── App.tsx
├── main.tsx
├── index.css
├── types.ts
├── components/        # UI 組件（SpotCard 等）
├── hooks/
│   ├── useKyotoEngine.ts    # 資料篩選引擎
│   └── useWindowSize.ts     # 響應式視窗尺寸 Hook
└── data/
    ├── spots/               # 景點 Schema（純結構，無語系文字）
    │   ├── kita.ts          # 北區
    │   ├── kamigyo.ts       # 上京區
    │   ├── sakyo.ts         # 左京區
    │   ├── nakagyo.ts       # 中京區
    │   ├── higashiyama.ts   # 東山區
    │   ├── shimogyo.ts      # 下京區
    │   ├── minami.ts        # 南區
    │   ├── ukyo.ts          # 右京區
    │   ├── nishikyo.ts      # 西京區
    │   ├── yamashina.ts     # 山科區
    │   └── fushimi.ts       # 伏見區
    ├── locales/
    │   ├── zh/              # 繁體中文語系（依行政區分檔）
    │   └── ja/              # 日文語系（依行政區分檔）
    ├── spots-loader.ts      # 動態載入景點資料
    ├── areas.ts
    ├── wards.ts
    ├── types.ts
    ├── i18n.ts
    └── index.ts
```

---

## 🔑 Spot ID 命名規則

新增一個段落說明區域前綴 ID 系統，表格如下：

| 行政區 | 前綴 | 範例 |
| :--- | :--- | :--- |
| 北區 KITA | KT | KT-001 |
| 上京區 KAMIGYO | KG | KG-001 |
| 左京區 SAKYO | SK | SK-001 |
| 中京區 NAKAGYO | NC | NC-001 |
| 東山區 HIGASHIYAMA | HY | HY-001 |
| 下京區 SHIMOGYO | SM | SM-001 |
| 南區 MINAMI | MN | MN-001 |
| 右京區 UKYO | UK | UK-001 |
| 西京區 NISHIKYO | NK | NK-001 |
| 山科區 YAMASHINA | YS | YS-001 |
| 伏見區 FUSHIMI | FS | FS-001 |

---

## 📊 資料模型

### SpotSchema（src/data/spots/{ward}.ts）
純結構資料，不含語系文字：
- `id`: 景點唯一 ID
- `wardId`: 所屬行政區 ID
- `areaId`: 所屬區域 ID
- `typeId`: 景點類型 ID
- `mapQuery`: Google Maps 搜尋關鍵字或座標

### SpotLocale（src/data/locales/{lang}/{ward}.ts）
語系文字，以 SpotSchema ID 為 key：
- `name`: 景點名稱
- `desc`: 景點簡介
- `tags`: 標籤內容

---

## ➕ 如何新增一個景點

更新三步驟流程，配合新架構：

1. **src/data/spots/{ward}.ts** → 新增 SpotSchema，id 使用區域前綴格式
2. **src/data/locales/zh/{ward}.ts** → 新增中文 locale
3. **src/data/locales/ja/{ward}.ts** → 新增日文 locale

⚠️ **警告**：三個檔案的 ID 必須完全一致，否則 `spots-loader.ts` 合併時會產生靜默錯誤。

---

## 🌐 多語系架構

說明語系資料依行政區分檔儲存，
未來新增 en 語系只需新增 `locales/en/` 目錄，
TypeScript `Lang` type 改一行即可全域提示需同步更新的位置。

---

## 🚀 本地開發流程

### 環境需求
- Node.js (建議 v18 以上)
- npm 或 yarn

### 啟動步驟
1. 安裝套件：
   ```bash
   npm install
   ```
2. 啟動開發伺服器：
   ```bash
   npm run dev
   ```
3. 預覽：開啟瀏覽器訪問 `http://localhost:5173`

### 建立生產版本
```bash
npm run build
```
輸出檔案將位於 `dist/` 目錄中。

---

## 🌐 部署說明

本專案為**純靜態前端**，可部署於任何支援靜態檔案的平台：
- **GitHub Pages** (推薦，需配置 GitHub Actions)
- **Vercel / Netlify** (自動串接 Repo 即可部署)

部署 `dist/` 文件夾內容即可使用。

---

## 📄 License

本專案採用 [MIT License](LICENSE) 授權。
