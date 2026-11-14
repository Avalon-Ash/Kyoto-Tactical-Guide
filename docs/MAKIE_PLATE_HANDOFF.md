# 蒔繪浮雕盤・交接

更新：2026-11-13 深夜（P3 部署後，W1–W4 完成，未 push）。接手者先讀 `../AGENTS.md`、`HANDOFF.md`，再讀本檔。本檔只講首頁文箱改畫為蒔繪浮雕盤這條工作線。**接手要做什麼，直接看 §8。**

逐輪紀錄（由舊到新）：[雲端 P0–P1](agent-runs/2026-11-12-makie-plate-p0-p1.md)、[本機接續](agent-runs/2026-11-12-makie-plate-p1-local.md)、[P2](agent-runs/2026-11-13-makie-plate-p2a.md)、[P3 前半](agent-runs/2026-11-13-makie-plate-p3a.md)、[P3 後半（Codex 八區）](agent-runs/2026-11-13-makie-plate-p3b-astra.md)、[P3 收尾](agent-runs/2026-11-13-makie-plate-p3c.md)、[驗收與程式審閱（Codex）](agent-runs/2026-11-13-makie-plate-verify-astra.md)、[P3 晚間（造形修整與修正）](agent-runs/2026-11-13-makie-plate-p3d.md)、[W2（Codex）](agent-runs/2026-11-13-makie-plate-w2-astra.md)、[W2 第二輪（Codex）](agent-runs/2026-11-13-makie-plate-w2b-astra.md)、[W3（agy）](agent-runs/2026-11-13-makie-plate-w3-agy.md)、[W4 補驗（agy）](agent-runs/2026-11-13-makie-plate-w4-agy.md)、[W2 第三輪（Codex，中途額度用盡）](agent-runs/2026-11-14-makie-plate-w2c-astra.md)。

> **2026-11-14 起改走 three.js**：目前狀態、設計語言（初音調度）、工作包與待辦都在 [`MAKIE_THREE_PLAN.md`](MAKIE_THREE_PLAN.md)（§2a 設計語言、§7 進度）。網址加 `?three=1` 用新渲染器，舊管線仍是預設。其他物件的網格重構（p1 鳥居與柱網、p2 屋宇與塔、p3 燈籠）的設計在 [`MAKIE_REBUILD_PLAN.md`](MAKIE_REBUILD_PLAN.md)。流水線檢討在 [`agent-runs/2026-11-14/pipeline-retro.md`](agent-runs/2026-11-14/pipeline-retro.md)。本檔以下是 11/13 以前的紀錄。

## 1. 現況一句話

**十一區都已是 WebGL2 浮雕盤，已併入 `main` 並部署到 GitHub Pages**（2026-11-13，使用者分別同意合併與 push）。P0–P3 完成。使用者確認「形意方向對」。之後（同日深夜）：W1 使用者回報效能與視覺沒有意見；W2 造形精進兩輪、W3 輸入防呆、W4 補驗與它抓到的換函空白（W4-01）都已 commit 在工作分支（`4a9058e`、`ac06b40`、`766a43a`、`be8cd16`），**尚未合併 `main`、尚未 push**。剩下的是 §8.0a 的待辦與尚未開始的 P4（效能、降級、刪舊浮雕）。沒有 WebGL2 的裝置仍走舊的浮雕網格。

## 2. 取得程式

```powershell
Set-Location C:\Git\Kyoto-Bunko
git fetch --prune; git status -sb; git log --oneline -5
npm ci        # 只有 node_modules 不在或 package-lock 變了才需要
npm run dev -- --host 127.0.0.1 --strictPort   # 3000 埠；Claude 桌面版用 preview_start {name:'dev'}
```

| 項目 | 值 |
|---|---|
| 分支 | `claude/great-brahmagupta-ye2uqt` 比 `main` 多 W1–W4 的四個 commit 與本檔更新（未 push）。後續工作在後者或新分支上做；**合併進 `main`、push 各自要使用者同意，分開問** |
| 線上版 | GitHub Pages，由 `.github/workflows/deploy.yml` 在 `main` 被 push 後自動部署；`gh run list --branch main --limit 1` 看結果 |
| 預覽 | 首頁 `/`（嵌入模式：三函同框、拖曳換函、閒置巡光）；獨立展示頁 `/toji-study/index.html`（有日夜、暫停、換函按鈕，截圖用這頁） |
| 交接當下的 HEAD | 以 `git log -1` 為準；本檔所在的 commit 就是交接點 |

## 3. 使用者已定案的事

1. 舊版立體建築只當造形借鑑，新版全部重畫為蒔繪。
2. 設計語言是初音調度：肉合研出蒔繪，輔以各種梨地與刑部地、切金切銀、平文，少許青貝。
3. 所有有體積的物件都要有動態與互動。
4. 部品體積要「誇張」。參考：故宮 3D 文物的百寶嵌文具盒（嵌件厚、圓、明顯高出地子，箱側也有紋飾）<https://theme.npm.edu.tw/3d/Content.aspx?sno=04009258&l=1>
5. WebGL2 為基線；要有鶯。
6. 分工：技術與美術由主代理做（靜寫、蒔看成品、內部來回後才交付）；agy 只做雜工。
7. 換函要有軌跡光與回饋感、背景要加環境光影（尚未開始，見第 8 節）。
8. 部品不能像紙片：要厚實的積體感，像 2D 轉 3D 的真實微縮模型（2026-11-12 看過第一版後）。
9. **形歸形、意歸意**（2026-11-13）：立體只做「一眼認得出」的大形；膨脹保不住的特徵不放大成怪形，改用平嵌在蓋面的切金、切銀、青貝意象。起因是楓被畫成「棍子頂三片巨葉」，使用者說「樹不像樹」。使用者後來說「形意方向對，蒔把控的好就繼續」。細則在 §6。
10. **暫停＝所有物件不浮起，光的撫摸互動照常**（2026-11-13），不是整個畫面凍結。系統的減少動態走同一條路。
11. 影子要從部品的根長出來、要落在別的部品上、部品之間不能穿插（2026-11-13）。做法參考了 `C:\Git\oil-paint` 的深度圖陰影。
12. 美術取捨由主代理（蒔）判斷後直接改，改完給截圖，不必逐項先問（2026-11-13「給蒔判斷要改就改」）。
13. 2026-11-13 使用者兩次指名把工作派給 Codex 的 Astra：八區的構圖與實作、以及「靜的工作都派給 Astra，最後一起審」（驗收與程式審閱）。理由是那邊額度多。這比第 6 點寬；之後要不要照做，以使用者當次的話為準。

