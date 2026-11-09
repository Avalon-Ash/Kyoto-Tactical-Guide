# Kyoto Tactical Guide ⛩️

> [十一區文庫首頁](http://127.0.0.1:3000/)已整合：預設月光，左右直接拖動換函、點蓋展卷；閒置循環移光，主動操作時暫停。首頁無介紹／換函列／測試工具／開卷按鈕；題字採 Shippori Mincho B1、繁中內文採 Noto Serif TC。保留[獨立展示](http://127.0.0.1:3000/toji-study/index.html)作材質與深度比較，兩入口共用渲染與真實資料。[最新驗收與限制](docs/agent-runs/2026-11-06-phase04-bunko-index.md)。

目前進度、提交記錄與新對話接續步驟：[交接入口](docs/HANDOFF.md)。

### 類 MMORPG 任務地圖概念的京都觀光入口網站

「Kyoto Tactical Guide」是一個將京都觀光資訊「遊戲化」的實驗專案。我們將京都市的各個行政區視為 RPG 遊戲中的「分區地圖 (Zones)」，將景點視為「任務 (Quests)」。透過類型分類（交通要津・寺社・商肆・食處・自然・近代設施・ACG 聖地）與自由文字標籤系統，使用者可依喜好快速篩選、搜尋景點，並一鍵跳轉 Google Maps 定位。

---

## 三大核心檢索模式

本應用提供三種互斥的檢索模式，透過頂部導航列（`HomeView.tsx`）切換，
各模式共用同一批 `filteredSpots` 狀態，由 `useKyotoEngine` 統一管理。

---

### 京洛文庫（Ward Mode）

**入口**：`mode === 'ward'`  
**資料來源**：`WARD_NAMES`、`getWardStats()`、既有景點／locale loader
**渲染元件**：`BunkoEntrance.tsx` → `mountBunko()`

十一行政區各有一函，以代表地標、山水及古地名構成固定視角的簡化幾何浮雕。
左右拖動文庫或用左右方向鍵選區，點蓋／Enter／空白鍵展卷；書卷讀取該區真實景點並支援搜尋、分類和中日文。
「地圖與完整篩選」進入既有 `DetailView`，再由其地圖按鈕切換實際地理視圖。

**規則與禁則：**
- 每個景點必須歸屬唯一的 `wardId`，合法值由 `WARD_NAMES` 定義，不在文庫控制器複製景點資料。
- `App` 保留執行期間的選區與日夜；語言共用 `useKyotoEngine`，重新整理預設月光。首頁閒置播放、主動操作讓出控制、1.8 秒後恢復；背景、讀卷、拖動及系統減少動態時停播。
- 首頁不顯示測試工具與開卷按鈕；獨立展示保留對照控制。字體由既有 Google Fonts 方式載入，無新 npm 依賴。
- `study.js` 的 `mountBunko`、`template.ts`、`library.ts` 與 `.bunko` 範圍樣式由主站及獨立頁共用。卸載必須釋放事件、觀察器、RAF、讀卷回寫及 GPU 資源。
- 原生 WebGL 簡化幾何不是精確建築復原／導航圖。使用者已選定一區一函方向；早期 GPU 蒔繪原型（`MapCanvas.tsx`、`makie-renderer.ts` 與兩張原型圖）已於 2026-11-09 刪除，需要時從 Git 歷史取回。不恢復蒔繪／區界切換。
- 實際行政區邊界及鄰近區域仍由詳細地圖呈現。景點統計動態計算，修改資料後自動反映。

---

### 名所目録（Area Mode）

**入口**：`mode === 'area'`  
**資料來源**：`AREA_KEYS`、`AREA_NAMES`、`getAreaStats()`（`src/data/index.ts`）  
**渲染方式**：`HomeView.tsx` 直接渲染列表 → 點擊進入 `DetailView`（area 模式）

以京都觀光慣用的散策區域（Area）為索引，將全市細分為更小的遊覽單元
（例：嵐山、金閣寺周邊、祇園・清水等），共 19 個區域（`A01`–`A19`）。
Area 粒度比 Ward 更細，適合依據旅遊動線規劃單日行程。

**規則與禁則：**
- 每個景點必須歸屬唯一的 `areaId`（於 `spots/*.ts` 的 `areaId` 欄位定義）
- 合法 areaId 為 `A01`–`A19`，定義於 `src/data/index.ts`，禁止自創編號
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
| `misc` | 旅行特質 | 旅遊屬性：名物、打卡、隱密、老舖、超市、地標、溫泉、現代等 |
| `culture` | 文化・信仰 | 人文歷史：神社、寺院、世界遺產、庭園、歷史、博物館、國寶等 |
| `nature` | 自然・風景 | 自然景觀：賞花、楓葉、山岳等 |
| `transport` | 交通要道 | 交通節點：鐵道、地鐵、巴士 |
| `acg` | 次文化 | ACG 聖地・動漫遊戲巡禮景點 |

**規則與禁則：**
- 標籤定義的唯一來源（SSOT）為 `src/data/tags.ts`，禁止在任何其他檔案硬編碼標籤字串
- `spots/*.ts` 中的 `tagIds` 陣列只能使用 `TAG_REGISTRY` 中已登記的 `id` 值
- 禁止使用語意模糊的標籤（如「美食」）；食物類應指定具體類型（如「拉麵」「懷石」）

**已登記標籤完整清單（`TAG_REGISTRY` 同步）：**

| group | 中文顯示 | tagId 清單 |
|---|---|---|
| `food` | 口福・食處 | 正餐・喫茶・懷石・燒肉・壽喜燒・拉麵・烏龍・壽司・蕎麥・豆腐・天婦羅・抹茶・和菓子・洋菓子・涮涮鍋・放題 |
| `misc` | 旅行特質 | 名物・打卡・隱密・老舖・經典・購物・地標・溫泉・現代・超市 |
| `culture` | 文化・信仰 | 世界遺產・庭園・神社・寺院・歷史・博物館・國寶 |
| `nature` | 自然・風景 | 楓葉・賞花・山岳・自然・展望 |
| `transport` | 交通道 | 鐵道・地鐵・巴士 |
| `acg` | 次文化 | ACG |

> 新增標籤請依 `tags.ts` 規定由 Ash 審查後統一登記，
> 代理人禁止自行擴充 TAG_REGISTRY。
- `T_FOOD` 類型景點禁用「世界遺產」標籤
- 單一景點的 `tagIds` 上限為 **6 個**，避免標籤膨脹稀釋篩選精度
- `PINNED_GLOBAL_TAGS` 控制御秘帖首頁的置頂展示順序，修改不影響資料完整性

---

## UX 設計原則

本應用的 UI 層遵循「**漸進揭露（Progressive Disclosure）**」原則：
使用者在每個操作階段只看到與當前情境相關的選項，
避免資訊過載，降低決策成本。

### 真實地圖引擎與空間映射 (Spatial Mapping Engine)

應用採用了整合 CartoDB/OpenStreetMap 的 Leaflet 真實地圖庫，提供更直覺的地理導航體驗：
- **SSOT 座標設定 (`map-centers.ts`)**：統一維護分區中心點與重要景點經緯度。叢集按 areaId 放在分區中心，地標使用 `SPOT_POSITIONS`；現行 ClusterMap 不使用單點散射。標記避讓依螢幕像素矩形計算，引線連回原點，縮放／移動／尺寸改變時重算，不移動資料座標。
- **世界遺產與國寶標記 (Landmark Icons) 優先級**：各行政區內名勝古蹟（如金閣寺、清水寺、各種世界遺產、國寶建築等）**必須**定義絕對中心點於 `SPOT_POSITIONS`。當景點屬於此清單時，地圖會渲染獨立的「地標圖示加名稱 (Icon + Name)」 SVG 標記，而非一般的群集點，藉此彰顯其重要地位。
- **靜態區界與邊界適應**：行政區地圖使用 `src/data/geo/ward-boundaries.ts` 的 11 區 GeoJSON，依區界自動縮放；前端不查詢 Nominatim。金色區線與暈光搭配區外暗化遮罩，保留 Polygon 洞與 MultiPolygon 分量；分區模式不套行政區遮罩。來源為 © OpenStreetMap contributors（ODbL 1.0），[資料授權、查核與重建說明](src/data/geo/README.md)。開發時執行 `node scripts/fetch-ward-geo.mjs`，已取得回應會從持久快取重建；可用 `--offline` 禁止網路。不可加入 CI、定期工作或前端呼叫。
- **日夜視界切換**：兩者皆使用 OSM 標準圖磚，日輪以 `.map-tiles-day` 呈現和紙暖色，夜巡以 `.map-tiles-night` 轉為暗色；濾鏡不作用在金線與標記。
- **UX 邏輯**：`DetailView` 可切換卡片／地圖；朱印標記以漢字呈現叢集筆數，點擊或 Enter／空白鍵開啟清單。卡片導航共用 `buildGoogleMapsUrl`；減少動態設定會停用程式平移與面板動畫。

以下是各核心互動的設計意圖說明，供開發者在修改 UI 邏輯前參照。

進入「洛中洛外」或「名所目録」的 DetailView 後，
副標籤列（TagSelector）會依據當前選中的主 Tab（typeId）動態縮減，
僅顯示與該類型語意相關的標籤分組，避免無效的跨類型標籤干擾。

| typeId | 中文顯示名 | 允許的 tag group |
|---|---|---|
| `T_ALL` | 總覽 | 全部（food / misc / culture / nature / transport / acg） |
| `T_HUB` | 交通要津 | transport、misc |
| `T_TEMPLE` | 寺社・名所 | culture、nature、misc |
| `T_SHOP` | 商肆・茶寮 | misc、food |
| `T_MODERN` | 近代設施 | misc、culture |
| `T_NATURE` | 山水・風雅 | nature、misc |
| `T_FOOD` | 口福・食處 | food、misc |
| `T_ACG` | 幻夢・繪草子 | acg、misc |


**維護規則：**
- 本表定義於 `src/data/type-tag-groups.ts`（`TYPE_TAG_GROUP_MAP`），由 `DetailView` 使用
- 新增 TYPES（新 typeId）時，必須同步在 `TYPE_TAG_GROUP_MAP` 新增對應白名單（`validate_data.js` 會檢查兩端是否同步）
- 切換主 Tab 時，若當前已選中的副標籤不屬於新白名單，系統自動清除選取狀態
- 此表禁止在 `useKyotoEngine`、`TagSelector`、spots 資料層複製或重新實作

---


## 🏗️ 核心架構：ECS 與 SSOT 原則

本專案採用 **ECS (Entity Component System)** 的設計思想來管理繁雜的旅遊資料，並嚴格遵守 **SSOT (Single Source of Truth)** 確保資料的一致性與可維護性。

### 1. SSOT (唯一事實來源) 原則
為了應對多語系與大量景點資料，我們將「結構」與「內容」徹底解耦：
- **Schema (結構層)**: 存放於 `src/data/spots/`。這裡定義了景點的「實體識別資訊」：ID、wardId、areaId、typeId。所有視覺呈現屬性（如類型顏色）均由 TYPES 元數據動態衍生，Schema 不含任何渲染指令。它是統計運算與邏輯判斷的唯一基準。
- **Locales (內容層)**: 存放於 `src/data/locales/`。按語系與行政區拆分，僅存放與 ID 對應的翻譯文字（名稱、描述、標籤串）。
- **Metadata (元數據)**: 行政區 (Wards)、分區 (Areas)、類型 (Types) 各自擁有獨立的設定檔，確保全域定義統一，避免硬編碼。
- **Tags (標籤元數據)**：存放於 `src/data/tags.ts`。定義 `TAG_REGISTRY`，包含每個 tagId 的多語系 label、分組與顯示 emoji。另有 `PINNED_GLOBAL_TAGS` 陣列，定義首頁御秘帖模式的固定置頂標籤順序。

  **雙層 Tags 設計（重要）**：
  - `schema.tagIds`（中文 key，如 `['和菓子', '老舖']`）：篩選系統的唯一基準，供 `useKyotoEngine` 邏輯使用，語系無關。
  - `locale.tags`（各語系顯示文字）：純顯示用途，渲染於 SpotCard 的 tag chip，不參與任何篩選邏輯。

### 2. ECS (實體組件系統) 架構
將旅遊景點視為「遊戲物體 (Game Objects)」，而非傳統的網頁元件：
- **Entities (實體)**: 每個「景點 (Spot)」本質上只是一個 ID。
- **Components (組件)**:
  - **Spatial**: `wardId`, `areaId` (導航與地理屬性)
  - **Categorical**: `typeId` (分類屬性)
  - **Reservation**: `reservationRequired?: true`（選填布林值）
  - **Presentation**: 由語系層動態混入的 `name`, `desc`, `tags`。合併後的 FlatSpot 另含選填的 `jaName`，供 Query Assembly System 作為日文地名錨點。`jaName` 在所有語系下均會注入：
    - `lang === 'ja'`：值為日文 locale 的 name（原生日文名）
    - `lang === 'zh'`：值同樣取自日文 locale 的 name，作為 ACG 景點等英文/羅馬字景點的地圖搜尋日文錨點。
- **Systems (系統)**:
  - **Assemble System (`spots-loader.ts`)**: 負責在導航發生時，動態裝配 Schema 與 Locale，產出 UI 消耗的資料物件。
  - **Query Assembly System (`SpotCard.tsx`)**: 透過共用的 `buildGoogleMapsUrl` 剝除 `spot.jaName` 的括號附註、套用先斗町與廣域名稱規則，並組裝 Google Maps Search URL；卡片與叢集面板共用。
  - **Kyoto Tactical Engine (`useKyotoEngine.ts`)**: 應用的「大腦」。負責管理過濾邏輯（Filtering）、搜尋（Searching）、語系狀態、以及計數器更新。

### 3. 可抽換式季節子系統 (Seasonal Architecture)
為主應用 (React SPA) 之外獨立運作的純 Vanilla HTML/JS 模組 (`public/seasonal.html`)，專門用於處理高時效性、特定季節的祭典及活動導覽。
- **解耦設計 (Decoupling)**：徹底脫離 React 生命週期與構建機制 (Build pipeline)，採用純 HTML/JS 及 Tailwind CDN 渲染。此設計避免了短期活動污染核心旅遊資料 Schema 的複雜性，極大降低維護與廢棄成本。
- **快速佈署與抽換**：當季節更迭（如秋季楓葉季取代初夏紫陽花季）時，開發者可直接替換整個 `seasonal.html` 內容，無需修改核心引擎邏輯或進行資料結構審核。
- **無縫橋接**：在 `HomeView` 頂部導航列以 `target="_blank"` 的方式另開分頁呼叫此獨立頁面。在行動裝置上可擁有原生的多視窗操作體驗，避免雙重視窗狀態管理的干擾。

### 🗺 Query Assembly System — 地圖搜尋規則

**SSOT 原則：所有搜尋關鍵字組裝必須以 `spot.jaName`（來自 JA locale 的 `name`）為唯一事實來源與地理錨點。**

實作入口為 `src/components/SpotCard.tsx` 的 `buildGoogleMapsUrl`，SpotCard 與 ClusterMap 共用：

1. 剝除半形／全形括號附註並 trim，名稱來自 `spot.jaName`。
2. 完全等於「先斗町」時改用「先斗町公園」作為搜尋錨點。
3. 先檢查 `municipalityId`：跨市景點附加其真實市名與府縣。京都市內的廣域名稱只附加「京都」；其他名稱附加 `WARD_NAMES[wardId].ja` 與「京都」。
4. 各片段經 `encodeURIComponent` 後以 `+` 串接，使用 `https://www.google.com/maps/search/?api=1&query=...`，不使用 `maps/dir/`。

例如二条城使用「二条城 + 中京区 + 京都」，嵐山使用「嵐山 + 京都」。目前函式不做地理前綴或方向詞的額外清洗；文件不可把尚未實作的規則當成現況。

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

- `closeDetail()` 清除 activeId、activeTag，並將 mode 重置為 `'ward'`。
- Schema 為統計所需而靜態匯入；ZH／JA locale 仍使用 Vite lazy glob。`getTagCounts()` 已是模組層 lazy getter，不需要為 StrictMode 再造另一份快取。
- ClusterMap 與 Leaflet 在首次切換詳細地圖時延遲載入，等待時顯示目前語系的 loading 訊息；行政區界由詳細地圖使用；文庫首頁不使用地理區界命中。
- `toChineseNumerals(101)` 為「一百零一」、`110` 為「一百一十」；已移除原文件不正確的三位數缺陷說明。
- 2026-11-04 本機資料稽核為 809 筆／ERROR 0／WARN 0，`--strict` 通過。SK-078 依店家閉店公告退役；修正文資標籤、食處身分與車站導航名稱。新增 `npx --no-install tsx scripts/audit-data.ts` 補充欄位、座標與覆核清冊。SK-038 已透過 `municipalityId: M_OTSU` 分離旅遊索引與真實市域，導航使用大津市／滋賀県；結構通過不等於全庫事實皆經查證。詳見 [Phase 4 資料查核](docs/agent-runs/2026-11-04-phase04-data.md)。

---

## 📂 目錄結構

```text
src/
├── App.tsx             # 應用程式入口與狀態路由
├── types.ts             # 全域 TypeScript 型別定義 (SpotSchema, FlatSpot, Lang...)
├── hooks/
│   └── useKyotoEngine.ts    # 【系統層】資料篩選與狀態管理樞紐
├── data/
│   ├── index.ts             # 資料對外統一入口；`getWardStats()` / `getAreaStats()` 採用 lazy getter 模式...
│   ├── map-centers.ts       # 【SSOT: 地圖】抽象叢集地圖中心點座標設定
│   ├── geo/                 # ODbL 靜態區界、來源紀錄與重建說明
│   ├── spots-loader.ts      # 靜態 Schema + lazy Locale 裝配
│   ├── wards.ts / areas.ts  # 【元數據】行政區與地圖分區定義...
│   ├── tags.ts              # 【元數據】TAG_REGISTRY：全域標籤定義...
│   ├── type-tag-groups.ts   # 【元數據】TYPE_TAG_GROUP_MAP：主 Tab → 副標籤 group 白名單
│   ├── types.ts             # 【元數據】景點分類定義 (HUB, SHOP, TEMPLE...)
│   ├── i18n.ts              # 全部介面文案（UI_DICT）與 translate()；元件內不寫中日文三元運算
│   ├── spots/               # 【SSOT: 結構】純地理/分類資料 (.ts)
│   └── locales/             # 【SSOT: 內容】各語系文本夾 (zh, ja)
├── components/
│   ├── BunkoEntrance.tsx # 十一區文庫：React 與共用控制器的生命週期銜接
│   ├── ClusterMap.tsx  # 地圖叢集展示畫面 (取代精確 Geo Map)
│   ├── HomeView.tsx    # 地圖選擇與分區引導
│   ├── DetailView.tsx  # 任務列表主介面 (包含分類過濾與地圖切換)
│   ├── SpotCard.tsx    # 景點任務卡片 (漆藝視覺風格)
│   ├── TagSelector.tsx  # 水平可拖曳的 Tag 篩選條
│   ├── BunkoTools.tsx   # 日夜、減少動態、語系三顆共用工具鈕
│   └── MakieIcon.tsx    # 金銀圖紋圖示
└── lib/
    ├── numerals.ts     # 漢數字轉換工具
    ├── makie-scene.ts  # 十一區地標座標與區域命中（文庫函目使用）
    ├── map-geometry.ts # 保留洞與 MultiPolygon 的區外遮罩
    └── map-labels.ts   # 螢幕像素標記避讓，不更改地理座標
scripts/
├── fetch-ward-geo.mjs      # 開發時抓取／離線重建 11 區邊界
└── fetch-ward-geo.test.mjs # 幾何與身分拒收測試
public/
└── seasonal.html       # 【子系統】歲時記季節祭典獨立頁面 (純 HTML/JS)
```

---

## 🎨 視覺風格：漆藝 (Urushi Style)

目前主入口以「初音調度」意象發展十一區文庫，既有地圖原型保留於程式庫：
- **首頁與檢索介面**：預設月光，暖日可切換；名所目錄、御秘帖及標籤結果共用紙色、金銀線、Shippori Mincho B1 題字與 Noto Serif TC 繁中內文。書卷以平紋蒔繪意象的 SVG 圖形與短標籤篩選。
- **文庫浮雕**：`src/studies/toji/` 以原生 WebGL 渲染十一區代表地標、山水、梨地與金銀材質；具有幾何高度、視差、陰影與光跡。固定構圖的簡化浮雕不是測繪建築／完整 3D 復原，沒有導入 Rust 或大型繪圖依賴。
- **操作與動態**：左右拖動／方向鍵換函，直接點蓋／Enter 展開真實雙語書卷；手動換函立即播放，閒置循環上限 30 次繪製／秒。主動操作讓出控制，讀卷、離屏、背景與減少動態時抑制播放；不能沿用舊原型「閒置沒有動畫」的描述。
- **樣式分層**：`src/theme.css` 是唯一色票（`--entry-*`、`--hira-*` 晝夜兩組），主站、文庫與獨立展示頁共用；`index.css` 只放 Tailwind 重設、捲軸與地圖標記，元件樣式在 `bunko-ui.css`，書卷與文庫在 `studies/toji/study.css`。元件不寫色碼，Canvas／Leaflet 需要字面色值時註明「mirrors theme.css」。
- **驗收界線**：[最新紀錄](docs/agent-runs/2026-11-06-phase04-bunko-index.md)含 1440px／375px、雙語日夜與鍵盤滑鼠；真實手機觸控與 OS reduced-motion 未測。舊 Lighthouse 分數不代表目前版本。

---

## 📁 根目錄檔案說明

- `metadata.json`：應用部署元資料，聲明應用名稱、描述及所需框架權限 (`requestFramePermissions` / `majorCapabilities`)，供宿主環境識別用。

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

---

## 📋 Schema 設計細則 (SSOT)

### ID 命名規則（SSOT）

每個行政區的 spot id 使用固定前綴縮寫（兩碼大寫字母）搭配三位流水號，
格式為 `XX-NNN`（例：`FS-001`、`SK-042`、`UK-023`）。

此設計刻意使 id 攜帶行政區資訊，目的是讓 LLM 在分批載入各區資料集時，
無需讀取全量即可透過 id 前綴判斷資料所屬區域，避免上下文視窗超載。

**非標準格式（`W_WARD_SLUG`、`XX-FOOD-NNN` 等）均為非法**，
遷入時必須轉換為 `XX-NNN` 標準格式。

---

### tagId 規則（SSOT）

合法 tagId 集合定義於各 ward schema 檔頭，並與本 README 保持同步。
現有全量 tag 即為合法集合，**沒有重複且語意無歧義的 tag 視為合法**。
新增 tag 前需先確認集合內無近義詞，並同步更新所有 ward 檔頭與本 README。

---
**ward 檔頭 tagId 分組（僅供人類閱讀，不影響 TAG_REGISTRY group 欄位）：**

各 ward schema 檔頭將合法 tagId 依語意分為以下視覺分組，方便代理人快速選用：

| 分組標籤 | 涵蓋 tagId |
|---|---|
| 交通 | 地鐵・巴士・鐵道 |
| 文化 | 寺院・神社・世界遺產・庭園・山岳・歷史・國寶 |
| 自然 | 自然・賞花・楓葉 |
| 體驗 | 打卡・ACG・現代・經典・隱密 |
| 飲食 | 正餐・喫茶・和菓子・抹茶・老舖・名物・壽司・拉麵・烏龍・天婦羅・壽喜燒・涮涮鍋・懷石・豆腐・洋菓子・蕎麥・燒肉・放題 |
| 商業 | 購物・超市・博物館 |
| 地物 | 地標・溫泉・展望 |

> 此分組僅為 JSDoc 說明文件的視覺輔助，`TAG_REGISTRY` 中每個 tagId 的實際 `group` 欄位（food/misc/culture/nature/transport/acg）保持不變，以 `src/data/tags.ts` 為準。
---

## 🤖 資料錄入規範（代理人行為約束）

> 本章節是資料層的 SSOT 行為約束文件。  
> AI 代理人在操作 `src/data/` 下任何檔案前，必須完整閱讀本章節。

### 1. 權限邊界（開放與封閉操作）

**開放操作（代理人可自行執行）**：
- `src/data/spots/*.ts`：新增 / 修改 `SpotSchema` 條目。
- `src/data/locales/zh/*.ts`：新增 / 修改 ZH `SpotLocale`。
- `src/data/locales/ja/*.ts`：新增 / 修改 JA `SpotLocale`。
- **查核與防重約定**：進行任何餐飲或景點的編輯前，代理人必須**確保先對現有資料執行 `grep` 檢查**，防止建立重複的景點。
- **食處查核規範**：所有與「食」相關（`T_FOOD` 或包含餐飲標籤）的資料新增、修改或遷入，**必須**與 [Tabelog](https://tabelog.com/) 進行事實查核，嚴禁使用已停業、地址變更或歇業中的舊資料。在使用搜尋工具查核時，**必須限定更準確的地域與店鋪關鍵字（如電話、官網、實體地址）**避免誤判！

**封閉操作（需 Ash 人工審查，代理人禁止自行修改）**：
- `TAG_REGISTRY` (`src/data/tags.ts`)：標籤白名單擴充。
- `TYPES` (`src/data/types.ts`)：景點分類擴充。
- `AREA_NAMES` / `WARD_NAMES` (`src/data/areas.ts`, `wards.ts`)：分區定義與地理映射邏輯。
- `src/data/index.ts`：匯出模組的任何異動。

### 2. 結構層 Schema 錄入絕對禁則 (Zero-Trust)
- **純粹空間節點**：`SpotSchema` 僅允許定義 `id`, `wardId`, `areaId`, `typeId`, `tagIds`，以及選填的 `reservationRequired`、`municipalityId`。
- **文字剝離**：**絕對禁止**在 Schema 中寫入任何在地化文字資料（包含已被廢除的 `mapQuery`，或是 `name`、`desc` 等）。
- **空間歸屬驗證**：`wardId`／`areaId` 是旅遊目錄，仍強制遵守檔案與 `AREA_BY_WARD` 映射。省略 `municipalityId` 表示京都市；明確登記的周邊市域必須有真實座標。跨市例外不新增京都行政區，不改 ID，不把市外地點錯標為京都市內。

### 3. 內容層 Locale 命名絕對約束 (SSOT 錨點)
- **JA Name 為唯一事實來源**：JA Locale (`ja/*.ts`) 中的 `name` 欄位，是 Query Assembly System 組裝 Google Maps 定位網址的**唯一地理錨點**。
- **官方全名防呆**：店家與景點資料必須使用 SSOT 官方全名，絕對禁止自我拼湊錯漏字。此欄位必須填寫「能在 Google Maps 或官方網站上精確檢索到的實體日文名稱」。括號附註僅允許用於消歧義（如車站業者「嵐山駅 (阪急)」、別名「東寺 (教王護国寺)」、ACG 聖地標記「晴明神社 (ACG聖地)」）；Query Assembly System（`buildGoogleMapsUrl`）會自動剝除括號內容。仍禁止純裝飾用途的後綴（例：禁止「清水寺 (秋季夜觀)」，必須填寫「清水寺」）。
- **鏡射同步**：新增或刪除景點時，ZH 與 JA Locale 必須與 Schema 檔同步異動相同 ID 的物件，嚴禁出現孤立節點。

### 4. `tagIds` 填寫規則
1. **限用白名單**：只能使用 `TAG_REGISTRY` 內已登記的鍵名，未登記標籤將導致系統阻擋。
2. **數量上限**：單一景點的 `tagIds` 上限為 **6 個**。優先標註最具識別度的特徵。
3. **類型禁則約束**：遵守檔頭宣告的邏輯約束（例如：`T_FOOD` 類型禁止標註「世界遺產」標籤）。
4. **雙軌標籤機制**：若無適合的系統邏輯標籤（Schema `tagIds`），請在 Schema 中省略該特徵，並將描述性標籤直接以逗號分隔寫在 Locale 的 `tags` 字串中（僅供 UI 渲染顯示）。代理人**禁止自行判定並擴充 `TAG_REGISTRY`**。

### 5. 地標景點真確性定位約束 (Landmark Coordinates)
當新增或修改具有「世界遺產」、「國寶」、「經典寺院 / 神社」等超重要地位的景點時（如金閣寺、清水寺、平安神宮等），**強制必須**在 `src/data/map-centers.ts` 的 `SPOT_POSITIONS` 常數中，新增該 `spot.id` 對應的真實經緯度坐標。以利 `ClusterMap.tsx` 在地圖上直接繪製專屬的地名圖示（Landmark Icon + Name）。

### 6. 歲時記（歷史存檔／年度版待製）
`public/seasonal.html` 保留 2026 年六月個人行程作存檔；2026-11-06 已移除首頁入口。它不是全年活動資料庫，不能以替換年份方式當成已核實的年度活動。

新方向為已知活動年度總表、季節分類、使用者日期區間內的活動清單，另見 [年度製作計畫](docs/SEASONAL_PLAN.md)。本輪只研究與規劃，尚未製作年度資料或查詢頁；恢復入口前需完成日期／來源查核與驗收。前文舊架構的「抽換季節頁」是歷史說明，以本節為準。

### 7. 執行前自我檢查與回報 (Automated Validation)

代理人每次完成資料 I/O 寫入、準備 Push 前，**強制執行**以下指令：
```bash
npx tsx validate_data.js
```
必須確認終端機輸出 `Health Check Passed`。若出現任何報測（如映射越界、幽靈標籤、Locale 缺漏），必須自行修正資料層，直至驗證通過為止。

- **ERROR（❌，阻擋）**：id 格式/前綴/重複、ward/area/type 未登記、Area 越界、Schema 禁止欄位、幽靈標籤、標籤超量、T_FOOD 禁則、Locale 缺漏或孤立、map-centers 失效座標、未知市域或跨市景點缺有效座標、`TYPE_TAG_GROUP_MAP` 與 `TYPES` 不同步。
- **WARN（⚠️，資料品質）**：ZH tags 未鏡射 schema、世界遺產/國寶未註冊 `SPOT_POSITIONS`、JA name 重名。預設不阻擋；加上 `--strict` 時一併視為失敗。
- 新增或修改的景點不得新增 WARN。

**標準回報格式**：
```text
變更景點：{數量} 筆
- [{動作}] {spot.id} / {wardId} / {areaId} / {JA Name}
資料健康檢查：✅ 通過 (已執行 npx tsx validate_data.js)
建議擴充 Tag：（無 或 列出建議及理由，交由 Ash 裁決）
```

---
