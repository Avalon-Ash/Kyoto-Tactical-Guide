# T4-M2a：東寺獨立材質／浮雕展示

日期：2026-11-05。狀態：**獨立頁實作完成；命令檢查通過，可用瀏覽器驗收部分完成；美術待使用者體驗。**

## 授權與基準

- 使用者要求「局部寫一個網頁作展示」，因前一輪研究文件沒有改畫面，首頁仍看不出差異。
- `C:/Git/Kyoto-Tactical-Guide`，`codex/phase4-data-audit`，HEAD `11c0947`。開工再次核對分支、提交與未提交修改；保留前輪全部 diff。
- 主代理單獨實作，未派子代理，未切換模型；實際模型／強度未由工具確認。未 commit、merge 或 push。
- 已確認 3000 既有伺服器 HTTP 200，直接使用，沒有重開服務。

## 正確入口

**http://127.0.0.1:3000/toji-study/index.html**

必須包含 `index.html`。Vite 在 `/toji-study/` 會回退到 SPA 舊首頁，本輪已實測發現並改用完整網址。這個展示與首頁分離，不能開首頁後聲稱新樣板沒有生效。

## 本輪變更

| 檔案 | 行為 |
|---|---|
| `public/toji-study/index.html` | 獨立展示；同構圖平面／浮雕對照、演示、減少動態、三種底地、中日文、日夜、保存畫面 |
| `public/toji-study/study.css` | 桌機／窄版，淡紙色與月光配色，無外部字型或資產請求 |
| `public/toji-study/geometry.js` | 文庫蓋板、五層屋簷、柱、欄杆、相輪、側殿、松樹與山石的簡化幾何；固定相機；投影與指標反算 |
| `public/toji-study/shaders.js` | 幾何隆起與高度相關視差、陰影貼圖、梨地／濃梨地／刑部梨地、局部螺鈿、金銀面、衰退軌跡 |
| `public/toji-study/study.js` | Pointer Events、鍵盤方向鍵／空白鍵、7 秒演示、按需繪製、離屏／隱藏停止、reduced-motion、context loss 處理、PNG 匯出 |
| `scripts/toji-study.test.mjs` | 幾何有限值／法線、投影反算、可見位移量、軌跡過期與 reduced-motion 抑制 |

不使用先前透明東寺圖片；本頁採原生 WebGL 簡化立體浮雕幾何，無新依賴、無 Rust。135444 頂點／45148 三角形，每幀含深度陰影與顏色兩個 pass，陰影貼圖 1024²，DPR 上限 1.5。這不是東寺測繪模型，也不是全站完整 3D 化。

平面模式保留相同相機、構圖及材質，只將浮雕高度壓至 0.025；互動時升至 1，靜態休止為 0.55，減少動態固定為 0.82。投影測試確認塔頂在兩種測試尺寸的平面／完整浮雕差異超過 65 CSS px。此數字是幾何投影測試，不是瀏覽器逐幀效能量測。

軌跡最多 20 個樣本、1500 ms 消退，改變表面反射，粒子不脫離漆面。觸控保留 `touch-action: pan-y`，本頁沒有點圖導航，因此拖曳不會誤開區域。文庫開蓋與資料書卷尚未接入；其他地標及首頁沒有本輪新增修改。

## 檢查與證據

命令日誌：`.claude/phase04e/`，不提交。

| 指令 | 結果 |
|---|---|
| `npm run lint` | exit 0 |
| `npx --no-install tsx validate_data.js --strict` | exit 0；809／ERROR 0／WARN 0 |
| `node --test --test-concurrency=1 scripts/makie-scene.test.mjs scripts/location-navigation.test.mjs scripts/toji-study.test.mjs` | exit 0；14/14，包含使用者指定的兩組回歸 |
| `npm run build` | exit 0；主 JS 498.92 kB，gzip 144.89 kB，首頁包未因獨立展示增長 |

### 本輪觀察

- 1440 × 1200：WebGL 啟用；平面與浮雕的輪廓、柱與樹幹、遮擋、投影可區別；滑鼠與方向鍵可觸發位移。相機固定。
- 375 × 812：無橫向溢出；中日語系、日夜及三種材質切換有效；互動按鈕至少 44px 高。日文較長操作文字會換行，未互相覆蓋。
- 手動減少動態：`lift=0.820`、軌跡 0、演示按鈕禁用；跨兩次觀察 frame counter 維持 9。
- 預覽工具期間曾出現 DPR／截圖縮放不穩定。**只採下列尺寸核對後的新圖**，早期錯尺寸檔保留作除錯，不作驗收證據。
- `desktop-1440-flat.jpg`：本輪平面對照。
- `desktop-1440-relief.jpg`：本輪浮雕／鍵盤聚焦；頁面因聚焦有少量捲動，不能不對齊就做像素差分。
- `mobile-375-ja-night-still.jpg`、`mobile-375-full.png`：375px 日文、月光、減少動態。
- `mobile-relief-render.png`：本頁「保存畫面」產生的原始渲染匯出，501 × 675；**不是全頁截圖**。

### 未測／待驗收

- 真實手指硬體輸入、垂直捲動的實機手感、Safari／iOS 未測。
- OS `prefers-reduced-motion` 切換未測，僅手動模式與純函式測試。不得宣稱涵蓋 OS 設定。
- GPU context loss／恢復與無 GPU 分支未做實機觸發測試；未測 FPS／低階裝置續航。
- 美術仍是幾何與材質樣板，不能聲稱已達初音調度工藝水準；平文等具體細節仍需美術精修。
- 文庫開盒、書卷資料流程尚未實作。先讓使用者評估這個局部展示，不擴展其他地標。

## 交接

後續以 [初音研究](2026-11-05-phase04-hatsune-research.md) 作材質依據。要整合回首頁前，先確認這個樣板的隆起幅度、視差與材質方向；仍需維持十一區／古地名／直接圖上入口，不把獨立頁的材質比較工具搬成首頁必經選單。
