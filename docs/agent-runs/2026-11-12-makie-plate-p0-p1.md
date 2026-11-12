# 2026-11-12 蒔繪浮雕盤 P0–P1（南區原型）

任務：首頁文箱改畫為蒔繪浮雕盤，P0（規格、彈簧）＋P1（南區東寺原型）／部分完成
請求模型／強度：主代理直接執行，未派子代理；實際設定：未確認
工作區／base SHA：雲端 checkout `claude/great-brahmagupta-ye2uqt`／`4ca3adb`
授權：使用者 2026-11-12 授權 P0–P1、WebGL2 基線、加入鶯；派 agy 的工作待使用者晚間於本機執行。

## 使用者決定

- 舊版建築只當造形借鑑；新版全部重畫為蒔繪。
- 所有有體積的物件都要有動態與互動。
- 部品要有「誇張」的體積：參照故宮 3D 百寶嵌文具盒（厚、圓、明顯高出地子，箱側也有紋飾）。
- 靜寫完由蒔看成品，兩者內部溝通後再交付。

## 變更檔案與行為

| 檔案 | 內容 |
|---|---|
| `src/studies/toji/plate/vocab.js` | 繪畫語彙：土坡、流水、すやり霞、岩、屋宇、五重塔、松、鶯、青貝；輸出純資料部品 |
| `plate/minami.js` | 南區構圖（52 個部品） |
| `plate/parts.js` | 部品驗證、點選查表、五狀態的彈簧模擬（立起、甦醒、擺動、停留觸發） |
| `plate/spring.js` | 臨界阻尼與欠阻尼彈簧 |
| `plate/bake.js` | Canvas 2D 烘焙：高度、線描、覆蓋、部品編號圖 |
| `plate/shaders.js`、`plate/renderer.js` | WebGL2：每個繪製步驟一支精簡著色器；地子隆起、部品切片成厚浮雕並沿腳線立起、模板緩衝陰影、霞 |
| `renderer.js` | 先取 WebGL2；已重畫的區走浮雕盤，其餘區與無 WebGL2 的裝置走原浮雕網格；浮雕盤建不起來時自動退回 |
| `study.js` | 傳入「手是否在場」；近觀單點觸發部品 |
| `bunko.css` | 浮雕盤自帶落地影，關掉 CSS drop-shadow |
| `scripts/plate.test.mjs` | 10 項測試 |

與原計畫的差異：`spring` 放在 `plate/spring.js`（原列 `src/lib/spring.ts`），因為 `scripts/*.test.mjs` 以純 node 載入。

## 檢查（綁定上列 base 與本次 diff）

| 檢查 | 結果 |
|---|---|
| `npm run lint` | exit 0 |
| `npx --no-install tsx validate_data.js --strict` | ERROR 0、WARN 0（809 筆） |
| `npm test` | `scripts` 77/77、`src/lib` 6/6 |
| `npm run build` | exit 0 |
| 無頭 Chromium（SwiftShader）1440×900 月光 | 南區浮雕盤渲染、部品立起、陰影、光池；閒置 29fps（上限 30） |
| 同上 760×560 最大倍率 | 塔身厚度、窗燈、岩、流水、粉粒逐顆可辨 |

## 未做／未驗

- 暖日版、375px 手機版、減少動態、鍵盤、開蓋過程的畫面驗收。
- 真機觸控、iOS Safari、真實 GPU 的 FPS 與烘焙時間（無頭環境的烘焙時間不具代表性）。
- 逐幀閃爍量測頁（P0 的 agy 項目）。
- 組紐與金具、箱側紋飾、內梨地細節。
- 其餘十區仍是舊浮雕網格；換函軌跡光與背景光影屬 P2。

## 問題

- PLAUSIBLE：部品邊緣的抗鋸齒依賴 alpha-to-coverage；畫布未取得多重取樣的裝置上邊緣會是硬邊。
- PLAUSIBLE：同一 slot 內相鄰部品（松的葉簇）擺動相位不同時，交界可能有 1–2 單位的細縫。

## 交接

待派 agy（每包最多 3 項，獨立工作樹，只交 diff，不得改 `plate/shaders.js`、`plate/renderer.js`、`plate/vocab.js`、`plate/minami.js`、`backdrop.js`、`bunko.css`）：

1. 量測頁：`toji-study/` 加 `?probe=flicker`，固定指標微移 N 幀，輸出相鄰幀平均差與幀時間。
2. 截圖矩陣腳本：1440／375 × 日夜 × 語系 × 減少動態，輸出到不提交的目錄。
3. 初音調度技法圖像來源彙整（網址、查核日），補進 `2026-11-05-phase04-hatsune-research.md`。
