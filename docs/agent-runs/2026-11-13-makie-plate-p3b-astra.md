# 2026-11-13 蒔繪浮雕盤 P3 後半

任務：P3 後半／八區實作與指定畫面檢查完成；標準指令驗收部分完成，兩個 tsx 入口受沙箱阻塞，同一原始碼已補驗通過。

請求模型／強度：`gpt-6-astra`／high（使用者指定）；實際設定：未確認，工具未提供執行模型與強度證明。本工作階段直接實作，未再派代理。

工作區：`C:\Git\Kyoto-Tactical-Guide`；分支：`claude/great-brahmagupta-ye2uqt`。
派工 base：`4e176a7`；開工讀到 `321664d`，讀檔期間外部新增 `001946d917260eb1bf2af14ba18f74ac68296efd`，以下驗收綁定該 HEAD 加本輪 diff。
`001946d` 移除了「北區尚未登記」的舊斷言；該變更不是本執行者所做。本輪測試修改只有新增 57 行，沒有修改、刪除或跳過既有測試。

程式碼快照 SHA256：`7f771cbc4174b66c3a0a1d688defb4067b6d53f53fefb2a28e2d13f1338e33ad`。
計算方式：將 `plate/{vocab,parts,kita,ukyo,nishikyo,sakyo,kamigyo,shimogyo,nakagyo,yamashina}.js` 與 `scripts/plate.test.mjs` 的路徑排序，依次加入「路徑、NUL、檔案原始 bytes」後取 SHA256；不含本回報。

## 變更與各區結果

新增八區檔案；`parts.js` 只加 import 與 `PLATES` 登記。`vocab.js` 新增 15 個語彙：`pond`、`phoenix`、`moonDeck`、`steppingStones`、`lantern`、`sandGarden`、`sandCone`、`corridor`、`courtTree`、`ginkgo`、`karamon`、`moatWall`、`stoneSteps`、`sanmon`、`gardenGround`。

既有函式僅增加預設不變的選項：`storey` 的 `mat`／`windowMat`，以及 `bird` 每個棲點的第五值 `bias`（預設仍為 32）。新區鶯使用 20 或 22，讓腳貼近實際葉墊；原三區沒有改變。

截圖都在 `.shots/p3b/`。下表每列四個檔案均已逐張看過：`night`＝1440×900 月光、`day`＝1440×900 暖日、`close`＝1440×900 月光 2.5 倍、`mobile`＝375×812 月光。這些是 viewport 規格，腳本輸出裁切後的文箱畫布；手機使用 2 倍 deviceScaleFactor。

| 區／步數 | 構圖骨架 | 部品 | 本輪新語彙（不重列共用庭地） | 已看截圖檔名 | 仍不理想之處／取捨 |
|---|---|---:|---|---|---|
| 北／5 | 三層金閣與水平倒影，右側島松平衡，左前留白 | 32 | 池、倒影、鳳凰 | `kita-night.png`、`kita-day.png`、`kita-close.png`、`kita-mobile.png` | 鳳凰採誇大的紋章輪廓；倒影是靜態圖案，沒有同步建築動畫 |
| 右京／1 | 左側近堂、右側池、遠山三段借景，前側留白 | 27 | 池 | `ukyo-night.png`、`ukyo-day.png`、`ukyo-close.png`、`ukyo-mobile.png` | 手機遠山起伏較含蓄，右前楓在全景偏小 |
| 西京／2 | 低書院沿池岸錯落，竹簀月見台與飛石引入池庭 | 32 | 月見台、飛石、石燈籠，沿用池 | `nishikyo-night.png`、`nishikyo-day.png`、`nishikyo-close.png`、`nishikyo-mobile.png` | 月見台以淺立面表示，近觀仍帶正面板感；刑部地顆粒較醒目 |
| 左京／-4 | 深色雙層殿與銀沙灘對置，向月台收住右前角 | 30 | 砂庭、砂紋、砂錐台，沿用池 | `sakyo-night.png`、`sakyo-day.png`、`sakyo-close.png`、`sakyo-mobile.png` | 向月台在光離開時偏扁；黑漆屋頂在特定反光角度會變亮，材質本身不是銀 |
| 上京／-5 | 紫宸殿為院首，四段低回廊圍合南庭，櫻橘相對 | 40 | 回廊／塀、白砂庭、櫻與橘 | `kamigyo-night.png`、`kamigyo-day.png`、`kamigyo-close.png`、`kamigyo-mobile.png` | 回廊保留間斷以遵守組間距；櫻橘採家紋式大花與大葉，非寫實樹冠 |
| 下京／-1 | 大小雙堂與渡廊共用腳線，前側大銀杏與空庭相對 | 29 | 銀杏，沿用塀／渡廊 | `shimogyo-night.png`、`shimogyo-day.png`、`shimogyo-close.png`、`shimogyo-mobile.png` | 銀杏刻意只保留三片大扇葉；後塀是低而長的線性界面 |
| 中京／-3 | 六棟御殿雁行下降，唐門守左庭，石垣與堀壓前緣 | 43 | 唐門、石垣與堀 | `nakagyo-night.png`、`nakagyo-day.png`、`nakagyo-close.png`、`nakagyo-mobile.png` | 六棟之間的連接省略；全景石垣接縫較淡，近觀可見；刑部地偏醒目 |
| 山科／3 | 石階中軸穿過開口山門通往本殿，兩側大楓收束 | 32 | 石階、開口山門，沿用石燈籠 | `yamashina-night.png`、`yamashina-day.png`、`yamashina-close.png`、`yamashina-mobile.png` | 燈籠保持粗壯剪影；楓的細枝沿用既有線描語彙，非獨立粗實體 |

