# T4-M2c：書卷裁切、卷軸與十一區文庫

日期：2026-11-06（自 11-05 跨日）。狀態：**實作與可用環境驗收完成；新卷軸美術與換函手感待使用者評價。**

## 授權與基準

- 使用者指出「遮擋沒作好」、上下兩根橫軸視覺品質不好，並指定「一區一盒文庫。左右切換？這你設計」。本輪修復書卷並實作十一區換函；其他地標浮雕仍不擴展。
- `C:/Git/Kyoto-Tactical-Guide`，`codex/phase4-data-audit`，base／HEAD `11c0947`。開工核對 status、分支與最新提交，保留前輪 diff；未 reset／clean、commit、merge 或 push。
- 主代理單獨負責設計、核心渲染與驗收，沒有子代理／派工。請求模型／強度不適用；工具未確認主代理實際設定，未切換設定。
- 3000 既有伺服器 HTTP 200，直接沿用。另於空閒的 3001 啟動本輪 production preview，驗證後停止自己的 preview；保留 3000。

## 問題與設計

**CONFIRMED：書卷內容穿過標題上方。** 舊 `.volume-paper` 同時負責 padding 與捲動，內側 `.volume-heading` 使用 sticky；標題上方／側邊的留白仍暴露滾動條目。加深標題背景不能解決範圍錯誤。

改成固定外層紙張、標題、搜尋／狀態，以及獨立 `#volume-body` 捲動區。外紙 overflow hidden，列表自己裁切；原本的 sticky 與整張紙捲動已移除。搜尋／清除時列表回到頂端，避免空結果留在看不到的位置。

上下軸改為紙張包覆軸心、深木端頭與窄金屬箍；上軸細、下軸略厚，與紙張邊緣接合。使用 HTML／CSS，沒有新增圖片或繪圖依賴；是視覺意象，不宣稱文物構造復原。

**一區一函，中央只端詳一盒。** 上緣換函區顯示當前行政區、序號、真實景點數，左右按鈕標示相鄰區。採既有十一區目錄順序，首尾循環，不暗示左右等於地理鄰接。圖上蓋面仍直接開盒；收卷返回同一函。其他區使用梨地素函與各自古地名／代表地標文字，明示浮雕待製，不把東寺模型複製到別區。

觸控橫滑只在換函區辨識，盒面保留光跡；垂直、過短、過久、取消或不同指標不換區。橫滑後抑制相容 click，避免一次換兩函。換函期間鎖定再次切換／開盒，減少動態時省略滑移。鍵盤在換函區使用左右鍵；盒面方向鍵繼續移光，Enter 開盒。

## 變更檔案

| 檔案 | 本輪責任 |
|---|---|
| `toji-study/index.html` | 換函控制、固定書卷標題／控制區、獨立列表、紙包卷軸結構 |
| `src/studies/toji/study.css` | 修正裁切、卷軸材質與端頭、桌機／375px 排版 |
| `src/studies/toji/collection.ts` | 從既有 ward、landmark metadata 與動態統計組成十一函目錄，雙向循環、卷名 |
| `src/studies/toji/study.js` | 換函狀態、視覺過渡、焦點保持、動態標題／地名、GPU mesh 切換 |
| `src/studies/toji/geometry.js` | 非東寺函只建盒體與內卷，沒有東寺山水建築；東寺原模型保留 |
| `src/studies/toji/library.ts` | 依選定 ward 載入真實雙語資料，切區清除舊篩選、共用導航、請求版本保護 |
| `src/studies/toji/interaction.js` | 將換函橫滑與原本盒面點按分開判定 |
| `scripts/toji-study.test.mjs`、`scripts/toji-library.test.mjs` | 素函無東寺幾何、十一區兩語一致性／首尾循環、橫滑排除情境 |

