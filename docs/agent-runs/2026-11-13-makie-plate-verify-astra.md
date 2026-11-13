# 蒔繪浮雕盤 P3 十一區驗收與程式審閱

- **任務：P3 收尾驗收／部分完成。E 已完成；A–D 因獨立 Chrome 啟動失敗未驗。不能據此關閉 P3 視覺驗收。**
- 請求模型／強度：`gpt-6-astra`／high；實際設定：**未確認**（執行工具未提供模型設定證據）。未再派子代理。
- 工作區：`C:\Git\Kyoto-Tactical-Guide`；分支：`claude/great-brahmagupta-ye2uqt`。
- 開工 HEAD／派工 base：`5ec606c93f7f78d222d8aa027fb045cef27e85c9`。共享工作區在執行中前進至 `4ce4713ae325aba6558401b6fdb14d0596cf3b20`；本驗收代理沒有執行任何 commit、push 或分支變更。
- E 綁定 **2026-11-13 18:59:15 +08:00** 的來源快照，當時 HEAD 為 `4ce4713`，plate 的工作目錄 diff 為空。完整 SHA-256 位於 `.shots/verify/source-E/manifest.json`；`vocab.js` 為 `e2b9f7960926fc08a2e25d7c073b2670dc8a7f12ee7167ad402180ff26d4646d`。19:00:53 再核對，快照內全部 plate 檔與工作區一致。
- 變更範圍：本報告、自己新增的 `.claude/dispatch/verify*.mjs`、`.shots/verify/` 下的快照與日誌。原始碼、測試與 `shot.mjs` 未修改；未安裝套件。
- **截圖產生 0 張、實際目視 0 張。** 沒有使用其他代理的截圖代替本輪證據，沒有目視「通過」結論。

## 十一區 × 情境總表

A1 包含 1440 暖日、375 暖日與月光；A2 包含兩個暫停光位與目視躺平；B1 包含 1440／375 換函及鄰函；B2 為開蓋中／閱讀中／關回；B3 為中日與日夜；B4 為 Tab／方向鍵／Enter／Esc；B5 為 reduced-motion。A–D 全部受 ENV01 阻擋。

E 的問題格包含共用語彙的邊界輸入與註解問題，**不代表十一區目前的正常輸入都壞掉**；目前資料的數值結果另列於下。

| 區 | A1 | A2 | A3 2.5× | B1 | B2 | B3 | B4 | B5 | C console | D 幀時間 | E 程式 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 南 | 未驗 | 未驗 | 未驗 | 未驗 | 未驗 | 未驗 | 未驗 | 未驗 | 未驗 | 未驗 | 有問題（R01–R04） |
| 伏見 | 未驗 | 未驗 | 未驗 | 未驗 | 未驗 | 未驗 | 未驗 | 未驗 | 未驗 | 未驗 | 有問題（R01–R04） |
| 東山 | 未驗 | 未驗 | 未驗 | 未驗 | 未驗 | 未驗 | 未驗 | 未驗 | 未驗 | 未驗 | 有問題（R02–R04） |
| 北 | 未驗 | 未驗 | 未驗 | 未驗 | 未驗 | 未驗 | 未驗 | 未驗 | 未驗 | 未驗 | 有問題（R02–R04） |
| 上京 | 未驗 | 未驗 | 未驗 | 未驗 | 未驗 | 未驗 | 未驗 | 未驗 | 未驗 | 未驗 | 有問題（R02–R04） |
| 左京 | 未驗 | 未驗 | 未驗 | 未驗 | 未驗 | 未驗 | 未驗 | 未驗 | 未驗 | 未驗 | 有問題（R02–R04） |
| 中京 | 未驗 | 未驗 | 未驗 | 未驗 | 未驗 | 未驗 | 未驗 | 未驗 | 未驗 | 未驗 | 有問題（R02–R05） |
| 下京 | 未驗 | 未驗 | 未驗 | 未驗 | 未驗 | 未驗 | 未驗 | 未驗 | 未驗 | 未驗 | 有問題（R02–R04） |
| 右京 | 未驗 | 未驗 | 未驗 | 未驗 | 未驗 | 未驗 | 未驗 | 未驗 | 未驗 | 未驗 | 有問題（R02–R04） |
| 西京 | 未驗 | 未驗 | 未驗 | 未驗 | 未驗 | 未驗 | 未驗 | 未驗 | 未驗 | 未驗 | 有問題（R02–R04） |
| 山科 | 未驗 | 未驗 | 未驗 | 未驗 | 未驗 | 未驗 | 未驗 | 未驗 | 未驗 | 未驗 | 有問題（R02–R04） |

