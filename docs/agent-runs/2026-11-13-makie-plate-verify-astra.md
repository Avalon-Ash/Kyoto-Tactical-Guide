# 蒔繪浮雕盤 P3 十一區驗收與程式審閱

- **任務：第二輪 A–D 驗收已執行，P3 部分完成；確認 2 個鍵盤問題，尚不能宣告全部驗收通過。** E 依本輪指示保留前輪內容，不重做。使用者告知前輪 E 已處理，以下歷史 R01–R05 不是本輪重新確認仍存在的缺陷。
- 請求模型／強度：`gpt-6-astra`／high；實際設定：**未確認**（工具沒有提供模型設定證據）。沒有再派子代理。
- 工作區：`C:\Git\Kyoto-Tactical-Guide`；分支：`claude/great-brahmagupta-ye2uqt`；第二輪開始與結束 HEAD／base：`554bf25693165822747a8f97bb077a085a79ee95`。
- 依授權接用 Chrome CDP `127.0.0.1:9377`、dev server `127.0.0.1:3000`；兩埠開工均 HTTP 200。沒有啟動 Chrome／server，沒有安裝、commit、push、切分支或修改原始碼與測試。
- GPU 實際回報：`ANGLE (AMD, AMD Radeon(TM) Graphics (0x0000164E) Direct3D11 vs_5_0 ps_5_0, D3D11)`；WebGL2，4× MSAA。不是舊交接記載的 RTX 4070。
- **第二輪原始截圖 193 張，實際逐張目視 193 張**；以原圖或兩張並排縮圖檢視，疑點另開原圖。截圖、JSON、來源快照及目視清單均在 `.shots/verify/round2/`；`round2-summary.json` 列出每張檔名。contact sheet 是檢視副本，不重複計入截圖數。
- 所有截圖的 plate SHA-256 與本輪結束來源一致，差異 **0**；22 張首頁換函完成畫面的 `ward === renderedWard`，兩側鄰函 ID 對照循環順序錯誤 **0**。證據只適用此本機 HEAD，不代表 main／線上 `5ec606c`。

## 十一區 × 本輪情境總表

A1＝1440×900 暖日、375×812 暖日／月光；A2＝暫停雙光位；A3＝2.5 倍主角局部近觀。B1＝1440／375 完整循環、完成幀與拖曳鄰函；B2＝開蓋中／閱讀／返回合蓋；B3＝中→日→中及日夜；B4＝鍵盤；B5＝減少動態。C「通過」指沒有應用 error／exception，另有一則預期的套件提示。D「通過」指兩組取樣完成，沒有設定真機效能門檻。

| 區 | A1 | A2 | A3 | B1 | B2 | B3 | B4 | B5 | C | D |
|---|---|---|---|---|---|---|---|---|---|---|
| 南 | 通過 | 通過 | 通過 | 通過 | 通過 | 通過 | 有問題（V01、V02） | 通過 | 通過 | 通過 |
| 伏見 | 通過 | 通過 | 通過 | 通過 | 未驗 | 未驗 | 未驗 | 通過 | 通過 | 通過 |
| 東山 | 通過 | 通過 | 通過 | 通過 | 未驗 | 未驗 | 未驗 | 通過 | 通過 | 通過 |
| 北 | 通過 | 通過 | 通過 | 通過 | 未驗 | 未驗 | 未驗 | 通過 | 通過 | 通過 |
| 上京 | 通過 | 通過 | 通過 | 通過 | 未驗 | 未驗 | 未驗 | 通過 | 通過 | 通過 |
| 左京 | 通過 | 通過 | 通過 | 通過 | 未驗 | 未驗 | 未驗 | 通過 | 通過 | 通過 |
| 中京 | 通過 | 通過 | 通過 | 通過 | 未驗 | 未驗 | 未驗 | 通過 | 通過 | 通過 |
| 下京 | 通過 | 通過 | 通過 | 通過 | 未驗 | 未驗 | 未驗 | 通過 | 通過 | 通過 |
| 右京 | 通過 | 通過 | 通過 | 通過 | 通過 | 未驗 | 有問題（V01） | 通過 | 通過 | 通過 |
| 西京 | 通過 | 通過 | 通過 | 通過 | 通過 | 未驗 | 有問題（V01） | 通過 | 通過 | 通過 |
| 山科 | 通過 | 通過 | 通過 | 通過 | 通過 | 未驗 | 有問題（V01） | 通過 | 通過 | 通過 |

