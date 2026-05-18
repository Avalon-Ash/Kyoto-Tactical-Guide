/**
 * @layer SSOT / Global Type System（全域型別層）
 * @module types
 *
 * 本檔是整個應用的型別核心，定義所有跨層共用的 TypeScript 型別與介面。
 * 所有 System 層（spots-loader、useKyotoEngine）與 UI 層（components）
 * 的資料型別均從此處統一引用，禁止在其他模組重複定義相同結構。
 *
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 封閉操作宣告（AI 代理人必讀）
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 本檔屬於「封閉操作」範圍，代理人禁止自行新增、刪除或修改任何型別定義。
 * 所有型別異動均需 Ash 人工審查後方可執行。
 * 違反此規則的型別擴充會導致 spots-loader、validate_data、
 * useKyotoEngine 等多個下游系統靜默失效。
 *
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SpotSchema — 結構層的唯一實體定義
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SpotSchema 僅允許以下欄位（Zero-Trust 原則）：
 *   id, wardId, areaId, typeId, tagIds?, reservationRequired?
 *
 * 絕對禁止在此介面新增任何語意文字、URL 或渲染相關屬性，
 * 包含已廢除的 mapQuery、name、desc 等欄位。
 * 違反者會破壞「結構與內容分離」的 SSOT 基礎。
 *
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * FlatSpot — UI 消耗層，由 spots-loader 裝配產生
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * FlatSpot 是 SpotSchema + SpotLocale 的合併結果，
 * 僅由 spots-loader.ts 的 loadSpotsByWard() 生產，
 * 禁止在 UI 元件層直接組裝或修改此物件。
 *
 * jaName 欄位用途：
 *   - 唯一地理錨點，供 Query Assembly System（SpotCard.tsx）
 *     組裝 Google Maps Search API URL 使用。
 *   - 值永遠來自 JA locale 的 name，禁止寫入 UI 排版用後綴或括號說明。
 *   - 絕對禁止將 jaName 作為畫面顯示文字使用。
 *
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 連鎖影響聲明
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 修改本檔任一型別，必須同步確認以下所有檔案不受影響：
 *   - src/data/spots-loader.ts    （裝配邏輯）
 *   - src/data/spots/*.ts         （schema 資料檔）
 *   - src/hooks/useKyotoEngine.ts （篩選邏輯）
 *   - src/components/SpotCard.tsx （Query Assembly）
 *   - validate_data.js             （驗證腳本）
 */
export type Lang = 'zh' | 'ja';

/** 景點與元數據 ID 的合法字元規範：僅限大寫字母、數字、底線及連字號 */
export const RE_ID_SLUG = /^[A-Z0-9_\-]+$/;

export type I18nText = Record<Lang, string>;

export type WardKey = 
  | 'W_KITA' | 'W_KAMIGYO' | 'W_SAKYO' | 'W_NAKAGYO' | 'W_HIGASHIYAMA' 
  | 'W_SHIMOGYO' | 'W_MINAMI' | 'W_UKYO' | 'W_NISHIKYO' | 'W_YAMASHINA' | 'W_FUSHIMI';

// 語系無關的 spot schema
export interface SpotSchema {
  id: string;
  wardId: string;
  areaId: string;
  typeId: string;
  tagIds?: string[]; // 新增：machine-readable 標籤陣列
  reservationRequired?: true;
  mapsPlaceId?: string; // Google Maps Place ID（ChIJ...）。設定時 place_id クエリ優先。
}

// 單一語系的文字包
export interface SpotLocale {
  name: string;
  desc: string;
  /** 
   * tags 欄位用途：
   * - ZH locale: 須與 schema.tagIds 鏡射（中文 key），同時作為顯示文字與篩選基準。
   * - JA locale: 使用日文標籤供顯示用途（如 '映え', '穴場'），不參與篩選邏輯。
   */
  tags: string;
}

// 最終合併後（給 UI 用）
export interface FlatSpot extends SpotSchema {
  name: string;
  desc: string;
  tags: string;
  /** 僅供地圖外部連結使用的日文名稱，非 ja 語系時由 Assembler 注入 */
  jaName?: string;
}