## 阻塞與問題清單（依處理優先度）

### ENV01：獨立瀏覽器無法存活；伺服器另有 watcher 錯誤

- 區／情境：全部／A–D；**CONFIRMED，環境阻塞，不是已確認的應用渲染 bug**。
- 截圖：無。日誌：`.shots/verify/chrome-stderr.log`、`environment.log`。
- 第一次透過 Node spawn 啟動獨立 profile／9378，約 10 秒後仍無可連線 CDP，腳本 exit 1：`Independent Chrome 9378 unavailable`。
- 第二次以 `Start-Process -WindowStyle Hidden` 啟動同樣的 Chrome，增加 stderr 記錄。日誌短暫出現 DevTools listening，隨後 GPU 子行程崩潰 9 次，Chrome 結束。未完成任何頁面導航。
- 同時，自己的 3100 Vite 程序因監看 `.shots/verify/chrome-profile/Default/Network/Cookies` 發生 `EBUSY`，exit 1。不是以 build 或資料檢查推測瀏覽器正常。
- 建議接續驗收時先確認執行環境能啟動有 GPU 的獨立 Chrome；profile 可置於已忽略的 `.claude/dispatch/` 子目錄，或由主代理另行調整 watcher 排除 profile。需先核對實際 watcher 設定；本輪不改 Vite 設定。
- 依「同一情境失敗兩次」停止 Chrome 重試；沒有碰 3000、9377，沒有降低權限限制或改用他人的瀏覽器。

### R01：南區、伏見的外側松葉超出可烘焙盤面

- 區／情境：南、伏見／E；截圖：無；**CONFIRMED（數值越界）；視覺缺口或截邊是否可見仍未驗**。
- 位置：`src/studies/toji/plate/minami.js:25`、`fushimi.js:42`；生成式在 `vocab.js:421`–`435`。盤面範圍定義在 `vocab.js:14`，烘焙轉換在 `bake.js:11`。
- 指令：`node .claude/dispatch/verify-audit.mjs`。查看 `E-audit.json` 的 `wards.W_MINAMI.outside` 與 `wards.W_FUSHIMI.outside`。
- `pine-c-leaf-0`：x 最大 **372.8345**，超出 +360 約 **12.8345**；`pine-b-leaf-0`：x 最大 **374.1832**，超出約 **14.1832**。這兩個都是 layer 3 的立體葉墊，不是地形或霞的邊界延伸。
- 當前貼圖以 ±360 映射至 canvas，超出的來源輪廓落在貼圖範圍外。既有檢查容許 x 到 ±380，因此可通過既有範圍條件。
- 建議：將對應松樹向盤內移約 15–20 單位，或縮小外側葉墊；保留 reach／模糊所需邊距，再重新確認同組、鄰組與鶯棲點，不能單純截斷點座標。

### R02：部分語彙的計數與陣列輸入會產生 NaN 或直接拋例外

- 區／情境：共用語彙／E 的邊界輸入；截圖：無；**CONFIRMED**。十一區現有正常參數未觸發，下列不是線上故障重現。
- 指令：`node .claude/dispatch/verify-audit.mjs`；證據為 `E-audit.json.inputs`。

| 位置（`src/studies/toji/plate/vocab.js`） | 重現輸入 | 實際結果 | 建議 |
|---|---|---|---|
| 132–134 | `roof('r',0,0,30,12,{tiles:0})` | `0/0` 導致查表索引 NaN，隨後 `Cannot read properties of undefined (reading '0')` | 定義 0 為不畫瓦線，或要求正整數 |
| 147、151 | `storey('s',0,-20,0,30,{bays:0})` | 立柱線含 NaN，燈窗部品為 empty | 驗證 bays 為正整數 |
| 245–247 | `kakezukuri('k',-30,30,-20,20,{posts:1})` | 唯一柱子的四點 x 都是 NaN | 單柱放中央，或要求 posts ≥ 2 |
| 636–638 | `stoneSteps('s',0,-20,20,15,25,0)` | 踏線含 NaN | 明確處理 count=0 或要求正整數 |
| 60–71 | `stream('s',[[0,0],[10,10]],[5])` | 寬度插值讀到 undefined，填色與折線含 NaN | points 至少 2 點、widths 等長且有限 |
| 463、514 | `shell('s',[])`、`steppingStones('s',[])` | `Cannot read properties of undefined (reading 'slice')` | 空集合回傳空部品陣列，或給可讀的輸入錯誤 |

生成 NaN 的案例多能被 `preparePlate` 報為 bad point，但在 builder 內先拋出的例外不會得到這種部品診斷。建議集中少量參數驗證，避免每個座標運算都包防護。

