# 盤上物件重構計畫

2026-11-14；本輪只有設計與拆包。工作區 `C:/Git/_wt_kyoto_rebuild`，分支 `rebuild`，實查 base **`e2672fab1818dc734426d4768d2efdd4a265463c`**。使用者已接受 `819a2d3` 的樹，要求其他物件沿用「先分形體與表面細節，再選管線」的方法。本文件不宣稱實作完成，不授權 commit、merge、push、安裝依賴或另派代理。

設計角色請求 `gpt-6-astra / high`；實際模型／強度未由工具確認。後續五包指定 `agy / gemini-4-hydrogen-high`，逐包寫入、逐包看圖。這是當次使用者的明確分工，優先於 `AGENT_EXECUTION_PLAN.md` 的一般模型表與 handoff §3.6 的舊分工。本輪不啟動它們。

## 1. 判讀依據與根因

已讀 `AGENTS.md`、`HANDOFF.md`、`AGENT_EXECUTION_PLAN.md`、`PLAN.md` 與 `DEVELOPMENT.md` 資料規範；本輪不涉及景點資料。已讀 `plate/` 全部 22 個 JS、`scripts/plate.test.mjs`、`MAKIE_PLATE_HANDOFF.md`、`MAKIE_STAMPS.md`、`MAKIE_REFERENCES.md`。已逐張檢視 `.shots/refs/` 的 15 張、`.shots/current/` 的 12 張（含 kita-day）、`.shots/tree-compare/` 的 3 張。後者是比較圖；current 是裁出的 scene，不可用 PNG 尺寸反推原 viewport。

| 證據 | 確認的限制 | 本輪決策 |
|---|---|---|
| `bake.paintLayer` 對 layer > 0 的 fill 一律寫紅色 255；`BLUR_FRAG` 先縮小再 15 tap 高斯模糊 | 修改 fill.soft 不會讓立體細桿變清楚；細縫與尖角先在場中消失 | 細桿、開口、簷口用真正的三角形與法線，不再送 body() |
| `solidMesh` 是每 group/layer 的 2 單位網格，查 ident 找頂點主人；`partVert` 再按 `body()` 位移 | 相鄰柱樑成為圓結；不同 owner 的頂點可被不同動畫拉動；增加貼圖解析度不是結構解方 | 各構件自己有截面，組裝交點埋接；相關部品共享運動 owner |
| current/higashiyama、tree-compare/maple | 舞台像鼓起的方格餅；細欄杆變成銀色齒塊 | p1 優先換柱網、台板與欄杆 |
| current/fushimi | 小鳥居開口仍可辨，但笠木、貫、柱角都像軟管 | p1 留列隊構圖，改半圓柱＋有折面的樑 |
| current/minami、kamigyo、nakagyo | 大屋頂可辨，邊緣太圓；迴廊像帶刻線的黑枕；唐門像厚牌 | p2 換實體屋面與框架，瓦線仍是付描 |
| current/yamashina、nishikyo | 燈籠是短粗柄、厚帽、鼓出的窗 | p3 細竿、明確六角笠、凹火袋 |
| current/fushimi、kita；tree-compare/pine | 狐耳／尾尖、鳳凰羽隙、鶯短喙和腳容易被吞 | p4 動物形體＋羽片；p5 鶯最後處理載體與隱顯 |

原文件有兩個需校正的概括：**箱體從來不是 body() 膨脹**，`buildBox()` 已是 dome、band、盒面、圓柱與 torus；**霞雖仍烘焙，但 MODE 4 是未模糊 coverage 的薄 quad**，不走實體 `solidMesh/body`。不為改架構而重做這兩者。

以 `node --input-type=module` 匯入 `PLATES/preparePlate` 實查：十一區 errors 都是 0，部品數如下；舊 handoff 的計數已過期。