另補近觀：`sakyo-cone-close.png`、`nishikyo-lantern-close.png`。

八區每區 2–3 道霞、1–2 顆岩（中京石垣算一個岩類部品）、兩個鶯棲點。新增測試檢查所有點的邊界、不同實體組至少 12 單位間隔，以及鶯的兩隻腳都落在載體填色輪廓內。

留白量測使用盤面 6 單位網格，計算不在任何 `fills` 多邊形內的採樣點，不計陰影、線寬與膨脹模糊：北 34.7%、右京 42.1%、西京 36.6%、左京 31.0%、上京 28.5%、下京 38.3%、中京 30.4%、山科 36.2%。新增測試另用 8 單位網格檢查約三分之一的留白範圍（26%–46%）。這是源圖量測，不宣稱是渲染畫面的精確像素占比。

## 檢查

| 指令 | 退出碼 | 結果／日誌 |
|---|---:|---|
| `node --test scripts/plate.test.mjs` | 0 | 14/14，含新增 2 項；完整 npm 測試日誌也包含這 14 項 |
| `npm run lint` | 0 | `.shots/p3b/lint.log` |
| `npx --no-install tsx validate_data.js --strict` | 1 | tsx 初始化呼叫 `os.userInfo()` 時失敗；尚未進入驗證。`.shots/p3b/validate.log` |
| `npm test` | 1 | `scripts/*.test.mjs` 92/92；接著 tsx 初始化失敗，未執行 `src/lib/*.test.ts`。`.shots/p3b/test.log` |
| `npm run build` | 0 | `.shots/p3b/build.log` |
| 同一原始驗證程式與兩個 TS 測試，以現有 TypeScript 編譯器補驗（下方完整指令） | 0 | 809 筆、ERROR 0／WARN 0（strict）；TS 測試 6/6。`.shots/p3b/ts-supplement.log` |
| `git -c safe.directory=C:/Git/Kyoto-Tactical-Guide diff --check` | 0 | 無 whitespace 錯誤；Git 提示未來 checkout 的 autocrlf 轉換，現有 LF／CRLF 已保留 |

本輪測試內容合計 92＋6＝98 項通過；**不等於四個原始驗收指令全部 exit 0**。原始 tsx 入口在此沙箱內成功執行仍為**未驗**。

CONFIRMED：單獨執行 `node -e "console.log(require('node:os').userInfo())"` 也回報 `uv_os_get_passwd returned ENOMEM`，定位在沙箱使用者資訊查詢，與本輪美術資料無關。沒有改 tsx、node_modules、驗證程式、package.json 或既有測試。

曾嘗試 Node 原生 TS 執行，但舊測試的無副檔名 import 無法解析；Vite SSR 補驗則遇到驗證程式動態 import 的 Windows 絕對路徑解析失敗。兩次都沒有改來源，日誌為 `test-native.log`、`vite-supplement.log`。最後用專案既有 `typescript` 做記憶體內轉譯及 `.ts` 解析，執行原始驗證與原始測試，指令如下：

```powershell
@'
import {registerHooks} from 'node:module';
import {readFileSync,existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import ts from 'typescript';
registerHooks({
 resolve(specifier,context,next){
  if(specifier.startsWith('.')&&context.parentURL){
   const candidate=new URL(specifier+'.ts',context.parentURL);
   if(candidate.protocol==='file:'&&existsSync(fileURLToPath(candidate)))return next(candidate.href,context);
  }
  return next(specifier,context);
 },
 load(url,context,next){
  if(url.startsWith('file:')&&url.endsWith('.ts'))return {
   format:'module',shortCircuit:true,
   source:ts.transpileModule(readFileSync(fileURLToPath(url),'utf8'),{
    compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}
   }).outputText
  };
  return next(url,context);
 }
});
process.argv.push('--strict');
await import('./validate_data.js');
await import('./src/lib/map-geometry.test.ts');
await import('./src/lib/map-labels.test.ts');
'@ | node --input-type=module
```

