# T4-M3 — 十一區文庫地標浮雕

日期：2026-11-06（Asia/Taipei）。工作區 `C:/Git/Kyoto-Tactical-Guide`；分支 `codex/phase4-data-audit`；base／HEAD `11c0947`。

## 授權與範圍

- 使用者最新指令「ok依序把其他區地標作完!」授權把 T4-M2c 的十個素函補成各區代表地標；取代前輪「其他地標先不擴展」限制。
- 主代理單獨研究、實作、整合與驗收，核心視覺單一寫入；沒有子代理。請求模型／強度：不適用；實際主代理設定：未經工具確認，未切換。
- 開工核對分支、HEAD、既有 diff 與 3000 listener，沿用伺服器。保留前輪所有未提交成果，未 reset／clean、未 commit／merge／push。
- 維持獨立入口 `/toji-study/index.html`、一區一函與固定相機；本輪沒有換掉首頁、沒有改受保護資料、沒有新增依賴或 Rust 管線。

## 完成內容

`src/studies/toji/landmarks.js` 新增十組幾何構圖及雙語短說明，共用瓦面曲線、屋脊、柱廊、院落、石階、樹與池庭的建模元件。模型直接接上既有浮雕高度、視差、陰影、樹木搖動、光跡與開盒變換，並非平面貼圖替換。

| 行政區 | 地標與構圖 | 頂點數（整函） |
|---|---|---:|
| 北區 | 金閣寺：三層閣、金色上層、鏡湖池與松島 | 65,106 |
| 上京區 | 京都御所：紫宸殿、南庭、低回廊與庭樹 | 78,213 |
| 左京區 | 銀閣寺：觀音殿、銀沙灘刻線、向月台與池水 | 54,438 |
| 中京區 | 二条城：錯落御殿、唐門、庭園與前景石垣 | 96,444 |
| 東山區 | 清水寺：懸造支柱、挑出舞台、本堂與楓樹 | 44,598 |
| 下京區 | 西本願寺：大小雙堂、連廊、唐門與銀杏 | 74,649 |
| 南區 | 東寺：保留已接受的五重塔與金銀山水幾何 | 137,982 |
| 右京區 | 天龍寺：方丈、曹源池、立石與借景山 | 64,104 |
| 西京區 | 桂離宮：錯落書院、月見台、池庭與飛石 | 79,326 |
| 山科區 | 毘沙門堂：山門、石階、抬高本殿與楓 | 72,960 |
| 伏見區 | 伏見稻荷：前景大鳥居、兩列退遠鳥居與樓門 | 83,442 |

所有構圖都用簡化量體取其識別特徵，比例、棟數與庭園位置經過壓縮，不是測繪模型或歷史復原；也不表示這些建物全部屬於平安時代。桂離宮以少量錯落量體表達書院群，伏見僅用有限鳥居表達延伸感。銀閣的「銀」用於庭砂，未把木構觀音殿做成銀箔建築。

材質仍沿用梨地／濃梨地／刑部梨地、切金切銀與螺鈿意象。新增少量赤褐漆，以及可隨光照顯現刻紋的金銀色池面；不是水體流體模擬。第一輪畫面檢視後，調整金閣上層金色面與池面，避免大片灰銀色像貼片。沒有宣稱達到工藝品或美術定稿品質。

`geometry.js` 按 ward 建立模型；`collection.ts` 的十一函皆標示已有 relief；`study.js` 顯示各函雙語意象並共用既有互動。保留東寺頂點數與四層分組。`shaders.js` 只擴充新場景材質。

**CONFIRMED 換函顯示問題**：減少動態時快速換函，曾觀察到文字先更新而 canvas 保留上一函。`changeCabinet()` 現在先上傳模型並同步繪製，再顯示新函資訊；渲染器寫入 `data-rendered-ward`。桌機、手機逐十一函均核對 `ward === renderedWard`，防止拿標題正確但畫面過期的截圖驗收。

## 建築參考（官方來源，查閱 2026-11-06）

下列資料僅用來選擇可辨識輪廓，不修改景點資料或加入未核實的營業資訊。

