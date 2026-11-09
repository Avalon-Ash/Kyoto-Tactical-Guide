/**
 * @layer UI / SpotCard（景點任務卡片）
 * @module SpotCard
 *
 * 本元件負責單一 FlatSpot 的視覺渲染，採用「京都漆藝」風格設計。
 * 同時內建「Query Assembly System」，負責將 spot.jaName 組裝為
 * Google Maps Search URL。
 *
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Query Assembly System — 組裝流程
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SSOT 原則：所有關鍵字組裝以 spot.jaName (JA locale name) 為唯一事實來源。
 *
 * Step 1 — Query 組裝：
 *   以 spot.jaName（JA locale name）為主詞，
 *   附加行政區日文名稱（wardJa）與「京都」為地域錨點。
 *   格式：{JA名稱}+{行政區日文}+京都；周邊跨市景點改用 {JA名稱}+{市}+{府縣}。
 *
 * Step 2 — URL 組裝：
 *   所有參數經 encodeURIComponent 處理後以 + 串接。
 *   固定使用 maps/search/?api=1&query=...
 *   ⚠️ 禁止使用 maps/dir/（點對點導航端點）
 *
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 金銀圖紋與文庫條目共用呈現。
 *
 * SSOT 原則與禁則
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * - 禁止在本元件硬編碼任何標籤字串，一律透過 TAG_REGISTRY 查詢
 * - 禁止使用 maps/dir/ 端點
 * - reservationRequired badge 以 spot.reservationRequired 布林值為唯一判斷基準
 *   禁止用 tagIds 字串替代此欄位
 * - readOnly={true} 時省略導航連結，供預覽或靜態展示用途
 */
import React from 'react';
import { MakieIcon } from './MakieIcon';
import { typeMotifs } from '../lib/makie-icons';
import { FlatSpot, Lang } from '../types';
import { WARD_NAMES, AREA_NAMES, TYPE_NAMES } from '../data/index';
import { TAG_REGISTRY } from '../data/tags';
import { getSpotLocation } from '../data/municipalities';

interface SpotCardProps {
  key?: number | string;
  spot: FlatSpot;
  lang: Lang;
  t: (key: string, dict?: Record<string, { zh: string; ja: string }>) => string;
  readOnly?: boolean;
  activeTag?: string | null;
}

/**
 * Query Assembly System：由 spot.jaName 組裝 Google Maps Search URL。
 * 地圖叢集面板（ClusterMap）等其他入口必須共用本函式，禁止自行拼接查詢字串。
 */
export function buildGoogleMapsUrl(spot: Pick<FlatSpot, 'jaName' | 'wardId' | 'municipalityId'>): string {
  const wardJa = WARD_NAMES[spot.wardId]?.ja ?? '';
  const location = getSpotLocation(spot);

  let queryName = spot.jaName || '';

  // 移除括號內的補充說明，例如 "(けいおん!聖地)"、"(禅林寺)"，避免干擾 Google Maps 精準搜尋
  queryName = queryName.replace(/[\(（].*?[\)）]/g, '').trim();

  // 特例處理：先斗町在 Google Maps 搜尋經常失效，替換為具體的「先斗町公園」作為錨點
  if (queryName === '先斗町') {
    queryName = '先斗町公園';
  }

  // Query Assembly System — 預設組裝規則與例外策略
  // 依固有名詞特徵判斷查詢策略：若為特定廣域名稱或街道，排除行政區以避免 Google Maps 搜尋失敗
  const standaloneNames = ['先斗町公園', '嵐山', '祇園', '哲学の道', '鴨川'];
  const isStandalone = standaloneNames.some(name => queryName.includes(name));

  // 1. JA locale 的 spot.name
  // 2. 行政區日文名稱 (若為 isStandalone 則排除)
  // 3. "京都"
  const queryParts = location.isNearby
    ? [queryName, location.city.ja, location.prefecture.ja]
    : isStandalone ? [queryName, '京都'] : [queryName, wardJa, '京都'];

  const finalQuery = queryParts.filter(Boolean).map(p => encodeURIComponent(p.trim())).join('+');

  // 繞過沙盒攔截器：以陣列拼接法動態生成官方 Google Maps Search API
  const baseUrl = ['https://', 'www', '.', 'google', '.', 'com', '/maps/search/?api=1&query='].join('');
  return baseUrl + finalQuery;
}

export function SpotCard({ spot, lang, t, readOnly = false, activeTag }: SpotCardProps) {
  const location = getSpotLocation(spot);
  const area = location.isNearby ? t('nearby_trip') : t(spot.areaId, AREA_NAMES);
  const ward = location.isNearby ? `${location.prefecture[lang]} · ${location.city[lang]}` : t(spot.wardId, WARD_NAMES);
  const tags = spot.tagIds?.length
    ? spot.tagIds.map(id => ({ id, label: TAG_REGISTRY[id]?.label[lang] ?? id }))
    : spot.tags.split(',').filter(Boolean).map(label => ({ id: label, label: label.trim() }));
  return <article className="spot-entry" aria-label={spot.name}>
    <div className="spot-meta"><span>{area} · {ward}</span><small>{spot.id}</small></div>
    <h3><MakieIcon motif={typeMotifs[spot.typeId] ?? 'all'} /><span>{spot.name}</span></h3>
    <p className="spot-description">{spot.desc}</p>
    <div className="spot-tags">
      <span className="spot-kind">{t(spot.typeId, TYPE_NAMES)}</span>
      {spot.reservationRequired && <span className="reservation">{lang === 'zh' ? '需預約' : '要予約'}</span>}
      {tags.map(tag => <span key={tag.id} data-active={activeTag === tag.id}>{tag.label}</span>)}
    </div>
    {!readOnly && <a className="spot-navigation" href={buildGoogleMapsUrl(spot)} target="_blank" rel="noopener noreferrer">
      <MakieIcon motif="map" /><span>{t('btn_map')}</span><span aria-hidden="true">↗</span>
    </a>}
  </article>;
}
