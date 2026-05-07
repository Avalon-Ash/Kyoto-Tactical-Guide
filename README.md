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
├── App.tsx          # 主應用邏輯與路由掛載
├── main.tsx         # React 渲染掛載點
├── index.css        # 全域樣式與 Tailwind 配置
├── types.ts         # 精確的 TypeScript 資料型別定義
├── components/      # UI 組件（如 SpotCard 景點卡片）
├── data/            # 靜態資料庫（核心、語系、連結、景點名錄）
│   ├── db_core.ts   # 行政區、區域與類型定義
│   ├── db_ja.ts     # 日文翻譯資料
│   ├── db_zh.ts     # 繁體中文翻譯資料
│   ├── db_links.ts  # Google Maps 查詢連結
│   ├── db_spots.ts  # 景點核心關聯資料 (ID, 所屬行政區等)
│   └── index.ts     # 資料匯總與對外接口
├── hooks/           # 自定義 Hooks (如 useKyotoEngine 資料篩選引擎)
└── lib/             # 工具函式 (如 numerials 羅馬數字轉換)
```

---

## 📊 資料模型 (JoinedSpot)

這是渲染 UI 時所使用的最終合併物件：

| 欄位 | 型別 | 說明 |
| :--- | :--- | :--- |
| `id` | `string` | 唯一辨識碼，例如 `S001` |
| `wardId` | `string` | 行區 ID，關聯至 `db_core.ts` 中的 `WARD_KEYS` |
| `areaId` | `string` | 子區域 ID，關聯至 `db_core.ts` 中的 `AREA_KEYS` |
| `typeId` | `string` | 景點類型，決定卡片邊框色與圖示 |
| `name` | `I18nText` | 景點名稱（支援 `zh`/`ja`） |
| `desc` | `I18nText` | 景點簡介（支援 `zh`/`ja`） |
| `tags` | `I18nText` | 逗號分隔的標籤字串（支援 `zh`/`ja`） |
| `mapQuery` | `string` | Google Maps 搜尋關鍵字或座標 |
| `typeColorClass`| `string` | 對應類型的 CSS 樣式類名 |

---

## ➕ 如何新增一個景點

若要新增一個景點（任務點），請依序修改以下檔案：

1.  **`src/data/db_spots.ts`**：
    新增一筆 `SpotRecord`，定義基本屬性：
    ```ts
    { id: 'S420', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_TEMPLE' }
    ```
2.  **`src/data/db_zh.ts` & `db_ja.ts`**：
    在 `SPOTS_ZH` / `SPOTS_JA` 陣列中新增對應 ID 的文字說明與標籤。
3.  **`src/data/db_links.ts`**：
    在 `LINKS` 陣列中新增對應 ID 的 Google Maps 查詢字串。

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
3. 預覽：開啟瀏覽器訪問 `http://localhost:3000`

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

## 🌍 多語系說明

系統採用單一 `Long` 狀態 (`'zh' | 'ja'`)。
透過 `I18nText` 結構儲存文字：
```ts
interface I18nText { zh: string; ja: string; }
```
切換語系時，UI 與所有景點內容會同步透過 `useKyotoEngine` Hook 完成即時映射渲染。

---

## 📄 License

本專案採用 [MIT License](LICENSE) 授權。