B2 已驗右京／西京／山科桌機與南區手機，符合「至少三區」；B3 全套在南區一次，另有伏見切日文。B4 完整 Tab 流程在南區（桌機、手機），方向鍵至右京並 Enter；西京／山科也各驗 Enter／Esc。其餘格未驗是未擴成每區全套，不把共用控制程式當逐區瀏覽器證據。B5 的平伏、雙光位與直接換函逐區完成；減動開蓋抽驗南區，另外十區的減動開蓋未驗。

## 本輪問題清單（依嚴重度）

### V01：首頁閱讀頁按 Esc 不返回文箱

- **CONFIRMED／功能，中優先度**。實際區：右京、西京、山科（1440），南（375；一般及 reduced-motion）。
- 重現：首頁聚焦文箱 → Enter → 等候閱讀頁完成 → Esc → 等待 0.5–0.9 秒。畫面仍停在相同 DetailView，`#scene` 已不存在；按左上返回鈕才回到同區合蓋文箱。
- 截圖：`B-{ukyo,nishikyo,yamashina}-reading.png`、`B-*-after-escape.png`、`B-*-returned.png`；`P-mobile-reading.png`、`P-mobile-escape.png`、`P-mobile-returned.png`；`B-reduced-after-escape.png`。
- 位置：`src/components/DetailView.tsx:71` 的返回處理與 `:73` 的根元素；`src/components/HomeView.tsx:73` 開卷改入 DetailView；`src/studies/toji/study.js:262` 的 Esc 只屬文箱生命週期，不能接管已卸載後的閱讀頁。
- 建議：在 DetailView 的鍵盤處理將 Escape 導向同一個返回函式，並在返回首頁後恢復文箱焦點；避免與地圖／標籤子面板的 Escape 冒泡衝突。這是建議，沒有實作。

### V02：文箱有焦點，但焦點外框被裁掉

- **CONFIRMED／可及性，中優先度**。南區 1440 與 375；共用 CSS 可疑影響全部區，其他區不宣稱逐一完成 Tab 目視。
- 重現：重新載入首頁，Tab 七次到 `#scene`。`document.activeElement.id === "scene"`、`:focus-visible === true`，computed outline 為金色 2px，offset 4px；畫面沒有包住舞台的可見焦點外框。拖動文箱後，移入舞台內的那一邊金框才看得到。
- 截圖：`B-keyboard-tab.png`、`P-mobile-focus.png`；對照 `B-minami-1440-neighbour.png`。逐 Tab 的控制項與 outline 紀錄在 `Bextra-results.json`；手機 computed style 在 `Bmore-results.json`。
- 位置：`src/studies/toji/bunko.css:7` 設正 outline-offset；`:11` 的 stage 為 overflow:hidden；`:12` 的 canvas 佔滿舞台。
- 建議：文箱使用內縮的 focus-visible 外框（例如負 offset），或舞台內獨立的焦點提示；保留換函時必要的裁切，不宜直接全域關閉 overflow:hidden。

## 畫面與操作觀察

