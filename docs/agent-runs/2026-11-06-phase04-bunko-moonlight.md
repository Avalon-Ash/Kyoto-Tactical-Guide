# T4-M4b — 月光預設、閒置循環與書卷字體

日期：2026-11-06；工作區 `C:/Git/Kyoto-Tactical-Guide`；分支 `codex/phase4-data-audit`；base／HEAD `11c0947`。使用者在 T4-M4a 驗收中追加要求：移除開卷按鈕、預設月光、無主動互動時持續播放原演示動態，並選擇有京都感的字體。主代理單獨實作，無派工；請求模型／強度不適用，實際模型設定未經工具確認，未切換。保留全部先前修改，未 commit／merge／push。

## 完成行為

- 延續 T4-M4a：首頁沒有介紹區、換函列、演示／減少動態工具列；本輪再移除「開盒・展卷」按鈕。左右直接拖動函面換區，點蓋或 Enter／空白鍵開卷。無 WebGL 時可點替代畫面或用鍵盤開卷，不依賴隱藏的按鈕。
- 主頁預設月光；使用者切換日間後，在 App 內往返保留選擇，重新整理回到月光預設。獨立展示仍保留其對照控制與日間預設。
- 主頁閒置時循環隆起、移光、視差與光跡，不再七秒結束；不自動換區或開卷。任何指標操作、鍵盤或滾輪輸入會讓出控制，停止操作 1.8 秒後恢復。持續按住拖動、換函中、開盒／讀卷期間均不自動播放。
- 閒置繪製上限 30 次／秒；分頁隱藏或 canvas 不可見時停止 RAF，卸載取消事件與 GPU 資源。系統減少動態或手動測試設定會抑制循環、位移和光跡。
- 題字、區名、地名採用 **Shippori Mincho B1**；繁中內文採 **Noto Serif TC**，日文用 Shippori Mincho B1。主頁與獨立頁都載入；其他檢索模式原樣式保留。

## 字體依據與成本

查核日期 2026-11-06。Shippori Mincho B1 是帶圓角與積墨細節的舊式明朝體，適合本次文庫意象；這是設計選擇，不宣稱是京都特有的歷史字體。參考[作者說明](https://github.com/fontdasu/ShipporiMincho)與 [Google Fonts 說明](https://raw.githubusercontent.com/google/fonts/main/ofl/shipporiminchob1/DESCRIPTION.en_us.html)。繁中覆蓋依 [Noto Serif TC 官方 metadata](https://raw.githubusercontent.com/google/fonts/main/ofl/notoseriftc/METADATA.pb)。

沿用既有 Google Fonts 載入方式，新增 B1 的 400／600 及 TC 的 400／500 字重；`display=swap`，網路未載入時使用 serif 備援。沒有 npm 依賴、大型引擎或新建置管線。字體仍是外部網路資源，沒有宣稱離線已內嵌。

## 驗收

| 命令 | 結果 |
|---|---|
| `npm run lint` | exit 0 |
| `npx --no-install tsx validate_data.js --strict` | exit 0，809 筆、ERROR 0、WARN 0 |
| `node --test --test-concurrency=1 scripts/makie-scene.test.mjs scripts/location-navigation.test.mjs scripts/toji-study.test.mjs scripts/toji-library.test.mjs scripts/bunko-integration.test.mjs` | exit 0，31/31 |
| `npm run build` | exit 0，主站及獨立入口皆輸出 |
| `git diff --check` | exit 0 |

新增閒置播放狀態回歸，涵蓋主動操作、讀卷、拖動、換函、背景／不可見、減少動態、WebGL 失敗與恢復門檻。既有整合測試另驗證預設夜間與無按鈕的 fallback 點擊開卷。

實際瀏覽器：1440×900／375×812、DPR 1；中日文、日夜、左右滑鼠拖動／鍵盤換函、直接點蓋／鍵盤開卷、返回流程及獨立展示皆驗收。主頁文字與工具列不占版面，無開卷按鈕；手機無橫向溢出。字體載入狀態及 computed font-family 已檢查。

最終版本循環超過 107 秒仍為 autoplay；約 97 秒區間內量到 27.7 次繪製／秒（僅 draw 計數，不是硬體 FPS）；操作切日夜後立即為 false，等待閒置門檻後恢復 true；拖動換區不誤開書卷。讀卷期間保持 false。正式建置檢查使用本輪 3001 preview，console warn／error 為 0；驗收後關閉自有 preview，保留 3000 dev server。一次 CUA 狀態讀取逾時後，重新綁定同一分頁恢復驗收；沒有因此修改產品或省略手機截圖。

新證據 `.claude/phase04m/`：`desktop-moonlight.png`、`mobile-moonlight-ja.png`、`mobile-reader-ja.png`、`autoplay-states.json`、`browser-state.json`、`idle-rate.json`、四項命令日誌及 `evidence.json`。不沿用舊版截圖；T4-M4a 的三塊移除與直接拖動收尾亦以本輪正式建置複驗。

**完成**：上述實作、命令及可用瀏覽器驗收。**待使用者體驗**：月光循環節奏、字體與直接拖動。**未測**：真實手機觸控、真實 OS reduced-motion、Safari／iOS、其他 GPU／實體 FPS；模擬狀態與 draw 計數不能代替硬體量測。

十一函、清水寺接面、幾何與 shader 不變；資料、受保護檔案及依賴清單未修改。本輪僅本機實作與驗收，沒有提交或發布授權。