## 4. 架構

所有新程式在 `src/studies/toji/plate/`。

> **2026-11-14 起樹走另一條管線**：幹與枝是骨架掃出的半管網格（`limbs.js`），葉與針是程式畫出的蒔繪印記表上的 instanced 印記（`stamps.js`、`trees.js`、`tree-shaders.js`），說明在 [`MAKIE_STAMPS.md`](MAKIE_STAMPS.md)，參考在 [`MAKIE_REFERENCES.md`](MAKIE_REFERENCES.md)。下面講的「膨脹」（模糊剪影＋`body()`）只剩地子、建築、岩、霞、箱子在用；它做不出細枝與分開的小葉，這是前四輪樹失敗的原因。

| 檔案 | 職責 |
|---|---|
| `vocab.js` | 繪畫語彙，只產生純資料部品（多邊形與折線），不碰 DOM。**地子**：`hill`、`stream`、`pond`、`gardenGround`、`sandGarden`、`stoneSteps`、`steppingStones`、`moonDeck`、`shell`。**霞與岩**：`suyari`、`rock`、`moatWall`。**屋宇**：`roof`、`storey`、`pagoda`、`hall`、`romon`、`sanmon`、`karamon`、`corridor`、`kakezukuri`、`torii`。**樹**：`pine`、`maple`、`ginkgo`、`courtTree`（後三者共用內部的 `broadleaf`）。**其他立體**：`fox`、`bird`、`phoenix`、`lantern`、`sandCone`。**平嵌意象**：`fallenLeaves`、`fallenFans`、`petals`、`fruits`、`moon`、`pawPrints`（共用內部的 `scatter`） |
| 十一個區檔 | 各區構圖：呼叫語彙排出部品。部品數：南 52、伏見 37、東山 32、北 32、右京 29、西京 35、左京 32、上京 45、下京 31、中京 44、山科 38（上限 63）。南、伏見、東山由主代理構圖；其餘八區由 Codex 構圖，主代理之後改過樹、意象與若干小件 |
| `parts.js` | `PLATES` 登記表、`preparePlate` 驗證、`partAt` 點選查表、`createLife` 彈簧模擬 |
| `spring.js` | 臨界阻尼（不回彈）與欠阻尼（小回彈）彈簧 |
| `bake.js` | Canvas 2D 烘焙成貼圖，並產生部品編號圖 |
| `shaders.js` | GLSL ES 3.00；同一份片段著色器依 `MODE` 編成數支精簡版本 |
| `renderer.js` | WebGL2 繪製流程、箱體網格 `buildBox`（含紐金具、懸子）、部品實體網格 `solidMesh` |
| `cord.js` | 組紐：節點鏈模擬與管狀網格，純函式 |

接線點：

- `src/studies/toji/renderer.js`：先取 `webgl2`，取不到退 `webgl`。`hasPlate(ward)` 為真就交給浮雕盤，否則畫舊網格。十一區都登記後，舊網格只剩「沒有 WebGL2」與「浮雕盤建構失敗」兩種情況會用到。浮雕盤建構失敗會 `console.warn` 並全面退回舊網格。
- `src/studies/toji/study.js`：每幀多傳 `presence`（手或閒置光是否在場）；近觀單點呼叫 `poke`。
- `src/studies/toji/bunko.css`：`canvas[data-plate="true"]` 關掉 CSS `drop-shadow`。

### 部品與層

- 盤面座標：x 向右 ±360，z 向下（朝觀者）±230，是一張正面觀看的畫。
- `layer 0` 是地子本身（土坡、流水、青貝），只會隆起，不會立起。
- `layer 1–3` 是貼圖槽：1 放霞與岩，2 放堂、塔、松幹，3 放葉簇與鶯。同一槽內靜止的部品可以重疊；會擺動的部品之間要留間距。
- 每個部品的欄位：`kind`、`group`、`order`、`mat`、`thick`（厚度）、`bias`（沿法線的微偏移）、`reach`（編號圖外擴）、`attach`（搭在哪一組上，鶯用）。
- 一組部品共用一條「腳線」（該組畫面最低的 z）。立起就是整張畫沿腳線往上掀。
- 實體：每組每層一張 2 單位的網格（`solidMesh`），頂點沿部品法線推出 `厚度 × body()`。`body()` 由模糊剪影決定：畫的輪廓外約 2 單位起一道圓牆，往內是圓頂；太細而鼓不起來的形狀（相輪、鶯腳）保留一層薄體。同組相鄰部品共用網格，之間沒有縫。
- 編號圖的 `reach` 現在也是牆的空間：立起的部品 `reach` 至少 4（細格子如懸造用 3）。
- 躺著的部品跟著底下的土坡起伏，立起後整條腳線貼地（`shaders.js` `partVert` 的 `gy`）。
- 疊在別的部品上的層用 `bias` 墊高，沉睡時也保留六成；`bias` 要大於底下那層實際鼓起的高度（松葉 9 起、鶯 32）。
- 形狀要夠大才立得起來：寬度小於約 10 單位的缺口會被膨脹填平，尖角會被磨圓，小而密的形狀會鼓成球（所以小鳥居沒有額束、樹冠是一團而葉形只用線刻）。`lines` 只畫在表面，不影響實體。
- **盤面是斜著看的**：立起的部品會擋住它後方（z 較小）的地子。平嵌的意象要放在立體部品的前方或空地上，否則看不到（左京的月試了三個位置都被觀音殿擋住，最後放進池裡）。
- 地板類的東西（月見台、石階、砂庭、池）屬於地子，做成 layer 0，不要立起來。