- A1：十一區均為盤，手機暖日／月光下文字與控制項沒有壓住文箱。桌機暖日全景沒有觀察到持續的部品互穿或錯區殘留。
- A2：採 `F-<ward>-still-left/right.png` 為正式雙光位證據；22 張均 `still=true`。屋宇、樹、鳥居等部品平伏，兩張高光分別位於左／右，地子與材質仍回應指標。`dataset.lift=0.820` 是文箱姿態參數，不能誤讀為部品 lift 未歸零。
- 第一批 `A-*-still-*` 除南區外，高光差異不足以判定通過；固定 1440、移出後重新進入畫布並記錄 pointermove 的 F 補驗通過。原批保留，沒有刪除失敗證據；尺寸切換與輸入路由差異的根因未定位，不憑這個差異報成應用 bug。
- A3：正式近觀為 `F-<ward>-zoom25.png`，11 張 `zoom=2.500`，對準各區主角：南五重塔、伏見樓門與鳥居、東山舞台、北金閣、上京紫宸殿、左京觀音殿、中京唐門、下京雙堂、西京書院與月見台、右京大方丈、山科山門與本殿。局部近觀會裁去主角邊緣或配景，不是完整建築立面圖。
- 已見的鶯與載體之間沒有明顯懸空間隙；樹腳、堂身與投影沒有看到明顯分離。平嵌落葉／花瓣／果實／足跡／月與燈光碎片在全景或近觀中可見。這是所捕捉姿態的目視結論，沒有把低解析的小鳥或未取樣的動態中間幀判定為完整幾何驗證。
- B1：兩種寬度共 22 張完成幀＋22 張左拖鄰函幀。右側可見鄰函外觀與下一區一致；兩側 DOM 快照 ID 均正確，完成後沒有留住鄰函／舊區的殘影。靜止時兩側 opacity=0 符合目前程式；不是要求三個完整盒子永遠同時可見。沒有逐幀錄影，因此不對所有瞬間閃爍／跳動下零缺陷結論。
- B2：三個桌機開蓋截圖 opening 約 0.46–0.50，南區手機約 0.37；盒蓋與內部有分離、卷軸可見，進閱讀頁後按返回能回同區。Esc 問題另見 V01。
- B3：南區中→日→中後文字與 `html.lang` 同步（ja／zh-Hant），日夜切換後 `data-theme=light` 且畫面轉暖日。截圖 `P-language-ja/zh.png`、`P-theme-day.png`。
- B5：375 模擬 reduce，十一區雙光位均 `still=true`，`autoplay=false`、idlePhase=0，部品平伏而光位改變。十一個方向鍵換函返回時皆已換到新區且 closed，`getAnimations().length=0`；包含烘焙與 CDP 的觀測延遲 67–119 ms，不是動畫時長。南區 Enter 後 26 ms 的觀測即有 DetailView，沒有保留開蓋動畫。減動閱讀頁 Esc 同樣無效。

## C：console 錯誤與警告

全程在導航前訂閱 `Runtime.consoleAPICalled`、`Runtime.exceptionThrown`、`Log.entryAdded`。第二輪 **應用 console error 0、未捕捉例外 0、warning 1**。唯一警告發生於首次載入 reduce 首頁（南區），原文：

```text
You have Reduced Motion enabled on your device. Animations may not appear as expected.. For more information and steps for solving, visit https://motion.dev/troubleshooting/reduced-motion-disabled
```

來源是 motion/react 的 `useReducedMotion` 開發提示，記錄在 `Breduced-results.json`，不是 WebGL 失敗。其餘 probe／A／B／Bextra／F／Bmore／D 的 logs 為空。

測試腳本 Bextra 曾因日文語系鈕 selector 寫錯而 exit 1（null.click）；這是驗收腳本錯誤，沒有算入應用 console。已以 DOM 中確認的共用工具鈕，在 Bmore 完成中日往返與日夜補驗。沒有重跑已成功的三區開蓋。

## D：效能表與方法

**無頭桌面 Chrome 的參考值，不代表手機真機、iOS Safari 或 GPU 完成時間。** 同一 AMD／D3D11 環境，展示頁預設月光；1440×900 DPR 1、375×812 DPR 2，`mobile:false`。每區暖機 750 ms 後，CDP 約每 32 ms 沿橢圓移動滑鼠約 5.15 秒；rAF 自頁內取約 5 秒 timestamp 差，列算術平均／最大／p95。含瀏覽器排程與 CDP 負載；沒有真機性能合格線，也沒有與上一版比較。

| 區 | 1440 樣本 | 1440 平均／最差／p95 ms | 375 樣本 | 375 平均／最差／p95 ms |
|---|---:|---|---:|---|
| 南 | 284 | 17.61 / 18.60 / 18.10 | 285 | 17.52 / 18.60 / 18.10 |
| 伏見 | 283 | 17.68 / 18.60 / 18.10 | 284 | 17.58 / 18.60 / 18.10 |
| 東山 | 284 | 17.58 / 18.50 / 18.10 | 285 | 17.59 / 18.60 / 18.10 |
| 北 | 284 | 17.62 / 18.60 / 18.10 | 285 | 17.56 / 18.60 / 18.10 |
| 上京 | 284 | 17.58 / 18.60 / 18.10 | 285 | 17.56 / 18.60 / 18.10 |
| 左京 | 285 | 17.54 / 18.50 / 18.10 | 284 | 17.57 / 18.60 / 18.10 |
| 中京 | 285 | 17.59 / 18.50 / 18.10 | 285 | 17.54 / 18.50 / 18.10 |
| 下京 | 284 | 17.56 / 18.50 / 18.10 | 284 | 17.56 / 18.60 / 18.10 |
| 右京 | 284 | 17.60 / 18.70 / 18.10 | 282 | 17.67 / 18.60 / 18.10 |
| 西京 | 285 | 17.56 / 18.60 / 18.10 | 284 | 17.56 / 18.70 / 18.10 |
| 山科 | 284 | 17.61 / 18.50 / 18.10 | 284 | 17.58 / 18.60 / 18.10 |

