# 蒔繪盤改用 three.js：遷移計畫

2026-11-14。使用者決定「直接換 three.js，不重新造輪子」（AGENTS.md §2 已加例外）。base：`rebuild` 分支 `9faff0b`（p1 鳥居與柱網、p2 屋宇與塔、p3 燈籠已是顯式網格）。

## 1. 為什麼要換

手寫 WebGL2 管線的成本已經超過它的價值：

- 我們自己寫了倒角、帶洞擠出、迴轉體、掃掠管、實例化印記、陰影、拾取和材質。three.js 對應的成熟元件：
  - 幾何：ExtrudeGeometry（含洞與 bevel）、LatheGeometry、TubeGeometry、InstancedMesh、BufferGeometryUtils.mergeGeometries。
  - 陰影與拾取：shadow map、Raycaster。
  - 材質：MeshPhysicalMaterial。
- 蒔繪最難的是材質，而 three 的 MeshPhysicalMaterial 剛好對得上漆器的層次：

| 漆器 | three.js 對應 |
|---|---|
| 漆面 | `clearcoat` |
| 平蒔繪與切金 | `metalness` 加上金粉 flake 法線貼圖 |
| 青貝（螺鈿） | `iridescence` 加 `iridescenceMap` |
| 梨地（金屬薄片沉在吸收層裡） | 梨地 flake 貼圖放在 clearcoat 底下 |

- 學術上梨地的做法正是「金屬薄片沉在吸收層裡」，蒔繪則是「RGBA 遮罩混合金屬 BRDF」（Ďurikovič 等 2002），可以直接照做。

## 2. 研究依據（先找成品與做法）