### 繪製順序（`renderer.js` 的 `draw`）

0. 陰影的深度圖：實體網格從燈的上方多畫一次，只寫深度（`renderer.js` 的 `shadeMatrix`、`SHADE_SIZE`、`SHADE_H`）。
1. 箱子落地影、箱體、組紐、蓋面地子（地子頂點依模糊高度位移）。地子查深度圖得到影子。
2. 部品實體：先只寫深度（alpha-to-coverage 處理輪廓），再用 `EQUAL` 深度測試上色，每個取樣只著色一次，同樣查深度圖，所以部品的影子會落在其他部品上。部品之間的前後由深度緩衝決定，不再靠層序。
3. 霞：半透明，最後畫，不寫深度。

### 貼圖

| 貼圖 | 內容 |
|---|---|
| `fine`（RGBA8 陣列，4 層） | R 未模糊的隆起、G 清晰浮雕、B 線描、A 覆蓋 |
| `soft`（R16F 或 R8，四分之一解析度） | R 經 GPU 高斯模糊；地子用它當土坡高度，立起的部品用它當枕形剖面 |
| `ident`（RG8，二分之一解析度，最近點取樣） | R 部品編號、G 材質；CPU 端同一份資料用於點選 |
| `shade`（DEPTH24，2048²，比較取樣） | 燈所見的實體深度，每幀重畫 |

寬度：畫布寬小於 700px 用 1152，否則 1536。

### 換函、暫停與背景（P2，`study.js`、`template.ts`、`bunko.css`、`backdrop.js`）

- 軌道：舞台上緣十一枚切金刻度（`#track`），目前函的刻度亮；拖曳時軌跡光跟著箱子走，放手後約半秒沉回，換函時滑到新刻度。
- 過門檻回饋：位移達 `switchDistance` 時下一函的刻度發亮、箱子輕頓（`scale .985`）、裝置支援時短震 10 ms。減少動態時只留刻度發亮。
- 三函同框（`ghosts`、`placeTrack`、`slide`、`snapshotNeighbours`）：左右鄰函各是一張用同一個渲染器畫的**靜止圖**（不是即時渲染），放在軌道兩側（間距為畫布寬的 0.82）跟著箱子平移；換函時整條軌道滑動，鄰函到中央的同一個 task 內由即時畫面接手。快照在換函、日夜切換、尺寸改變後 350 ms 重拍；重拍會重烘目前這一區，部品會從沉睡重新醒一次。只在首頁（`embedded`）啟用；展示頁與減少動態是淡出淡入／直接換。鄰函靠近時不會對光有反應。
- 暫停／減少動態（`still()`＝使用者按暫停或系統 `prefers-reduced-motion`）：`parts.js` 的 `update` 在 `still` 時把每個部品的 `stand`、`lift`、`sway`、位移歸零（全躺平、霞不漂），箱子不傾、繩不擺、不自動巡光、換函與開蓋不做動畫；**指標位置、光跡、材質對光的反應照常**（`study.js` 的 `tick` 不再把 `px`／`py` 歸零，`addTrail` 不再因 `still` 跳過）。狀態列文字在 `study-chrome.js` 的 `still`。
- 背景：障子格光（左上斜落的窗格光）、卓面的暗光澤與箱底的金色反光（`backdrop.js` 的 `paintRoom`，色與強度在 `BACKDROP_PALETTE` 的 `shoji*`、`table*`、`gleam*`）。
- 閱讀頁（`DetailView.tsx`）按 Esc 等同返回鈕；有自己處理 Esc 的面板（地圖的面板會 `stopPropagation`）優先。

## 5. 調整旋鈕

| 想調什麼 | 位置 |
|---|---|
| 立起角度上限（弧度） | `parts.js` 的 `HINGE`：屋宇 `1.2`（約 69 度）、松與鶯 `1.1`（約 63 度）；2026-11-13 使用者要求「再誇張一點」，由 `.92`／`.84` 加大 |
| 靜止時的微仰 | `parts.js` 的 `STAND_REST = .14` |
| 停留多久觸發 | `parts.js` 的 `DWELL_MS = 400` |
| 立起、沉回的快慢 | `parts.js` `update` 裡 `stepSpring(s.stand, …)` 的 `5.5`（起）與 `2.4`（落）；塔每層再除以 `1 + order * .28` |
| 各物件的招牌動作 | `parts.js` 的 `act` |
| 部品厚度 | `vocab.js` 各語彙的 `thick`：預設 24、岩 30、松幹 16、葉墊 24、鶯 16、窗 15 |
| 實體的剖面（牆多陡、頂多圓） | `shaders.js` 的 `BODY`（`bodyS`、`body`） |
| 沉睡時保留多少厚度 | `shaders.js` `partVert` 的 `thick=aPart.w*mix(.72,1.,A.z)*mix(.78,1.,A.y)` |
| 土坡隆起高度 | `shaders.js` 的 `SWELL = 17`（頂點與片段著色器各一處，要同步） |
| 環境光、主光、手邊光池 | `shaders.js` 的 `AMB`、`KEY`、`POOL`；光池範圍在 `setLight` 的 `d2/24000.` |
| 日夜的光色 | `shaders.js` `setLight` 的 `gKeyC`、`gPoolC`、`gAmbC`（夜間主光偏冷、手邊光近白，金只在手邊醒來） |
| 金屬反射的房間 | `shaders.js` 的 `room()` |
| 金、淡金、銀、漆、琥珀漆的顏色 | `shaders.js` 的 `GOLD`、`PALE`、`SILVER`、`LACQ`、`AMBER` |
| 梨地三層深度的顏色與密度 | `shaders.js` 的 `nashiji()`；地子密度是 `main` 裡的 `dens=.60+.16*vnoise(…)` |
| 漆面高光 | `shaders.js` 的 `coat()` |
| 光源高度 | `renderer.js` 的 `LAMP_H = 70` |
| 影子的長短（投影用的燈高，越高影子越短） | `renderer.js` 的 `SHADE_H = 380`；必須高過所有立起的部品 |
| 影子的濃淡、邊緣軟硬 | `shaders.js` 的 `SHADE = .86`；`shadeAt` 的取樣間距 `1.5` 與 `renderer.js` 的 `SHADE_SIZE` |
| 部品立起後留在蓋面的研出影像還剩多少 | `shaders.js` MODE 1 的 `print`（`1.-.8*smoothstep(…)`） |
| 實體網格密度 | `renderer.js` `solidMesh` 的 `cell`（預設 2 單位，南區約 14 萬頂點） |
| 組紐長度、粗細、位置 | `cord.js` 的 `nodes`、`seg` 與 `cordTube` 的半徑；`renderer.js` 的 `FITTINGS` |
| 組紐對拖曳與換函的反應 | `renderer.js` `draw` 的 `pull`（`* .5`）與 `kick`（`* 420`） |
| 箱側紋飾 | `shaders.js` `MODE==0` 的 `m==20` 區塊 |

