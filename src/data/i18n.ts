import { I18nText, Lang } from '../types';

/** Every interface string lives here; components never write their own zh/ja ternaries. */
export const UI_DICT: Record<string, I18nText> = {
  app_title: { zh: "京都 雅遊 手帖", ja: "京都 雅遊 手帖" },
  db_info: { zh: "京洛紀勝：共收錄 {n} 處｜十九區｜十一行政區", ja: "京洛紀勝：計 {n} 件｜十九区｜十一行政区" },
  mode_label: { zh: "首頁分頁", ja: "表示の切り替え" },
  mode_bunko: { zh: "京洛文庫", ja: "京洛文庫" },
  mode_area: { zh: "名所目録", ja: "名所目録" },
  mode_tag: { zh: "御秘帖", ja: "御秘帖" },
  caption_area: { zh: "循地名，尋洛中洛外", ja: "地名をたどり、洛中洛外へ" },
  caption_tag: { zh: "以風物尋訪京都", ja: "風物から京都を探す" },
  btn_back: { zh: "歸、", ja: "帰る" },
  btn_close: { zh: "收卷・歸", ja: "巻を閉じる" },
  btn_map: { zh: "展輿圖（Google Maps）", ja: "輿図を開く（Google Maps）" },
  btn_back_map: { zh: "返回地圖", ja: "地図に戻る" },
  unit_spot: { zh: "處", ja: "件" },
  loading: { zh: "展卷中，稍候片刻…", ja: "巻物を広げています…" },
  empty_msg: { zh: "此間無跡，換一條路試試", ja: "この道には跡なし、別の径を" },
  no_results: { zh: "此間無跡", ja: "跡なし" },
  type_filter: { zh: "景點類型", ja: "名所の種類" },
  tag_filter: { zh: "細分類", ja: "絞り込み" },
  filter_all: { zh: "全部", ja: "すべて" },
  view_mode: { zh: "呈現方式", ja: "表示方法" },
  view_list: { zh: "景點列表", ja: "名所一覧" },
  view_map: { zh: "探索地圖", ja: "地図を見る" },
  volume_note: { zh: "出發前請確認營業與預約資訊。", ja: "訪問前に営業・予約情報をご確認ください。" },
  reservation: { zh: "需預約", ja: "要予約" },
  nearby_trip: { zh: '京都周邊', ja: '京都からの小旅行' },
  nearby_map_note: { zh: '含京都周邊景點，依實際所在地標示', ja: '京都周辺のスポットを実際の所在地に表示' },
  map_zoom_in: { zh: "放大地圖", ja: "地図を拡大" },
  map_zoom_out: { zh: "縮小地圖", ja: "地図を縮小" },
  map_fit: { zh: "顯示全區", ja: "全域を表示" },
  theme_to_day: { zh: "切換暖日", ja: "陽光に切り替え" },
  theme_to_night: { zh: "切換月光", ja: "月光に切り替え" },
  motion_reduce: { zh: "減少動態", ja: "動きを抑える" },
  lang_switch: { zh: "日本語", ja: "繁中" },
  bunko_loading: { zh: "正在鋪設金地…", ja: "金地を準備しています…" },
  bunko_failed: { zh: "無法啟用 WebGL。請使用支援硬體加速的瀏覽器。", ja: "WebGL を使用できません。ハードウェアアクセラレーション対応のブラウザーでご覧ください。" },
  bunko_zoom_reset: { zh: "回到全景", ja: "全体に戻す" },
  bunko_canvas_home: { zh: "{name}文庫：撫過盒面移光，左右拖動或方向鍵換函；點蓋或 Enter 展卷；雙指或 +／− 放大", ja: "{name}の文庫：漆面をなぞると光が移る。左右のドラッグ・矢印キーで函を選択。蓋を押すか Enter で巻を開く。二本指か +／− で拡大" },
  bunko_canvas_study: { zh: "{name}文庫：點擊或 Enter 開盒；方向鍵移光，空白鍵演示；雙指或 +／− 放大", ja: "{name}の文庫：クリック・Enter で蓋を開く。矢印キーで光を移動、スペースキーで実演。二本指か +／− で拡大" },
  lang_switch_label: { zh: "切換日文", ja: "繁体字中国語に切り替え" },
};

/** Pure lookup shared by the engine's `t` and components that only receive `lang`. */
export function translate(key: string, lang: Lang, dict: Record<string, Partial<I18nText>> = UI_DICT): string {
  const entry = dict[key];
  if (!entry) return key;
  return entry[lang] ?? entry.zh ?? Object.values(entry)[0] ?? key;
}
