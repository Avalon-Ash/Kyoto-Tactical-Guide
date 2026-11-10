# Kyoto Tactical Guide — 執行計畫（2026 Q4）

> **目前狀態以 [交接入口](HANDOFF.md) 為準**（2026-11-09 整理）。Phase 0–3 與 Phase 4 第一批（T4.1、T4.2）、文庫首頁 T4-M1～M4c、手機 UI T4-M5 都已完成並併入 `main`；各輪細節見 `agent-runs/`。下一項是 [UI 翻新](UI_RENEWAL_PLAN.md)（規劃完成，待使用者決定）。2026-11-09 以前在本檔頂端逐輪追加的狀態橫幅已移除，原文留在 Git 歷史。


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

## Phase 0–3（已完成，封存）

已完成的 Phase 0–3 任務內容已封存於 [archive/PLAN-phase0-3.md](archive/PLAN-phase0-3.md)；這些任務已完成，其中的 MapCanvas 等元件已不存在，內容只供回溯。

---

## Phase 4 — 資料正確性優先，再擴充地圖

2026-11-04 使用者授權依建議順序啟動，先查 SK-078 與資料正確性，依合約分工，這輪不 push。最新全域派工合約優先；本輪執行與模型限制見 [資料查核紀錄](agent-runs/2026-11-04-phase04-data.md)。

1. **T4.1 第一批資料查核：完成（`a0a94f7`）。** 全庫結構清冊、前輪 11 個疑點，加上 6 個車站導航名稱，共 17 個 ID。SK-078 依新增閉店證據退役，809／ERROR 0／WARN 0；歷史 D6 原文保留。新增唯讀 `scripts/audit-data.ts`，不修改原稽核門檻。
2. **T4.2 跨市模型：完成（`a1eeb99`），後續事實查核待續。** SK-038 最小新增 `municipalityId`，分離旅遊索引／真實市域／導航地域。之後分批查文化財對象與餐飲身分／營業狀況，不能把結構綠燈視為全庫查證完成。
3. **T4.3 個別景點地圖：未啟動。** 先決定座標來源、授權、精度與密度策略；現有 45 個真實景點座標不等於全庫都有點位。
4. **T4.4 MapLibre 評估：未啟動。** 向量底圖與自訂漆藝樣式先做成本、效能及視覺收益評估，再決定是否導入。
5. **T4.5 歲時記：只有計畫。** 見 [SEASONAL_PLAN](SEASONAL_PLAN.md)；首頁入口已移除，年度資料庫未授權。

---

## T4-M — 文庫首頁與全站 UI（已併入 main）

| 輪 | 內容 | 紀錄 |
|---|---|---|
| T4-M1～M2c | 東寺樣板 → 初音研究 → 文箱開盒、真實書卷、一區一函 | `agent-runs/2026-11-05-phase04-*.md`、`2026-11-06-phase04-cabinet-collection.md` |
| T4-M3～M3b | 其餘十區地標、清水寺屋頂與基座修正 | `2026-11-06-phase04-eleven-landmarks.md`、`-kiyomizu-*.md` |
| T4-M4～M4c | 文庫整合首頁、直接拖動換函、月光預設、名所目錄／御秘帖統一 | `2026-11-06-phase04-bunko-*.md`、`-main-release.md` |
| T4-M5 | 手機優先、深色預設、全站共用主題／語系／減少動態 | `2026-11-06-mobile-bunko-ui.md`（含 2026-11-09 補驗） |

仍未覆蓋：真實手機觸控、Safari／iOS、OS 層級減少動態、其他 GPU、FPS。浮雕仍是 WebGL 2.5D，不是真實 3D 或 Rust。

---

## Phase 5 — UI 翻新（規劃完成，待使用者決定）

總計畫、架構、美術需求分別在 [UI_RENEWAL_PLAN](UI_RENEWAL_PLAN.md)、[UI_RENEWAL_ARCHITECTURE](UI_RENEWAL_ARCHITECTURE.md)、[UI_RENEWAL_ART](UI_RENEWAL_ART.md)。分期 P0（token、彈簧）→ P1（文箱放大）→ P3（背景）→ P2（光澤）→ P4（其他頁面）→ P5（驗收）。開工前要使用者決定總計畫 §6 的四項，並另行授權實作。

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
| T3.6 收尾 | ✅ 可用環境驗收完成；平台限制見紀錄 | 12d3bfc |
| T4.1 第一批資料查核 | ✅ | a0a94f7 |
| T4.2 跨市模型 | ✅ 後續事實查核待續 | a1eeb99 |
| T4-M1～M4c 文庫首頁 | ✅ 實機觸控未測 | 08478c3、6d6a132 |
| T4-M5 手機 UI | ✅ 實機觸控未測 | 見 `git log main` |
| Phase 5 UI 翻新 | ⏳ 待使用者決定 | — |
