# 蒔繪浮雕盤 W2d：幹枝、薄葉與真塗月器

任務：`MAKIE_REFERENCES.md`「對下一輪的含意」第 1 點、`MAKIE_PLATE_HANDOFF.md` §8.0a 第 2 項／**部分完成**。五區套用新樹與兩個枝上棲點；左京月器完成實作及指定三種畫面。六區寫入 EPERM，保留原樹，沒有將十一區重做標成完成。銀杏、櫻、橘的新語彙已寫，但未接到受限區檔，未做新造形的瀏覽器驗收。

請求模型／強度：`gpt-6-astra`／high；實際設定：**未確認**，本工作階段工具未提供可核對的模型與強度證據。

工作區：`C:\Git\Kyoto-Bunko`；分支：`claude/great-brahmagupta-ye2uqt`；base SHA：`73bd04ddea215c1dfc2b30390dfd813a87d772c2`。開工工作樹乾淨。沒有提問、再派代理、commit、push、切分支、stash、reset、安裝套件或自行啟動 Chrome／dev server。

當次派工優先於舊交接：四項整合檢查留給主代理；不按舊 §8.0 提問或 commit。新參考的「幹枝立體、葉薄」取代舊 §6 的整團闊葉冠。沒有修改合約、參考文件、正式測試或渲染器。

## 已套用的變更

下表程式路徑相對 `src/studies/toji/plate/`。截圖相對 `.shots/w2d/`。

| 項目 | 檔案:行號與行為 | 畫面證據 |
|---|---|---|
| 松 | `vocab.js:521` 的 `wood` 產生漸細曲枝；`:535` 的 `branchPine` 是彎幹＋三層分枝＋六個小扇簇。幹寬至少 12、厚 16；枝厚 10；葉厚 3、bias 10。每層兩簇共用一部品，寬約 23.4–30，水平間隙 12，放射針線與曲線樹皮。 | `close/minami.png`、`close/fushimi.png`、`close-final/sakyo-pine.png`；躺姿 `rest/minami.png`、`rest/fushimi.png`。 |
| 松的接線 | `minami.js:3,23,28`、`fushimi.js:4,35,38`、`sakyo.js:3,21,23` 用 `branchPine as pine`，同步把兩棲點放到下層外露枝段，bias 10。 | `before/<區>.png` → `final/<區>.png`、`phone/<區>.png`，區名 minami、fushimi、sakyo。 |
| 楓 | `vocab.js:375` 的 `branchBroadleaf`、`:420` 的 `branchMaple`：曲幹、兩側枝、三片五裂掌形薄葉；幹枝厚 12，葉厚 2.5、bias 12；既有平文落葉保留。沒有底冠或七個鼓包。 | `close-final/higashiyama.png`、`close-final/yamashina.png`。 |
| 楓的接線 | `higashiyama.js:3,24,27`、`yamashina.js:3,18,22` 改新語彙、兩個棲點改右側枝段，bias 12。 | `before/<區>.png` → `final/<區>.png`、`phone/<區>.png`。 |
| 鶯 | `bird` 本身不改；上述五區十個棲點全部重放。松載體是 layer 3 的 boughs；楓載體是 layer 3 的 trunk（含側枝）。 | 五區第一棲點見 close／close-final；第二點全在 `perches/<區>-perch2.png`。 |
| 左京月器 | `vocab.js:735` 的 `moonBowl`：黑漆器 `MAT.lacquer`、厚 12、bias 18；圓口用橢圓與口沿線表示，青貝月影和三道平文銀線各一部品。三件與台同組 `kogetsudai`。`sakyo.js:12` 放到頂高 98，刪掉地子月。 | `close/sakyo-moon.png`、`final/sakyo.png`、`phone/sakyo.png`。西京的 `pond-moon` 呼叫及 `moon` 函式完全沒改。 |

六個區檔不能同步棲點，故沒有直接覆寫原 `pine`／`broadleaf` 的共用行為：新版本以 `branch*` export 接入可寫五區，舊 export 暫供受限區使用。這是本輪權限造成的過渡，**不是已完成全區遷移**。待主代理套用文末兩行／檔的替換後，才可檢視、移除不再使用的舊語彙。

