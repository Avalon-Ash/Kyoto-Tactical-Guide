# Phase 4 主線整合與交接

日期：2026-11-06。工作區 `C:/Git/Kyoto-Tactical-Guide`。使用者明確要求「交接文件有更新嗎？寫好合併推上 GIT」，並再次確認「最後要合回主線」。本輪具備提交、合併至 main 及推送 origin/main 的授權，取代此前各階段只實作不提交的限制。

主代理單獨處理；無派工，請求模型／強度不適用，實際設定未由工具確認。起始分支 `codex/phase4-data-audit`，HEAD `11c0947`；fetch 後本機／遠端 main 皆為 `12d3bfc`，沒有分歧。

## 交付內容

- 既有 Phase 4 提交 `a0a94f7`、`a1eeb99`、`86d852b`、`11c0947` 隨主線整合保留，不重做資料查核或跨市模型。
- `08478c3`：地標像素歸屬、柔和漆面光照與硬切區塊移除，保留舊地圖原型。
- `6d6a132`：十一區文庫幾何、清水寺接面修正、書卷、首頁整合、月光動態／直接換函、平面金銀圖紋及統一目錄／御秘帖。
- 文件交付包含各階段研究與驗收、HANDOFF／PLAN／派工計畫／README，以及歲時記年度活動製作計畫。年度活動資料庫尚未實作，未因移除按鈕而刪除舊行程存檔。

README 美術段落已區分目前文庫與歷史 2.5D 地圖；避免下一位將「其他十座尚未製作」「閒置不持續播放」誤認為最新主頁行為。

## 本輪檢查

| 指令 | 結果 |
|---|---|
| `npm run lint` | exit 0 |
| `npx --no-install tsx validate_data.js --strict` | exit 0，809 筆、ERROR 0、WARN 0 |
| `node --test --test-concurrency=1 scripts/makie-scene.test.mjs scripts/location-navigation.test.mjs scripts/toji-study.test.mjs scripts/toji-library.test.mjs scripts/bunko-integration.test.mjs` | exit 0，32/32 |
| `npm run build` | exit 0，主站與獨立展示入口 |
| `git diff --check` | exit 0 |

以 SHA-256 核對 `.claude/phase04n/evidence.json`：所有列出的程式／測試來源均未改變。幾何／shader 亦與先前證據一致。本輪僅補文件與執行 Git，不把歷史截圖宣稱為新拍；畫面結果及限制見 [T4-M4c](2026-11-06-phase04-bunko-index.md)。重跑日誌位於本機 `.claude/phase04-release/`、`.claude/release-tests.log`、`.claude/release-validate.log`。

## 主線交付與接手

使用 fast-forward 將工作分支完整整合到 main；只推送 origin/main，不 force push、不改寫歷史、不 reset／clean。交接版本為本文件所在的 main 提交；推送完成後以 `git rev-parse main` 與 `git ls-remote origin refs/heads/main` 比對，並確認工作目錄乾淨。

保留開發分支作追溯，不刪除遠端分支。`.claude/`、node_modules、dist、臨時驗收產物不提交，遠端接手者須自行重建畫面證據。新增歲時記活動資料、真實裝置驗收屬後續工作，不宣稱本輪已完成。

若發布後需要撤回，以 main 上新增 revert 提交處理，先依使用者對主線／遠端操作的授權範圍執行；不得用 reset 或 force push 抹除已發布歷史。