| 地標 | 參考特徵與來源 |
|---|---|
| 金閣寺 | 三層閣、上兩層金箔及鳳凰：[相國寺官網](https://www.shokoku-ji.jp/kinkakuji/guide/) |
| 京都御所 | 紫宸殿與南庭的儀式性構圖：[宮內廳御所導覽](https://sankan.kunaicho.go.jp/multilingual/kyoto/index.html)、[紫宸殿資料](https://www.kunaicho.go.jp/event/kyotogosho/pdf/02shishinden.pdf) |
| 銀閣寺 | 二層觀音殿、銀沙灘與向月台：[相國寺官網](https://www.shokoku-ji.jp/ginkakuji/guide/) |
| 二条城 | 雁行御殿與庭園關係：[二条城官網](https://nijo-jocastle.city.kyoto.lg.jp/introduction/highlights/teien/) |
| 清水寺 | 懸造本堂、舞台與山坡：[清水寺官網](https://www.kiyomizudera.or.jp/history.php) |
| 西本願寺 | 大小雙堂與境內配置：[境內導覽](https://www.hongwanji.kyoto/see/keidai.html)；銀杏：[官方秋季介紹](https://www.hongwanji.kyoto/info/img/onishi-aki.pdf) |
| 天龍寺 | 方丈、曹源池、立石與借景：[境內導覽](https://www.tenryuji.com/precincts/) |
| 桂離宮 | 竹製月見台與書院：[宮內廳月見台](https://kyoto-gosho.kunaicho.go.jp/room/3A240)、[離宮導覽](https://kyoto-gosho.kunaicho.go.jp/pdf/katsura_rikyu_RGB.pdf) |
| 毘沙門堂 | 石階、仁王門、本殿與庭樹：[官方境內圖](https://www.bishamon.or.jp/precincts_of_the_temple/) |
| 伏見稻荷 | 樓門、朱漆鳥居與參道：[官方境內圖](https://inari.jp/trip/map01/) |

## 驗收結果

新證據全部位於本機 `.claude/phase04h/`，不沿用前輪圖片、不提交該資料夾。`evidence.json` 綁定 base、分支及當前來源 SHA-256；`geometry-metrics.json` 保存各模型頂點數及範圍。

| 命令 | exit | 結果／日誌 |
|---|---:|---|
| `npm run lint` | 0 | TypeScript 通過；`lint.log` |
| `npx --no-install tsx validate_data.js --strict` | 0 | 809 筆、ERROR 0、WARN 0；`validate.log` |
| `node --test --test-concurrency=1 scripts/makie-scene.test.mjs scripts/location-navigation.test.mjs scripts/toji-study.test.mjs scripts/toji-library.test.mjs` | 0 | 23/23 通過；`tests.log` |
| `npm run build` | 0 | 主站與獨立展示皆輸出；`build.log` |

新增幾何測試驗證十一個 mesh 各不相同、頂點有限值、法線單位化、函面範圍、四層分組與每函 150,000 頂點上限；既有雙語／分區資料、手勢與導航測試保留。這些是完整性與回歸檢查，不代替視覺判斷，也不是 GPU 效能基準。

| 瀏覽器情境 | 結果與證據 |
|---|---|
| 桌機 1440×1200、DPR 1，中文日間 | 逐區檢視十一函輪廓、構圖與邊界；`desktop-W_*.jpg`、`gallery-state.json` |
| 手機 CSS 375×812、DPR 1，日文夜間 | 十一函無橫向溢出、模型與區名一致；`mobile-W_*.jpg`、`mobile-state.json`；御所、清水及伏見另檢視完整畫面 |
| 十一函開卷／收卷 | 日文每區名稱與條目數正確，合計 809；`volume-state.json` |
| 滑鼠移光／軌跡 | 右京函觀察到隆起與光跡，`lift=1`、`trails=2`；`mouse-relief.jpg`、`interaction-state.json` |
| 鍵盤 | 方向鍵換函與移光；Enter 開右京 77 筆書卷，Escape 收卷；`open-ukyo.jpg` |
| 平面／浮雕 | 右京量體高度與投影有明顯差異；`flat-ukyo.jpg` 與 `mouse-relief.jpg` |
| 手動減少動態 | 十一函維持浮雕，軌跡 0、仍可換函及即時開卷；桌機／手機 state 記錄 `still=true` |
| 正式建置 | 暫時 3001 preview：下京與東山模型頂點數吻合，東山書卷 84 筆，console warn/error 0；`production-state.json`、`production-reader.jpg` |
| 主站 smoke | 正式建置根入口仍載入 809 筆與十一行政區按鈕；沒有替換成文庫首頁 |

驗收環境曾對 `127.0.0.1` 保存非 100% 縮放，造成手機截圖裁切；以同伺服器的 `localhost` 獨立來源取得 DPR 1，核對實際 `innerWidth/innerHeight` 後重拍，所有 `mobile-W_*.jpg` 與 mobile state 皆覆蓋為有效證據。早期故障診斷圖不列入驗收。3001 測試伺服器已停止；原 3000 保留。最後預覽停在北區金閣函，一般動態啟用。

## 完成、待體驗與未測

- **完成**：十個新增地標構圖、十一函渲染／雙語意象、快速換函畫面同步修正、命令驗收及上述瀏覽器情境；HANDOFF、PLAN、派工計畫與 README 同步。
- **待使用者體驗**：新增十函的美術細節、構圖偏好與動態手感；不能以自動測試稱為美術定稿。
- **未測**：真實手機手指／多點觸控、OS `prefers-reduced-motion` 設定切換、Safari／iOS、GPU context loss、不同實體 GPU 與 FPS。可用環境只完成滑鼠、鍵盤、手機 CSS 寬度及頁內減少動態，沒有把它們冒充實機觸控。
- **後續階段**：首頁整合未做，仍在獨立文庫頁。沒有提交或遠端操作；既有工作區修改完整保留。