### R03：零面積幾何可通過 `preparePlate`

- 區／情境：共用語彙／E 的退化輸入；截圖：無；**CONFIRMED**。現有十一區的 1,038 個 fill 沒有這種輸入。
- 位置：`vocab.js:67`–`73`（重合 stream 點）、`vocab.js:362`–`369`（moon radius）、`vocab.js:469`–`472`（pond 半徑）；驗證缺口在 `src/studies/toji/plate/parts.js:42`。
- 同一 audit 指令重現：`stream('s',[[0,0],[0,0]],[5,5])` 產生面積 0 的 fill；`moon('m',0,0,0)` 產生 4 個面積 0 的 fill；`pond('p',0,0,0,40,1)` 產生面積 0 的岸線。三者 `preparePlate.errors` 都是 `[]`。
- 原因：目前只驗點數與 soft／crisp 範圍，沒有檢查獨立頂點數或面積；stream 的 `|| 1` 避免除零，卻把重合點變成零法向量。
- 建議：語彙入口拒絕非正半徑／完全重合路徑；驗證器對 fill 增加有限值與非零面積診斷。不要把純線條當 fill 來要求面積。

### R04：暫停的中日狀態文案仍宣稱停止光跡

- 區／情境：全部展示頁／必讀程式審閱補充；截圖：無；**CONFIRMED（原始碼文案與控制邏輯不一致），瀏覽器呈現未驗**。
- 位置：`src/studies/toji/study-chrome.js:9`、`:10` 的 `still` 字串：「停止位移、擺動與軌跡」／「変位・揺れ・軌跡を停止」。
- 對照：`study.js:214` 的 `addTrail` 沒有 still 排除；`study.js:235` 的指標處理仍會呼叫它。交接 §8.0 明訂暫停時光跡與材質反應照常。`parts.js:167`–`172` 只把部品姿態歸零，保留光的反應。
- 建議兩語同步改為「部品躺平，光仍跟隨指標」的意思，避免使用者把現在的光跡看成失效。上述邏輯是靜態確認，不能替代 A2／B5。

### R05：唐門註解與關閉門扇的資料相反

- 區／情境：中京／E；截圖：無；**CONFIRMED，低優先度註解問題**。
- 位置：`vocab.js:592` 說「open passage」「opening ... wider than the blur」，但 `:609`–`:614` 明確新增閉合漆門，矩形覆蓋 x=±34、h=0–50，並回傳 doors。中京呼叫在 `nakagyo.js:15`。
- 建議：保留既定閉門造形，將函式說明更新為帶閉合門扇的唐破風門；不要為了配合舊註解刪除門扇。

## E：逐檔審閱與數值證據

已完整閱讀 `vocab.js`（快照 663 行）與十一個區檔；另讀 `parts.js`、烘焙邊界與相關控制程式以核對實際行為。沒有執行或修改專案測試。

下表由 `node .claude/dispatch/verify-audit.mjs` 產生。非有限值檢查涵蓋 fill／line 的座標；退化指標為 fill 的鞋帶公式面積 < 1e-8；自交檢查是非相鄰邊的嚴格穿越，不含共線重疊。外框相交以 `attach ?? group` 合組後判斷，不代表已驗動態 3D 穿插。

| 區 | 部品 | fill | prepare 錯誤／非有限／零面積／嚴格自交 | 超盤部品 | 不同組外框交疊／腳線不一致／鳥腳無平面支撐 |
|---|---:|---:|---|---:|---|
| 南 | 52 | 101 | 0／0／0／0 | 6 | 0／0／0 |
| 伏見 | 37 | 146 | 0／0／0／0 | 6 | 0／0／0 |
| 東山 | 32 | 129 | 0／0／0／0 | 6 | 0／0／0 |
| 北 | 32 | 53 | 0／0／0／0 | 0 | 0／0／0 |
| 上京 | 45 | 92 | 0／0／0／0 | 0 | 0／0／0 |
| 左京 | 32 | 58 | 0／0／0／0 | 0 | 0／0／0 |
| 中京 | 44 | 82 | 0／0／0／0 | 1 | 0／0／0 |
| 下京 | 31 | 98 | 0／0／0／0 | 0 | 0／0／0 |
| 右京 | 29 | 66 | 0／0／0／0 | 0 | 0／0／0 |
| 西京 | 35 | 88 | 0／0／0／0 | 0 | 0／0／0 |
| 山科 | 38 | 125 | 0／0／0／0 | 0 | 0／0／0 |
| 合計 | **407** | **1,038** | **0／0／0／0** | **19** | **0／0／0** |