沒有改 schema、locale、受保護 metadata、主首頁渲染或全站狀態架構。`collection.ts` 讀取既有 `MAKIE_LANDMARKS`，沒有重抄古地名與地標定義。首頁仍是既有十一區同畫面地圖，獨立頁不代表首頁已換成文庫。

## 驗收

本輪證據：`.claude/phase04g/`（不提交）；`evidence.json` 記錄 base SHA、來源／檢查／截圖雜湊與限制。

| 指令 | 結果 |
|---|---|
| `npm run lint` | exit 0，`lint.log` |
| `npx --no-install tsx validate_data.js --strict` | exit 0；809／ERROR 0／WARN 0，`strict.log` |
| `node --test --test-concurrency=1 scripts/makie-scene.test.mjs scripts/location-navigation.test.mjs scripts/toji-study.test.mjs scripts/toji-library.test.mjs` | exit 0；22/22，`tests.log` |
| `npm run build` | exit 0，`build.log` |

最終程式調整後四項全數重跑。主站 main＋共用 chunk 合計約 498.84 kB（gzip 145.63 kB）；展示 JS＋共用 chunk 約 305.34 kB（gzip 87.58 kB）。共享既有地標 metadata 後，展示比前輪多約 49.77 kB（gzip 15.86 kB）；沒有新增依賴，景點 locale 仍按區／語系載入。這是現有多入口的分包成本，不把單一 main chunk 變小誇稱總下載量下降。

### 瀏覽器觀察

- **1440 × 1200 裁切重現**：列表 scrollTop 1200；外紙 scrollTop 0，標題位置維持不動；標題及列表上方的 hit-test 沒有命中任何景點條目。`clipping.json`、`desktop-scroll-clipped.jpg` 與最終正式版 `production-desktop-clipped.jpg`。
- **375 × 812**：中文／日文、日夜、手動減少動態；頁面、紙張、列表均無橫向溢出，書卷列表可視高度約 437px。`mobile-scroll-ja.jpg`、`mobile-scroll-clipped.jpg`、`production-mobile-ukyo.jpg`；最後一張實際寬度已核對為 375。
- **十一函循環**：實際按鈕逐一切換，11 次回到南區；焦點維持在換函按鈕。`cabinet-cycle.json` 記錄十一區名、ID 與數量；兩語所有區的資料／代表地標存在性另由測試驗證，總數 809。
- **跨區讀卷**：右京 77 筆，日文搜尋天龍寺＋寺社類型得到 2 筆（東寺以外的正確資料）；回到南區為 45 筆，舊搜尋／類型清空。未知關鍵字為 0，清除恢復資料。沒有新增旅遊事實，未開啟外部 Maps 導航。
- **鍵盤**：換函區左右鍵、盒面 Enter、書卷搜尋／PageDown、Escape 與收卷焦點恢復已操作。東寺方向鍵仍產生軌跡，回到東寺仍使用 137982 頂點的原浮雕。減少動態保留 lift 0.820、軌跡 0，開盒與換函即時完成。
- **正式建置**：3001 的換函、開盒、雙語讀卷及捲動成功；新驗收分頁 console error／warn 為空，`production-console.json`。主首頁仍正常載入 809 筆與十一區入口。
- 編輯多個檔案途中，舊 dev 分頁 HMR 曾短暫回報缺少新 `volume-index` 元素；完整重新整理後未再出現。最終正式驗收採新分頁，沒有把舊 HMR 日誌混入最終結果。

### 尚未驗證／待決定

- 真實手機橫滑、手指光跡、Safari／iOS；OS `prefers-reduced-motion` 設定切換；GPU context loss／無 GPU／網路失敗實機觸發未測。橫滑只有邏輯測試，不能宣稱已有實機手感驗收。
- 沒有新 FPS／功耗數據，不用靜態畫面推論低階裝置效能。
- 新卷軸視覺、左右換函方向待使用者體驗。首頁整合及其餘十個地標的美術仍未實作。
- 無新增依賴、無 Rust 或全站完整 3D 重寫；未 commit／merge／push。
