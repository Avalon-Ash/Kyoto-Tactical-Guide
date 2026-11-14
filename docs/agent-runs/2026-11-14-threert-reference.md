# ThreeRT 參考圖：即時畫面缺什麼光（2026-11-14，本機）

```text
任務：ThreeRT 路徑追蹤參考圖＋即時畫面光照差異報告／完成
請求模型／強度：主代理 Claude Opus 5.5；實際設定：未確認（工具未回報強度）
工作區／base SHA：C:\Git\Kyoto-Bunko，分支 claude/threert-reference，base 2a60200（origin/main）
變更檔案與行為：src/studies/toji/plate/export-glb.js 的地面材質（只在 dev 的 ?export=glb 用；網站著色未動）
檢查：見 §5
資料來源／未確認項：見 §6
問題：見 §4（PLAUSIBLE：對照的是近似場景，不是同一渲染器的 A/B）
交接：等使用者決定下一步；未 commit／push
```

## 1. 環境與安裝

| 項目 | 值 |
|---|---|
| 機器 | Windows 11 Pro 10.0.26300，RTX 4070，驅動 621.24 |
| ThreeRT | `C:\Git\_ext\ThreeRT`，`edf2768`（`git clone --depth 1`），不在本 repo |
| 新裝（使用者 2026-11-14 同意） | rustup 1.29.3（winget）、Rust 1.100.0 x86_64-pc-windows-msvc（minimal profile＋wasm32 target，`rust-toolchain.toml` 指定）、Visual Studio 2022 Build Tools C++ 工作負載（MSVC 14.44.35207、Windows SDK 10.0.26100）、esbuild 0.28.2（`C:\Git\_ext\esb`，`--no-save`） |
| 原本就有 | node 24.19.0、npm 11.17.0 |
| 編譯 | `cargo build --release --bin threert-render`：**第一次就成功**，2 分 28 秒，`threert-render.exe` 29 MB。Windows 原本無人驗證，本次為第一筆 |
| esbuild | postinstall 被 npm 的 allow-scripts 擋下，但 `@esbuild/win32-x64` 已在，`require('esbuild').build` 可用，未另外放行 |
| junction | `node_modules\esbuild`、`@esbuild` → `..\esb\node_modules\…`；`@threert\scene|gameplay|voxel` → `packages\…`（`New-Item -ItemType Junction`） |

## 2. 渲染

指令：`renderer\target\release\threert-render render out\bundles\kyoto-plate-<區>.js -o out\<變體>\kyoto-<區>.png --assets . --spp 64`，未設 `VK_ICD_FILENAMES`、`THREERT_MERGED`。

| 輸出 JSON | 值 |
|---|---|
| adapter | NVIDIA GeForce RTX 4070 |
| backend | **Vulkan**（wgpu 預設 PRIMARY 選到 Vulkan，不是 DX12；沒設 `WGPU_BACKEND`） |
| hwrt | true |
| 解析度／前處理 | 1280×720，preset cinematic，denoise atrous，自動曝光 ev100 約 6.5 |

| 變體 | 區 | 三角形 | spp | total_ms | trace_ms |
|---|---|---|---|---|---|
| 純金屬地（改前） | 南 W_MINAMI | 63,310 | 64 | 5,965（含第一次編 kernel） | 246 |
| | 右京 W_UKYO | 38,768 | 64 | 1,196 | 162 |
| | 北 W_KITA | 43,522 | 64 | 1,068 | 124 |
| 深琥珀 `#a8703a`、metal .45、rough .5（試 1，捨） | 南／右京／北 | 同上 | 64 | 1,178／1,018／1,004 | 247／134／120 |
| 淡琥珀 `#c8945a`、metal .6、rough .45、clearcoat 1／.04（試 2，**採用**） | 南／右京／北 | 同上 | 64 | 1,109／1,017／987 | 230／133／119 |

雲端 SwiftShader 4 spp 要 4 分鐘；本機 64 spp 約 1 秒。之後可直接上 1024 spp 或更高解析度。

