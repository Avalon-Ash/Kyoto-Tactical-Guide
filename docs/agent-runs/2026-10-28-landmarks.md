# T1.3 地標座標查核

查核日期：2026-10-28。Rawls（請求 gpt-6.1-sol / medium）查來源，主代理整合。
以下數值取自來源明列座標或內嵌地圖，不沿用 PLAN 的未查證候選值；位數不等於測量精度。
座標是地圖地標的可識別錨點，非步行導航入口保證。Google Maps 導航仍使用既有名稱組裝。

| ID | lat | lng | 錨點與已開啟來源 |
|---|---|---|---|
| KT-006 | 35.044258 | 135.744919 | 大徳寺；[CODH](https://geoshape.ex.nii.ac.jp/nrct-poi/resource/27/270000167100.html) |
| KG-003 | 35.033409 | 135.760574 | 相國寺；[CODH](https://geoshape.ex.nii.ac.jp/nrct-poi/resource/27/270000204100.html) |
| KG-029 | 35.031864 | 135.739865 | 大報恩寺本堂；[京都大學](https://www.rish.kyoto-u.ac.jp/logos/wp-content/themes/Xylarium/kz00110/) |
| SK-005 | 35.014173 | 135.7954022 | 永観堂／禅林寺；[MapFan](https://mapfan.com/spots/SCC4I,J,SW) |
| SK-080 | 35.235772 | 135.793888 | 峰定寺；[京都市觀光 Navi](https://ja.kyoto.travel/tourism/single01.php?category_id=7&tourism_id=411) 的地圖 q 參數；[CODH](https://geoshape.ex.nii.ac.jp/nrct-poi/resource/27/270000015400.html) 另列接近的 35.235740,135.793911 |
| NK-004 | 35.01263 | 135.7503 | 二条城二の丸御殿唐門；[奈良文化財研究所](https://heritagemap.nabunken.go.jp/statistic/98022874-%E4%BA%8C%E6%9D%A1%E5%9F%8E.html)。不是城域中心。原 key NK-006 實為先斗町，已更正 |
| NK-018 | 35.0131667 | 135.7495 | 二の丸庭園指定石碑；[京都市石碑資料 NA133](https://www2.city.kyoto.lg.jp/somu/rekishi/fm/ishibumi/html/na133.html)，N35°00′47.4″／E135°44′58.2″ 換算；不是庭園中心 |
| HY-006 | 35.0010773 | 135.7739072 | 建仁寺；[MapFan](https://mapfan.com/spots/SC3WC,J,ES)，[CODH](https://geoshape.ex.nii.ac.jp/nrct-poi/resource/27/270000069700.html) 地址小松町584佐證身分 |
| UK-004 | 35.028292 | 135.6779631 | 大覚寺；[MapFan](https://mapfan.com/spots/SC3WC,J,GS) |
| UK-082 | 35.200915 | 135.685366 | 常照皇寺；[京都府觀光連盟](https://www.kyoto-kankou.or.jp/info_search/487) 的地圖 q／destination 參數，主代理另讀 HTML 確認 |
| YS-005 | 34.961773 | 135.8075725 | 勧修寺；[京都市觀光 Navi](https://ja.kyoto.travel/tourism/single01.php?category_id=7&tourism_id=251) 地圖 q 參數 |
| SK-038 | 35.070463 | 135.841128 | 延暦寺；[京都市觀光 Navi](https://ja.kyoto.travel/tourism/single01.php?category_id=7&tourism_id=680) 地圖 q 參數 |
| UK-024 | 35.060564 | 135.678454 | 高山寺；[京都府觀光連盟](https://www.kyoto-kankou.or.jp/info_search/3466) 地圖 destination 參數 |
| YS-006 | 34.959499 | 135.816287 | 隨心院；[京都市觀光 Navi](https://ja.kyoto.travel/tourism/single01.php?category_id=7&tourism_id=381) 地圖 q 參數；[府觀光連盟](https://www.kyoto-kankou.or.jp/info_search/203) 的另一錨點相距約31公尺 |

補查已確認 NK-018 的官方所在地明載「二条城二の丸庭園内」。14 筆皆有直接來源，沒有用百科或未核實候選值補洞。

## 本輪範圍外的資料風險

- SK-080：京都市官方將峰定寺本堂列為重要文化財，既有 JA 描述「本堂（国宝）」有明確衝突；國寶標籤亦需覆核。
- UK-082：府觀光連盟提及重要文化財與天然紀念物，本輪未取得國寶標籤的依據。
- YS-005：官方提及國寶刺繍釈迦如来説法図現藏奈良國立博物館，不能直接推定現地展示國寶。
- YS-006：寺院[文化財頁](https://www.zuishinin.or.jp/zsi-cultural_assets/)主要列重要文化財，本輪未取得國寶標籤依據。
- SK-038：延暦寺根本中堂實在滋賀縣大津市，[文化廳](https://kunishitei.bunka.go.jp/bsys/maindetails/102/1320)佐證；現有 W_SAKYO 為京都旅遊索引歸類，不能當作真實行政區。修復需要處理跨市資料模型，未擅改受保護區域定義。

新增準確地標不表示已確認以上既有標籤與描述。這些問題獨立保留在交接清單，不能用驗證器綠燈宣稱已完成旅遊內容事實稽核。