## 6. 構圖與造形的規則

測試會擋的（`scripts/plate.test.mjs`）：

- 每區部品 ≤ 63（`MAX_PARTS = 64`，0 號是地子）；id 不重複；沒有 NaN 點。
- 每區恰好一隻鶯、兩個棲點；八個新區另檢查鶯的兩隻腳落在載體的填色輪廓內。
- 不同組的立體部品（layer > 0、非霞；鶯與載體算同一組）外框不得重疊；八個新區另要求至少 12 單位的間隔。要讓幾樣東西成為一體（本堂坐在舞台上、南面回廊與門），給同一個 `group`，整組共用一條腳線。
- 八個新區：立體部品在 ±360／±230 內、地子在 ±372／±232 內；留白 26%–46%（8 單位網格估算）。

測試不會擋、但要守的：

- 大約三分之一的蓋面留白。留白是構圖的一部分。
- 每區的骨架不重複：南＝中央的塔；伏見＝對角線；東山＝懸空的一大塊；北＝水平倒影；右京＝近堂、池、遠山三段；西京＝書院沿池錯落；左京＝雙層殿對砂灘；上京＝圍合的院子；下京＝雙堂與大樹；中京＝雁行；山科＝中軸石階。
- **形歸形、意歸意**：新增物件時先讓立體是普通、認得出的形，再問「它的意象能不能落在地上」。樹是分叉的樹幹加一團樹冠（`broadleaf`），葉形線刻在樹冠上，地上撒落葉。
- 金是主角，銀與青貝點綴。
- 同一種意象不要在兩區重複（目前左京、西京都用水中月，是待修項）。

新增一區或一個語彙的步驟：在 `vocab.js` 加函式（照既有寫法：`part(id, KIND.x, layer, mat, anchor, {group, order, thick})`，往 `fills`／`lines` 推形狀，回傳陣列）→ 區檔呼叫 → `node --test scripts/plate.test.mjs` → 截圖看（§7 的工具）→ 改到滿意 → 四項檢查。**不改測試來讓構圖過關，改構圖。**

## 7. 驗證狀態與工具

### 交接當下的檢查

| 檢查 | 結果 |
|---|---|
| `npm run lint` | exit 0 |
| `npx --no-install tsx validate_data.js --strict` | exit 0；ERROR 0、WARN 0 |
| `npm test` | exit 0；`scripts` 92/92、`src/lib` 6/6 |
| `npm run build` | exit 0 |

四項在交接文件這筆 commit 的工作樹上全部重跑過（原始碼與 `0a7929f` 相同，之後只加了文件與一支不進 build 的截圖腳本）。**接手第一件事仍是四項重跑一次，確認起點是綠的。**

### 已驗（本機無頭 Chrome，AMD 內顯 D3D11，WebGL2）

Codex 逐張看過 193 張截圖，明細在[驗收報告](agent-runs/2026-11-13-makie-plate-verify-astra.md)：

- 十一區：1440 暖日、375 暖日與月光、暫停（光停兩個位置）、2.5 倍近觀、減少動態下換函。
- 首頁：1440 與 375 各換函一整圈，鄰函順序正確、無殘影；開蓋與返回（南、右京、西京、山科）；中日與日夜切換（南）。
- console：錯誤 0、例外 0。
- 幀時間：每區平均約 17.6 ms、最差約 18.6 ms（1440 與 375 相同）。**這是桌面無頭 Chrome 的參考值，不代表手機。**
- 主代理另外看過十一區的 1440 月光全景與若干近觀，並用實際按鍵驗過「Enter 進閱讀頁、Esc 回同一區、焦點回文箱」。

### 已驗（W4，agy Hydrogen，2026-11-13，`9b2c31b`；明細見 W4 報告）

- 首頁鍵盤開蓋、閱讀、Esc 返回：伏見、東山、北、上京、左京、中京、下京七區都回到同一區、焦點回文箱。
- 減少動態下十一區開蓋與 Esc：直接切換、部品躺平。
- 文箱焦點框（1440 與 375）：金框完整在舞台內側。
- 沒有 WebGL2：十一區都退回舊浮雕、`plate` 為 `false`、無錯誤。連 WebGL 都沒有：顯示 `bunko_failed` 文字、無例外。
- 拖曳換函（南→右京）：抓到 W4-01（放手後文箱滑離滑鼠觸發 `pointerleave`，把軌道拉回，鄰函消失約半秒），`4a9058e` 修好並重拍確認。

### 未驗

- 線上版本身、實體手機觸控與幀率、iOS Safari。
- 換函只驗了南→右京一個方向，取樣間隔約 0.4 秒；開蓋中間幀；最大倍率下逐幀閃爍。
- W2 之後十一區鶯的第二棲點逐點近觀（Codex 的點選工具在部分區取不到棲點）；W2 之後的手機寬度全區複查。
- 修整後的造形在手機寬度與暖日下的樣子（Codex 的 193 張是在 `554bf25` 拍的，涵蓋了這些修整；主代理自己只看了 1440 月光）。

