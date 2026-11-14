# 用 ThreeRT 算蒔繪盤的參考圖

2026-11-14。使用者提供 [meshy-dev/ThreeRT](https://github.com/meshy-dev/ThreeRT)（MIT，Rust＋wgpu 的即時路徑追蹤，API 仿 three.js），問能不能接。

## 結論

- **不接進網站。** 瀏覽器版是 wasm＋WebGPU，官方只在 Chrome 跑過 hello world；WebGPU 沒有硬體光追，瀏覽器幀率沒量過，Safari／iOS 沒測。一般瀏覽器裡 ThreeRT 場景會退回普通 three.js。我們的漆面質感都是注入 three 材質的 GLSL，搬過去要全部改寫成 WGSL 材質函式。AGENTS.md §2 也只授權 three.js。
- **接成參考渲染器。** ThreeRT 自己就是拿 UE5 路徑追蹤當正確答案來校即時畫面。我們把蒔繪盤靜止時的樣子匯出成 `.glb`，在使用者家裡的電腦（Windows 11、RTX 4070，DX12 硬體光追）上算一張路徑追蹤圖，拿來對照、調整網站的 shader。網站照舊跑 three.js。

## 匯出（本 repo）

- `src/studies/toji/plate/export-glb.js`：在 CPU 上重跑 GPU 的頂點變換（`PART_MOTION_GLSL`、樹的 `TREE_*_GLSL`、地面的 `groundY`），把當下這一幀的部件、樹（幹與葉片，葉片用 coverage 做 alpha 裁切）、地面浮雕和盒身寫成 glTF。
- 只在開發伺服器、網址帶 `?three=1&export=glb` 時啟動：盤面畫 30 幀後瀏覽器會下載 `kyoto-<區>.glb`；換區會再下載一次。正式 build 不含這段（`import.meta.env.DEV` 分支會被移除，已檢查 `dist/` 沒有 GLTFExporter）。
- **帶不過去的**：梨子地的三層粉、網點切金、流水紋都是程序 shader，不會跟著匯出。地面只帶「每種材質一個顏色」的貼圖，所有表面都是一般 PBR（金屬度、粗糙度，漆面用 clearcoat）。霞帶、紐、平塗佔位的狐鳳鶯沒有匯出。所以參考圖的價值在**光**：金與金之間的反射、浮起部件的陰影與接觸暗部、漆面映出的窗光；不在細部紋理。

```powershell
npm run dev
# 瀏覽器開 http://localhost:3000/toji-study/index.html?three=1&export=glb
```

## 渲染（使用者的電腦）

1. 從 <https://threert.dev/download/> 安裝 ThreeRT for Windows（需要 DX12 ray queries，RTX 4070 符合；目前是未簽章的預覽版）。安裝包含 `threert` 指令。
2. `threert create kyoto-ref`，`cd kyoto-ref`。
3. 把 `kyoto-W_MINAMI.glb` 放進專案的 `assets/`。
4. 把範本的場景檔內容換成本 repo 的 `tools/threert/plate-reference.js`（範本是 TS 的話，副檔名改成 `.ts` 即可）。換區時改檔頭的 `WARD`。
5. `threert dev` 開視窗看；`threert shot` 存路徑追蹤收斂後的 PNG。
6. 把 PNG 給主代理，和網站同視角的截圖並排比較。

**未驗證**：ThreeRT 範本的檔案結構與資產路徑（範本在閉源 app 裡，repo 裡沒有）、場景的光量與曝光（照 ThreeRT 的 Cornell box 範例設定：窗光 6000 nits、補光 500 nits、自動曝光）。第一次跑如果太暗或太亮，調 `window_`、`fill` 的強度，或用 `camera.setManualExposure()`。

## 場景設定（`tools/threert/plate-reference.js`）

- 尺寸：蓋面寬 720 單位 → 0.45 m，接近初音料紙箱。
- 相機：沿網站的視線方向退到 4 m、用窄視角，接近網站的正交投影。
- 光：主光是網站 `KEY` 方向上 1.2 m 處的柔光窗；視線方向一盞淡淡的補光；環境是昏暗的暖色室內（漆是鏡面，環境太亮整面會反白）。
- 桌面：深色木，放在盒底。