各項審閱結論與範圍：

- **ID**：所有當前區內 ID 唯一；跨區重用 `uguisu`、`pine` 等名稱不構成同盤衝突。builder 的派生後綴仍可能撞名：audit 的 `roof suffix collision` 合併 `roof('x',…)` 與 `rock('x-lip',…)` 得到 `duplicate id x-lip`，已被 `preparePlate` 擋下；無需另報為現有缺陷。來源：`vocab.js:138`、`parts.js:31`。
- **腳線**：`parts.js:46`–`59` 用整組最大 z 指派同一 foot；鳥採 attach 載體的 foot，兩個棲點不同屬合理。`higashiyama.js:22`–`23` 的舞台與本堂、`shimogyo.js:11`–`13` 的雙堂與渡廊、`kamigyo.js:17`–`19` 的南側三段均已合組，沒有發現腳線分裂。動態時不同 order 的彈簧速度造成的拉長仍未目視。
- **越界**：19 個裡有 R01 的 2 片松葉；其他 17 個是地形、水或霞。南區 `minami.js:9`–`15`、伏見 `fushimi.js:22`–`32`、東山 `higashiyama.js:8`–`18` 有邊界延伸；東山水最大 z=257.1101。中京 `nakagyo.js:12` 的護城河到 z=232，比盤面多 2。這些數值延伸已確認，但是否為構圖出血或不想要的截邊，沒有畫面不判定為視覺 bug。
- **鶯支撐**：每區兩個棲點的兩條腳線終點都落在載體某個 fill 內；這只證明平面接觸，沒有驗到 bias、高度、立起角度是否讓鶯懸空或陷入。
- **暫停數值補查**：每區先跑 120 次 1/60 秒的 `createLife.update` 喚醒，再傳 `still:true`。所有部品的 sway、stand、dx、dz、lift 都為 0（`stillNonzero=[]`）。這不是 DOM 的 `dataset.still` 斷言，也不是視覺躺平驗收，因此 A2／B5 仍填未驗。
- **重複程式，可選整理**：`vocab.js:287`–`305` 與 `:412`–`418` 都有 spine、漸細樹幹多邊形與樹皮線的組裝；可抽純幾何的幹形 helper，保留 broadleaf／pine 各自的採樣、樹冠與 seed。`nishikyo.js:19`–`21`、`sakyo.js:21`–`23`、`nakagyo.js:16`–`18` 等重複松樹＋兩棲點搭配，可將棲點與載體放在同一構圖描述中，減少未來移樹漏移鶯；不要把不同區的構圖強制共用固定座標。這是維護建議，不是缺陷，也未實作。
- **最新美術變更**：快照的 `moonDeck` 已是 layer 0／`KIND.still`（`vocab.js:500`–`509`），沒有沿用較早讀取時「月見台會立起」的判斷。共享工作區更新照常接受，證據以快照為準。

## C：console 與環境日誌

**頁面 console 未驗，不能記為 error 0／warning 0。** Chrome 未存活到 Runtime 訂閱與頁面導航；下列是瀏覽器程序 stderr，不冒充 JavaScript console。

第二次啟動的原始英文訊息摘錄（完整內容含時間、PID 與本機系統訊息，保留於 `chrome-stderr.log`）：

```text
Encryption is not available.
GPU process exited unexpectedly: exit_code=-1073741790
The GPU process has crashed 1 time(s)
The GPU process has crashed 9 time(s)
GPU process isn't usable. Goodbye.
```

另有 `Failed to encrypt`、Google Update 登錄鍵存取失敗、DawnGraphiteCache 開檔失敗、`Error observing HKCU`、`Failed to create IAppCapability`、`Unexpected variant type: 4127`。全部發生於啟動 `about:blank`，沒有任何一區的應用情境可歸因。

Vite exec session `32887` 的原始主要錯誤：

```text
Error: EBUSY: resource busy or locked, watch 'C:\Git\Kyoto-Tactical-Guide\.shots\verify\chrome-profile\Default\Network\Cookies'
errno: -4082
syscall: 'watch'
```

## D：效能表與方法

無頭 Chrome 的幀時間只能作參考，不能代表手機真機或 iOS Safari。本輪沒有可用數值。

| 區 | 1440 平均／最差 ms | 375 平均／最差 ms |
|---|---|---|
| 南 | 未驗 | 未驗 |
| 伏見 | 未驗 | 未驗 |
| 東山 | 未驗 | 未驗 |
| 北 | 未驗 | 未驗 |
| 上京 | 未驗 | 未驗 |
| 左京 | 未驗 | 未驗 |
| 中京 | 未驗 | 未驗 |
| 下京 | 未驗 | 未驗 |
| 右京 | 未驗 | 未驗 |
| 西京 | 未驗 | 未驗 |
| 山科 | 未驗 | 未驗 |

