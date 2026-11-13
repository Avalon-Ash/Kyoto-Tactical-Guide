# 蒔繪浮雕盤 W2 造形精進

任務：`MAKIE_PLATE_HANDOFF.md` §8.2 W2／**部分完成**。十項都有保留的實作；第 8 項所有棲點的最終視覺貼合尚未完整驗證，第 10 項懸子未取得開蓋後 2.5 倍近觀。未將這些缺口算成通過。

請求模型／強度：`gpt-6-astra`／high；實際設定：**未確認**，本工具沒有提供可核對的執行模型資訊。

工作區：`C:\Git\Kyoto-Bunko`；分支：`claude/great-brahmagupta-ye2uqt`；base SHA：`9b2c31b7cda6e7775f19f8469d956dc3099f5a0e`。本輪依派工單直接實作，未再派代理；未 commit、push、切分支、stash、reset 或安裝套件。`parts.js`、所有正式測試、schema 與資料檔未修改。

## 變更與畫面證據

下表程式路徑均相對於 `src/studies/toji/plate/`，行號為交付 diff 的位置；截圖路徑均相對於 `.shots/w2/`。`before/` 是 base 的十一區月光全景；`final/` 是所有程式變更完成後的十一區月光全景。全景 job 為 1440×900／night／zoom 1／焦點 `0.5,0.5`；mobile 為 375×812／day；close 為 zoom 2.5。工具存的是舞台 canvas，PNG 尺寸不等於整個 viewport，手機以 DPR 2 輸出。

