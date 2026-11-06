# T4-M3a — 清水寺屋頂破面修正

> 後續使用者確認仍有穿插；本輪只處理屋面，未解決灰色基座／舞台同高問題。已由 [T4-M3b](2026-11-06-phase04-kiyomizu-plinth.md) 確認並修正。以下保留當時診斷，不作為穿插已完全解決的結論。

日期：2026-11-06；工作區 `C:/Git/Kyoto-Tactical-Guide`；分支 `codex/phase4-data-audit`；base／HEAD `11c0947`。

使用者回報清水寺屋頂有三角暗塊，傾斜時像灰色面穿出。主代理單獨修正及驗收，沒有子代理；請求模型／強度不適用，實際設定未經工具確認，未切換。既有修改保留，沒有 commit／merge／push。

## 診斷與變更

- **CONFIRMED**：原屋頂每側由兩段大片平面組成，轉折採平面法線；放大檢視可以看見不連續的明暗帶。原簷口最低點 122、牆體頂 118，只有 4 個模型單位間距。
- 用暫時放大相機、關閉陰影、法線與材質分色隔離問題。材質分色沒有確認銀色基座實際穿進屋面；「幾何相交」不能列為已證實根因。只關閉陰影也不足以消除原本的屋面轉折，因此沒有採取隱藏陰影的處理。
- `landmarks.js` 僅清水寺啟用連續二次曲面屋頂，每側 12×18 格，沿曲面計算法線；瓦線以相同曲線貼合屋面，不再用兩段直線折過大片三角面。
- 簷口高度參數由 5 改為 12，柱頭跟隨抬高；曲面最低點約 128.95，與牆頂相隔約 10.95。屋頂、柱牆、平台仍同屬結構變形層，傾斜使用同一仿射變換，不以不同層的位移拉扯接合處。
- `geometry.js` 的三角形輸出支援指定逐頂點法線；未指定時保留原平面法線。其餘十函未啟用新曲面，東寺幾何仍為 137,982 頂點。清水寺由 44,598 增為 70,332，仍低於既有 150,000 上限。
- 暫時相機、診斷色與無陰影版本全部移除；`study.js` 與 `shaders.js` 的 bytes 均與本輪開始前一致，正式畫面維持原相機與正常金漆／投影。

## 驗收

| 檢查 | 結果 |
|---|---|
| `npm run lint` | exit 0 |
| `npx --no-install tsx validate_data.js --strict` | exit 0；809 筆、ERROR 0、WARN 0 |
| `node --test --test-concurrency=1 scripts/makie-scene.test.mjs scripts/location-navigation.test.mjs scripts/toji-study.test.mjs scripts/toji-library.test.mjs` | exit 0；24/24 |
| `npm run build` | exit 0 |
| `git diff --check` | exit 0；僅 Git 行尾提示 |

新增測試檢查清水寺屋面細分邊長、同坡面共享頂點法線一致、與牆頂間距、結構變形層與不同高度縮放時的間距。既有十一函幾何、雙語資料與導航回歸仍通過。

瀏覽器：1440px 中文日間、375×812 日文夜間、滑鼠四向移光、鍵盤移光／Enter 開卷／Escape 收卷、平面與浮雕切換、頁內減少動態均已操作。東山書卷 84 筆；手機無橫向溢出；console warn/error 0。放大四向傾斜未再觀察到原三角暗塊或灰面穿出。此結論限本機可用瀏覽器，不宣稱所有 GPU／觸控設備皆已驗收。

本輪新證據在 `.claude/phase04i/`：

- `roof-before.jpg` 與 `roof-after-detail.jpg`：同一診斷放大相機的前後對照，不是正式構圖。
- `roof-tilt-{left,right,top,bottom}.jpg`、`tilt-state.json`：修正後四向動態近看。
- `desktop-fixed.jpg`、`mobile-ja-night.jpg`：已恢復正式相機的實際畫面。
- `lint.log`、`validate.log`、`tests.log`、`build.log`、`evidence.json`：命令與當前來源雜湊。
- `diagnostic-*` 僅為診斷紀錄，綠／藍分色不是設計成果，不能當成最後美術。

**完成**：局部曲面與間距修正、上述命令和可用瀏覽器驗收。**待使用者體驗**：原本發生穿插的實際移動手感。**未測**：真實手機觸控、OS reduced-motion、Safari／iOS、不同 GPU／FPS；本輪沒有重跑 production preview。首頁整合與其他地標美術不在本次修正範圍。
