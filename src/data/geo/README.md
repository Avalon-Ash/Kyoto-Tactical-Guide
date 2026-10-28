# 京都行政區靜態邊界

`ward-boundaries.ts` 與 `ward-boundaries.sources.json` 包含從 OpenStreetMap 抽取的京都市 11 區邊界與來源紀錄。資料採 **[Open Database License (ODbL) 1.0](https://opendatacommons.org/licenses/odbl/1-0/)**，© [OpenStreetMap contributors](https://www.openstreetmap.org/copyright)。此資料授權聲明不變更應用程式碼的授權。

查核日期：2026-10-28（Asia/Taipei）；個別抓取時間為 sources JSON 中的 UTC `fetchedAt`。地圖保留可見的 OSM 署名與版權連結；未來首頁使用這份資料時也須保留署名。

## 重建與服務政策

從專案根目錄執行 `node scripts/fetch-ward-geo.mjs`。這是已知 11 個區名的一次性開發查找工具，不是通用搜尋服務，不可放入網站執行期、CI 或定期排程。

必須遵守 [Nominatim 使用政策](https://operations.osmfoundation.org/policies/nominatim/)：單機單執行緒、每次請求起點至少間隔 1.1 秒、以含專案網址的 User-Agent 識別、持久快取、錯誤立即停止且不自動重試。小型一次性批次可能允許，服務方仍可撤回存取；不可用它列舉大型資料集或繞過封鎖。

回應保存在不提交的 `.claude/ward-geo-cache/`。再次執行優先讀快取；`node scripts/fetch-ward-geo.mjs --offline` 在任一快取缺漏時直接失敗，不送出請求。快取中的 query 與目前參數不同時停止，不自動清除重抓。更新資料須由維護者檢查當時服務政策與必要性後另行安排。程序以快取目錄中的 `build.lock` 防止同時執行；意外中止後先確認該程序已結束，才處理殘留鎖檔。

## 資料契約與轉換

- Ward 清單讀自既有 `wards.ts`；不複製另一份名單。
- Nominatim jsonv2 回應須唯一匹配 relation／boundary／administrative、admin_level=8、完整日文區名、日本、京都府、京都市；11 區 relation ID 不重複。
- 檢查所有頂點座標、閉環、至少三個不同頂點、非零面積、自交、洞包含關係與環交叉、MultiPolygon 分量重疊及外框。相接分量也保守拒收，交人工審查，不靜默修復。
- 座標是 GeoJSON 的 `[lng, lat]`。廣域京都範圍只用於拒收明顯錯誤，不當作精確市界。
- 使用 Nominatim `polygon_threshold=0.0005` 的簡化結果，保留所有 polygon／hole；不再四捨五入或裁掉北部山區。產物約 37 KiB，低於 150 KiB 上限。若超限，應從快取離線簡化、重做幾何驗證，不為調整參數重複查詢。
- 所有行政區驗證完才產生正式檔案；兩份檔案先暫存，再發布，寫入／替換失敗會回復舊配對。這不是跨檔案斷電交易；若回復也失敗，保留 `.tmp`／`.rollback` 並阻止下次覆寫，維護者須先檢查與恢復配對。來源紀錄列出查詢、抓取日期、OSM relation ID、行政層級、地址、外框及點數。

執行 `node --test scripts/fetch-ward-geo.test.mjs` 驗證拒收案例；`node scripts/fetch-ward-geo.mjs --offline` 驗證實際 11 區回應並重建。資料是 OSM 當時邊界，不宣稱為政府測繪或法律界址。

參考：[Nominatim Search](https://nominatim.org/release-docs/latest/api/Search/)、[輸出格式](https://nominatim.org/release-docs/latest/api/Output/)、[日本行政層級慣例](https://wiki.openstreetmap.org/wiki/Japan_tagging)、[京都市 11 區](https://www.city.kyoto.lg.jp/sogo/page/0000015607.html)。
