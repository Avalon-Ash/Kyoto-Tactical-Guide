# Phase 4 — 延曆寺跨市模型與互動蒔繪

日期：2026-11-04。工作區 `C:/Git/Kyoto-Tactical-Guide`，分支 `codex/phase4-data-audit`，base `a0a94f74c8d796e0ac6c6eda7fb00e5eb3f4c6fd`。原驗收以該 base 加 diff 進行；2026-11-05 已提交跨市修復 `a1eeb99` 與互動蒔繪 `86d852b`。使用者新指令授權將這批程式與交接文件推送至 `codex/phase4-data-audit`，未授權合併 main。

接續入口：[HANDOFF.md](../HANDOFF.md)。檢查命令與實際數字集中在交接入口，避免兩份結果漂移。

## 授權與分工

使用者授權前批資料 commit（已為 a0a94f7），繼續處理跨市模型、恢復預覽並改進美術；之後明確要求黑漆肉合研出蒔繪意象、行政區與古地名地標並存、畫面直接互動且合併區界。這些指示取代 Phase 3 SVG 美術規格；初始未授權 merge／push；11-05 已追加本批分支 push 授權，仍未授權 merge main。

| 工作包 | Owner／實際狀態 | 寫入範圍 |
|---|---|---|
| 跨市模型、稽核與導航 | 主代理，已完成本機驗證；未自行切換模型強度 | types、municipalities、sakyo、SpotCard、ClusterMap、map-clusters、兩個稽核與導航測試 |
| 單一漆面互動與整合 | 主代理，2.5D 原型完成，未宣稱美術定稿 | MapCanvas、HomeView、makie-scene、makie-renderer、CSS、i18n、相關測試與資產 |
| 早期視覺只讀第二意見 | codex-call companion；請求 gpt-6.1-sol／medium；runtime turn_context 確認同設定；exit 0 | 無；隔離工作樹 `C:/Git/_wt_kyoto-art-review`，base a0a94f7 |

第二意見的範圍限指定截圖及兩個視覺檔，禁止寫入、Git、瀏覽器與再派工。工具 thread `01a1a71d-b8e9-7310-9f8b-2fc09b2d90fc`。截圖是右京詳情頁，故意見只覆蓋卡片、對比與留白；早期色調建議已被使用者的新漆藝要求取代。**此結果不構成本輪最終 GPU 視覺的獨立審查。** 子代理已完成，沒有仍在執行的寫入代理。

派工命令（只讀提示檔與輸出保留於忽略目錄）：

```powershell
node C:/Users/xino_/.codex/plugins/cache/openai-codex/codex/1.0.6/scripts/codex-companion.mjs task --model gpt-6.1-sol --effort medium --cwd C:/Git/_wt_kyoto-art-review --prompt-file C:/Git/Kyoto-Tactical-Guide/.claude/phase04b/visual-review.md
```

## 跨市資料與行為

- SK-038 維持 W_SAKYO／A16 作為旅遊動線索引，新增結構欄位 `municipalityId: M_OTSU`；這是使用者跨市模型授權下的最小 `src/types.ts` 變更。
- registry 提供中日市／府縣文字；schema 未加入 name、desc、mapQuery。
- shared Google Maps query 改用真實大津市與滋賀県，卡片顯示京都周邊；其他京都市內特殊名稱規則由回歸測試保護。
- 詳圖將周邊景點獨立成精確位置的叢集，避免仍混入大原中心。bounds 納入市外目的地；有市外點時停用區外暗罩，保留區界。
- 主稽核和補充稽核都驗證市域白名單及跨市座標；補充稽核將「明確跨市」獨立列出，未靜默掩蓋未知越界。
- 所在地查核：2026-11-04，[大津市 MICE 官方延曆寺頁](https://otsu-mice.jp/facilities/hieizan-enryaku-ji-temple/) 列地址「大津市坂本本町4220」。座標沿用前批已查核值，不為消除錯誤搬動座標。

## 蒔繪管線

1. React 保留資料與導覽。首頁移除 SVG 渲染及「蒔繪／區界」切換、旁列十一區選單。
2. Canvas2D 一次性產出區域 ID 材質遮罩與建築紋樣。市中心放大的連續單調投影共用於遮罩、地標和 CPU 點選；GeoJSON holes／MultiPolygon 均處理。
3. WebGL fragment shader 合成既有底圖、區域金粉反光、地標亮度與輕微浮起。背景亮度只是高度近似，沒有真實 3D 幾何或 Rust／WASM。
4. 圖上十一個原生按鈕提供地標名稱、行政區及景點數的無障礙名稱，鍵盤聚焦也啟動相同回饋；保留衣笠、御所・西陣、嵯峨野、深草等文字。
5. 按需 requestAnimationFrame；閒置、離屏及文件隱藏不持續重繪。DPR 上限 1.5，無新增繪圖依賴；靜止／減少動態採立即選取、固定光源。GPU 失敗時保留底圖與入口，context 恢復可重建。

視覺限制：生成底圖的建築並未對應精確實體；地標紋樣也不是逐棟復原。當前入口是有正確行政區命中的藝術略圖；完整地理資訊仍由 Leaflet 詳圖提供。這一版供使用者評估互動方向，尚未驗收為最終美術。

## 美術資產與來源

- 工具：內建 imagegen，generate 模式；不是額外 API 付費 CLI。
- 上線資產：`public/art/kyoto-makie-relief.jpg`，1292×1218，642151 bytes。原始 PNG 保留於忽略目錄；僅格式轉換為 JPEG quality 92，未另以程式做美術修圖。
- 生成 brief 摘要（非逐字 prompt）：京都山水與寺院的黑漆藝術地圖，肉合研出蒔繪般隆起、磨光的金銀粉與漆面光澤，細密金粉山稜、蜿蜒河川、殿宇與樹木，少量朱色，無文字或 UI，正面俯視的高質感工藝攝影意象。
- 技法參考：[文化遺產資料庫・蒔絵工程](https://online.bunka.go.jp/db/heritages/detail/144954)。視覺方向是平安京都意象與漆藝質感，沒有聲稱所有畫中地標或技法均屬平安時代。
- 區界沿用 repo 的 OpenStreetMap GeoJSON 與原 ODbL 來源紀錄，未改真實 boundary。

## 驗證與回退

本輪最新檢查詳見 [交接入口的驗證表](../HANDOFF.md#已執行驗證)，測試與截圖綁定 base a0a94f7 加本輪程式 diff（後續已提交 a1eeb99、86d852b），文件收尾不改程式行為。

尚未進行新版本 Lighthouse／FPS、Safari／iOS 真機及 context-loss 實機測試。不要沿用 Phase 3 分數宣稱 GPU 版效能相同。操作證據不等於使用者已接受美術。

回退邊界：跨市資料模型與美術為兩條可分開審查的變更；退回美術時不必移除跨市修復。已分開提交；不使用 reset／clean 丟棄其他工作。提交清單排除 `.claude/`、node_modules、dist；要回退已提交版本時另外取得相應 Git 授權並只處理對應提交。
