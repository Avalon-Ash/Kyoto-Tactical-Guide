# Phase 4 — 東寺蒔繪樣板

> 後續使用者美術回饋未通過：差異不明顯、區域裁切堆疊礙眼。硬切選取與文字底板已另行修正；目前以 [柔和選取紀錄](2026-11-05-phase04-soft-selection.md) 為準，暫不擴展。以下保留樣板初版歷史驗收。

日期：2026-11-05。工作區 `C:/Git/Kyoto-Tactical-Guide`，分支 `codex/phase4-data-audit`，base `11c0947`。開工時工作區乾淨，與同名遠端同步；本輪只授權實作與驗收，禁止 commit／merge／push。

## 分工與範圍

| 工作包 | Owner | 可寫檔案 | 狀態 |
|---|---|---|---|
| T4-M1 東寺樣板與材質融合 | 主代理 | `src/lib/makie-scene.ts`、`src/lib/makie-renderer.ts`、MapCanvas、CSS、`public/art/toji-makie-study.webp` | 樣板完成，未擴展其餘十座 |
| 驗收與交接 | 主代理 | 本紀錄、HANDOFF、PLAN、AGENT_EXECUTION_PLAN、README、`scripts/makie-scene.test.mjs` | 命令及可用瀏覽器驗收完成；系統 reduced-motion 未測，完整驗收為部分完成 |

未派子代理；請求模型／強度：沿用使用者工作階段，未提出 override；實際設定未經工具確認。沒有其他視覺寫入者。

## 設計

- 選東寺做單一樣板。透明的五重塔、側殿、松樹及金銀粉地景素材，以既有底圖為風格參考；保留原 SPOT_POSITIONS 與行政區投影。局部構圖偏左，以避開西本願寺文字，非移動真實座標。
- 地標與底圖先合成，再計算同一光照。移除只讓圖示縮放／上浮的變換，區域和地標以漆面光澤一起回饋。
- 仍為 WebGL 2.5D；亮度近似起伏，沒有測繪模型、真實高度／法線圖、Rust 或新依賴。底圖未改，裝飾性建築比例與庭院不是歷史復原。
- 其餘十個地標尚未逐棟精修；先驗證東寺在桌機與窄版的效果再決定擴展。
- 另建量化地標 ownership atlas：alpha 至少 64/255 的像素選取該地標，透明處回到真實區界。GPU 反光與 CPU 點擊讀相同 ID；修復點塔頂誤入下京區（CONFIRMED）。不新增旁列選單或雙模式。
- 初版程序繪圖的規整線條與底圖不合，已移除該草稿，最終使用內建 imagegen 素材；不是另留一套渲染管線。

## 驗收

本輪證據獨立保存在忽略目錄 `.claude/phase04c/`，不沿用前輪截圖。初次 PowerShell 埠查詢未回傳 listener，但 Vite strictPort 拒絕啟動（埠已占用），隨後現有 HTTP 站台可正常檢視，因此沿用原伺服器。

| 指令／情境 | 結果與證據 |
|---|---|
| `npm run lint` | exit 0；`lint.log` |
| `npx --no-install tsx validate_data.js --strict` | exit 0；809 筆、ERROR 0、WARN 0；`strict.log` |
| `node --test --test-concurrency=1 scripts/makie-scene.test.mjs scripts/location-navigation.test.mjs` | exit 0，11/11；新增地標覆蓋區界與透明處回落、超界不繞列測試；`tests.log` |
| `npm run build` | exit 0；主 JS 499.53 kB／gzip 145.03 kB；ClusterMap 165.77 kB；`build.log` |
| 桌機 1440px | 實測 innerWidth 1440；完整日間畫面 `desktop-day.jpg`（1440×1440）。`before-desktop.jpg` 僅供本輪改前對照 |
| 塔身滑鼠 | (685,918) hover 得 W_MINAMI，點擊進入南區 45 處；`toji-desktop-hover.jpg`。透明像素回落另由回歸測試覆蓋 |
| 鍵盤 | 真實 Tab 逐一走過 11 個圖上按鈕，focused ward 等於 active ward；`keyboard.json`。御所 Enter 進上京區；窄版東寺 Enter 進南区 45 件 |
| 375×812 | innerWidth／scrollWidth 都為 375，11 個按鈕至少 44×44，0 組矩形重疊；`mobile.json`、`mobile-ja-night-still.jpg` |
| 語系、日夜、手動靜止 | 中日文切換，月光、靜止、東寺鍵盤 focus 均通過；`desktop-ja-night-still.jpg` 為補充畫面（工具截圖縮放／下方留黑，不當作精確尺寸證據），手機截圖為完整有效畫面 |
| Console | 當次 `tab.dev.logs({levels:['error','warn'],limit:10})` 為空陣列 |