### 截圖工具

`scripts/plate-shot.mjs`：經 DevTools 協定操作無頭 Chrome，不需要 Playwright。

```bash
node scripts/plate-shot.mjs C:/Git/Kyoto-Bunko/.shots/<資料夾> <job> [job…]
# job = 名稱:步數:主題:寬x高:倍率:fx,fy
node scripts/plate-shot.mjs C:/Git/Kyoto-Bunko/.shots/try kita:5:night:1440x900:1:0.42,0.4 yam-zoom:3:day:1440x900:2.6:0.62,0.66 fushimi-still:4:night-still:375x812:1:0.5,0.5
```

- 步數：從南區按「下一函」幾次（負數按「上一函」）。**南 0、右京 1、西京 2、山科 3、伏見 4、北 5、上京 −5、左京 −4、中京 −3、東山 −2、下京 −1。**
- 主題：`night`、`day`，加 `-still` 是先按暫停。倍率 1–3。`fx,fy` 是光停在畫布上的比例位置。
- 輸出每張的 `#scene` dataset（`ward`、`plate`、`parts`、`still`…）；有 console 錯誤會印 `CONSOLE:`。先確認 `ward` 是你要的區。
- 需要 dev server 在 3000。腳本找不到 9377 埠的 Chrome 會自己開一個（設定檔放在 `node_modules/.cache/chrome-profile`）。
- `.shots/` 不提交。

注意事項：

- **無頭 Chrome 的設定檔不要放在專案被 Vite 監看的地方**（例如 `.shots/`）。Vite 監看到被鎖住的檔案會以 EBUSY 結束，dev server 就無故消失。
- 有獨立或內建 GPU 的機器用 `--use-angle=d3d11 --enable-gpu`；都沒有的用 `--use-angle=swiftshader --enable-unsafe-swiftshader`（約 1fps，彈簧幾乎不動）。
- 截圖前先 `curl http://127.0.0.1:3000/` 確認 server 活著；腳本在 server 掛掉時會丟 `Cannot read properties of undefined`。
- Claude 桌面版的 Browser pane 對 canvas 送鍵盤事件不可靠（Enter 開不了蓋）；鍵盤情境用 CDP 的 `Input.dispatchKeyEvent`。
- `scripts/shots.mjs` 是舊的 Playwright 版，專案沒裝 Playwright，從未產生過截圖。

## 8. 接手計畫（給下一位主代理）

### 8.0a 進度（2026-11-13 深夜）

| 工作 | 狀態 |
|---|---|
| W1 | 使用者：效能還好、視覺沒有太大意見。完成 |
| W2 | 三輪（Codex Astra high）＋主代理收尾，`ac06b40`、`be8cd16`、W2c（2026-11-14）。§8.2 表格是當時的待修清單，保留作紀錄 |
| W3 | agy Hydrogen，`766a43a`；十一區未觸發新檢查，烘焙不變 |
| W4 | agy Hydrogen，結果見 §7；W4-01 修正 `4a9058e` |
| W5（P4） | 使用者 2026-11-14 決定：**保留舊浮雕當沒有 WebGL2 的退回，不刪舊程式**。效能項目使用者說目前還好，未做 |

蒔看完兩輪 W2 後仍不滿意、下一輪可做的（依影響排）：

0. **樹（2026-11-14）**：W2 第三輪、樹的重做（`e1dba6c`）都失敗後，改架構重建（形體＋印記）。使用者對樹的回饋尚未收到。
1. ~~闊葉樹正面像立著的切板~~：W2 第三輪（2026-11-14）改成薄底冠加七個鼓包墊，鼓包間有暗谷、樹幹露出。
2. **左京的月（使用者 2026-11-14 定案）**：用千利休的典故——真塗（黑漆）的器盛水，放在向月台頂上，映出月影（信長大悅的那則）。做法：向月台頂上一只真塗的器，器中以青貝做月影，加一點切銀／平文的月光意象；斜視下要讀得出「台上一器、器中有月」。現況（平嵌在台前地子）是過渡版。
3. **松（使用者 2026-11-14：要動，排下一輪 Astra）**：全景像傘或蘑菇（北區最明顯）。保留「橫的幾層」的松語言，讓層次與輪廓不再讀成傘。
4. 霞在某些角度像平的金色長條；狐尾仍厚、坐姿偏雕像；山科燈籠全景仍短粗。

下一輪建議把 2、3 合成一張 Astra 派工單（都會改 `vocab.js`）。Codex 2026-11-14 用到週上限（100%，平時 11/20 12:19 恢復）；使用者有重置卷，派之前問使用者是否已重置。

### 8.0 開工流程

1. 讀 `../AGENTS.md`、`HANDOFF.md` §1、本檔 §3（使用者定案的事）、§6、§7、本節。其他節是查閱用。
2. `git status -sb` 確認乾淨、在哪個分支；四項檢查跑一次。
3. 開 dev server，跑一張截圖確認工具可用（例：`南區 minami:0:night:1440x900:1:0.5,0.5`）。
4. 問使用者有沒有看線上版的回饋（W1）。**有回饋就先做回饋**；沒有就照 W2 → W3 → W4 的順序做，W5 要先取得使用者同意。
5. 每個工作包一個 commit（在工作分支上）。合併 `main`、push 各自先問。
6. 美術修改：改完一定截圖自己看過，把截圖傳給使用者，並說出自己還不滿意的地方。不要只說「已改善」。
7. 回報時區分「看過」「沒看」；沒跑的檢查寫沒跑。

回覆風格：繁體中文；使用者習慣兩個角色分段說話，段首用全形「靜：」（架構、數學、除錯）與「蒔：」（美術、看實際畫面）。

### 8.1 W1：使用者看線上版後的回饋