`branchGinkgo`（`:421`）與 `branchCourtTree`（`:422`）提供粗幹扇葉、薄花雲＋青貝瓣、少量橢圓葉＋平文果點。記憶體候選組版有做部品／腳端／間距／留白稽核；因下京、上京無法寫入，**沒有畫面證據，不宣稱造形通過**。

## 與參考並排後的觀察

完整讀取 `MAKIE_REFERENCES.md`；15 張 PNG 都實際開啟：pine-makie-row、pine-hiroshige、pine-puffs-ginkgo、pine-shiozan-kakego、maple-makie、kiyomizu-hiroshige、fox-1、fox-2、lantern、moon、pagoda、phoenix、rocks-hills-1、rocks-hills-2、uguisu。

`node .claude/dispatch/w2d-compare.mjs` 產出並已查看 `compare/pine.png`、`compare/maple.png`、`compare/moon.png`。只是把提供的參考與實際成品圖放在左右欄，沒有重畫參考圖。

- 松：與蒔繪松相同的是露出的彎幹、分枝、分離的薄扇與針線。相較 `pine-makie-row` 第 1、4 張及廣重，現在三層枝序還太規整、橫伸不夠長，整體偏稀疏，仍有修剪過的盆栽／枝架感。葉不再是大菇傘，但還不能稱為參考中的繁茂老松。薄葉在躺姿留有側緣鋸齒，見 `rest/`。
- 楓：`maple-makie` 第 3 張能一片片讀葉；本輪也能讀到三片掌形與其間空隙。不同處是參考有許多小葉簇沿長曲枝交疊，本輪只有三片，仍偏徽飾、枝端偏直立。375 暖日主要看到三個星狀小亮點與叉枝，不能逐一辨清五裂。中途 `close/higashiyama.png`、`close/yamashina.png` 的中央枝曾與主幹合成大實面，移除重複上枝後以 `close-final/` 為準。
- 鶯：相比 `uguisu.png`，五區的鳥現在跨坐枝段；新位置下方能看到側枝。鳥身仍大、兩腳線很細，身體常遮去一部分葉片，不能從靜態圖保證動畫每幀接觸。
- 月器：`close/sakyo-moon.png` 可讀出銀台、黑漆器的厚壁與口沿、器內藍綠月影；三道銀光是短線，沒有粉狀散佈。`moon.png` 提供材質與圓器造形參考，本輪構圖依使用者指定的台上盛水器，沒有把參考中的秋草月搬過來。375 暖日器只剩小黑圈，月影的顏色與銀線不易分清。器與台共用既有傾軸，口面是圖繪橢圓，未聲稱實作獨立水平水面或真的凹腔。
- 未改六區：北仍是厚葉墊松；右京的楓、上京櫻橘、下京銀杏仍是鼓包冠。`close/ukyo.png`、`close/kamigyo.png`、`close/shimogyo.png`、`pine/kita-close.png` 都看過；不列作新語彙的驗收。

## 測試與幾何數字

每次都執行原封不動的 `node --test scripts/plate.test.mjs`，沒有修改測試。各次日誌 `.shots/w2d/test-00.log` 至 `test-06.log`。

| 日誌 | 時機 | 通過／失敗 | exit |
|---|---|---:|---:|
| 00 | base | 16／0 | 0 |
| 01 | 最初共用 pine 換新，但六區 EPERM、舊棲點未改 | 15／1 | 1 |
| 02 | 改顯式 branchPine 接線，可寫區才一起換樹與棲點 | 16／0 | 0 |
| 03 | 東山、山科新楓與枝上棲點 | 16／0 | 0 |
| 04 | 松葉壓扁加寬、枝厚下調；左京月器 | 16／0 | 0 |
| 05 | 移除楓的重複中央上枝、幹厚下調 | 16／0 | 0 |
| 06 | 未接線的櫻瓣／橘果 bias 與薄葉高度配對 | 16／0 | 0 |

