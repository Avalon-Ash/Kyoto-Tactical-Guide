# 2026-11-13 蒔繪浮雕盤 P3 晚間（造形修整、Codex 驗收後的修正、第二次合併部署）

任務：蒔繪浮雕盤 P3／完成並部署。剩餘工作改列為 `docs/MAKIE_PLATE_HANDOFF.md` §8 的 W1–W5。
請求模型／強度：主代理直接執行造形與修正；驗收與程式審閱派 Codex，請求 `gpt-6-astra`／high，實際設定未確認。
工作區／base SHA：`C:GitKyoto-Tactical-Guide`，`claude/great-brahmagupta-ye2uqt`／`5ec606c`（第一次合併部署處）。
授權：使用者 2026-11-13 傍晚：「形意方向對，蒔把控的好就繼續；靜妳都派給 Astra 作吧，最後一起審」；之後分別回覆「合回 main」「push 部署」；最後要求更新落後文件並寫給下一位（Opus）的詳細交接。

## 變更

| Commit | 內容 |
|---|---|
| `0039114` | 伏見：鳥居列腳下的切銀參道石、狐的尾巴改低捲；燈籠窗改切金；下京銀杏落葉加密；右京池中岩壓低 |
| `4ce4713` | 西京月見台改成平嵌在蓋面的竹簀；上京南面兩段回廊與門合成一道牆 |
| `554bf25` | 依 Codex 程式審閱：南區與伏見最外側的松往內移（葉墊原本超出盤面 13–14 單位）、伏見的狐左移；暫停的中日文狀態文字改成與行為相符；唐門註解 |
| `0a7929f` | 依 Codex 畫面驗收：閱讀頁按 Esc 回到文箱（`DetailView.tsx`）；文箱焦點框畫在舞台內側（`bunko.css`） |
| `925f2a1` | 交接文件（當晚版） |
| 本筆 | 交接文件重寫（給下一位主代理的分包計畫）、`scripts/plate-shot.mjs`、入口文件與 README 的落後處 |

## Codex 派工

| 輪次 | 結果 |
|---|---|
| 驗收第一輪 | 沙箱裡 Chrome 的 GPU 行程崩潰、自開的 dev server 因 Vite 監看 Chrome 設定檔而結束；畫面 0 張。完成程式審閱（R01–R05） |
| 驗收第二輪 | 改連主代理在沙箱外開好的 Chrome（9377）與 dev server（3000）；193 張截圖逐張看過；查到 V01（Esc）、V02（焦點框） |
| 另有一次 | 主代理把 `curl && 派工` 串在一起，server 當時已停，指令沒送出（未耗額度） |

完整報告：[2026-11-13-makie-plate-verify-astra.md](2026-11-13-makie-plate-verify-astra.md)。

## 檢查

| 檢查 | 綁定 | 結果 |
|---|---|---|
| lint、validate `--strict`、test、build | `554bf25` | 全部 exit 0；ERROR 0、WARN 0；scripts 92/92、src/lib 6/6 |
| lint、test、build | `0a7929f` | exit 0；scripts 92/92、src/lib 6/6。validate 未重跑 |
| lint、validate `--strict`、test、build | 本筆（原始碼同 `0a7929f`） | 全部 exit 0；ERROR 0、WARN 0；scripts 92/92、src/lib 6/6 |
| `node --check scripts/plate-shot.mjs` | 本筆 | 通過；腳本內容與當晚實際使用的版本相同，只改了檔頭註解 |

## 畫面驗收

| 情境 | 結果 |
|---|---|
| 主代理：伏見、上京、西京、下京、右京、山科修整後的 1440 全景各一張；移松後的伏見與南區各一張 | 已看 |
| 主代理：首頁 Enter 進閱讀頁、Esc 返回（CDP 實際按鍵，1440） | 已驗：返回同一區，焦點回 `#scene` |
| 主代理：焦點框 | 只確認 `outline-offset` 計算值為 −6px，**未截圖** |
| Codex：十一區各情境 | 見其報告總表；通過項與未驗項照錄於 `MAKIE_PLATE_HANDOFF.md` §7 |
| 線上版、真機、iOS、無 WebGL2 退回 | **未驗** |

## 問題

- PLAUSIBLE：蒔仍不滿意的造形（左京與西京意象重複、樹冠與松相近、狐像狗、切金小葉的方格紋等），列在交接 §8.2。
- CONFIRMED：語彙在不合理輸入下產生 NaN／零面積（十一區不觸發），列在交接 §8.3。
- CONFIRMED：`codex-companion.mjs task` 的完成訊號不可靠；Codex 沙箱開不了 GPU Chrome、跑不動 `tsx`。
- CONFIRMED：無頭 Chrome 設定檔放在 Vite 監看範圍內會讓 dev server 結束。

## 交接

- `main` 與工作分支已 push 到 `925f2a1` 並部署成功；本筆文件 commit 在工作分支上，是否合併與 push 待使用者決定。
- 剩餘工作：`MAKIE_PLATE_HANDOFF.md` §8。Codex 未 commit／push。
