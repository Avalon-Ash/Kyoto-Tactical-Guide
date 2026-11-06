# T4-M4a — 首頁精簡與直接拖動文庫

日期：2026-11-06；工作區 `C:/Git/Kyoto-Tactical-Guide`；分支 `codex/phase4-data-audit`；base／HEAD `11c0947`。接續 T4-M4，使用者直接標註要求移除首頁介紹文案、換函導覽列及底部測試工具，改為左右拖動文庫。主代理單獨實作，無派工；請求模型／強度不適用，實際設定未經工具確認，未切換。無新依賴、未 commit／merge／push。

## 已完成

- 首頁不再顯示介紹區、上一函／下一函列、演示及減少動態工具列，亦無其鍵盤停留點。文庫使用主導航下方剩餘高度，區名及函序縮入畫面角落，保留古地名、地標、日夜與開卷入口。
- 滑鼠按住／手指橫拖文庫，畫面跟隨拖動，放開跨過門檻才換函；向左下一函、向右上一函，十一函循環。短拖回彈，慢速拖動同樣可用。
- 方向鎖定避免垂直捲動被判為換函；pointer capture 支援拖出畫面再放開，取消／失去捕捉會復位；其他手指不會接管當前手勢。拖動不會誤開書卷，輕點蓋面仍可開卷。
- 未按住時原有移光與光跡保留。首頁鍵盤左右鍵改為換函，Enter／空白鍵開卷；上下鍵仍可移光。
- 首頁移除手動測試控制後，仍遵循系統 `prefers-reduced-motion`，停用拖動位移、換函動畫及光跡。獨立展示保留測試用控制和原有滑軌，不改已接受幾何／shader。

## 驗收及證據

| 命令 | 結果 |
|---|---|
| `npm run lint` | exit 0 |
| `npx --no-install tsx validate_data.js --strict` | exit 0；809 筆、ERROR 0、WARN 0 |
| `node --test --test-concurrency=1 scripts/makie-scene.test.mjs scripts/location-navigation.test.mjs scripts/toji-study.test.mjs scripts/toji-library.test.mjs scripts/bunko-integration.test.mjs` | exit 0；30/30 |
| `npm run build` | exit 0 |
| `git diff --check` | exit 0 |

新增三項回歸涵蓋：慢速拖動與水平門檻；主頁換函／鍵盤返回／系統減少動態分支；垂直、往返、短拖與取消時不換函、不開卷。系統偏好的測試是模擬 matchMedia，並非真實 OS 設定驗收。

本輪新截圖／狀態在 `.claude/phase04l/`，不沿用 M4 證據：

- 桌機 1440×900、手機 375×812：三塊被指出的區域均不顯示，無橫向溢出；首頁主內容只剩文庫畫面。
- 桌機左右滑鼠拖動：南區 → 右京 → 南區；手機寬度：東山 → 下京 → 東山。短拖不換函、書卷仍關閉。
- 點蓋實際開卷：南區 45 筆；鍵盤左右換函／Enter 開卷：東山區 84 筆。日文、夜間與返回流程可用。
- 正式建置主入口及獨立頁收尾併入 [T4-M4b](2026-11-06-phase04-bunko-moonlight.md) 複驗，瀏覽器 console warn／error 為 0。
- `desktop-clean.png`、`desktop-night-ja.png`、`mobile-night-ja.png`、`mobile-reader-ja.png` 與 `browser-state.json`；最終來源與驗收以 T4-M4b 的 `.claude/phase04m/evidence.json` 為準。

**完成**：首頁精簡、直接拖動與上述驗收。**待使用者體驗**：新拖動手感及滿版文庫編排。**未測**：實機手指觸控、真實 OS reduced-motion、Safari／iOS、跨 GPU／FPS。不得以窄版滑鼠拖動當作實機觸控通過。

預覽仍是 3000 主站；3001 僅供本輪正式建置驗收，驗收完關閉。清水寺及其他十個地標幾何未動，資料、受保護檔案與依賴清單未改；保留工作區已有修改。