| # | 保留的變更（檔案:行號） | 改前／改後截圖 | 實際觀察與仍不滿意之處 |
|---|---|---|---|
| 1 | `sakyo.js:12`：移除池中月，青貝圓移到向月台上緣；同組 `kogetsudai`、layer 3、thick 2.4、bias 19。西京不動。 | 前 `before/sakyo.png`；A `01-a/sakyo.png`、`sakyo-mobile.png`、`moon-close.png`；B 同名於 `01-b/`；最終 `final/sakyo.png`。 | A 的青貝圓沒有被銀閣或東求堂遮住。近觀像附在向月台上緣的一枚圓章，還不是水平躺在台頂的月盤。 |
| 2 | `vocab.js:272`、`:281`、`:585`：三瓣葉墊改為一個 80 點、帶內凹的連續輪廓；銀杏上窄下寬。最後將葉冠厚度從試作的 24 降為 12，保留各區原有松鳥高度；`higashiyama.js:27` 兩棲點 bias 改 20。 | 前 `before/<區>.png`；試作 `02-tree/<區>.png`；最終 `final/<區>.png`；手機 `final/maple-mobile.png`；近觀 `08-final-check/yamashina.png`、`final/ginkgo-close.png`、`final/higashiyama-close.png`。 | 十一區都看過：闊葉樹是一整團，松仍是橫向分層。薄葉冠減少厚側壁，但楓樹輪廓仍偏圓盤；銀杏有尖頂，兩側還偏圓潤。未把它寫成自然樹冠已定稿。 |
| 3 | `vocab.js:376`：瘦胸、長吻、兩枚尖耳；粗尾貼背上折，尾端低於耳尖；腳邊增加 layer 0 切金寶珠。 | 前 `before/fushimi.png`；後 `03-fox/fushimi.png`、`fox-mobile.png`、`fox-close.png`；最終近觀亦見 `08-final-check/fushimi-perch2.png`。 | 耳、吻、尾能分開看見，寶珠在腳前。近觀銀色尾巴仍很厚，坐姿偏雕像；沒有做口銜鑰匙版本。 |
| 4 | `vocab.js:325`、`:335`、`:348`：楓落葉、銀杏落葉、橘果改平文金／銀；先限東山試拍，再推共用函式。燈光碎片仍保留切金。 | 前全景 `before/higashiyama.png`，近觀 `03-fox/leaves-before.png`；後 `04-trial/higashiyama.png`、`leaves-mobile.png`、`leaves-close.png`；全推後 `04-all/fans-close.png`、`fruit-close.png`。 | 小葉內部不再有切金方格，銀葉有整片連續反光。葉片仍依既有散佈相互搭接，東山近觀銀色落葉群偏密。 |
| 5 | `vocab.js:489`：鳳凰平面尺寸乘 .88、厚度 14→10；北區呼叫尺度仍為 1。 | 前 `before/kita.png`；後 `05-phoenix/kita.png`、`phoenix-mobile.png`、`phoenix-close.png`；最終 `final/kita.png`。 | 外框寬 55.44，對頂層屋頂寬 120 為 46.2%。近觀可見雙翼與頸部；手機仍主要讀成展翼徽記，尾羽未細化。 |
| 6 | `fushimi.js:8`、`:21`：五鳥居的 z 跨度 198→280、中心 x 跨度約 301.8→210；參道石跟著列線移動。 | 前 `03-fox/fushimi.png`；後 `06-climb/fushimi.png`、`climb-mobile.png`、`climb-close.png`；最終 `final/fushimi.png`。 | 鳥居由近處往山後斜升，逐座縮小；全景可讀出較陡的路線。山仍為既有的低起伏地形，並未做台階或改成高山。 |
| 7 | `vocab.js:522`：竿半寬改 `max(6/s,7)`，燈室收窄，笠半寬 33→35；保留可見的火袋。 | 前 `before/yamashina.png`；後 `07-lantern/yamashina.png`、`lantern-mobile.png`、`lantern-close.png`；西京另有 `07-lantern/nishikyo.png`。 | 近觀可見細竿與寬笠，s=.9 時竿寬 12.6。全景仍有短粗石物的觀感；笠沒有繼續放大，因西京石頭與燈籠的 12 單位間隔約束。 |
| 8 | `vocab.js:449`：S 1.7→2.2；`fushimi.js:38` 第一棲點 z 126→124.5、第二 106→103.5；東山 bias 配合薄葉冠降至 20。最終 bird 函式仍尊重呼叫端 bias，沒有全域抬高補償。 | 前 `before/<區>.png`；放大後 `08-bird/<區>.png`、`minami-mobile.png`、三個舊區 `*-close.png`；最終全景 `final/<區>.png`；南第二點 `08-perch2/minami-perch2.png`；伏見第二點 `08-final-check/fushimi-perch2.png`；東山第一點 `final/higashiyama-close.png`。 | 南的兩點、伏見修正後第二點及東山最後第一點有可看的近觀。44 個腳端在來源葉片輪廓內，但不是所有最終第二棲點都取得可判讀的近觀，因此本項只算部分驗證。鳥身在低仰角仍較像銀色橢圓，腳線很細。 |
| 9 | `vocab.js:86`、`shaders.js:305`、`:364`：霞改為連續箔面；以未模糊 alpha 取邊、導數抗鋸齒；取消霞材質散粒，保留金箔與少量金屬反光。 | 前 `08-bird/<區>.png`；後 `09-mist/<區>.png`、`mist-mobile.png`、`mist-close.png`；最終 `final/<區>.png`。 | 十一區已逐張看過。霞有實心水平片面與階差邊，近觀沒有原本外散的粉粒。片面有些角度顯得太平、像金色長條；未加入新雲紋或褶皺。背景的霞未修改。 |
| 10 | `renderer.js:60` 的 buildBox：懸子放兩疊、各三層料紙與窄金紙帶，頂面低於托盤邊。`shaders.js:262`、`:264`：箱側水線與切金由 PALE 改 GOLD。 | 前 `09-mist/minami.png`、`10-before/box-open.png`、`side-close.png`；後 `10-after/minami.png`、`box-open.png`、`box-open-mobile.png`、`side-mobile.png`、`side-close.png`。 | 懸子可見兩疊料紙，沒有穿出邊框；箱側碎片從灰白轉為淡金，銀色口沿仍在。料紙仍是簡化方片，沒有纖維或書寫。開盒會重設 zoom，未取得懸子本身 2.5 倍近觀；2.5 倍照片只驗箱側。 |