**未測／待驗收**：OS `prefers-reduced-motion` 實際切換、Safari／iOS、真實觸控兩次點擊、GPU context loss／素材載入失敗的瀏覽器情境、新版本 FPS／Lighthouse。手動靜止不等同系統 reduced-motion。嘗試以 Windows Chrome 做進一步驗證時，Computer Use 因無法可靠判定目前瀏覽器網址而停止；未改系統設定、未再嘗試 UI 操作。最後 viewport override 為 375×812，工具停止前未能 reset，該臨時 tab 未標為保留。不能將完整驗收標為完成。

本輪新增資產 380146 bytes（原底圖維持不變）。主 JS 相較交接 498.11 kB 增 1.42 kB，gzip 增 0.59 kB；額外 1536² RGBA ownership GPU texture 約 9 MiB，加上 CPU IDs 約 2.25 MiB。這是規格計算，沒有宣稱實測 GPU 記憶體或 FPS。仍按需繪製、DPR 上限 1.5。

## 素材來源與重現

使用內建 imagegen，未用付費 API CLI。素材為生成意象，不是古建築測繪或歷史考證。1254×1254 RGBA PNG 以 Pillow 轉為 WebP quality 88、method 6，保留 alpha（0–255），未改尺寸或美術內容。

專案資產：`public/art/toji-makie-study.webp`；原始生成 PNG 在工具自己的 `.codex/generated_images/01a1abcc-af6a-72d0-934d-0dfdd241a48b/exec-ce13bd9f-5a4a-4be8-9bf6-29842ed381b7.png`。PNG 不供網站引用。生成時以 `public/art/kyoto-makie-relief.jpg` 作風格參考，`transparent_background: true`。

最終 prompt：

```text
Use case: stylized-concept. Create ONE transparent architectural vignette asset for compositing into the existing Kyoto black lacquer map. The reference image is STYLE ONLY, do not recreate the whole map. Subject: Toji temple's five-storey wooden pagoda, exactly five gracefully curved tiled eaves and a slender sorin finial, plus a small low temple hall on its LEFT and a few delicate pine trees and irregular ground flecks. Match the reference's exquisite black urushi lacquer, raised polished gold and silver maki-e powder relief, extremely fine nashiji speckles, warm muted bronze wood, bright worn gold roof edges, deep black roof undersides. Oblique elevated three-quarter view matching the reference's architectural perspective, illuminated from upper left. The tower should stand around 60% of image width, with a low precinct spreading left. Entire vignette fits inside square frame with modest transparent margin, tower including finial fully visible. Organic feathered perimeter consisting of scattered gold grains, sparse tree branches and dark translucent contact shadows that dissolve into transparency. NO solid rectangular background, NO circular platform, NO pedestal slab, NO sticker outline, NO white border, NO text, NO labels, NO river, NO mountains. Avoid clean vector line art or simplified game icon; this must look like macro photography of real hand-crafted carved lacquer artwork. Do not make a literal historical reconstruction.
```

## 交接與回退

- 本輪沒有 commit／merge／push；base 仍為 11c0947，驗收綁定目前 diff，檔案雜湊與截圖尺寸列在 `.claude/phase04c/evidence.json`。
- 東寺樣板可供使用者評估；其餘十座保持原型造型，共用光照及命中修復。不應描述為整張美術定稿。
- 若回退本輪，只逆向套用本輪視覺 diff 與兩項新增測試、移除本輪新增資產；勿 reset／clean，不碰前批資料與跨市導航提交。文件要同步反映決策。
- `.claude/phase04c/` 是本機證據，不提交；另一台機器必須自行重跑重拍。