場景：`tools/threert/plate-reference.js` 依區各複製一份為 `scenes/kyoto-plate-<區>.ts`（只改 `WARD`，三區的 bundle 可並存）。

## 3. 參考圖可信度：地面材質

`export-glb.js` 原本地面 `metalness .9`、底色白×色票，整盒像一塊金板（改前圖）。試 1「深琥珀、半金屬」整面偏橘、像塑膠；試 2 介於兩者之間，蜂蜜金、看得出透漆的厚度，也最接近 MAKIE_GROUND_PLAN §0a 的「明亮的蜂蜜金」。檔案定在試 2，註解寫明理由。

改了地之後，部件和地終於分開：純金屬版的地與部件同色同亮，接觸暗部與反光被吃掉；琥珀版才看得到下面 §4 各項。所以 §4 以試 2 為準。

## 4. 逐項對照（同區、網站暖日 1440px）

網站目前的光：`three-renderer.js` 的 `AmbientLight .55`、`DirectionalLight`（`KEY`，日 3.4）＋ `PCFShadowMap` 2048、`scene.environment` 是 three 的 `RoomEnvironment`（中性灰的房間，`environmentIntensity .55`）、`NeutralToneMapping`。部件、樹、岩是一般 `MeshPhysicalMaterial`（`physical()`，`three-renderer.js:251`），只有地面與盒身走 `three-pack.js` 的自寫光照（`mSetLight`、`mCoat`、`mRoom`）。

| # | 項目 | 參考圖 | 網站目前怎麼做 | 可以怎麼近似 | 預估成本 |
|---|---|---|---|---|---|
| L1 | 部件底部接觸暗部 | 岩腳、金堂基壇、金閣底層與地接觸處有一圈短而暗的暗部，越遠越淡；樹腳也有 | 沒有 AO；只有 `PCFShadowMap` 的投影。部件底部和地之間沒有暗線，看起來像貼紙浮在地上 | (a) 部件 shader 加「離地高度」暗化：`kyotoMotion` 已知 `foot` 與高度，`smoothstep(0, h0, height)` 乘 diffuse；(b) 地面在 `bake.js` 另烘一張接觸 AO（部件足跡做距離場再模糊），`mLight()` 乘上去 | (a) 每頂點／片段幾個 ALU；(b) 每區烘一次（數 ms）＋地面多一次貼圖取樣，不影響幀時間 |
| L2 | 屋簷底面的金地反光 | 五重塔、金閣各層屋簷的底面與牆身被金地照亮，帶暖橘；金堂基壇整條發橘光 | 屋簷底面只收到 `RoomEnvironment` 下半球（灰）與 ambient 白光，讀成暗褐或黑框 | (a) 部件材質 `onBeforeCompile` 加地面反彈：`max(-n.y,0)` × 地面平均色（`M_AMBER` 一帶）× 鍵光照在地上的量；(b) 每區用 `CubeCamera` 拍一次盤面做 PMREM，取代 `RoomEnvironment` 給部件用 | (a) 片段幾個 ALU；(b) 換區時多一次 6 面渲染＋PMREM（約數十 ms），執行時無額外成本，但要處理移光時環境不跟著動 |
| L3 | 漆面窗光的寬度與強度 | 窗光是一大片柔和的亮面，蓋過蓋面的三分之一以上，由前左往後右漸暗；部件頂面（屋頂）正對窗的地方亮到近白 | `mSetLight` 的 `mBand = exp(-s*s*2.2)`，`s` 乘 6.5，帶很窄；`mCoat()` 裡只占 `mKeyC*mBand*.075`，另外 `mRoom(0.)*.045`；梨子地粉在帶內 ×`(1+2.2*mBand)`。截圖靜止時幾乎看不到 | 把 `s` 的 6.5 降到約 2.5、係數 .075 提到 .2–.3，並用 `mRoom` 的 `win` 項當窗形；上限夾住，維持「不洗白建築」（GROUND_PLAN D2 的驗收） | 只改常數，零成本；要和移光一起在實機看 |
| L4 | 陰影的軟硬 | 窗是 0.9×0.6 m 面光、距 1.2 m（約 40°），影子短而軟，接觸處最暗、往外很快散掉 | `PCFShadowMap`、2048、`normalBias 1.2`，影子邊緣硬而長（五重塔的影子投到右後方一大片） | `PCFSoftShadowMap` 或 `VSMShadowMap`＋`shadow.radius`／`blurSamples`；或保留硬影但把影子淡化（陰影項 `mSh` 混一點 ambient），讓 L1 的接觸暗部負責「貼地」 | 換 shadow 類型：每個接收面多幾次取樣，手機要量；VSM 多一次模糊 pass |
| L5 | 盒側受到的反光 | 盒側（正面）偏暗，下緣映出暗桌面，上緣有一條亮的倒角；側面明顯比蓋面暗一階 | `BOX_MATERIALS.side`（metal .72、clearcoat 1、`nashijiSide`）在 `RoomEnvironment` 下整面均勻明亮；網站沒有桌面，盒側反射的是灰房間 | 盒側 shader 用反射向量 `r.y<0` 的部分混一個暗的「桌面色」，`r.y>0` 混房間色；或直接把 `side` 壓暗一階，留倒角（`edge`、`rim`）亮 | 幾個 ALU；是美術決定（網站背景是和紙，不是桌） |