## 第 1 項兩案比較

- A：月落向月台。`01-a/moon-close.png` 的青貝圓集中在台上緣，與左側池面分開；手機也能看到一點藍綠。保留此案。
- B：砂上月影。`01-b/moon-close.png` 將月移至銀沙灘，砂紋改成波；圖中月嵌在銀色波紋上，仍很接近「水面月影」的閱讀方式。此案已撤回，沒有留下波形砂紋。
- A/B 都拍了同一組 1440 月光、375 暖日及 2.5 倍近觀。選擇依據是月與向月台的連結及斜視時的可見位置，不是測試結果；兩案測試都通過。

## 檢查與數字

本輪只依派工跑 `node --test scripts/plate.test.mjs`；每次都是 **exit 0、14 通過／0 失敗／0 skipped**。沒有修改正式測試來配合構圖。

| 次序 | 執行時機 | 通過／失敗 | exit |
|---|---|---|---|
| 1 | 開工基線 | 14／0 | 0 |
| 2 | 向月台月 A | 14／0 | 0 |
| 3 | 砂上月 B | 14／0 | 0 |
| 4 | 選回 A＋單團葉冠 | 14／0 | 0 |
| 5 | 區檔棲點寫入遭拒後的原 diff | 14／0 | 0 |
| 6 | 試作共用 bias 補償 | 14／0 | 0 |
| 7 | 狐 | 14／0 | 0 |
| 8 | 東山小葉試作 | 14／0 | 0 |
| 9 | 小葉推到共用函式 | 14／0 | 0 |
| 10 | 鳳凰 | 14／0 | 0 |
| 11 | 鳥居列、參道 | 14／0 | 0 |
| 12 | 燈籠 | 14／0 | 0 |
| 13 | 鶯 S=2.2 | 14／0 | 0 |
| 14 | 伏見第一棲點修正 | 14／0 | 0 |
| 15 | 霞材質與邊 | 14／0 | 0 |
| 16 | 懸子、箱側 | 14／0 | 0 |
| 17 | 撤回全域 bias，薄葉冠、東山高度、伏見第二點 | 14／0 | 0 |
| 18 | 最終 diff 留存日誌 | 14／0 | 0 |

最終日誌：`.claude/dispatch/w2-final-tests.log`。第 13 次雖然全過，額外腳端檢查仍找到伏見第一點超出葉片；原因是正式腳端斷言只涵蓋八個新區，已在第 14 次修正，沒有把當時的測試通過當作十一區全過。

額外命令 `node .claude/dispatch/w2-audit.mjs`：exit 0；十一區 `preparePlate.errors=[]`，44／44 個腳端在其所附 layer 3 葉片內。日誌 `.claude/dispatch/w2-final-audit.log`。這是來源幾何檢查，不代表動畫各幀的畫面貼合。

| 區 | 部品數 | 來源留白 % | 腳端成立 |
|---|---:|---:|---:|
| 南 | 52 | 58.5 | 4／4 |
| 伏見 | 38 | 60.4 | 4／4 |
| 東山 | 26 | 55.9 | 4／4 |
| 北 | 32 | 33.2 | 4／4 |
| 右京 | 27 | 40.2 | 4／4 |
| 西京 | 35 | 35.3 | 4／4 |
| 左京 | 31 | 29.8 | 4／4 |
| 上京 | 41 | 27.9 | 4／4 |
| 下京 | 29 | 35.4 | 4／4 |
| 中京 | 44 | 30.4 | 4／4 |
| 山科 | 34 | 34.2 | 4／4 |

留白用正式測試相同的 8 單位網格／來源 fill 多邊形估算，不是畫面亮度。八個新區都在正式測試的 26–46% 內，並通過 12 單位組間距；原三區沒有重排骨架，不聲稱三區都恰為三分之一。

