# T4-M3b — 清水寺灰色基座與舞台重疊

> 2026-11-06 使用者已確認「這次ok了，其他我看過沒有穿插」，本修正及其餘地標穿插體驗已接受。後續首頁整合見 [T4-M4](2026-11-06-phase04-bunko-home.md)；下文保留當時驗收狀態。

日期：2026-11-06；工作區 `C:/Git/Kyoto-Tactical-Guide`；分支 `codex/phase4-data-audit`；base／HEAD `11c0947`。使用者指出灰色基座右下仍穿入舞台，明確要求抬高。主代理單獨修正，無派工；請求模型／強度不適用，實際設定未經工具確認，未切換。保留既有修改，未 commit／merge／push。

## 已確認根因與修正

**CONFIRMED**：上一輪 T4-M3a 處理的是屋頂，沒有修到使用者指出的基座／舞台接面，不能視為已完整解決穿插。

- 原灰色基座範圍：x=-149..149、z=-108..40、y=75..79。
- 舞台：x=-169..169、z=26..138、y=74..79；舞台金線高至 79.3。
- 兩者在 z=26..40 重疊，頂面同為 y=79；金線甚至高於灰面，造成可見的深度衝突與穿線。此處不是屋頂陰影問題。
- `landmarks.js` 將清水寺 `hall()` 的基準由 75 提至 84，整組灰色基座、殿身與屋頂共同抬高 9。灰色基座現在 y=84..88，底面距舞台金線約 4.7。下方新增 y=79..84 的木色承座，避免懸空。
- 所有接合構件仍使用相同結構變形層；傾斜不會改變相對高度順序。其餘十函不變，清水寺頂點數由 70,332 增至 70,362。

## 驗收與證據

新增 `Kiyomizu silver plinth stays above the overlapping stage and its gold seams` 回歸測試。先在舊模型上執行並確認失敗（`.claude/phase04j/regression-before.log`，exit 1），再修正模型，測試轉為通過（`regression-after.log`，exit 0）。測試從實際 mesh 取出重疊區高度，檢查灰色底面高於舞台／金線，且使用相同變形層；既有屋頂間距測試同步使用抬高後牆頂 127。

| 命令 | 結果 |
|---|---|
| `npm run lint` | exit 0 |
| `npx --no-install tsx validate_data.js --strict` | exit 0，809 筆、ERROR 0、WARN 0 |
| `node --test --test-concurrency=1 scripts/makie-scene.test.mjs scripts/location-navigation.test.mjs scripts/toji-study.test.mjs scripts/toji-library.test.mjs` | exit 0，25/25 |
| `npm run build` | exit 0 |
| `git diff --check` | exit 0 |

本輪新證據 `.claude/phase04j/` 不提交、不沿用舊圖：

- `plinth-{left,right,top,bottom}.jpg`：暫時放大相機檢視四向滑鼠傾斜；右下基座側面連續，舞台金線未再穿入灰面。此相機只供診斷，隨後恢復。
- `desktop-fixed.jpg`：正式構圖 1440px 中文日間。
- `mobile-night.jpg`、`browser-state.json`：375×812、DPR 1、日文夜間、減少動態；無橫向溢出、東山書卷 84 筆、console warn/error 0。
- 已操作鍵盤移光、Enter 開卷／Escape 收卷、平面／浮雕切換；滑鼠四向 state 在 `tilt-state.json`。
- `study.js` 已逐 byte 核對回復本輪開始前版本，沒有留下放大相機或其他診斷改動；`evidence.json` 記錄來源雜湊與命令。

**完成**：基座／舞台高度衝突修正、先紅後綠回歸與上述可用瀏覽器驗收。**待使用者體驗**：原本指出的右下角移動手感。**未測**：真實手機觸控、OS reduced-motion、Safari／iOS、不同實體 GPU／FPS；本輪未另啟 production preview。未更動首頁整合或其他地標。