唯一正式測試失敗為 `W_KITA: uguisu-1 has a supported foot`，原因是原棲點搭配新幾何。沒有擴大支撐形狀或修改測試去過關；改為新舊語彙分開，必須連同棲點才遷移。另一次 shell 的 `node -e` 因 PowerShell 引號導致 SyntaxError，尚未寫任何來源；改直接 patch 單行後才跑 06。

`node .claude/dispatch/w2d-evidence.mjs`：exit 0，`final-audit.json`／`final-audit.log`。實際十一區 preparePlate errors 全空、兩棲點共 **44／44 腳端**在 layer 3 載體來源填色內。這不是 GPU 動畫逐幀接觸測試。

| 區 | base → 最終部品 | 最小組間距 | 腳端 |
|---|---:|---:|---:|
| 南 | 52 → 54 | 7.84 | 4／4 |
| 伏見 | 38 → 40 | 4.44 | 4／4 |
| 東山 | 47 → 26 | 23.94 | 4／4 |
| 北 | 32 → 32 | 19.54 | 4／4 |
| 右京 | 34 → 34 | 14.00 | 4／4 |
| 西京 | 35 → 35 | 12.29 | 4／4 |
| 左京 | 31 → 35 | 68.16 | 4／4 |
| 上京 | 55 → 55 | 19.96 | 4／4 |
| 下京 | 36 → 36 | 26.99 | 4／4 |
| 中京 | 44 → 44 | 14.32 | 4／4 |
| 山科 | 48 → 34 | 36.10 | 4／4 |

上限 63，實際最大 55。八個新區的邊界、12 單位間距與留白限制均由正式測試通過；不把舊三區說成有同樣邊界／留白要求。額外稽核的 `outside`、`bare` 對舊三區只是數字，非新增正式驗收條件。

候選替換只是讀取受限檔內容、在記憶體套用 import／棲點，再用 data URL 匯入純幾何；未寫原檔、未改瀏覽器產品資料。六區候選的部品數分別為北 33、右京 29、西京 37、上京 45、下京 30、中京 46；腳端各 4／4、最小間距皆 ≥12、留白 26%–46%、越界點 0、preparePlate errors 空。**這不能替代套用後正式測試及畫面驗收。**

## 瀏覽器證據與重現

沿用已開的 HTTP 3000 與 CDP 9377；開工兩者 HTTP 200。未自行開服務。`.shots/w2d/` 共 63 張 PNG，皆實際開啟查看，包括改前、階段圖、比較圖及最終圖；畫面都是桌面無頭 Chrome，手機指 viewport 375×812、DPR 2，不代表實機。

- 改前：`before/<十一區>.png`，1440×900 月光。
- 改後：`final/<十一區>.png`，1440×900 月光；`phone/<十一區>.png`，375×812 暖日。
- 松階段：`pine/` 三個已遷移區全景、南／伏見／北 2.5 倍近觀。北為原版。
- 楓：`close-final/` 東山、山科；舊版受限樹的指定近觀在 `close/`。
- 左京月：`close/sakyo-moon.png`、`final/sakyo.png`、`phone/sakyo.png`。
- 無光躺姿：`rest/` 南、伏見、北；先近觀，再移光到畫布右上並等 6.5 秒，未按暫停。
- 五個已改區第二棲點：`perches/`，真實點擊切換，dataset 均 `poked=uguisu-0`，沒有直接寫動畫狀態。

主要命令：

```text
node scripts/plate-shot.mjs C:/Git/Kyoto-Bunko/.shots/w2d/<目錄> <job> …
node .claude/dispatch/w2d-final-shots.mjs
node scripts/plate-shot.mjs C:/Git/Kyoto-Bunko/.shots/w2d/phone sakyo:-4:day:375x812:1:0.5,0.5
```

完整最終批次與 jobs 在 `shot-jobs.json`；各目錄 `run-*.log` 保存退出碼與 dataset。南／伏見近觀焦點 `.30,.54`／`.40,.66`；北 `.61,.62`；東山 `.37,.60`；山科 `.33,.45`；左京月 `.58,.73`，皆 1440×900 月光、2.5 倍。舊右京 `.63,.72`、上京 `.43,.48`、下京 `.32,.52`。