`git -c safe.directory=C:/Git/Kyoto-Bunko diff --check`：exit 0，無空白錯誤；Git 另提示四個原為 LF 的修改檔日後可能依設定轉 CRLF。本輪編輯腳本保留各檔原有換行。全套 lint／validate --strict／npm test／build 依本次派工由主代理執行，本輪沒有嘗試 tsx 或安裝依賴；資料驗證的 ERROR/WARN 數不在本輪另作宣稱。

## 瀏覽器、問題與未驗

開工兩埠都回應 HTTP 200，沿用 `127.0.0.1:3000` 與 CDP `9377`，未自行啟動 server 或 Chrome。主要使用原 `scripts/plate-shot.mjs`；第二棲點及開蓋使用 `.claude/dispatch/` 的新輔助腳本。成功的截圖均核對實際 ward；最終十一區為 WebGL，輸出沒有 console error／warning。119 張已產生 PNG 均實際查看；中間試作保留作對照，不代表都是最終版本。

- **CONFIRMED：檔案權限。** `w2-perches.mjs` 寫 `ukyo.js` 時 EPERM，apply_patch 同檔也失敗；後續 `w2-perch-refine.mjs` 寫 `shimogyo.js` 也 EPERM。未改 ACL、未繞過限制；兩檔沒有變更。最終以共用葉冠厚度與可寫的東山棲點處理，撤掉會抬高松鳥的全域補償。`02-perches/` 是寫入失敗後的重拍，不能當作修正生效證據。
- **CONFIRMED：第二棲點近觀取景不完整。** `08-perch2/` 雖有十一區照片，但右京、西京、左京、中京等照片把第二棲點裁掉；下京那張仍主要拍到松。部分其餘照片屬最後高度修正之前，不代替最終驗收。
- **CONFIRMED：輔助點擊失敗。** 下京曾回報 `hit undefined`，排除覆蓋按鈕後曾成功；最後重新對準銀杏又因第一棲點不在 viewport 報 `no exposed first-perch hit point`。另一個先點後放大的輔助版本在北區報 `hit undefined`，批次即停止，`final-perch2/` 為空。沒有把點擊失敗寫成產品故障，也沒有繼續盲試。
- **未驗：** 最終八個新區及東山第二棲點的逐點 2.5 倍視覺貼合；已有全景及來源幾何證據，但不足以宣稱逐點無懸空／陷入。南第二點有未受後續幾何改動影響的近觀，伏見第二點有最終修正後近觀。
- **未驗：** 懸子開蓋後 2.5 倍近觀。產品 `openBook()` 會 `resetZoom()`，本輪不改互動控制來取得照片。已有桌機月光及手機暖日開盒圖。
- **未驗：** 真機觸控、Safari、所有動畫中間幀及幀時間；本次不是效能或 W4 全流程驗收。未重新宣稱效能數字。各項手機近觀與全景不等於十一區所有日夜、語系、減少動態組合均通過。
- 資料來源／未確認項：本輪只改藝術語彙，沒有新增旅遊身分、地址、座標或營業資訊；不涉及外部資料查證。

## 交接與回退

交付六個程式檔的未提交 diff：`vocab.js`、`sakyo.js`、`fushimi.js`、`higashiyama.js`、`shaders.js`、`renderer.js`，以及本報告。`.shots/w2/` 與 `.claude/dispatch/w2-*` 為本輪檢查產物，不提交。主代理仍需依派工執行四項整合檢查，且 W2 不能在第二棲點視覺缺口未處理前標成完整驗收。

按項回退時只反向套用對應 diff hunk：月在 `sakyo.js`；鳥居及參道在 `fushimi.js`；霞在 `suyari` 與 shader 的 MODE 4／mat 13；箱在 buildBox 新增 packet 區塊及 MODE 0 的兩行 GOLD。**葉冠厚度、鶯 S、東山 bias 與伏見棲點互相配合，回退應一併檢查，不可只撤一行高度。** 不要重跑中間試作腳本，它們依賴各階段的舊字串，並非可重入安裝器。代理未 commit／push。