- 目標：把使用者在手機與桌機上看到的問題收進來，逐條處理。
- 主代理交接時請使用者特別看四處：左京與西京的水中月重複、樹冠與松相近、伏見的狐像狗、切金小落葉的方格紋。
- 若回報「手機卡」：先做 W5 的效能小項（陰影貼圖縮小、網格變疏），量測用 Codex 驗收報告 D 節的方法，並請使用者在真機上再看。
- 若回報畫面錯誤：先用 `plate-shot.mjs` 在同尺寸重現，再修。
- 完成條件：使用者說可以，或把不做的項目明確記下來。

### 8.2 W2：蒔還不滿意的造形

都在 `src/studies/toji/plate/`。每項先截現況、改、再截，比對後才收。

| 項目 | 位置 | 現況 | 建議的做法（照「形歸形、意歸意」） |
|---|---|---|---|
| 左京與西京都用水中月 | `sakyo.js` 的 `moon('moon', -196, 22, …)`；`nishikyo.js` 的 `moon('pond-moon', …)` | 兩區意象重複。西京的月配月見台，該留 | 左京換一種：向月台的頂面本來就是「待月」的平台，可在 `sandCone` 頂上加一片青貝或切銀的圓（同組、layer 3、薄），讓月「落在台上」；或把銀沙灘的砂紋做得更像波（`sandGarden` 的線）並在砂上放月的倒影。注意盤面斜視，月放在立體部品後方會被擋 |
| 樹冠與松的葉墊相近 | `vocab.js` 的 `broadleaf`、`crownLobe` | 楓、銀杏、櫻橘都是「樹幹加三瓣圓頂」，遠看和松的葉墊同一種語言 | 讓闊葉樹的輪廓和松拉開：樹冠改成一整團（一個大的不規則輪廓，邊緣鋸齒更深）而不是三瓣；或把樹冠加高成球形／卵形。松是「橫的幾層」，闊葉樹就做「一整團」。銀杏已經偏高，可再拉長成火焰形 |
| 伏見的狐像狗 | `vocab.js` 的 `fox` | 坐姿、尾巴低捲、吻長；全景裡是「坐著的四足動物」 | 狐的辨識點是大而尖的耳、細長的吻、又粗又長的尾。耳朵再大一點、身體收瘦；尾巴可以改成貼著身後往上的一大團（但不要高過頭，之前高過頭時像「Y」字）。意象面：腳邊或口中的寶珠／鑰匙用切金平嵌；足跡（`pawPrints`）已有 |
| 切金小落葉帶方格紋 | `vocab.js` 的 `scatter` 呼叫處（`fallenLeaves` 等用 `MAT.kirikane`／`MAT.kirigin`） | 切金材質本身會畫出小方格，葉片小時像被切碎 | 小的葉片改用平文材質 `MAT.hyomonGold`／`MAT.hyomonSilver`（整片金屬薄板，技法上也正是「平文」）；切金留給燈籠的光那種本來就是碎片的意象。先在一區試、近觀比較 |
| 北區鳳凰偏大 | `kita.js`、`vocab.js` 的 `phoenix` | Codex 做成誇大的紋章 | 縮小到屋頂寬的一半左右；看近觀是否還認得出 |
| 鳥居列「爬山」感弱 | `fushimi.js` 的 `climb()` | 已加參道石；鳥居在斜視下仍近乎水平一列 | 可把 z 的跨度加大（現在 100 到 −98）、x 的間距縮小，讓列更陡；注意和山、樓門、狐的外框不重疊 |
| 山科燈籠全景像樹樁 | `vocab.js` 的 `lantern` | 已改矮胖加金窗，近觀像燈籠 | 笠再寬一點、竿再細一點（但 ≥ 約 12 單位寬，否則會消失） |
| 舊項：鶯在全景太小 | `vocab.js` 的 `bird`（`S = 1.7`） | 看不出是鳥 | 放大到約 2.2，並重看十一區的棲點是否仍在葉墊上（測試會擋腳不在載體內） |
| 舊項：霞像撒粉、不像有邊的金霞 | `shaders.js` 霞的片段、`vocab.js` 的 `suyari` | 邊緣太散 | 屬著色器工作，動之前先看 §5 的旋鈕；改完十一區都要重看 |
| 舊項：懸子裡是空的；箱側切金在月光下偏白 | `renderer.js` 的 `buildBox`、`shaders.js` `MODE==0` | 未動 | 低優先 |

完成條件：每項都有前後截圖；四項檢查通過；把仍不滿意的寫回本表。

### 8.3 W3：語彙的輸入防呆（小）

來源：[驗收報告](agent-runs/2026-11-13-makie-plate-verify-astra.md)的 R02、R03。十一區現有參數不會觸發，所以是預防性的。

- `preparePlate`（`parts.js`）對 `fills` 加「面積接近 0」的錯誤訊息（鞋帶公式，門檻例如 1e-6）；純線條不檢查。
- `roof` 的 `tiles: 0`、`storey` 的 `bays: 0`、`kakezukuri` 的 `posts: 1`、`stoneSteps` 的 `count: 0`、`stream` 的 `widths` 長度不符、`shell`／`steppingStones` 的空陣列：在函式開頭丟出可讀的錯誤（說明哪個函式、哪個參數），不要每個算式都包防護。
- 在 `scripts/plate.test.mjs` 加對應測試。
- 完成條件：新測試通過，十一區的烘焙結果不變（`plate.test.mjs` 既有的「bakes the same every time」會擋）。

### 8.4 W4：補驗

可以派給 Codex（見 8.7 的派法），也可以自己做。

- 其餘七區（伏見、東山、北、上京、左京、中京、下京）在首頁的開蓋、閱讀、Esc 返回；十區在減少動態下的開蓋。
- 文箱焦點框：鍵盤 Tab 到 `#scene` 後截圖，確認金框在舞台內側看得到（1440 與 375）。
- **沒有 WebGL2 的退回**：用 CDP 在頁面載入前注入，讓 `getContext('webgl2')` 回傳 `null`：
  ```js
  await send('Page.addScriptToEvaluateOnNewDocument', {source: "const g=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(t,...a){return t==='webgl2'?null:g.call(this,t,...a)};"});
  ```
  預期：十一區都用舊浮雕畫出來、`#scene` 的 `dataset.plate` 不是 `"true"`、console 沒有錯誤。連 `webgl` 也拿不到時應顯示載入失敗訊息（`bunko_failed`）。
