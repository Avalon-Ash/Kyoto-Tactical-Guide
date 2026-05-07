# Kyoto Tactical Guide ⛩️
### 類 MMORPG 任務地圖概念的京都觀光入口網站

「Kyoto Tactical Guide」是一個將京都觀光資訊「遊戲化」的實驗專案。我們將京都市的各個行政區視為 RPG 遊戲中的「分區地圖 (Zones)」，將景點視為「任務 (Quests)」。透過標籤化系統（如清晨、深夜、體力需求、預算等級等），使用者可以像在玩 open-world 遊戲一樣，有系統地規劃屬於自己的京都冒險路徑。

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
├── App.tsx             # 應用程式入口與路由切換
├── main.tsx            # React 掛載點
├── index.css           # 全域樣式 (含漆藝 Urushi 視覺變數)
├── types.ts            # TypeScript 介面定義
├── components/         # UI 組件
│   ├── MapCanvas.tsx   # 互動式行政區大地圖
│   ├── HomeView.tsx    # 首頁 (地圖與說明區)
│   ├── DetailView.tsx  # 任務列表頁面 (含側邊欄與橫向捲動卡片)
│   ├── SpotCard.tsx    # 景點任務卡片 (漆藝風格視覺)
│   └── ...
├── hooks/
│   ├── useKyotoEngine.ts    # 資料篩選與語系切換引擎
│   └── useWindowSize.ts     # 響應式視窗監聽
└── data/
    ├── areas.ts             # 行政區基本資料 (代碼、名稱、描述)
    ├── spots/               # 景點 Schema (純地理與分類結構，無語系文字)
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
    └── locales/             # 多語系文字資料
        ├── zh/              # 繁體中文景點名稱與說明
        └── ja/              # 日文原始名稱與說明
```

---

## 🎨 視覺風格：漆藝 (Urushi Style)

本專案採用獨特的「京都漆藝」視覺設計：
- **底色 (漆道)**：深沉的炭黑與暗紅背景。
- **邊界 (蒔繪)**：細緻的金箔與金屬質感邊框。
- **互動 (光影)**：卡片懸停時具有如漆器般溫潤的回饋感。

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
