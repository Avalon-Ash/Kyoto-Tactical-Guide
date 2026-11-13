# 樹的渲染架構重建：形體＋印記

日期：2026-11-14。任務狀態：**A 判定通過，B 完成**（本派工範圍；四項全專案整合檢查依派工留給主代理）。

| 項目 | 記錄 |
|---|---|
| 授權 | 本輪使用者派工單；實作、截圖、自行判定 A，再進 B；禁止再派子代理 |
| 請求模型／強度 | `gpt-6-astra`／high |
| 實際設定 | **未確認**：工具未提供當前模型／強度回讀；未變更設定，未開子代理 |
| 工作區 | `C:\Git\Kyoto-Bunko` |
| 分支／base | `claude/great-brahmagupta-ye2uqt`／`e1dba6c4a8ac22ee32217a17726b4593ed83adcb` |
| 開始狀態 | `git -c safe.directory=C:/Git/Kyoto-Bunko status --short` 無變更；原有 plate tests 16/16 |
| Git 操作 | 未 commit、push、切分支、stash、reset；`safe.directory` 只用單次 `-c`，未改全域設定 |
| pending edits | 無；未遇到 EPERM，沒有需要代套的區檔 |

## 架構與範圍

| 檔案位置 | 行為 |
|---|---|
| `src/studies/toji/plate/trees.js:18` | 純資料樹 builder：幹枝折線與半徑、印記、實際橫枝棲點。共 27 棵樹。松每棵十二印記，楓／銀杏三十五，櫻五十，橘五十（含十五果）。 |
| `src/studies/toji/plate/limbs.js:11` | 十二段半橢圓剖面，半徑 × 0.62 為高度；端點封口。分枝起點埋入母枝，不受模糊貼圖控制。 |
| `src/studies/toji/plate/limbs.js:36` | 固定位置、角度、尺寸、圖格、材質、疊高的 instance buffer。 |
| `src/studies/toji/plate/stamps.js:5`、`:64` | 八種純資料圖樣；Canvas 生成 192² × 8 RGBA8 texture array，R 高度／G 覆蓋／B 線描。逐層 mipmap，無模糊。 |
| `src/studies/toji/plate/tree-shaders.js:3` | 半管與印記共用根平面、鉸鏈、擺動、開蓋、箱體傾斜。印記不隨視線轉向。 |
| `src/studies/toji/plate/shaders.js:148`、`:324` | 樹的 alpha 深度、細脊法線、沿管 UV 樹皮；接回既有金、淡金、銀、青貝等材質與投影陰影。 |
| `src/studies/toji/plate/renderer.js:194`、`:315` | 樹的 shader／VAO／buffer／共用印記表；換區重建幾何，釋放時刪除新增 GPU 資源。 |
| `src/studies/toji/plate/renderer.js:394`、`:412`、`:415` | 半管與印記加入陰影深度、alpha-to-coverage 深度預寫、EQUAL 上色。 |
| `src/studies/toji/plate/bake.js:22` | 樹不再烤進 `fine/soft`；保留相同圖樣外框供 ident 點選。 |
| `src/studies/toji/plate/parts.js:32`、`:53`、`:216` | 鶯兩腳中心移到載體的真實枝點；驗證新資料；幹、葉、鶯共用 hinge／sway。 |
| `src/studies/toji/plate/vocab.js:593` | 匯出新 builder。移除舊 `broadleaf`、`branchBroadleaf`、`pine`、`branchPine` 的剪影／墊枕實作及無用 helper；`branch*` 名稱只作相容別名。 |
| `minami.js`、`higashiyama.js` | A 段先接新 builder。其餘九區透過原有 `branch*` 匯入取得新 builder，未為改名稱而重寫區檔。 |
| `scripts/plate.test.mjs` | 只新增四項；原有十六項（含鶯腳覆蓋斷言）逐字保留。 |

地子、建築、岩、霞、箱體仍走原路徑；未改 `study.js`、`src/data/`、套件依賴。架構說明見 [MAKIE_STAMPS.md](../MAKIE_STAMPS.md)。

與派工概念的具體取捨：使用 texture array 避免圖集 mip 邊界串色；半管交界用相交幾何接合，沒有布林焊接；印記的微浮雕只改法線，深度由固定的薄片平面提供。樹採剛性根平面，沒有逐葉 billboard 或逐頂點追隨土坡。

鶯的舊區檔坐標保留為輸入，`preparePlate` 按 `attach` 找新樹的 `perch` 再整體平移；這讓兩隻腳保持原間距，避免十一份人工重算值。樹上鶯的 vertex shader 也改用載體根平面，並扣掉腳自身最低膨脹量，避免枝高與腳厚重複相加。

## A 段判定

先讀 `MAKIE_REFERENCES.md` 並打開 `.shots/refs/` 全部十五張。只讀參考 `C:/Git/oil-paint/src/world/forest.js`、`src/oilpaint/brush.js`、`src/oilpaint/dabs.js`、`src/night/pines.js`；沒有引入 three.js。