- three.js MeshPhysicalMaterial 文件：clearcoat 用來近似漆面這類光澤外層；iridescence 隨視角變色。效能注意：每像素成本較高，必須給 environment map。[docs](https://threejs.org/docs/pages/MeshPhysicalMaterial.html)
- 「Rendering of Japanese Artcraft」（Ďurikovič, Kolchin, Ershov, Eurographics 2002）：
  - 蒔繪：用照片做 RGBA 紋理，alpha 控制金屬 BRDF 的混合權重。
  - 梨地：吸收材質裡的金屬片。
  - [diglib](https://diglib.eg.org/handle/10.2312/egs20021020)
- Yamaguchi 2015，《The Visual Computer》31(11)：日本漆器與蒔繪的參數化反射近似。[dblp](https://dblp.org/rec/journals/vc/Yamaguchi15.html)
- Adachi 等，JSSD 2016：以量測反射特性重現漆器，Torrance-Sparrow 擬合。[J-STAGE](https://www.jstage.jst.go.jp/article/jssd/63/0/63_63/_article/-char/en)
- 2.5D 立體透視盒（diorama）的做法：
  - 用 InstancedMesh 的切片；畫好的切片隨視角轉動，不會變成紙片。[three.js forum](https://discourse.threejs.org/t/a-portfolio-you-walk-through/96904)
  - 法線貼圖加跟游標移動的光。[freefrontend](https://freefrontend.com/code/halloween-2-5d-parallax-shader-2026-05-07/)
- 金粉 flake：程序生成的切線空間薄片法線貼圖，車漆常用。[3Delight Flakes](https://documentation.3delightcloud.com/x/3QEuMg)
- oil-paint（使用者先前提供）：真形體加上程式畫的筆觸貼圖。我們的樹已經用這套方法成功。

## 2a. 設計語言：初音調度（使用者早已定案，不再詢問）

依據：`docs/MAKIE_PLATE_HANDOFF.md` §3 第 2、4、8、9、12 條，以及 `docs/agent-runs/2026-11-05-phase04-hatsune-research.md` 的技法對照表。

- **底：梨子地**。不規則扁平的金粉藏在透漆（琥珀色）下，細碎、有深淺、表面研磨平滑。濃梨地、刑部梨地用在雲霞與地面的疏密變化。**底不是黑漆。**黑漆只用在盒內、邊緣、窗與門扉這類局部。
- **主技法：金銀高蒔繪與肉合研出。**山石、屋簷、建築盛起成形；研出、平蒔繪的平面在同一面上並存，底不整片抬升。
- **切金、切銀**：細方片一片一片排成馬賽克，鋪在盛起的岩面上；屋脊、欄杆也用。和隨機的粉粒要分得開。
- **付描**：建築與草葉用細線表現，金線很細。
- **珊瑚**：極少量的紅點，例如梅花。**青貝**：少量局部，虹彩只在貝片內。
- **整體色**：金是主調，從淡金到茶金；銀灰用在水和岩；一點紅珊瑚。整體是「黃金に輝く」的華麗王朝感。

**2026-11-14 實物照片觀察**（德川美術館「初音蒔絵文台・硯箱（部分）」，dig-it 2025 技法特寫）：
- **梨子地：** 很細、很密的橙金點，底是暖棕。T0 的金粉 flake 粒徑太大，要縮到接近像素級，顏色偏琥珀橙。
- **高蒔繪岩：** 圓潤隆起，輪廓有清楚的稜線；岩面鋪滿方形切金；旁邊有蕨葉般的付描細線。
- **建築：** 低浮雕加細線，不是厚重的實體。
- **水與流水：** 銀色波線。
- **梅花：** 紅珊瑚小點。

來源：[文化遺産オンライン：婚礼調度類（千代姫所用）](https://online.bunka.go.jp/heritages/detail/192763)、[初音蒔絵黒棚飾り](https://online.bunka.go.jp/heritages/detail/52505)、[dig-it：初音の調度 技法解說](https://dig-it.media/digit/article/863228/)、[徳川美術館收藏頁](https://www.tokugawa-art-museum.jp/collections/初音の調度)

## 3. 目標架構

**保留：**

- `parts.js`：資料模型、`preparePlate`、`createLife`（CPU 上的運動狀態）。
- 各 builder 吐出的 mesh chunk：純資料，直接轉成 BufferGeometry。
- `plate.test.mjs` 的行為測試。

**新的 `three-renderer.js`：**

- 介面跟現在的 `createPlateRenderer(gl, canvas)` 一樣，回傳 `{setWard, draw, poke, active, dispose}`。
- 共用外層的 WebGL2 context：`new THREE.WebGLRenderer({canvas, context})`，每次畫完呼叫 `resetState()`。
- 用 `?three=1` 開關做 A/B 比較；確認對等後改成預設，再刪掉舊管線。

**運動：**

- 每個部品的 a/b 狀態（stand、sway、lift、glow……）每幀寫進一張 DataTexture。
- 用 `onBeforeCompile` 把現有 `mesh-shaders.js` 的鉸鏈變換（繞腳線站起、擺動、抬升、開盒）注入 MeshPhysicalMaterial 和陰影用的 depth material。

**材質表（MAT → MeshPhysicalMaterial 參數）：**

| 材質 | 設定 |
|---|---|
| lacquer（漆） | 黑底、低粗糙度、clearcoat 1 |
| gold／silver | metalness 1，加 flake 法線貼圖 |
| hyomon（平文） | 片狀金屬、較光滑 |
| nashiji（梨地） | 梨地 flake 貼圖放在 clearcoat 底下 |
| aogai（青貝） | iridescence |
| lamp（燈窗） | emissive，回應 glow |

貼圖用 canvas 程序生成，不載外部圖。

**地面、山、霞、水：** `bake.js` 現在的高度場改在 CPU 上生成網格（PlaneGeometry 加頂點高度），或做成 displacement 加 normal map。霞和水用透明材質。

**樹：** limbs 改用 TubeGeometry；印記用 InstancedMesh 加 `stamps.js` 的貼圖集。

## 4. 工作包與派工（依 `~/.claude/skills/agy-call/MODELS.md`）

| 包 | 內容 | 派給 | 理由 |
|---|---|---|---|
| T0 | three 骨架：WebGLRenderer 共用 context、相機與燈、盒子、已是 mesh 的部品（p1–p3 建築、鳥居、舞台、燈籠）轉 BufferGeometry、材質表初版、DataTexture 加 onBeforeCompile 鉸鏈、陰影、`?three=1` 開關 | agy `claude-sonnet-5-5`（Antigravity 的 Claude 池，不吃 Claude Pro） | 架構級，Hydrogen 不適合；Astra 要到 11/21 才重設 |
| T1 | 地面、山、霞、水改成 three 網格與材質 | Hydrogen high（T0 合併後） | 範圍明確 |
| T2 | 樹：TubeGeometry 加 InstancedMesh 印記 | Hydrogen high | 範圍明確 |
| T3 | 材質美術：漆、梨地、青貝、金粉對照 `.shots/refs` | Astra（11/21 後）看圖定參數，Hydrogen 改數值 | 視覺判讀是 Astra 強項 |
| T4 | p4 狐與鳳凰、p5 鶯：用 three 幾何重做有機形體 | Astra（11/21 後）整包設計加實作 | 架構加造形 |
| T5 | 對等確認後切成預設、刪舊管線、手機效能量測 | 主代理 | 整合 |

**每包的硬規則**（只擋真正危險的事）：

- 不碰資料 schema 與受保護檔案。
- 不 push、不 merge。
- 行為測試不准改弱；範圍圍欄可以更新並註明。
- 每次呼叫都設 timeout。
- 驗收證據由流水線產生：完整測試輸出、全部截圖與 dataset、含新檔的 diff。

**碰到阻礙時：** 先找類似的成品與做法；判斷是合約或架構的問題，就回報 BLOCKED 並附修改提案。

## 5. 驗收

- `npm run lint`、`validate --strict`、`npm test`、`npm run build` 全過。
- 記錄 three 加進來後 build 增量多少（min 與 gzip）。
- `?three=1` 與舊管線十一區同視角截圖對照，包括桌機 1440、手機 375、夜、日、still。
- 手機 375 的幀時間不低於舊管線。

## 6. 回退

- 舊管線保留到 T5，`?three=1` 只是開關。
- 任何一包不過，就留在自己的分支，不影響 `rebuild`。

## 7. 進度（2026-11-14）

| 包 | 狀態 | commit |
|---|---|---|
| T0 骨架 | 完成（agy Sonnet 5.5） | 8670df2 |
| T1 地面、水、霞、動態載入 | 完成（Hydrogen） | 726eb83 |
| 材質依初音調度：梨子地盒身、細金粉 | 完成（主代理） | af253aa |
| T2 樹 | 完成（Hydrogen） | 9748ea4 |
| T4a 高蒔繪岩加切金 | 完成（Hydrogen 加主代理調整） | 見 git log |

待辦：
- **地（2026-11-14 使用者回饋）**：對標初音調度文箱本體的地，企劃與進度見 [`MAKIE_GROUND_PLAN.md`](MAKIE_GROUND_PLAN.md)（D0–D2、D4–D6 第一版完成，D3 未做）。肉合蒔繪部件等地定稿後再改。
- **構圖（2026-11-14 使用者回饋）**：平面上的深度與資訊密度，企劃見 [`MAKIE_COMPOSITION_PLAN.md`](MAKIE_COMPOSITION_PLAN.md)（C1–C6）。
- **T3 材質**：銀欄杆偏灰、燈窗橙色太飽和、青貝。
- **T4a 後續**：切金只覆蓋到岩的下半部，頂面沒有片；`rock-mesh.js` 的鋪片條件要查。
- **T4**：狐、鳳凰、鶯，目前仍是平塗佔位；p4、p5 原本的工作也併入這包。
- **T5**：設成預設並刪除舊管線，手機幀時間量測。

T3、T4 與岩的後續由主代理直接做（研究原作、調材質、看截圖是 Opus 5.5 的強項）；Astra（約 11/21 重設）或 Fable 5.2（約 11/15 21:00 重設）有額度時可整包派出，但不讓工作停在等外派。
