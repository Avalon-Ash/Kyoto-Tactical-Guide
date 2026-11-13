# 蒔繪浮雕盤 W2 第二輪：樹冠、左京的月

任務：`MAKIE_PLATE_HANDOFF.md` §8.2 W2 第 1、2 項再修／**部分完成**。樹冠造形與左京月的替代方案已實作；山科棲點調整遇到 EPERM，依派工跳過，第二棲點視覺驗證未完成。

請求模型／強度：`gpt-6-astra`／high；實際設定：**未確認**，工具未提供可核對的模型及強度資訊。

工作區：`C:\Git\Kyoto-Bunko`；分支：`claude/great-brahmagupta-ye2uqt`；base SHA：`766a43ab67eaec3709d1f3cc26e62ea8731f8d75`。開工工作區乾淨。本輪依派工直接實作，未再派代理、commit、push、切分支、stash、reset 或安裝套件。只保留三個程式檔的 diff 與本報告。

## 變更與畫面證據

程式路徑相對於 `src/studies/toji/plate/`；截圖路徑相對於 `.shots/w2b/`。`before/` 為 base 月光全景；`final/` 為最終月光全景；`mobile/` 為最終暖日手機；`close/` 為最終 2.5 倍月光近觀。桌機 viewport 1440×900、手機 375×812；工具只截舞台 canvas，手機 DPR 2，因此 PNG 尺寸不同於 viewport。

| 項目 | 保留的變更（檔案:行號） | 前後截圖 | 實際觀察、仍不滿意之處 |
|---|---|---|---|
| 闊葉樹輪廓 | `vocab.js:277`：六段不等大的三次曲線構成單一輪廓，缺口錯位；依 seed 左右翻轉並略微偏斜。`:306`、`:313`：收窄、拉高、冠心上移；葉冠厚度仍為 12。銀杏保留原本上窄下寬的火焰輪廓。 | `before/<區>.png` 對 `final/<區>.png`；五區名見下表。試作在 `tree-a/`、`trial-b/tree-close.png`。 | 最終近觀可分辨上方高低不同的鼓包及兩側內凹；全景不再是寬於高的圓盤。東山最小一棵在手機上仍會把相鄰鼓包讀成一整塊；六個鼓包不代表手機每個角度都可逐一數出。 |
| 分枝、葉刻 | `vocab.js:313`、`:321`：分叉下移，兩側枝伸向樹冠底部；`:324`：三條細線延續到冠面。葉形仍是 `lines`，收在冠內，不加立體葉片。 | `close/higashiyama.png`、`ukyo.png`、`kamigyo.png`、`shimogyo.png`、`yamashina.png`、`yamashina-east.png`。 | 近觀能看到主幹和側枝之間的空隙，形成 Y 形；銀杏也保留三枝結構。小樹的分枝在全景及手機仍細小。葉刻集中在中央，外側鼓包表面較空，仍有雕飾樹的觀感。 |
| 東山棲點 | `higashiyama.js:27`：兩點移至 `[-136.1,111.7]`、`[313.9,45.8]`，bias 保持 20。 | 第一點 `close/higashiyama.png`；第二點 `perches-final/higashiyama-perch2.png`。 | 原第一點被新葉冠的點選區覆蓋，工具無法點到。移動後實際點擊回報 `poked=uguisu-0`，第二棲點照片可見鶯在右側冠頂。腳線很細，沒有以這幾張照片宣稱動畫各幀都無穿插。 |
| 左京月 | `sakyo.js:12`–`:14`：移除台上的 layer 3 圓章，月回到 layer 0 地子，中心 `(190,199)`、半徑 16、無波紋，與向月台中心 x=190 對齊。移除不再使用的 KIND import。 | `before/sakyo.png` 對 `final/sakyo.png`；`mobile/sakyo.png`、`close/sakyo.png`。相同最終圖另存 `moon-ground/`。 | 月在銀沙灘及向月台前方的漆面可見，與台腳隔著漆地，沒有落進池裡。暖日手機也能看見藍綠圓點；它較像一枚地子上的青貝月符，不能表達「月盤放在台頂」的實物關係。採用使用者明確允許的替代方案。 |

### 左京台頂試作為何撤回

先試將 `sandCone` 頂半寬由 21.5 加至 32，頂部橢圓加深；月改半徑 22、縱橫比 .30，與台體共用 layer 2、thick 18、bias 0。`trial-b/sakyo.png`、`trial-b/moon-mobile.png`、`trial-b/moon-close.png` 有全景、手機及近觀。近觀看似一個嵌在頂部的青貝橢圓，但只是畫面透視提示。