## 畫面與來源證據

使用既有 `http://127.0.0.1:3000` 與 `.claude/dispatch/shot.mjs`；沒有啟動另一個 dev server。腳本使用 Chrome headless、D3D11 參數；實際 GPU 型號、幀率**未驗**。

重拍最後版本的命令為：

```text
node .claude/dispatch/shot.mjs C:/Git/Kyoto-Tactical-Guide/.shots/p3b <job> [job...]
```

各區步數見上表；全景與手機倍率 1、近觀倍率 2.5。精確四種焦點與 viewport：

| 區 | night／day 焦點 | close 焦點 | mobile 焦點 |
|---|---|---|---|
| kita | 0.42,0.4 | 0.42,0.3 | 0.5,0.5 |
| ukyo | 0.38,0.55 | 0.36,0.52 | 0.5,0.5 |
| nishikyo | 0.4,0.45 | 0.34,0.38 | 0.5,0.5 |
| sakyo | 0.53,0.56 | 0.37,0.36 | 0.5,0.5 |
| kamigyo | 0.5,0.4 | 0.49,0.38 | 0.5,0.5 |
| shimogyo | 0.5,0.44 | 0.35,0.58 | 0.5,0.5 |
| nakagyo | 0.48,0.5 | 0.37,0.62 | 0.5,0.5 |
| yamashina | 0.5,0.5 | 0.5,0.46 | 0.5,0.5 |

最後執行的 JSON 證據在 `shots-final-a.log`、`shots-final-b.log`，細節補圖在 `shots-details.log`；均位於 `.shots/p3b/`。第一批 `ukyo-day` 曾拍到南區，已在第二批最後重拍覆蓋並確認 `ward=W_UKYO`，不把錯區截圖算驗收。最終各圖 `plate=true`，未印出 `CONSOLE:` 錯誤。

題材來源依使用者指定的 `src/studies/toji/landmarks.js` 標題與 `scenes`，查讀日期 2026-11-13；這是蒔繪構圖，不是實測重建。沒有新增建築身分、地址、座標、旅遊資訊或外部史實主張；現地建築現況與旅遊資料查證**未驗**。

原三區回歸：用 `git show 001946d:src/studies/toji/plate/vocab.js` 與當時三個區檔，透過 data URL 載入原 builder，與目前 `PLATES` 的輸出做 `assert.deepEqual`，退出碼 0。部品數南 52、伏見 35、東山 30；JSON 的 SHA256：

```text
minami       b16eca9a99ed3e04994b94a2956459d5e1a10e8bdb5f489ded3541b596539dd7
fushimi      ba72cb35e4f46fe13d832dbf611332fed45c0432cc3442ce9c6e3a74bc94cff8
higashiyama  e06f822252de549db54c3920a953557f8abaf5189fa7a2234e7a7124e05360aa
```

## 引擎、規則與未驗項

- CONFIRMED：以此引擎畫長縱深的月見台，立起後會像高屏風；已改成寬而淺的立面造形。石階、池、砂庭、砂紋、飛石及庭地均留在 layer 0。
- CONFIRMED：向月台若用不轉起的岩類，只會像平石；本輪改成獨立的 `KIND.tier` 截錐立面。它不是銀沙灘地子的其中一條砂紋。
- 棲點在葉片內是必要條件；實際葉墊厚度也影響視覺高度，所以新增每棲點可選 bias。各幀、各光位下的接觸狀態與換棲完整動畫**未驗**；已驗兩腳在載體內及選定靜幀。
- 首頁三函同框、開蓋、鍵盤、語系、減少動態、WebGL1 降級、真機觸控、iOS Safari、效能及長時間運行**未驗**。本輪指定的四種靜態畫面已完成，不能代替上述情境。
- 沒有修改任何 renderer、shader、bake、spring、cord、study、CSS、資料檔或型別；沒有新增依賴。

交接：八區均已登記，可直接在既有 dev server 查看；標準 tsx runner 的沙箱相容性仍未解除。程式內容與測試已補驗，不需為此修改驗證標準。
所有結果留在工作區 diff；本執行者未 commit／push／切分支／stash／reset，也沒有修改外部新增的 commit。

回退範圍（僅供主代理選擇，不在本輪執行）：移除八個新區檔及本回報，撤回本輪對 `vocab.js`、`parts.js`、`plate.test.mjs` 的 diff；保留外部 `001946d` 與原三區。不要對整個工作區做 reset。