手機批次中左京首次圖遇到來源 HMR，dataset 回到 W_MINAMI，逐張看圖發現後重拍。`phone/run-4.log` 該行作廢，最終 `phone/sakyo.png` 以 `phone/run-retry.log` 為證據；不把錯區圖當成功。最後僅調未接線櫻橘的 bias，不改實際十一區的組版輸出。除這次 HMR 造成的錯區，成功批次未記錄 console error／warning。

## 未做／未驗與交接

- **CONFIRMED／未做：** 六區 EPERM：北、右京、西京、上京、下京、中京。這六區未換樹、未重放鶯；逐字替換在下節。
- **未驗：** 新銀杏、櫻、橘的畫面；六區候選接線後的全景、手機、所有棲點。未改六區本輪沒有逐點重驗第二棲點；全景和來源腳端檢查不冒充逐點近觀。
- **CONFIRMED／造形未定稿：** 新松枝序仍規整；楓仍是稀疏三葉枝架，尤其手機很像符號；葉緣部分鋸齒；五區鳥身仍遮住細腳及部分葉片。
- **未驗：** 動畫每幀穿插、所有日夜／語系／減少動態組合、手機實機、Safari／iOS、幀率、線上版。未改渲染器來製作獨立水平器口。
- **未跑：** lint、資料 validate、完整 npm test、build。當次派工明訂由主代理跑四項整合檢查，本輪不宣稱它們通過或資料 ERROR／WARN 值。
- 資料來源：只改藝術語彙，不新增景點身分、地址、營業資訊。參考文件及 15 圖由使用者提供，本輪沒有另作外部歷史查證。

`git -c safe.directory=C:/Git/Kyoto-Bunko diff --check`：exit 0；Git 仍提示既有混合行尾未來可能轉 CRLF，本輪未整檔正規化行尾。讀取日誌搜尋 `CONSOLE:`／`EXC` 沒有結果。

交付六個程式檔未提交 diff 與本報告；`source-hashes.json` 綁定最終來源。`.shots/w2d/`、新建 `.claude/dispatch/w2d-*` 不提交。按項回退只反向套用本輪 diff：樹語彙需與五區 import／棲點一起回退；月只撤 `moonBowl` 和左京呼叫／import。不要重跑階段編輯腳本；它們不是可重入安裝器。未 commit／push。

## EPERM：未套用的逐字替換

六檔各首次 EPERM 後等 10 秒重試一次仍失敗；沒有改 ACL 或繞寫。以下是最終候選替換，僅做記憶體幾何稽核，未在工作樹套用、未做畫面驗證。每檔兩行各自逐字替換：

### `src/studies/toji/plate/kita.js`

原字串：
```js
import {MAT, gardenGround, hill, pond, phoenix, storey, roof, pine, bird, rock, suyari} from './vocab.js';
```
新字串：
```js
import {MAT, gardenGround, hill, pond, phoenix, storey, roof, branchPine as pine, bird, rock, suyari} from './vocab.js';
```

原字串：
```js
    ...bird('uguisu', [[153, -12, -1, 'island-pine', 22], [-275, -132, 1, 'west-pine', 22]]),
```
新字串：
```js
    ...bird('uguisu', [[148.36, 45.72, -1, 'island-pine', 10], [-270.03, -74.88, 1, 'west-pine', 10]]),
```

### `src/studies/toji/plate/ukyo.js`

原字串：
```js
import {MAT, gardenGround, hill, pond, hall, pine, maple, fallenLeaves, bird, rock, suyari} from './vocab.js';
```
新字串：
```js
import {MAT, gardenGround, hill, pond, hall, branchPine as pine, branchMaple as maple, fallenLeaves, bird, rock, suyari} from './vocab.js';
```

原字串：
```js
    ...bird('uguisu', [[-274, -156, 1, 'west-pine', 22], [267.6, 94.5, -1, 'near-maple', 20]]),
```
新字串：
```js
    ...bird('uguisu', [[-268.38, -103.48, 1, 'west-pine', 10], [298.77, 161.54, -1, 'near-maple', 12]]),
```