原始 22 組數值與實際期間見 `D-results.json`、`D-run.log`。沒有以這張表宣稱「手機流暢」。

## 腳本、指令與證據

第二輪自行新增的腳本均在不提交的 `.claude/dispatch/`，原 `shot.mjs`、`verify.mjs` 沒有修改。下列瀏覽器腳本只建立自己的 CDP 分頁，finally 關閉該分頁，保留主代理提供的瀏覽器與 server。

| 指令 | 退出碼／產物 |
|---|---|
| `curl.exe --max-time 8 -sS -o NUL -w ... http://127.0.0.1:9377/json/version`；同樣檢查 3000 | 0；兩個 HTTP 200 |
| `node .claude/dispatch/verify-round2.mjs probe` | 0；2 張、DOM／GPU 記錄 |
| `node .claude/dispatch/verify-round2.mjs A` | 0；66 張；每區一組情境，完成各組後繼續下一區 |
| `node .claude/dispatch/verify-round2-b.mjs B` | 0；44 張，桌機／手機十一區 |
| `node .claude/dispatch/verify-round2-b.mjs Bextra` | 1；15 張成功保存；三區開蓋／Esc 已驗，語系往返因腳本 selector 中止 |
| `node .claude/dispatch/verify-round2-focus.mjs F` | 0；33 張，固定尺寸補驗雙光位與主角近觀 |
| `node .claude/dispatch/verify-round2-b.mjs Breduced` | 0；25 張，十一區減動＋南區開卷 |
| `node .claude/dispatch/verify-round2-more.mjs Bmore` | 0；8 張，語系／主題補驗與南區手機鍵盤／開蓋 |
| `node .claude/dispatch/verify-round2.mjs D` | 0；22 組 rAF |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .claude/dispatch/verify-sheets.ps1 -Prefix ... [-RecordMode ...]` | 0；System.Drawing 產生兩張並排檢視圖，原始 PNG 保留 |
| `node .claude/dispatch/verify-round2-summary.mjs` | 0；逐圖狀態、來源 hash、鄰函 ID 斷言與目視清單 |
| `node .claude/dispatch/verify-report-round2.mjs` | 0；保留原 E、更新本報告，保留原 LF |
| `git -c safe.directory=C:/Git/Kyoto-Tactical-Guide diff --check`、`status --short` | 文件／diff 範圍檢查；沒有修改全域 safe.directory |
| lint／test／build／validate | 依指示不執行；本輪未改原始碼／測試 |

## 未驗項與交接

- 未驗：上表明列的其他區 B2／B3／完整 B4；B5 的另外十區減動開蓋。原因：依本輪指定「至少三區／各一次」採代表情境，沒有聲稱全部組合都跑過。
- 未驗：換函每一個中間幀、全部光位下的微小穿插／鳥腳高度、最大倍率逐幀閃爍；本輪使用指定完成幀、拖曳幀與局部近觀，沒有逐幀影片。
- 未驗：線上 main／部署版、實體手機觸控／實際幀率、iOS Safari、沒有 WebGL2 的降級。本輪指定的是現有本機 Chrome／3000，不能拿桌面 viewport 代替真機。
- E 新 HEAD 重審未做，依使用者「E 已完成並已處理，這輪不要重做」；下一節完整保留原 E，時間／行號屬其舊快照。
- 第二輪沒有啟動或終止 Chrome／dev server，只關閉自己的驗收分頁；所有原始碼差異為 0。交接給主代理審 V01／V02；沒有自行修 bug，沒有 commit／push。
- 前輪 ENV01（獨立 GPU Chrome 啟動崩潰／3100 watcher EBUSY）已不阻擋本輪。完整前輪報告保留於 `.shots/verify/round2/report-before-round2.md`，前輪環境日誌仍留原路徑。

## E：前輪原文保留（本輪未重審）

前輪 E 綁定 **2026-11-13 18:59:15 +08:00**、HEAD `4ce4713` 的來源快照；完整 SHA-256 在 `.shots/verify/source-E/manifest.json`。`vocab.js` 為 `e2b9f7960926fc08a2e25d7c073b2670dc8a7f12ee7167ad402180ff26d4646d`。以下原文保留；使用者告知已處理，本輪不以舊問題狀態覆蓋修復結果。

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