第一版（`.shots/stamps/a1/`）的松扇大小太一致，楓裂片太窄，近觀呈針狀。**只做一次造形調整**：松改為橫向扇貝葉層與針扇交錯；楓加寬掌部、加大單葉；降低細脊高度，線描由整片發白改為較暗的脈線。沒有再回頭修改舊膨脹剪影。

並排證據：

- [松：參考與 A2](../../.shots/stamps/compare/pine.png)
- [楓：參考與 A2](../../.shots/stamps/compare/maple.png)

判定依據：松有可見曲幹、橫枝、四層橫寬葉面，層間可見空隙，近觀針紋保留而沒有圓球側壁；楓有可辨掌形尖葉，五個葉簇遮住枝端而仍留下枝間空隙，全景是有葉的樹。與參考的差距是排布仍較規整，松針扇有程式圖樣的重複感；未宣稱複製了文物的手繪不規則性。據此進 B。

| A2 檔名（目錄 `.shots/stamps/a2/`） | 情境 |
|---|---|
| `minami.png`、`maple.png` | 1440×900 月光全景 |
| `minami-phone.png`、`maple-phone.png` | 375×812 暖日全景 |
| `minami-close.png`、`maple-close.png` | 2.5 倍近觀，光在樹旁，樹立起 |
| `minami-away.png`、`maple-away.png` | 近觀後移光至畫布右下；保留既有 STAND_REST 微仰，不是強制零角度 |

另補最終 [南區躺平](../../.shots/stamps/b/minami-flat.png)、[東山躺平](../../.shots/stamps/b/higashiyama-flat.png)：暫停且光移開原型樹，`still=true`，鉸鏈歸零。A2 的樹造形在 B 未再調整；B 僅補完樹上鶯的根平面接合。

## B 段截圖與觀察

全部位於 `.shots/stamps/b/`；每區都有 `名字.png`（1440 月光）、`名字-phone.png`（375 暖日）、`名字-close.png`（2.5 倍月光近觀）。尺寸指瀏覽器 viewport；PNG 沿原 `plate-shot.mjs` 方式裁切 scene 畫布，手機保留 DPR 2。十一區三十三張均打開檢視（手機另做 [總覽](../../.shots/stamps/compare/mobile.png)）。

| 區／檔名前綴 | 部品／印記 | 近觀主體與實際觀察 |
|---|---:|---|
| 南 `minami` | 48／36 | 三松；粗幹有鱗狀刻紋，葉層厚度不隨幹的半徑增加，枝間有透空。 |
| 右京 `ukyo` | 25／59 | 池前楓；掌形葉有實心掌部與尖裂，葉簇下方兩根細枝可見。 |
| 西京 `nishikyo` | 33／24 | 近松；曲幹向一側斜升，四層葉面與池緣沒有合成一塊。 |
| 山科 `yamashina` | 34／70 | 西楓；較大的五裂／七裂葉重疊，主幹與側枝之間仍透出地子。 |
| 伏見 `fushimi` | 36／24 | 鳥居旁松；葉片陰影分層，左松根與旁邊岩塊有間隔。 |
| 北 `kita` | 29／24 | 池島松；根在岩後、針扇在兩側，銀鳥停在枝葉之間。 |
| 上京 `kamigyo` | 39／124 | 櫻、橘同框；五瓣花的外緣碎裂，橢圓葉可見中脈，圓果穿插；月光銀花偏藍灰。 |
| 左京 `sakyo` | 31／24 | 近松；池邊四層葉面與細枝均可分開讀，沒有連成冠球。 |
| 中京 `nakagyo` | 42／24 | 西松；葉層位於唐門左後方，根、幹和門屋頂輪廓沒有接合。 |
| 東山 `higashiyama` | 26／105 | 左楓；葉片大於第一版，近觀能讀出掌形，手機只能讀到葉簇。 |
| 下京 `shimogyo` | 28／47 | 大銀杏；短粗根段、分叉與有脈線的扇葉，葉簇之間有細縫。 |

另有 `fushimi-flat.png`、`kamigyo-flat.png`、`shimogyo-flat.png`：暖日暫停、光移開近觀主體。五種樹躺平仍有幹枝與葉面，不會退回舊樹冠。手機全景不以逐葉可辨作驗收；針紋、葉脈需近觀。

重現截圖的工具是 `.shots/stamps/capture.mjs`，由原 `scripts/plate-shot.mjs` 衍生：禁止自行啟動 Chrome，新增 `@group` 定位、移光後截圖、`plate=true`／`gl.getError()` 檢查。所有瀏覽器工作只連既有 9377 與 3000。

```text
node .shots/stamps/capture.mjs C:/Git/Kyoto-Bunko/.shots/stamps/b <name>:<steps>:night:1440x900:1:@<group>
# phone: day:375x812:1；close: night:1440x900:2.5
# flat: night-still 或 day-still，尾端追加 :.95,.85
```

