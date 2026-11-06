# T4-M1 接續 — 移除區域切片回饋

日期：2026-11-05。工作區 `C:/Git/Kyoto-Tactical-Guide`、分支 `codex/phase4-data-audit`、HEAD `11c0947`，保留前輪未提交 diff。使用者看過東寺樣板後回饋差異不明顯，區域裁切堆疊礙眼；這不是美術核准，不擴展其他地標。

主代理單獨處理，未派工、未更動模型／推理設定（實際設定未經工具確認），未 commit／merge／push。

## 變更

- `makie-renderer.ts` 移除行政區 GPU mask、硬邊描線、整區金色平塗。CPU 仍依原 GeoJSON 判定區域；地標仍按 alpha ownership 選取。
- 選取採以滑鼠／地標為中心的連續柔和漆光，搭配地標本體亮度，沒有多邊形邊緣。GPU 少一張 1024² RGBA 材質（約 4 MiB 規格量），未做 GPU 實測。
- `index.css` 移除地名一般／選取狀態的矩形漸層底板與發光圓點；保留文字陰影、選取文字亮度與鍵盤 focus-visible 輪廓。底部說明區不是導航清單，十一區仍在圖上操作。
- 東寺素材未重製、未擴大其他地標，本輪針對使用者指出的視覺干擾修正，不宣稱已解決整體美術差距。

## 驗收

新證據目錄 `.claude/phase04d/`，不沿用 phase04c 截圖。

| 檢查 | 結果 |
|---|---|
| `npm run lint` | exit 0；`lint.log` |
| `npx --no-install tsx validate_data.js --strict` | exit 0；809／ERROR 0／WARN 0；`strict.log` |
| `node --test --test-concurrency=1 scripts/makie-scene.test.mjs scripts/location-navigation.test.mjs` | exit 0，11/11；`tests.log` |
| `npm run build` | exit 0；主 JS 498.92 kB，gzip 144.89 kB；`build.log` |
| 1440px 桌機 | innerWidth 1440／height 1200；東寺塔身滑鼠 hover 為 W_MINAMI，點擊進南區，文字背景 computed backgroundImage 為 none；`desktop-toji-hover.jpg` |

| 375×812 | innerWidth／scrollWidth 375；11 個入口皆至少 44×44，0 重疊；所有地標 backgroundImage 為 none；`mobile.json` |
| 中日文／日夜／手動靜止 | 日文、月光、靜止及東寺鍵盤聚焦、Enter 進南区已驗證；`mobile-ja-night-still.jpg` |

狀態：本次局部修正與可用環境驗收完成，美術待使用者確認，暫不擴展其他地標。前輪 OS reduced-motion、Safari／iOS、真實觸控、GPU context loss／素材失敗、FPS／Lighthouse 限制仍存在。桌機測試以實際 innerWidth 1440 為準；IAB 有 1.5 倍縮放，viewport 設定依比例補償，收尾恢復自然視窗。

使用者接著明確要求開啟修正版預覽、先不擴展其他地標。已準備恢復中文首頁供人工確認；未 commit／merge／push。檔案雜湊及本輪證據列在 `.claude/phase04d/evidence.json`。