### `src/studies/toji/plate/nishikyo.js`

原字串：
```js
import {MAT, gardenGround, pond, hall, moonDeck, moon, steppingStones, lantern, pine, bird, rock, suyari} from './vocab.js';
```
新字串：
```js
import {MAT, gardenGround, pond, hall, moonDeck, moon, steppingStones, lantern, branchPine as pine, bird, rock, suyari} from './vocab.js';
```

原字串：
```js
    ...bird('uguisu', [[-277, 93, 1, 'near-pine', 22], [271, -157, -1, 'far-pine', 22]]),
```
新字串：
```js
    ...bird('uguisu', [[-270.56, 142.72, 1, 'near-pine', 10], [265.10, -106.00, -1, 'far-pine', 10]]),
```

### `src/studies/toji/plate/kamigyo.js`

原字串：
```js
import {MAT, gardenGround, hall, sandGarden, corridor, courtTree, petals, fruits, pine, bird, rock, suyari} from './vocab.js';
```
新字串：
```js
import {MAT, gardenGround, hall, sandGarden, corridor, branchCourtTree as courtTree, petals, fruits, branchPine as pine, bird, rock, suyari} from './vocab.js';
```

原字串：
```js
    ...bird('uguisu', [[-278, -174, 1, 'west-pine', 22], [-82.3, -28.9, -1, 'sakon-sakura', 20]]),
```
新字串：
```js
    ...bird('uguisu', [[-271.56, -124.28, 1, 'west-pine', 10], [-65.08, 27.28, -1, 'sakon-sakura', 12]]),
```

### `src/studies/toji/plate/shimogyo.js`

原字串：
```js
import {MAT, gardenGround, hall, corridor, ginkgo, fallenFans, pine, bird, rock, suyari} from './vocab.js';
```
新字串：
```js
import {MAT, gardenGround, hall, corridor, branchGinkgo as ginkgo, fallenFans, branchPine as pine, bird, rock, suyari} from './vocab.js';
```

原字串：
```js
    ...bird('uguisu', [[269, 104, -1, 'east-pine', 22], [-222, 66, 1, 'great-ginkgo', 22]]),
```
新字串：
```js
    ...bird('uguisu', [[263.10, 155.00, -1, 'east-pine', 10], [-192.73, 129.80, 1, 'great-ginkgo', 21]]),
```

### `src/studies/toji/plate/nakagyo.js`

原字串：
```js
import {MAT, gardenGround, hall, karamon, moatWall, pine, bird, rock, suyari} from './vocab.js';
```
新字串：
```js
import {MAT, gardenGround, hall, karamon, moatWall, branchPine as pine, bird, rock, suyari} from './vocab.js';
```

原字串：
```js
    ...bird('uguisu', [[-291, -28, 1, 'west-pine', 22], [267, -176, -1, 'east-pine', 22]]),
```
新字串：
```js
    ...bird('uguisu', [[-284.56, 21.72, 1, 'west-pine', 10], [261.10, -125.00, -1, 'east-pine', 10]]),
```

## 主代理收尾（2026-11-14）

- 六區（北、右京、西京、上京、下京、中京）的逐字替換由主代理照 `.shots/w2d/pending-edits.json` 套用；`node --test scripts/plate.test.mjs` 16／0。主代理重拍十一區 1440 月光全景（`.shots/w2d/mine/`），全部 `plate` 正常、無 console 錯誤；部品數 26–54。
- 四項整合檢查：lint 0；validate --strict ERROR 0 WARN 0；npm test 94+6；build 0。
- 蒔的觀察：骨架加小簇的方向對上參考，但從「太厚」擺到「太稀」。全景裡松像珊瑚或鹿角（北區最明顯）、楓像 Y 字細枝頂著幾顆小星（東山）、上京的櫻橘也是細枝加少數小團。左京的黑漆月器近觀讀得出。下一輪要加密度：松改成 3–5 層薄而橫寬、下緣扇貝形的葉層（簇與簇在同層內連成一片），楓與櫻增加葉量與葉的大小。
