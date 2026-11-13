# 2026-11-13 蒔繪浮雕盤 P3 收尾（暫停行為、八區驗收、意象手法、合併部署）

任務：蒔繪浮雕盤 P3／部分完成。十一區都已是盤並已部署；造形與情境驗收未完，清單見 `docs/MAKIE_PLATE_HANDOFF.md` §8.1。
請求模型／強度：主代理直接執行；八區實作派 Codex，請求 `gpt-6-astra`／high。實際設定：未確認（Codex 回報也寫未確認）。
工作區／base SHA：`C:\Git\Kyoto-Tactical-Guide`，`claude/great-brahmagupta-ye2uqt`／`c9e69e4`（P3 前半結束處）。
授權：使用者 2026-11-13 依序指示：（1）八區派 Astra 實作；（2）暫停時物件不浮起、光仍互動；（3）楓不像樹，改用切金銀在蓋面做落葉意象；（4）「都用類似手法精進物件意象，給蒔判斷要改就改」；（5）額度將盡，「這版本合回主線推上遠端，讓 git 部署，寫交接文件」。合併與 push 依第 5 點執行。

## 變更

| Commit | 內容 |
|---|---|
| `4e176a7` | 暫停／減少動態：所有部品躺平（不立、不浮、不搖），光與光跡仍跟著手 |
| `321664d` | 交接文件記下暫停的定義 |
| `001946d` | 移除「北區尚未是盤」的舊斷言（擋住派工） |
| `606efb9` | 其餘八區與 15 個新語彙（Codex 實作；回報在 `2026-11-13-makie-plate-p3b-astra.md`） |
| `1ef0d81` | 楓改成分叉樹幹加三瓣樹冠；新增 `fallenLeaves`（切金、切銀落葉） |
| `627a711` | 銀杏、櫻、橘改成同一種闊葉樹；新增 `fallenFans`、`petals`、`fruits`、`moon`、`pawPrints`；燈籠改矮胖並在腳下撒切金碎片；唐門加門扉；向月台加高 |
| 本筆 | 交接文件 |

## 派工經過（Codex）

- 第一次派出後，Codex 發現既有測試斷言北區不是盤，與任務衝突而提問。外掛把這一輪回報為「完成」，但執行緒實際繼續跑並完成了八區。
- 主代理誤以為它停了，移除斷言後重派一次；第二條執行緒偵測到另一個寫入者，沒有寫任何檔案就結束。多耗一輪額度，另有一則誤送的 `--help`。
- 教訓：`codex-companion.mjs task` 的結束訊號不可靠，要看 `~/.codex/sessions` 裡該執行緒的 `task_complete` 事件。
- Codex 在沙箱裡跑不動 `tsx`（`os.userInfo()` 失敗），自己另外補驗；主代理用原指令重跑，全部通過。

## 檢查（綁定 `627a711`）

| 檢查 | 結果 |
|---|---|
| `npm run lint` | exit 0 |
| `npx --no-install tsx validate_data.js --strict` | exit 0；ERROR 0、WARN 0 |
| `npm test` | exit 0；scripts 92/92、src/lib 6/6 |
| `npm run build` | exit 0 |

## 畫面驗收

截圖在不提交的 `.shots/p3c/`、`.shots/p3d/`（主代理拍）與 `.shots/p3b/`（Codex 拍，主代理未看）。

| 情境 | 結果 |
|---|---|
| 暫停：伏見 1440 月光，光停在兩個位置 | 已看。部品全躺平，高光跟著移動 |
| 八區 1440 月光全景（Codex 原版） | 已看。骨架各不相同，沒有穿插或懸空的鶯 |
| 楓改版：東山全景與近觀、山科全景 | 已看 |
| 意象改版：下京、伏見、西京、左京、中京、山科全景（月光）、上京全景（暖日）、山科近觀（暖日） | 已看 |
| 首頁 `/`：南區，桌機寬度一張 | 已看，正常，console 無錯誤 |
| 右京放大後的楓與落葉 | 有截圖，**未看** |
| 新十區的手機 375、其餘暖日與近觀、首頁三函同框與換函、開蓋、語系、鍵盤、暫停 | **未驗** |
| 真機、iOS Safari、手機幀率、沒有 WebGL2 的退回路徑 | **未驗** |

## 問題

- PLAUSIBLE：各區造形的不足，逐條列在 `MAKIE_PLATE_HANDOFF.md` §8.1 第 2 點。
- PLAUSIBLE：Codex 寫的八個區檔與 `vocab.js` 後半未逐行審。
- CONFIRMED：盤面斜視，立起的部品會擋住它後方（z 較小）的地子；平嵌意象要放在立體部品的前方或空地上，否則看不到。
- CONFIRMED：dev server 在工作階段中停過兩次（原因未查），截圖前要先確認 3000 埠有回應。

## 交接

- 已 fast-forward 併入 `main` 並 push（使用者授權）；部署由 `.github/workflows/deploy.yml` 在 push 後觸發，結果見 GitHub Actions。
- 剩餘工作：`MAKIE_PLATE_HANDOFF.md` §8.1。Codex 子代理未 commit／push。