| name | steps | group |
|---|---:|---|
| minami | 0 | pine-a |
| ukyo | 1 | near-maple |
| nishikyo | 2 | near-pine |
| yamashina | 3 | west-maple |
| fushimi | 4 | pine-a |
| kita | 5 | island-pine |
| kamigyo | -5 | sakon-sakura |
| sakyo | -4 | near-pine |
| nakagyo | -3 | west-pine |
| higashiyama | -2 | maple-a |
| shimogyo | -1 | great-ginkgo |

## 測試與效能

| 指令／證據 | 結果 |
|---|---|
| `node --test scripts/plate.test.mjs` | exit 0，20/20；[tests.log](../../.shots/stamps/tests.log)。原 16 項未改，新增 4 項。 |
| `node .shots/stamps/verify-browser.mjs` | exit 0；八格都有覆蓋、細脊、線描，邊界非零像素 0；27 棵樹 ident 實際命中本組幹；`plate=true`、GL error 0、console 0。[browser-check.json](../../.shots/stamps/browser-check.json) |
| 三十三張 B 截圖與五張躺平 | 全部 `plate=true`，GL error 0，最後 `CONSOLE: none`；[desktop](../../.shots/stamps/b-desktop.log)、[mobile](../../.shots/stamps/b-mobile.log)、[close](../../.shots/stamps/b-close.log)、[flat](../../.shots/stamps/b-flat.log) |
| `git -c safe.directory=C:/Git/Kyoto-Bunko diff --check` | exit 0；僅既有 Git autocrlf 提示，沒有空白錯誤。 |
| `node .shots/stamps/final-check.mjs` | 檢查原測試內容未變、文件連結存在，並記錄本輪十二個程式／測試檔 SHA-256；[manifest](../../.shots/stamps/manifest.json)。 |
| 搜尋 `function broadleaf/branchBroadleaf/branchPine/pine`、`crownLobe`、`function wood` | 舊樹實作無命中；別名匯出保留供區檔使用。 |

開發中曾出現一次 GLSL 區域變數 `q` 重複宣告，修正後重新截圖確認沒有 fallback；另一次既有測試找不到 `pine-a-leaf-1`，以保留葉部品 ID 解決，沒有修改原斷言。

效能在 **同一台 RTX 4070／ANGLE D3D11／Chrome 157**，展示頁 1440×900、南區、`lift=1`、移光五秒，以 RAF 間隔量測。舊版由 CDP 對該測試分頁回傳 `git show e1dba6c:src/studies/toji/plate/*` 的原檔，不改工作樹、不切分支。舊版 dataset 的 139290 頂點／54 部品確認載入基準；新版為 85014 舊式頂點＋20736 半管頂點＋36 印記／48 部品。

| 版本 | 樣本 | 平均 ms | p95 ms | 最差 ms | console／GL |
|---|---:|---:|---:|---:|---|
| `e1dba6c` | 1200 | 4.167 | 4.20 | 4.30 | 0／0 |
| 本輪 | 1200 | 4.167 | 4.30 | 4.40 | 0／0 |

指令：`node .shots/stamps/perf-compare.mjs baseline`、`node .shots/stamps/perf-compare.mjs current`。原始值：[baseline](../../.shots/stamps/perf-baseline.json)、[current](../../.shots/stamps/perf-current.json)。平均差約 0 ms、最差差 0.10 ms，未觀察到大於 3 ms 的退步。這是受刷新節奏限制的畫面間隔，**不是 GPU 執行時間，也不代表手機效能**。交接的 17.6 ms 來自 AMD 內顯，不能直接與本輪 RTX 4070 比快慢。

## 未做／未驗與交接

- `npm run lint`、`npx --no-install tsx validate_data.js`、`npm test`、`npm run build`：本輪未執行，依派工「四項整合檢查由主代理跑」。本報告的通過範圍是 plate 20 項與上述瀏覽器驗收，不宣稱全專案整合已通過。
- 未驗實體手機、iOS Safari、AMD 內顯、線上部署；375 情境是同一桌面 Chrome 的 viewport／DPR 模擬。
- 未做分叉 boolean union、薄葉側壁、朱漆新材質、隨機樹形庫。松的四層排布仍重複；櫻的銀色在月光下偏藍灰，均可在提供的近觀確認。
- 未逐一以 UI 截到每隻鶯的第二棲點；兩棲點的腳覆蓋與同步都有資料測試，換棲已有原測試。`partAt` 額外實測了所有樹幹；葉片的逐像素點選沒有逐葉窮舉。
- 不需要代套檔案，pending edits 無。既有區檔未遇寫入限制，因九區透過共用 builder 完成移轉，無需改檔。
- 保留 diff，未 commit／push。若整輪不採用，主代理可按本輪 12 個程式／測試檔與兩份文件逐檔反套 diff；不要回退其他工作。A1、A2、B 截圖及驗收腳本均在忽略的 `.shots/stamps/`，不列入提交。