讀取 `parts.js` 的 `preparePlate` 與 `shaders.js` 的 `partVert` 可確認：部品傾角由 kind 決定，幾何沿同一腳線傾起；這個橢圓仍與台的斜面共用傾角。僅擴頂和壓扁圓形，不能使月面獨立保持水平並隨台頂升降。派工禁止修改這些渲染檔，因此沒有把試作稱為「躺著」並交付。台頂試作已完整撤回，`moon`、`sandCone` 本身沒有最終 diff；最終採前方地子方案。

### 所有使用 broadleaf 的區：已看過的最終畫面

下表每區都查看了 `before/<區>.png`、`final/<區>.png`、`mobile/<區>.png`、`close/<區>.png`；山科另看 `close/yamashina-east.png`。

| 區／檔名 | 實際觀察 | 部品數 | 最小組間距 |
|---|---|---:|---:|
| 東山／higashiyama | 三棵楓均成較高的單團；右側小樹的凹口在全景較不明顯。第一棲點已上移。 | 26 | 22.20 |
| 右京／ukyo | 近景楓冠高於寬，冠底有側枝；池與樹的原構圖留白仍在。 | 27 | 14.00 |
| 上京／kamigyo | 銀色櫻、金色橘都呈縱向團冠；橘的刻圓與櫻的花刻仍可區分。 | 41 | 24.81 |
| 下京／shimogyo | 銀杏仍尖頂、上窄下寬，冠底分叉可見；未換成六瓣雲冠。 | 29 | 26.99 |
| 山科／yamashina | 左右楓的鼓包、冠底枝杈可見；原鶯第一點仍處冠面偏上，尚未移到新冠頂。 | 34 | 36.10 |

北區的兩棵在 `kita.js:24`、`:25` 實際呼叫 **pine**，不使用 broadleaf。本輪不改 pine；另外拍並查看 `before/kita.png`、`final/kita.png` 作對照，松仍為橫向葉墊。沒有將北區說成已修好的闊葉樹。

## 檢查與數字

每次均執行 `node --test scripts/plate.test.mjs`，**exit 0、16 通過／0 失敗／0 skipped**，沒有修改正式測試。

| 次序 | 執行時機 | 通過／失敗 | exit |
|---|---|---|---|
| 1 | 開工基線 | 16／0 | 0 |
| 2 | 五瓣試作 | 16／0 | 0 |
| 3 | 六瓣與分叉下移 | 16／0 | 0 |
| 4 | 台頂嵌月試作 | 16／0 | 0 |
| 5 | 分枝張開、冠心再上移 | 16／0 | 0 |
| 6 | 撤回台頂，採前方地子月 | 16／0 | 0 |
| 7 | 東山棲點生效；山科 EPERM 跳過 | 16／0 | 0 |
| 8 | 放寬小樹一處較窄凹口，最終程式 diff | 16／0 | 0 |

額外命令 `node .claude/dispatch/w2b-audit.mjs`：exit 0，輸出 `.shots/w2b/geometry.json`。十一區 `preparePlate.errors=[]`；44／44 腳端落在其載體葉冠來源多邊形內。八個新區的 12 單位間距、邊界及留白要求由正式測試通過；舊三區不冒充全部有 12 單位間距。

| 樹冠 | 寬 | 高 | 高／寬 | 最小凹口開口估計 |
|---|---:|---:|---:|---:|
| 東山 maple-a | 73.01 | 87.57 | 1.20 | 16.91 |
| 東山 maple-b | 60.42 | 71.15 | 1.18 | 14.10 |
| 東山 maple-c | 56.07 | 65.68 | 1.17 | 13.11 |
| 右京 near-maple | 80.56 | 94.87 | 1.18 | 18.80 |
| 上京 sakon-sakura | 68.65 | 81.18 | 1.18 | 16.01 |
| 上京 ukon-tachibana | 60.04 | 67.46 | 1.12 | 13.71 |
| 下京 great-ginkgo | 90.28 | 112.29 | 1.24 | 保留火焰輪廓，不套六瓣估計 |
| 山科 west-maple | 102.67 | 123.15 | 1.20 | 23.77 |
| 山科 east-maple | 85.98 | 101.25 | 1.18 | 20.07 |

全部厚度 12。凹口開口估計是每個曲線接點前後各 1/4 段曲線採樣點之間的弦長，最小 13.11；它是來源輪廓尺寸，**不是 GPU 膨脹後的精確缺口寬度**，仍以列出的實際截圖判讀。最後才放寬的一處凹口，先前小樹估計約 9.15–9.88，已修改控制點並重拍相關區。

`git -c safe.directory=C:/Git/Kyoto-Bunko diff --check`：exit 0。Git 對既有 LF 的區檔提示未來可能轉 CRLF；編輯保持原行尾。最終程式內容 SHA-256 記於 `.shots/w2b/source-hashes.json`，用以配對本輪證據與 diff。

## 瀏覽器與重現指令