| 南 | 右京 | 西京 | 山科 | 伏見 | 北 | 上京 | 左京 | 中京 | 東山 | 下京 |
|---|---|---|---|---|---|---|---|---|---|---|
| 48 | 25 | 33 | 34 | 36 | 29 | 39 | 31 | 42 | 26 | 28 |

五包均不新增部品 ID，不改區檔構圖座標，不提高 63 上限。頂點、羽片、柱子是同一部品內的 submesh，不各佔一個 part。

## 2. 每類物件的處置

下表尺寸均為盤面單位，不是像素。參考圖是內部搜尋縮圖，只取造形關係，不當考據照片或可再發布素材。「第幾張」由左至右計完整主縮圖；遇左緣殘圖另以內容定位。

| 類別／現有函式 | 現在怎麼畫、膨脹限制 | 新做法與不改之處 | 圖像對照／排程 |
|---|---|---|---|
| 地子、土坡 `hill/gardenGround` | layer 0 soft 高度場，地面共用 SWELL=17；正好會產生相融緩坡 | **保留**。不改成一塊塊厚片；仍以橫向帶與第二個內部鼓包表示坡。這裡要的是連續起伏，不需要孔洞 | rocks-hills-1 左起第 2 張黑箱上的橫疊坡、第 5 張臨水岸；rocks-hills-2 最右層坡 |
| 岩 `rock/moatWall` | 多邊輪廓、內層 fill、表面折線，厚 30／15；膨脹磨鈍稜，細刻線不改幾何 | **本夜保留膨脹**。圓岩與台地柔面合理；要崖岩時另用 2–3 階梯楔體（每階高 3–5，退台 4–8），而非把所有岩換低模石。moatWall 小尺度石縫維持刻線 | rocks-hills-1 中間直立金岩與右側斷岸；current 的圓岩沒有必要搶過建築 |
| 流水、池 `stream/pond` | layer 0，soft=0，crisp .12/.08；Catmull–Rom 帶＋付描；shader 水紋，非立體枕 | **保留平嵌**。溪是連續梳線，池是斷續水平線；不做透明水體、鏡面 RTT、抬高河床。若之後加渦，仍用 3–5 條相隔 1.5–3 的曲線印記 | rocks-hills-2 左側黑漆流水、pine-makie-row 第 3／5 張波紋；兩者不同於 current 池的靜水 |
| 霞 `suyari` | 2–3 個圓端帶填色、thick=0，MODE 4 coverage、半透明、無深度寫入／無影 | **保留**。金帶是正確語彙；其長條感不是膨脹缺陷。不做 TubeGeometry，不加投影，不移去遮住新細節。盤外 CSS 霞不在範圍 | pine-shiozan-kakego 的橫長留白金帶；MAKIE_REFERENCES 的すやり霞條目 |
| 堂 `hall/storey/roof` | 金屋頂＋黑壁＋窗＋銀 lip 都是膨脹剪影 | 屋面用有厚度的參數薄殼（頂面、底面、封邊），壁用 6–9 厚盒，柱用小倒角擠出；瓦縫用附著屋面的 .55–.8 寬薄帶印記，不建每片瓦 | kiyomizu-hiroshige 第 2 大縮圖：左下寬屋頂的完整坡面、細簷與細柱；p2 |
| 塔 `pagoda` | 五層同組、order 分層甦醒；相輪九橫條被磨成一根針 | 五層保留原寬與 pitch；屋頂同上；相輪用有半圓截面的中軸與 9 個真正分開的短環／環帶。相輪 90 高（原約 63），總高約 301，比例約 30%，不硬拉到 1/3 而越界 | pagoda 第 2 張線繪、第 4 張霧中塔：簷逐層收、小而翹；p2 |
| 門 `romon/sanmon/karamon` | 樓門下層是整片牆；山門兩粗柱；唐破風整塊膨脹成牌 | 樓門下部三間開口以樑柱負空間表達；山門維持開口，柱改明確截面；唐門保留閉門扉，破風用雙曲線間的帶殼，中央鼓脊由網格控制。小雕花／門釘仍是附面印記 | kiyomizu 圖的柱與簷語言；本地沒有門的專門近照，比例依現有輪廓，不冒稱復原建築。p2 |
| 迴廊 `corridor` | open=true 也填滿黑壁，只以線分間 | open=true 改柱框，每間能透見地子；屋頂薄殼、柱 2.8–3.6、頂樑與台基有體積。open=false 保留實牆但改盒面，不開洞 | current/kamigyo、shimogyo 對照；p2 |
| 懸造 `kakezukuri/railing` | 5.2–6 寬柱、3.6 高繫樑、2 寬欄杆被膨脹圓接 | 柱用倒角矩形擠出；樑用矩形擠出、交點只埋 .2–.4；台板有上下表面；欄杆 1.6–2.2 寬實桿。保留 8 柱／3 道繫樑，不增密 | kiyomizu-hiroshige 第 2 圖右上懸造的暗色細架；p1 |
| 鳥居 `torii` | 兩柱、貫、笠木輪廓一起鼓；小門為保縫而省額束 | 柱用漸縮半橢圓掃掠；貫矩形、笠木為沿弧線的薄盒樑；s≥1 保留額束，小門照舊省略。直角／梁柱交界不被抹成圈 | fox-1 左起第 2 張紅鳥居通道，取柱直、兩道梁、頂端起翹；p1 |
| 燈籠 `lantern` | shaft 有 Math.max(6/s,7) 的粗化補償；火袋／笠都是鼓包，窗用 bias 浮上去 | 消除為膨脹補粗的下限；細竿掃掠、六角笠與底座分層薄擠出、火袋為四框＋後退黑窗，頂端寶珠小半球。光粒仍平嵌 | lantern 第 1 張直立黑漆筒底部燈籠、約 x=800–950 的雙圖中上方火袋；p3 |
| 狐 `fox` | 胴、耳、吻、豎尾全是銀色 fill 的 body()；尖端被吞 | 體軀保有飽滿半橢球；耳／吻是有封邊的楔片，尾用漸縮半管；眼、腿縫為附面深漆細帶。石座保持膨脹，足邊寶珠維持平嵌，本夜不新增口銜物／狐火 | fox-1 第 2 張白狐坐姿，fox-2 紅底一對金線狐（約 x=780–990）；p4 |
| 鳳凰 `phoenix` | 為存活而做寬翼，兩塊 fill 只剩 Y 形輪廓 | 小半橢球胸、彎頸、冠羽；每翼 5–7 片細長封邊羽片，3 條尾羽。羽片為固定在屋脊平面的重複薄片印記，非隨眼轉的 billboard；輪廓間有真縫 | phoenix 第 2 張羽列與最右長飄羽；屋頂徽飾尺度不變，不能複製整隻華麗大鳥。p4 |
| 鶯 `bird` | 橢圓身頭＋尾、喙 fill；腳是 lines；負 hinge 標記 treeRider 抵消膨脹最低厚度 | 半橢球身頭、短喙楔、1 片尾＋1 片貼身翼、兩隻真正細腳。保留同一隻鳥的兩個 part 與所有換棲點行為；整體 follows 樹但自己的 hop/visibility 保留 | uguisu 第 2 張側身梅枝鳥：短喙、圓腹、長而收細的尾、腳貼枝；p5 |
| 落葉／花瓣／果／足跡 `scatter/fallenLeaves/fallenFans/petals/fruits/pawPrints` | layer 0 的清晰 fill、材質印記，沒有 body() 填縫 | **保留**。不因樹用 instance 就強行改；葉、掌墊與瓣尖已清楚。地上辨種，物件上讀大形 | maple-makie 第 3 張、pine-puffs-ginkgo 第 1／2 張；fox-2 的行跡只借意，不當足跡圖譜 |
| 月、向月台與器 `moon/sandCone/moonBowl` | 西京水中月是平嵌；左京本 base 已有台上一器、器中青貝月＋三條銀光，不是舊 handoff 說的台前月。台／器仍有膨脹 | 西京維持。左京目前辨得出定案，**本夜不動**；下一輪若近觀要求中空口沿，器以 24–32 段雙壁旋轉網格（外徑36、口沿1.2、深9、足徑12）＋內面月印記；台以截錐 profile，不能只換器而不定義承托面。先解決本夜更大的形體缺陷 | moon 最右黑漆器參考器口，前方秋草銀月僅作材質；不把秋草盤圖當作利休器型證據 |
| 砂庭、石階、踏石、月見台 | layer 0 面與付描 | **保留地子**；不豎起、不加獨立鉸鏈 | 現有構圖與 handoff §4 地板規則 |
| 箱子、懸子、卷、紐金具、組紐 | buildBox 的手寫網格；cordTube 真管，箱側紋 shader | **保留**，不換 renderer、不換物理；箱側紋樣本來就附著面。組紐無影是既有取捨，這五包不處理 | rocks-hills-2 中間金箱、pine-makie-row 第 2 張箱蓋和側面 |