- 換函中間幀：用 CDP `Page.startScreencast` 或在拖曳途中連拍，檢查鄰函與本函交接的那一刻有沒有跳。
- 完成條件：把結果補進本檔 §7 的「已驗／未驗」。

### 8.5 W5：P4（**動手前要使用者同意**，尤其是刪除舊程式）

這是下一個階段，內容與要先問的事：

1. **效能**（可先做，風險低）
   - 陰影貼圖：`renderer.js` 的 `SHADE_SIZE = 2048`。畫布寬 < 700 時改 1024，並把 `shaders.js` `shadeAt` 的取樣間距同步調整。
   - 實體網格：`solidMesh` 的 `cell`（2 單位，一區約 13–15 萬頂點）。窄畫布可試 3。
   - 量測：展示頁 `?probe=flicker`（`probe.js`）與驗收報告 D 節的 rAF 方法；真機數字要請使用者提供。
2. **降級策略**（要使用者決定）：十一區都是盤之後，舊浮雕只服務沒有 WebGL2 的裝置。選項：
   - 保留舊浮雕當退回（現況；代價是 `geometry.js` 的場景與 `landmarks.js` 的建模要繼續留著）。
   - 改成靜態圖退回（每區一張預先算好的圖），然後刪舊浮雕。
   - 不支援，顯示說明文字。
3. **刪除舊程式**（決定降級策略後才做）：`geometry.js` 的場景、`landmarks.js` 的建模（地標名稱文字要保留，標題在用）、舊 `renderer.js` 的網格路徑；對應的舊測試要改寫（先 `grep -rn "landmarks\|geometry" scripts src` 列出引用）。刪除前先確認 `study.js` 的 `groundPoint`、`cameraMatrix` 等共用函式的來源。
4. 更新 `HANDOFF.md`、`docs/DEVELOPMENT.md` 第 35 行附近關於「原生 WebGL 簡化幾何」的說明。

### 8.6 要使用者決定的事（不要自己定）

- 合併進 `main`、push：每次、分開問。
- ~~W5 的降級策略與是否刪舊浮雕~~：2026-11-14 定為保留舊浮雕。
- ~~左京的意象~~：2026-11-14 定為千利休「真塗之器映月」，見 §8.0a 第 2 項。
- 要不要繼續把工作派給 Codex／Astra，以及派哪一類。

### 8.7 派工給 Codex 的做法（2026-11-13 實測）

- 指令：`node "<codex-companion.mjs>" task --model gpt-6-astra --effort high --write --cwd C:/Git/Kyoto-Bunko --prompt-file <派工單>`，背景執行。腳本路徑先 glob `~/.claude/plugins/cache/openai-codex/codex/*/scripts/codex-companion.mjs`。派工單放在 `.claude/dispatch/`（不提交）；當天用過的三份都還在那裡，可當範本：`astra-p3b.md`（八區實作）、`astra-verify.md`（驗收）。
- **這支指令回報「完成」不可信**：Codex 提問時它會當成結束，但執行緒其實還在跑。要看 `~/.codex/sessions/<日期>/rollout-*.jsonl` 最後幾行有沒有 `"type":"task_complete"`。當天因此誤以為它停了而重派一次，兩條執行緒同時在同一個 checkout。
- 派工單要寫「不要提問；做不了就在報告寫未驗並繼續」，並先自己檢查既有測試有沒有「舊狀態斷言」會擋路。
- **Codex 的沙箱開不了有 GPU 的 Chrome，也跑不動 `tsx`**。要它看畫面：主代理先在沙箱外開好 dev server（3000）與無頭 Chrome（9377，跑一次 `plate-shot.mjs` 就會開），派工單叫它連這兩個埠、不要自己開；這段期間主代理不碰那個瀏覽器。`validate` 與 `src/lib` 的測試由主代理自己跑。
- 它構圖與看圖的能力好、回報誠實（做不到的都寫未驗）；主代理仍要自己重跑四項檢查、自己看截圖，不能只信報告。
- Codex 沙箱寫 `ukyo.js`、`shimogyo.js`、`yamashina.js` 時多次 EPERM（ACL 看起來正常，原因未明）；它算好的改動寫在報告裡，由主代理套用。
- 2026-11-13 兩輪 W2 用掉 Codex 週額度約 46%；11-14 第三輪在最後一步撞到 100% 上限中斷（`codex-companion` 以 exit 1 結束、輸出 `You've hit your usage limit`），主代理接手收尾。額度看 `~/.claude/QUOTA.md`。
- `TaskStop` 停背景的 `npx vite` 只會停掉外層 shell，node 的 vite 與 esbuild 會留著、鎖住資料夾；收工時用程序清單找命令列含專案路徑的 node／esbuild 結束掉（或背景指令用 `exec npx vite …`）。
- agy 的派法見全域 `agy-call` skill：主力 `gemini-4-hydrogen-high`；無頭模式讀不到工作區外的檔，派工單、參考檔、允許清單都放進它的 clone（`C:\Git\_wt_kyoto_<topic>`）。§10 是歷史紀錄。全域規則：外派額度見底就由主代理自己做。

### 8.8 當天踩過的坑

- dev server 無故停掉：見 §7 的注意事項（Chrome 設定檔）。
- 派工或截圖的指令不要用 `curl … && 主指令` 串起來：server 掛掉時整串靜靜地不執行，看起來像做完了。
- 改了樹冠或移了樹，鶯的棲點要跟著移；測試只對八個新區檢查腳在不在載體內，南、伏見、東山要自己看圖。
- 樹冠變寬後常和鄰近的建築外框相撞（測試會報 `X and Y overlap in the picture`）：縮樹或移樹，不要動測試。
- 行尾：既有檔案多半是 CRLF，Git 會提示 LF 將被轉換，屬正常；新檔寫 LF。
- 不要在 `C:\Git` 以外寫東西；不要 stash、reset、切分支（可能有別的工作階段共用這個資料夾）。要把 `main` 快轉到目前分支而不切分支：`git fetch . HEAD:main`。