沿用 `http://127.0.0.1:3000`、CDP `9377`，開工確認 HTTP 200、Chrome `157.0.8103.52`。未自行開 server 或 Chrome。成功截圖的 dataset 均確認 `renderer=webgl`、`plate=true`、正確 ward；近觀為 zoom 2.500。成功截圖批次沒有回報 console error／warning。

主工具命令格式：

```text
node scripts/plate-shot.mjs C:/Git/Kyoto-Bunko/.shots/w2b/<目錄> <job> …
```

全景 job 都是 `<區>:<步數>:night:1440x900:1:0.5,0.5`；手機改為 `day:375x812:1:0.5,0.5`。步數：東山 -2、右京 1、上京 -5、下京 -1、山科 3、北 5、左京 -4。最終近觀的 job 尾端：

| 檔名 | 步數 | `theme:WxH:zoom:fx,fy` |
|---|---:|---|
| higashiyama | -2 | `night:1440x900:2.5:0.37,0.60` |
| ukyo | 1 | `night:1440x900:2.5:0.63,0.72` |
| kamigyo | -5 | `night:1440x900:2.5:0.48,0.52` |
| shimogyo | -1 | `night:1440x900:2.5:0.32,0.52` |
| yamashina | 3 | `night:1440x900:2.5:0.33,0.45` |
| yamashina-east | 3 | `night:1440x900:2.5:0.67,0.63` |
| sakyo-close（moon-ground 原檔） | -4 | `night:1440x900:2.5:0.58,0.73` |

左京最終圖從 `moon-ground/` 複製到三個最終目錄；台頂試作只以 `trial-b/` 為證據，不當作最終成品。

第二棲點用本輪新建 `.claude/dispatch/w2b-perch-shot.mjs`：先在 1.15 倍以實際點擊切換，再按重設倍率、重框至 2.5 倍。成功圖均回報 `poked=uguisu-0`，未直接改產品動畫狀態。右京、上京、東山最終圖在 `perches-final/`；下京在 `perches/shimogyo-perch2.png`。東山取景 `0.68,0.68`，上京 `0.43,0.48`，其餘同上表。

## 問題、未做／未驗

- **CONFIRMED：山科寫入權限。** `node .claude/dispatch/w2b-perches.mjs` 寫 `src/studies/toji/plate/yamashina.js` 遇到 EPERM，等 10 秒後重試一次仍是 EPERM，依指示跳過；未改 ACL 或另繞寫入方式。山科檔案沒有 diff。預定但未寫入的兩個棲點為 `[-257.7,-37.1,1,'west-maple',20]`、`[271.1,-32.9,-1,'east-maple',20]`；這些位置尚未通過寫入後測試與畫面驗證，不可直接當已驗收數值。
- **CONFIRMED：山科第二棲點近觀未取得。** 輔助命令 `node .claude/dispatch/w2b-perch-shot.mjs C:/Git/Kyoto-Bunko/.shots/w2b/perches-final … yamashina-perch2:3:night:1440x900:2.5:0.67,0.63` 以 exit 1 結束：`no exposed first-perch hit point in the viewport`。第一點近觀與兩點來源腳端支撐已有證據；第二點視覺貼合及完整換枝仍未驗。東山曾出現相同工具錯誤，調整棲點後已成功，不算成測試失敗。
- **未做：真正水平、隨台頂升降的月盤。** 允許的語彙與區檔不足以修改獨立轉軸；採用派工明許的前方地子月。試作不是已完成的水平月面。
- **未驗：** 所有樹、鶯在動畫中的每一幀、手機真機觸控、Safari／iOS、幀時間。本輪照片是桌面無頭 Chrome，不代替真機。
- **未跑：** lint、資料 validate、完整 npm test、build；派工明確交由主代理執行四項整合檢查，本輪不宣稱這些通過或資料 ERROR／WARN 數。
- 資料來源：本輪只改藝術語彙與位置，不新增旅遊身分、地址、座標、營業資訊；不涉及外部資料查證。

## 交接與回退

交付 `vocab.js`、`higashiyama.js`、`sakyo.js` 的未提交 diff 及本報告。`parts.js`、`shaders.js`、`renderer.js`、正式測試皆未改。`.shots/w2b/` 與 `.claude/dispatch/w2b-*` 是本輪驗證產物，不提交。

樹冠仍有山科棲點的權限與視覺驗證缺口，不能標成完整驗收。主代理可在可寫環境處理山科棲點，再跑四項整合檢查；本輪沒有要求使用者額外確認。

按項回退只反向套對應 diff：左京月為 `sakyo.js`；樹冠為 `vocab.js` 的 crownLobe／broadleaf，**東山棲點須與樹冠一併回退或重新量測**。不要重跑中間試作編輯腳本，它們依賴階段字串，不是可重入安裝器。未 commit／push。