「保留」是設計決定，不是待 Hydrogen 自行補做的任務。未排入五包的台／器中空方案是下一輪候選，不是今晚的隱藏第六包。

## 3. three.js 評估（本夜零新依賴）

本專案 package.json 無 three；目前 CPU builder 與 WebGL2 renderer 都是自寫。參照 `C:/Git/oil-paint/README.md` 的 The idea 與 `forest.js/brush.js/dabs.js`，可學的是**體積載體、附著的筆觸、固定疊高、投影共用形體**。forest 的 tube 本身也是手寫掃掠，只借 THREE 向量計算；它不是「使用 three 就會畫出樹」。其多數 dab 朝眼轉、油畫色盤與油彩陰影不是本盤要移植的風格。

官方 API 於 2026-11-14 以文件工具查閱（未開互動瀏覽器）：[ExtrudeGeometry](https://threejs.org/docs/pages/ExtrudeGeometry.html) 提供形狀擠出與 bevel；[LatheGeometry](https://threejs.org/docs/pages/LatheGeometry.html) 繞 Y 軸旋轉 profile；[TubeGeometry](https://threejs.org/docs/pages/TubeGeometry.html) 沿曲線掃固定半徑；[ShapeGeometry](https://threejs.org/docs/pages/ShapeGeometry.html) 產生單面形狀三角形。其 [BufferGeometry](https://threejs.org/docs/pages/BufferGeometry.html) 的 position/normal/uv/index 可以取出轉接現有 WebGL buffer，並不強制使用 THREE.WebGLRenderer。

| 面向 | 只用 three 幾何產生器 | 本夜採用：有限範圍自寫 |
|---|---|---|
| 功能 | 複雜凹多邊形、洞、bevel、曲線框架已有工具；但 Tube 的固定半徑仍不等於本案漸縮半管 | 只寫矩形倒角桿、凸截面擠出、參數屋面條帶、半橢球、羽片；以構件組裝留下洞，不寫通用 CSG／洞三角化 |
| Bundle | 即使不引 renderer，仍連帶 BufferGeometry、向量、曲線、三角化等；tree-shaking 結果依入口與版本，不能拿整個 three.min 大小當增量 | 無套件增量，只增加使用中的 helper；精確 byte/gzip 尚未量測，不能宣稱減少多少 KB |
| 維護 | 成熟工具可減少三角化錯誤；需鎖版本、追 API，深路徑 import 比公開入口脆弱 | 自己負責 winding、法線、端蓋、退化三角形；限制輸入形狀與測試面積／截面，比一次造完整幾何函式庫可控 |
| 接線 | 須轉軸（Shape XY→盤 XZ）、處理 indices、材質 group、UV、owner；three 的材質與 scene graph 不幫忙本案鉸鏈 | 直接輸出現有座標與每個 part 的 owner，對接 uA/uB，無第二套座標／生命週期 |
| 陰影／著色器 | 頂點可以共用原 shader，但仍要完成三 pass、pick、資源釋放；不是即插即用 | 同樣需三 pass，但一種明確 packed layout；原金／銀／漆與陰影沿用 |

結論：**今晚所有包都不用 three，也不複製它的原始碼或從 CDN 偷載入**。若之後真的出現大量任意輪廓帶洞／bevel 的需求，再請使用者決定是否解除大型繪圖依賴限制；屆時做同一組 geometry 的隔離 bundle A/B，記 Vite min+gzip 增量、生成耗時、GPU bytes、頂點數與維護差異。現在沒有安裝／build A/B，因此不提供假量測數字。

## 4. p1 建立的共用資料與接線合約

這節是實作規格，不是現有 API。p1 必須完整交付；p2–p5 開工時只使用已經 PASS 的 p1。不依賴任何後面的包，也不替後包預先遷移物件。

### 4.1 純資料

`mesh` 是可選欄位；有它就明確退出膨脹路徑，不能用 `limbs:[]` 冒充樹。

```js
{
  // 所有既有 id / group / order / kind / layer / mat / anchor 等保留
  thick: 0,
  mesh: [
    { mat: MAT.gold, vertices: [/* 每頂點 8 floats: x,y,z,nx,ny,nz,u,v；非索引三角形 */] }
  ],
  fills: [/* 從實際外框／構件投影得到的點選輪廓；不能用整個 bounding box */],
  lines: [/* 保留必要語意／鶯兩腳；mesh 的表面線要另外有可見幾何 */],
  motionWith: '同 group 的另一個 part id', // 可選，不能是自己、不能循環
  rigidGroup: true // 可選，只給一個根；preparePlate 將同 group 其他成員接到它
}
```

mesh.y 是離開盤面畫的厚度（向外），畫中高度依然是 -z；不是把整個物件又旋轉站起一次。`mesh` 的尺寸受原本部品 footprint 約束；每個 chunk 的材質一定是既有 MAT。每個三角形三頂點材質相同。只輸出有限數值、非零面積、接近單位法線。不能把凹輪廓直接扇形三角化；屋頂／破風用對應曲線間的條帶，洞用多個桿件的空隙。

新 `mesh-geometry.js` 只提供本包需要的 `extrudeConvex`（凸截面）、`sweepHalfTube`（中心線 [x,z,r]，可另給 y 基高）、`ribbonMesh`（[x,y,z] 表面路徑、width、薄厚）、`packMeshes(parts)`。輸入與出錯條件用 JSDoc 記錄。後包物件專用 helper 放各自 module，不讓第一包先造整個模型系統。法線由面的切線叉積或解析式產生；縮放／鏡射後重算，禁止拿頂點位置當法線。

`packMeshes` 對每個頂點追加 owner/style 成 16 floats（64 bytes）：pos3、normal3、uv2、owner4=(index,foot,anchorX,anchorZ)、style4=(hinge,mat,isBird,bias)。其正負值不借用樹的負 hinge 標記；p5 的 treeRider 用獨立 attribute／flag 擴充，屆時明確更新 layout，不先猜需求。p1 isBird=0；未使用參數填零不代替輸入驗證。

### 4.2 renderer、bake、陰影

- `bake.paintLayer` 跳過 p.mesh，如同跳過樹；`identMaps` 照樣畫真實 projected fills。**不可刪 ident**，否則點選與 leave-behind 分支失去主人。
- `renderer.setWard` 的 standing 篩選加 `!p.mesh`；mesh VAO/VBO 在換區時重建資料、每幀不再產生幾何；空區 count=0。由 `own()` 註冊釋放，`freePlate/dispose` 不洩漏。加 `dataset.meshVertices` 供報告。
- 新 `mesh-shaders.js` 的 `meshVert(mode, GROUND)`：使用真正 aPos/aNormal；鉸鏈、sway、uOpening、uTilt 順序照 partVert。接地 `gy` 仍用舊公式 `mix(groundY(q),groundY(vec2(q.x,foot)),smoothstep(.1,.7,A.y))`，非鉸鏈物件走 groundY(q)。不在 GLSL 再查 soft 來算物件厚度；只查地子的 groundY。接地彎曲的梯度要作用到法線（取 groundY 的 x/z 差分，按位置映射的 Jacobian 變換／逆轉置法線），不能讓坡上的表面高光錯位。
- `shaders.frag(mode, tree)` 加 **type 3 = explicit mesh**。type 0／1／2 路徑保持原樣。type 3 直接由 vPart 取 index、材質，真法線、fine=0、hs=1；不讀 ident 來 discard、不套 body、不畫樹皮、不把所有 surface 都乘樹的刻線係數。MAT.aogai 若使用，fine.g 應是完整覆蓋 1，不能因 fine=0 隱形。付描用有確定 y 的細帶／薄片子網格，沿同一個 owner 移動；無需新 texture array。
- 新網格每幀必須同時參與 **7 陰影深度 → 5 深度預寫 → 2 EQUAL 上色**，共用 shade texture、投影與 tilt，`invariant gl_Position`；三 pass 使用同一頂點函式，不做獨立影子剪影。每 pass 合併一個 mesh draw；畫完還原 VAO、depthFunc、activeTexture，不破壞樹、霞、箱體。
- 完成前必須用截圖確認 `plate="true"`。shader compile 失敗會回退舊浮雕，單看「有圖」不算成功。

### 4.3 運動、命中與不變條件

- `preparePlate` 加 mesh 格式驗證與 motionWith/rigidGroup 驗證；錯誤列入 errors，不能吞掉。root 必須在同 group、不能為 bird、不能循環。保留 foot=max(group bounds.z)；不為每根柱自訂不同腳線。
- `createLife.update` 最後同步 motionWith 的 **a.x、a.y、b.x、b.y、b.z**，連 state 的對應 x/v 也同步，避免下一幀殘速；a.z/a.w 留本 part 的材質甦醒與亮光。根不讀從屬者。不影響原樹與 treeRider 同步。
- p1 的 butai-frame 是 butai 全組根，讓目前仍膨脹的 hondo 也保持貼台；torii-lip 跟 torii。p2 堂、門與迴廊做完整結構時各自共用根；五重塔保留每層不同 order 的甦醒，不能把全塔鎖成一個 stand，既有 tower test 不能改。每層內 wall/lamp/roof/lip 同步，層間維持原本分層活動，不跨層建一根會被拉裂的連續網格。
- 原始 fills 必須對應可見形體；可拆成多塊、不能保留消失的黑牆作隱形命中。reach 對新桿件用 .5–1，不能用 4 單位膨脹又把負空間填進 picking。薄桿可保留中心線命中容差，但不跨孔洞。
- partAt 仍是盤面映射，不在本夜引入 raycaster。不能藉重編 ID、改測試容差、移樹／縮整個建築、擴足印外框來過驗收。

## 5. 拆包與完整性

| 順序 | 包／最多三個任務 | 實作前置 | 影響區／理由 |
|---|---|---|---|
| 1 | p1：完整 mesh 接線；鳥居＋清水柱網；測試與圖 | base 可直接做 | 造形重點伏見／東山；共用管線需十一區回歸。矩形桿與半管最易驗尺寸，先解最顯眼缺陷 |
| 2 | p2：屋面與牆；塔／門／迴廊；測試與圖 | p1 已 PASS | 十一區；可重用的屋面一次改善最大面積，不能只改南區 |
| 3 | p3：燈籠結構；測試與圖 | p1 已 PASS（不依賴 p2） | 西京、山科；局部且容易量測 |
| 4 | p4：狐；鳳凰；測試與圖 | p1、p2 已 PASS（不依賴 p3） | 伏見、北；鳳凰使用 p2 已確定的屋脊承托高度，避免猜膨脹面的高度 |
| 5 | p5：鶯形體；載體／隱顯；測試與圖 | p1 已 PASS（不依賴 p2–p4） | 十一區；最後處理枝高、腳接觸、兩棲點以及不可見鳥的影子 |

這是依序累加、每包結束都能用的工作包；不是可同時套到 base 的五份獨立 patch。p1 若不過就停，不讓後包代修共用基礎；後包不依賴任何尚未完成的工作。共用檔案永遠只有當包 Hydrogen 一個寫入者。

各包精確 write set、函式、尺寸、測試在 `.claude/dispatch/pkg-p1.md` 至 `pkg-p5.md`；執行順序在 `packages.json`。每包保留既有測試原文，只在 `scripts/plate.test.mjs` 末尾新增具風險意義的測試，因既有 gate 只執行這支，不另造不會被跑的測試檔。

## 6. 驗收、證據與停損

每包 Hydrogen 只能跑既有 allowlist 的三條（各自單獨呼叫）：`node --test scripts/plate.test.mjs`（180秒）、`npm run lint`（120秒）、`node .claude/dispatch/shot.mjs`（單批300秒）。用讀寫工具把 jobs-pN.json 複製內容到 jobs.json，不用 shell cp。dev server／Chrome 由既有流水線管理；本設計輪不開瀏覽器。只讀搜尋用檔案工具。每個相同檢查最多兩次失敗，交原始日誌與 diff、停止該包，不改驗證來通過。

`jobs-pN.json` 是 gate 可直接使用的輸入；night=月光、day=暖日、-still=按暫停；steps 對照 handoff §7。全景均要求 1440×900／倍率1，另有 2.5 倍近觀、375×812、暖日或靜止的代表情境。fx/fy 是光與縮放錨點，**不是直接設定相機的裁切中心**；本輪只按現圖估定位，未執行拍攝，第一輪圖需核實目標入鏡。所有圖片檔名與 console/dataset 必須一起讀，空圖、錯區、plate=false 都 FAIL。

圖片 gate 能證明定格形體，不能證明鍵盤、OS reduced-motion 或兩棲點的完整動作。既有 shot.mjs 不提供這些操作，不能假稱驗過；鶯兩棲點用純資料／life 的新增測試驗接觸和同步，另以兩個光位置拍各側畫面。審查若需要特定動作中間幀，記為補驗需求，不許用靜態圖代證。每包必看：新細節是否比原圖更像指定參考、實體根與影子接地、交點是否穿插、窗與柱縫是否真的透、日夜是否仍讀得出形、暫停是否躺下且仍有材質反光。

每包報告 `.claude/dispatch/agy-pN.md` 要列：base、請求／實際模型（無工具證據寫未確認）、修改檔案與函式、每次指令 exit／pass／fail、各區部品數與新 mesh 頂點數、shots 檔名與可觀察差異、CONFIRMED/PLAUSIBLE 問題、未 commit/push。不要寫沒有指令來源的效能改善數字。

整合者在取得實作授權的階段，仍須執行 repo 的 `npm test`、`npx --no-install tsx validate_data.js`、`npm run build` 及 lint；ERROR=0、WARN不增加。它們不在 Hydrogen 的三條 allowlist 內，由整合者執行，**不能把本地三條 gate 的 PASS 說成全專案整合驗收完成**。現有 night.sh 只跑局部 gate，其 commit/cleanup 行為也不是本文件新增的授權，本輪不執行或改寫該腳本。

退回指南：後包依賴 p1 的 API，保留已 PASS 包與日誌；未通過包只保留 diff 交整合者，Hydrogen 不做 reset/checkout/clean。設計檔與 `.claude/dispatch` 不應成為清除使用者變更的依據。只有使用者授權後由主代理處理 Git；沒有任何一包要求先 push 才能驗圖。
