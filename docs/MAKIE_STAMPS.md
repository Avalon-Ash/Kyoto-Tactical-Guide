# 樹：半管形體與薄印記

2026-11-14。只適用松、楓、銀杏、櫻、橘；地子、岩、建築、霞仍用原本的烘焙／膨脹路徑。

## 資料

`vocab.js` 的樹函式轉出 `trees.js` 的純資料 builder，沒有 DOM 或 three.js。`branchPine` 等舊呼叫名稱是同一 builder 的別名，區檔既有的根位置、高度、傾斜與 seed 保留。

每棵樹包含 `-trunk` 與葉部品，全部共用 `group`、`anchor` 與腳線：

```js
{
  limbs: [{points: [[x, z, radius], ...], bark: 1, mat /* optional */}],
  stamps: [{x, z, w, h, turn, cell, mat, offset, relief}],
  perch: [x, z, height],
  thick: 0,
  fills: [/* 由半管外框與印記外框導出的點選覆蓋；不拿來膨脹 */]
}
```

- `limbs.js` 將每條肢掃成半橢圓管，十二個剖面段；高為半徑 × `LIMB_HEIGHT`（0.62）。尖端半徑收細，分枝起點埋入母枝；根與端點有封口，分叉是相交網格，沒有 boolean union。
- `stamps.js` 定義八格：松針扇、松葉層、五裂楓、七裂楓、銀杏、五瓣花、橘葉、橘果。`stampDrawing` 同時供烘焙與純資料外框使用。
- `preparePlate` 以載體的 `perch` 平移鶯的整體圖形，兩腳中心對齊實際橫枝；區檔原本的棲點坐標只是舊資料輸入，樹上的最終位置以 `perch` 為準。建築上的棲點維持原路徑。
- `createLife` 最後同步樹葉與鶯的 hinge、sway、平移至幹的值，保留鶯自己的出現／消失與跳躍。

## GPU 流程

1. 一次烘焙 192 × 192 × 8 的 RGBA8 texture array，逐格 mipmap，沒有模糊或外擴。R＝薄浮雕高度、G＝覆蓋、B＝線描、A＝覆蓋副本。陣列層之間不會串色。
2. 換區時重建半管 vertex buffer 與印記 instance buffer。每個印記為六個頂點、一個 quad；位置與轉角固定在樹的平面，不朝向攝影機。`offset` 依固定資料次序增加，重疊順序不隨鏡頭改變。
3. `tree-shaders.js` 共用地子高度查詢，在根的平面上套鉸鏈、擺動、開蓋與整箱傾斜。樹為剛性平面，不讓每片葉單獨貼地變形。
4. 三個 pass 均畫半管與印記：陰影深度 → 深度預寫（alpha-to-coverage）→ `EQUAL` 上色。與其他實體共用深度、陰影貼圖。
5. `shaders.js` 的 `frag(mode, tree)` 中，`tree=0` 保留舊部品；1 為半管；2 為印記。半管用真實法線與沿管 UV 樹皮紋；印記由高度梯度求法線，微浮雕不改 quad 的深度。材質沿用既有金、淡金、銀、青貝等分支。
6. `bake.js` 跳過樹的 `fine/soft` 繪製；`identMaps` 保留實際外框，`partAt` 仍可點選。沒有樹的模糊輪廓、枕形網格或留底重影。

樹上鶯仍是原本銀鳥網格。`solidMesh` 以負的 hinge 屬性標記 `treeRider`；vertex shader 取絕對值旋轉，另使用載體根平面與枝高，扣掉薄腳自身的最低膨脹高度，避免雙重墊高。

## 旋鈕與驗證

| 想調整 | 位置 |
|---|---|
| 根、大小、傾斜 | 各區呼叫的 `x/z/h/lean` |
| 幹曲線、分枝、葉簇排布、棲點 | `trees.js` 的 `stampedTree` |
| 半管厚扁比／剖面段數 | `limbs.js` 的 `LIMB_HEIGHT`／`limbMesh` |
| 葉緣、針、葉脈 | `stamps.js` 的 `stampDrawing` |
| 印記尺寸、薄浮雕量、固定疊高 | `trees.js` 的 `stamp` 與各樹種配置 |
| 樹皮、線描深淺 | `shaders.js` 的 `TREE` 分支 |
| 立起與擺動 | `parts.js` 現有 `HINGE` 與 life；不是印記自己的動畫 |

`node --test scripts/plate.test.mjs`：原有 16 項不變，新增 4 項覆蓋純資料、四單位細枝、十一區鶯腳與同步、非法幾何拒絕。視覺與效能證據見 [本輪報告](agent-runs/2026-11-14-makie-plate-stamps-astra.md)。

限制：薄葉沒有立體側壁；分叉不是拓撲焊接；手機全景只讀整體葉量，不能逐一辨識所有葉脈。這些不是四分之一解析度模糊造成的限制。