已編寫、**未成功執行**的 `verify.mjs D` 方法：各區暖機後，以 CDP mouseMoved 沿橢圓路徑移動指標約 5 秒，同步收集 rAF timestamp 差，輸出樣本數、實際期間、算術平均、最大與 p95；1440×900 DPR 1、375×812 DPR 2，均為桌面 Chrome viewport 模擬，不是觸控裝置。rAF callback 間隔不等於 GPU 完成時間；主代理同時作業也可能影響數字。

## 腳本、指令與退出狀態

| 指令／動作 | 結果與證據 |
|---|---|
| `git -c safe.directory=C:/Git/Kyoto-Tactical-Guide status --short`、`branch --show-current`、`rev-parse HEAD` | 成功，只讀；以單次 `-c` 處理執行帳號 ownership，不改全域 Git 設定 |
| `npm run dev -- --host 127.0.0.1 --port 3100 --strictPort` | exit 1，PowerShell 禁止執行 npm.ps1；改用 npm.cmd |
| `npm.cmd run dev -- --host 127.0.0.1 --port 3100 --strictPort` | 曾成功啟動；後因上述 EBUSY exit 1，session 32887 |
| `Copy-Item .claude/dispatch/shot.mjs .claude/dispatch/verify.mjs`，再擴充新副本 | 完成；原始 `shot.mjs` 未修改 |
| `node .claude/dispatch/verify.mjs probe` | exit 1；Chrome 第一次啟動失敗，session 16273 |
| `Start-Process ...chrome.exe -WindowStyle Hidden ...` | 診斷 wrapper exit 0，只代表命令完成；Chrome 第二次仍崩潰，詳見 stderr。未取得可靠的 Chrome 主程序退出碼，不把 wrapper 0 當成功 |
| `node .claude/dispatch/verify-audit.mjs` | exit 0；`E-audit.json`、`E-audit.log`、`source-E/`、`source-E.diff`。數值 findings 見上表；不是 lint／資料 validator 的 ERROR/WARN |
| `node .claude/dispatch/verify-finish.mjs` | exit 0；`completion-evidence.json` 記錄來源比對、總數、PNG 數與程序／埠清理結果 |
| lint／test／build／validate | 依派工單不執行；未改應用或測試，不能引用前一輪結果當本輪成功 |

Chrome 第二次的實際參數：

```text
C:/Program Files/Google/Chrome/Application/chrome.exe
--headless=new
--remote-debugging-port=9378
--user-data-dir=C:/Git/Kyoto-Tactical-Guide/.shots/verify/chrome-profile
--use-angle=d3d11 --enable-gpu --ignore-gpu-blocklist
--hide-scrollbars --window-size=1440,900 --enable-logging=stderr about:blank
```

`verify.mjs` 目前包含 probe、A、D 與 Bprobe 草稿；因啟動阻塞，A／D 與 Bprobe 都沒有執行，完整 B 流程未擴充。近觀草稿預設畫布中央，尚未逐區校正主角位置，接續時不能直接把它的輸出當作 A3 合格證據。

## 未驗項、清理與交接

- A：全部 11 區的暖日桌機、暖日／月光手機、暫停雙光位、2.5 倍主角近觀，均未驗。
- B：兩種寬度的完整換函圈、鄰函快照、至少三區開關蓋、語系與日夜、鍵盤焦點、reduced-motion 均未驗。
- C：頁面 console 未收集；僅保存 Chrome／Vite 的環境錯誤。
- D：22 組 5 秒量測全部未驗。
- 陰影是否貼根、部品動態穿插、鶯的實際高度、平嵌意象遮擋、手機控制項壓箱、暫停是否仍立著：全數未目視，沒有「應該沒問題」的結論。
- 線上部署版、真機觸控、iOS Safari、無 WebGL2 降級也未驗。指定本輪網址是自己的本機 3100，本輪不聲稱驗過線上版本。
- 已確認自己啟動的 Chrome PID `39752`、`29684` 不存在，3100／9378 無 listening socket；Vite session 已回報結束。未終止其他 Chrome 或其他代理程序。profile 與診斷資料保留在允許的 `.shots/verify/`。
- 資料來源為本機程式、指定交接文件與本輪執行日誌；沒有旅遊資料新增或事實查核需求。
- 交接：E 審閱完成；A–D 需要在可啟動獨立 GPU Chrome 的環境續驗。本驗收代理未 commit／push，所有問題僅列報告，未修原始碼。