其他看到的：參考圖的屋頂頂面因為窗光直射金屬而接近白色（自動曝光下的高光），網站的屋頂反而控制得比較好，這點不該照抄。

並排圖（不提交，都在 `.shots/threert/`）：

| 檔案 | 內容 |
|---|---|
| `compare-W_MINAMI.png`、`compare-W_UKYO.png`、`compare-W_KITA.png` | 網站｜改前（純金屬）｜改後（試 2） |
| `detail-W_MINAMI.png`、`detail-W_KITA.png` | 金堂與五重塔、金閣與池的放大對照 |
| `site-<區>-day-1440.png`、`site-<區>-day-canvas.png` | 網站原始截圖（整頁與畫布） |

參考圖原檔：`C:\Git\_ext\ThreeRT\out\{metal,amber,amber2}\kyoto-<區>.png`；glb：`C:\Git\_ext\glb\{metal,amber,amber2}\`。

## 5. 檢查

改 `export-glb.js` 之後（日誌 `.shots/threert/gates.log`，不提交）：

| 命令 | 結果 |
|---|---|
| `npm run lint` | exit 0（5 秒） |
| `npx --no-install tsx validate_data.js` | exit 0，ERROR 0／WARN 0 |
| `npm test` | exit 0；`scripts/*.test.mjs` 122/122、`src/lib/*.test.ts` 6/6 |
| `npm run build` | exit 0（3.9 秒） |
| `grep -r "GLTFExporter\|export-glb\|ground-nashiji" dist/` | 0 筆 |

網站著色（`three-pack.js`、`three-renderer.js`）未改，所以沒有重拍網站截圖做驗收；`?export=glb` 匯出三次都成功（glb 標頭 `glTF`、長度欄位與檔案大小一致）。

## 5a. 追加：試 L3 漆面窗光（使用者同日要求）

只改 `three-pack.js` 的地面光照（`mSetLight`、`mCoat`、`mNashiji`）；部件、樹、岩的著色未動。常數抽成 `M_BAND_*`、`M_SHEEN_*`。

| 版本 | 內容 | 結果 |
|---|---|---|
| 改前 | 窄帶 `exp(-s²·2.2)`，白光 `.075` | 靜止時幾乎看不到光帶 |
| 試 1（捨） | 帶加寬（寬度 .9、跨蓋面衰減 ×.65、掃動 4.5），白光 `.26` | 整片蓋面被加白，乳白偏粉、沒有窗的形狀；夜間變灰藍 |
| 試 2（採用） | 兩層：漆面窄帶維持原形，白光 `.14`；粉下另加寬的金色泛光 `mSheen = exp(-s²·.35)`，乘在梨子地本體（×(1+.55·mSheen)）並加強帶內的粉；夜間兩層都乘 .45 | 蓋面變亮偏暖、飽和度保住，左後到右前有柔和漸層；夜間仍是暖金；建築不受影響 |

截圖（不提交）：`.shots/threert/band/`，`grid-after2.png`（改前｜試 2，南區日間靜止、兩個移光位置、夜間，北區日間）、`grid-after1.png`、`grid-rest.png`（三版並排）。拍法：`?three=1`、1440×900、無頭 Chrome（d3d11）、畫布裁切。

檢查：`npm run lint` exit 0；`validate_data.js` ERROR 0／WARN 0；`npm test` 122/122、6/6；`npm run build` exit 0；dist 無 GLTFExporter；拍照期間 console 無錯誤。

未驗證：傾斜（拖曳）時光帶掃過的手感（掃動常數沿用 6.5，沒改）、手機 375px、實機。

## 6. 未驗證與限制

- 參考場景與網站不是同一個光：網站是方向光＋灰房間 PMREM；參考圖是面光窗＋補光＋暖色暗房，加一張深色木桌。L4、L5 的差異有一部分來自這裡，不全是網站缺的。
- 相機：參考圖是 4 m 外的窄角透視，網站是正交投影；構圖與盒子位置不完全一致（參考圖盒子比較大、偏右下）。
- 程序紋理（梨子地三層粉、切金、流水）不會匯出，所以參考圖不能拿來判斷紋理，只看光。
- 網站截圖是 `?three=1`、暖日、一般動態、滑鼠不在畫面上（燈不在場），等待 3.5 秒後拍；不是 `still` 模式。南區截圖時 `frames=5`，已目視確認畫面完整。
- 匯出的 glb 沒有霞帶、紐、狐鳳鶯佔位（MAKIE_THREERT_REFERENCE.md 既有限制）。
- DX12 路徑沒試（wgpu 選了 Vulkan）。
- 只算 64 spp；沒做收斂測試。
- 換區匯出時，經過的中間各區也會被下載一次（`export=glb` 每次換區都觸發），已刪除，只留三區。

## 7. 追加：L1、L2（agy 實作，2026-11-14 晚）

```text
任務：L1 接觸暗部、L2 金地反彈／完成（L2 效果有限，見下）
請求模型／強度：gemini-4-hydrogen-high（agy，Gemini Models 池）；實際設定：agy 日誌 model="gemini-4-hydrogen-high"
工作區／base SHA：C:\Git\_wt_kyoto_parts（agy/parts-light）／e053e47；派工單 .claude/dispatch/L1L2.md（不提交）
變更檔案與行為：three-pack.js：PART_MOTION_GLSL 傳出 vLift（部件離地高度），新增 PART_LIGHT_GLSL（K_CONTACT_*、K_BOUNCE*）；
  three-renderer.js：patchMaterial 只對部件（kyotoMotion）在 aomap_fragment 後壓暗近地的間接光與一半直射漫射（L1），
  並依半球權重 .5-.5·dot(n,up) 加上金地反彈（L2）；樹、地、盒身、深度材質未動
檢查：agy 與主代理各自重跑 lint／validate（ERROR 0、WARN 0）／test 122+6／build，全部 exit 0；agy 無 denied_actions；主資料夾在派工期間無變動
問題：L2 依 agy 照單實作的「只照朝下面」版本，畫面看不出差別（PLAUSIBLE：朝下的屋簷底面在俯視角幾乎不可見）；
  主代理改成半球權重、強度 .6→1.2→.8 各拍一次，仍只有微弱差異：牆身多是黑漆窗格，加在材質色上的反彈幾乎為零。
  參考圖的建築看起來亮，主要來自屋頂頂面映窗光，不是地面反彈
交接：未 commit；截圖 .shots/threert/band/detail-l12-*.png、grid-l12.png（不提交）
```

L1 有效：岩腳、金閣與五重塔基部的暗部接近參考圖。下一個能讓建築接近參考圖的是屋頂頂面的窗光（部件的 clearcoat／key specular），不是 L2。

## 8. 追加：部件光照長鏈（p1–p4，2026-11-14 晚）

```text
任務：p1 屋頂窗光、p2 軟陰影（L4）、p3 盒側壓暗（L5）、p4 岩與樹幹的切金與金銀兩面／完成
請求模型／強度：p1–p4 gemini-4-hydrogen-high（agy，Gemini Models 池）；p4 原派 claude-sonnet-5-5-medium（agy）兩輪失敗後換模型
工作區／base SHA：C:\Git\_wt_kyoto_parts（agy/chain）／51b1d91；串接腳本與證據在 .claude/dispatch/chain/（不提交）
變更檔案與行為：
  p1 three-pack.js PART_LIGHT_GLSL K_WIN、K_WIN_SOFT；three-renderer.js 部件 aomap 區塊加窗反射（受粗糙度與夜間收斂）
  p2 three-renderer.js SHADOW_SOFT 6（shadow.radius）、SHADOW_STRENGTH .8（shadow.intensity）；r186 已移除 PCFSoftShadowMap
  p3 three-pack.js BOX_MATERIALS.side 改暗、BOX_SIDE_FRAG_GLSL 乘 K_SIDE_DIM .82；rim、edge 不變
  p4 three-pack.js PART_KIRIKANE_GLSL；three-renderer.js 岩體（spec.name 'mura'，即 rock-mesh.js 的 bodyMat）受光金、背光氧化銀＋依受光度大小疏密的菱形切金；
     樹幹（patchLimbMaterial）同樣的切金與背光偏銀。主代理調整：K_ROCK_LIT_LO/HI .20/.74→-.35/.30、K_ROCK_OXID_SCALE .88→.62、K_TRUNK_OXID_STRENGTH .78→.4
     （交件版岩體大半讀成白銀、樹幹褪色）
檢查：每包由腳本跑 lint／validate／test／build（全 exit 0，validate ERROR 0／WARN 0，test 122+6）並拍 5 個鏡頭；整合後主代理重跑一次，同樣全過，dist 無 GLTFExporter
問題：
  - 乾跑 p0 第一次抓到截圖腳本的錯（埠號放進單引號字串，沒展開），修正後重跑；p1 之後未受影響（CONFIRMED）
  - agy 的 Claude 模型讀檔走 Bash，允許清單只放行完全相同的字串，第一步就被拒、整個執行結束；加提示也一樣（CONFIRMED，兩輪）。這類流水線只派 Gemini
  - L4 的手機幀時間沒量；PCF radius 不增加取樣數，預期成本不變（PLAUSIBLE）
  - 背光的銀面在網站的俯視角裡多半看不到；要讀出「金銀兩面」可能得靠移光或放大
交接：已依使用者授權併入 main 並 push（見 git log）
```

## 9. 追加：換盒不卡（p5，2026-11-14 晚）

- 量測（開發模式，`?three=1`，CDP longtask＋rAF 間隔，每種 2–3 次換盒）：

  | | 換盒長任務（前） | 最長幀間隔（前） | 換盒長任務（後） | 最長幀間隔（後） |
  |---|---|---|---|---|
  | 桌機 | 121–150 ms | 121–167 ms | 無 | 25–46 ms |
  | CPU ×4（模擬手機） | 526–671 ms | 525–675 ms | 換盒本身 0–1 ms | 146–192 ms（背景預建） |

- 做法：setWard 拆成 `buildWard`（generator，8 個 yield 點）與 `activate`；快取 3 盒；換盒後 0.9 秒起用 requestIdleCallback 逐步預建左右鄰盒，建好後 `initTexture` 與 `compileAsync` 預熱。agy（gemini-4-hydrogen-high）實作；主代理加了延遲並拿掉 idle 的 timeout。
- 未解決（PLAUSIBLE）：慢 CPU 上預建的單步（identMaps、preparePlate）仍約 100–190 ms，換盒後約 2 秒內會有幾次小頓。徹底解法是把烘焙搬進 Worker（OffscreenCanvas），屬下一輪。未在實機量。