## 9. 已知問題

| 問題 | 狀態 |
|---|---|
| 部品邊緣抗鋸齒依賴 alpha-to-coverage；畫布沒拿到多重取樣的裝置會是硬邊 | PLAUSIBLE |
| 同組部品立起速度不同時，相鄰部品之間的網格會短暫被拉長 | PLAUSIBLE |
| 最大倍率下有單點逐幀差 255，來源未定位 | PLAUSIBLE |
| 組紐沒有落地影 | 已知取捨 |
| 點蓋開箱的命中判定沒算箱體傾斜（最大約 3 度） | PLAUSIBLE，影響應很小 |
| 霞沒有影子（陰影改成深度圖後） | 已知取捨 |
| 陰影深度圖每幀多畫一次實體網格；手機效能未量 | PLAUSIBLE |
| 狐像坐著的狗；鳥居列在斜視角下仍近乎水平 | W2 已修（`ac06b40`） |
| 左京與西京意象重複；樹冠與松相近；切金小葉有方格紋 | W2 已修；仍不滿意之處見 §8.0a |
| 幾個語彙在不合理輸入下產生 NaN 或零面積（十一區不會觸發） | W3 已加防呆（`766a43a`） |
| 盤面斜視，立起的部品擋住後方地子上的平嵌意象 | 已知限制，構圖時避開 |
| `codex-companion.mjs task` 的完成訊號不可靠 | CONFIRMED，見 §8.7 |
| 拖曳換函放手後鄰函消失、舞台空白約半秒（W4-01） | 已修（`4a9058e`） |

## 10. agy 派工單（歷史：2026-11-12 已執行 A1、A2；A3 已派出，結果見本機接續紀錄。Codex 的派法在 §8.7）

實測：agy 只要跑一次允許清單外的終端機指令，整包就被終止。派工單開頭要寫明「讀檔與搜尋只用讀檔工具，終端機只在最後跑驗收指令」。

共同條件：

```text
角色、請求模型、推理強度、選用理由：機械性實作；Gemini 3.8 Flash high（agy）；範圍明確、可與主代理並行
工作區絕對路徑、分支、base SHA：另開工作樹（例 C:\Git\Kyoto-agy）；由 claude/great-brahmagupta-ye2uqt 的 HEAD 分出；base 以 git rev-parse HEAD 為準
前置任務是否完成：是（原型已 push）
禁止操作／不能改變的行為：不得 commit、push、切分支、再派子代理；不得修改 src/studies/toji/plate/shaders.js、plate/renderer.js、plate/vocab.js、plate/minami.js、backdrop.js、ward-art.js、bunko.css、study.css、theme.css、index.css、bunko-ui.css、ClusterMap.tsx 及 AGENTS.md §2 的受保護檔案；不得新增依賴
探索範圍、重試上限、停止條件：同一檢查失敗或逾時兩次即停，交出日誌
回報位置或格式：AGENTS.md §6 的結果格式，寫入 docs/agent-runs/2026-11-12-agy-<任務>.md
```

### A1 閃爍量測

```text
任務／PLAN ID：蒔繪浮雕盤 P0-A1 閃爍與幀時間量測
必讀檔案／已確認事實：src/studies/toji/standalone.ts、study-chrome.js、study.js、renderer.js、plate/renderer.js（只讀）
可修改檔案：src/studies/toji/study-chrome.js、src/studies/toji/standalone.ts；新增 src/studies/toji/probe.js、scripts/probe.test.mjs
交付結果與來源證據：展示頁網址帶 ?probe=flicker 時，固定倍率與指標位置，讓指標沿小圓微移 N 幀；以離屏 2D canvas drawImage 取樣主畫布（在繪製同一個 task 內），輸出相鄰幀平均絕對差、最大差、幀時間中位數與 95 百分位到頁面與 console。純計算部分（差值、百分位）放 probe.js 並附 node 測試。不帶參數時行為不變
驗收指令、瀏覽器情境與逾時：npm run lint（120 秒）、npm test（180 秒）；瀏覽器開 /toji-study/index.html?probe=flicker 取得一組數字（300 秒）
```

### A2 截圖矩陣

```text
任務／PLAN ID：蒔繪浮雕盤 P0-A2 截圖矩陣腳本
必讀檔案／已確認事實：本檔第 7 節的無頭瀏覽器參數；.gitignore
可修改檔案：新增 scripts/shots.mjs；必要時 .gitignore 加一行輸出目錄
交付結果與來源證據：有 Playwright 就用，沒有就印出說明並以非零碼結束（不安裝）。對已啟動的 127.0.0.1:3000 拍：1440×900 與 375×812 × 暖日／月光 × 中／日 × 一般／減少動態，各拍全景與指標停在盤面中央 6 秒後兩張；輸出到不提交的 .shots/
驗收指令、瀏覽器情境與逾時：npm run lint（120 秒）；實跑一次並列出產生的檔名（300 秒）
```

### A3 圖像來源

```text
任務／PLAN ID：蒔繪浮雕盤 P0-A3 初音調度技法圖像來源彙整
必讀檔案／已確認事實：docs/agent-runs/2026-11-05-phase04-hatsune-research.md
可修改檔案：docs/agent-runs/2026-11-05-phase04-hatsune-research.md（只在文末新增一節）
交付結果與來源證據：每項技法（肉合研出、濃梨地、村梨地、刑部梨地、切金、平文、青貝、葦手）各列 1–3 個可公開瀏覽的圖像或解說頁，附網址、館藏或出處名稱、查核日期；查不到的寫「未確認」，不推測
驗收指令、瀏覽器情境與逾時：只改文件；檢查連結可開與 diff 範圍
```
