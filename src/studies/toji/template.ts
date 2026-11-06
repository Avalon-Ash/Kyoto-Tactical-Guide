import { makieIcon } from '../../lib/makie-icons';
// Shared, trusted markup for the standalone study and the React home.
export const BUNKO_MARKUP = `<main>
    <header><a class="back" href="/">← <span data-i18n="back">京都御秘帖</span></a><div class="tools"><button id="language" type="button">日本語</button><button id="night" type="button" aria-pressed="false" data-i18n="night">月光</button></div></header>
    <div class="intro"><p class="eyebrow">KYOTO / ELEVEN BUNKO</p><h2 class="hero-title" data-i18n="title">一座京都，藏於文庫。</h2><p data-i18n="intro">一區一函，循卷尋訪京都。</p></div>
    <section class="exhibit" aria-label="東寺互動浮雕展示">
      <div class="exhibit-top"><div class="comparison" role="group" aria-label="深度對照"><button id="flat" type="button" aria-pressed="false" data-i18n="flat">平面對照</button><button id="relief" type="button" aria-pressed="true" data-i18n="relief">互動浮雕</button></div><span class="edition" data-i18n="edition">初音調度意象・局部習作</span></div>
      <nav id="cabinet-nav" class="cabinet-nav" tabindex="0" aria-label="左右選擇行政區文庫">
        <button id="previous-cabinet" type="button"><span aria-hidden="true">←</span><span id="previous-name"></span></button>
        <div class="cabinet-identity" aria-live="polite" aria-atomic="true"><small id="cabinet-number"></small><h2 id="cabinet-name"></h2><p id="cabinet-count"></p></div>
        <button id="next-cabinet" type="button"><span id="next-name"></span><span aria-hidden="true">→</span></button>
      </nav>
      <div class="stage" id="stage">
        <canvas id="scene" tabindex="0" role="button" aria-haspopup="dialog" aria-controls="library" aria-label="東寺文庫：點擊或 Enter 開盒展卷；方向鍵移光，空白鍵演示"></canvas>
        <div class="loading" id="loading" role="status" data-i18n="loading">正在鋪設金地…</div>
        <div class="seal" aria-hidden="true">京<br>洛</div>
        <div class="stage-caption"><small id="cabinet-context" aria-live="polite" aria-atomic="true"></small><span id="cabinet-place">東寺・九条</span><small id="cabinet-landmark"></small></div>
        <p id="cabinet-art-note" class="cabinet-art-note" hidden></p>
        <button id="open-book" class="open-book" type="button" aria-haspopup="dialog" aria-controls="library"><span data-i18n="openBook">開盒・展卷</span> ↗</button>
      </div>
      <div class="exhibit-bottom"><p id="status" role="status" data-i18n="ready">滑鼠／手指掠過，或按「演示一次」</p><div class="actions"><button id="demo" type="button" data-i18n="demo">演示一次 ↗</button><button id="motion" type="button" aria-pressed="false" data-i18n="motion">減少動態</button><button id="save" type="button">保存畫面</button></div></div>
    </section>
    <section class="materials" aria-label="材質比較"><div><p class="eyebrow" data-i18n="ground">地蒔 / GROUND</p><h2 data-i18n="materialTitle">同一片金地，三種表情。</h2></div><div class="material-options" role="group" aria-label="底地材質"><button type="button" data-material="1" aria-pressed="true"><i class="nashiji"></i><strong data-i18n="nashiji">梨地</strong><small data-i18n="nashijiDesc">細粒，透漆的深淺</small></button><button type="button" data-material="2" aria-pressed="false"><i class="dense"></i><strong data-i18n="dense">濃梨地</strong><small data-i18n="denseDesc">密蒔，更厚實的金色</small></button><button type="button" data-material="3" aria-pressed="false"><i class="gyobu"></i><strong data-i18n="gyobu">刑部梨地</strong><small data-i18n="gyobuDesc">箔底，大而不規則的片粒</small></button></div></section>
    <div class="notes"><p data-i18n="note">沿水岸看螺鈿變色，屋脊是切金、切銀意象。金粒附著漆面，軌跡是光的餘韻。</p><p data-i18n="scope">依初音調度意象創作的十一區文庫；各區地標為簡化浮雕幾何，非建築測繪模型。</p><a href="https://www.tokugawa-art-museum.jp/collections/初音蒔絵料紙箱/" target="_blank" rel="noopener noreferrer" data-i18n="source">參考：德川美術館・初音蒔繪料紙箱 ↗</a></div>
    <footer>KYOTO / THE MAKI-E COLLECTION <span>STUDY 01 — 2026.11</span></footer>
  </main>
  <dialog id="library" class="library" aria-labelledby="volume-title">
    <div class="scroll-roller scroll-roller-top" aria-hidden="true"><i></i><span></span><i></i></div>
    <div class="volume-paper">
      <header class="volume-heading"><div><p class="eyebrow" id="volume-index">KYOTO / MINAMI</p><h2 id="volume-title">南之卷</h2><p id="volume-subtitle"></p></div><div class="volume-tools"><button id="volume-language" type="button">日本語</button><button id="close-book" type="button">收卷合蓋</button></div></header>
      <div class="volume-controls">
      <form class="volume-filter" role="search">
        <label class="sr-only" for="volume-search" id="search-label">卷內尋訪</label>
        <div class="volume-search-wrap"><span class="hira-icon">${makieIcon('search')}</span><input id="volume-search" type="search" autocomplete="off" placeholder="景點、食處、關鍵字"></div>
        <button id="volume-map" type="button" hidden><span class="hira-icon">${makieIcon('map')}</span><span id="map-label">地圖</span></button>
        <button id="clear-search" type="button"><span class="hira-icon">${makieIcon('reset')}</span><span class="sr-only" id="clear-label">清除</span></button>
      </form>
      <span class="sr-only" id="type-label">類型</span><div id="volume-types" role="group" aria-labelledby="type-label"></div>
      <p id="volume-status" class="volume-status" role="status" aria-live="polite"></p>
      <button id="retry-volume" type="button" hidden>重新載入</button>
      </div>
      <div id="volume-body" class="volume-body" tabindex="0" role="region" aria-labelledby="volume-title">
      <div id="volume-results" class="volume-results"></div>
      <footer class="volume-footer"><span id="volume-note"></span><span id="volume-seal">南區</span></footer>
      </div>
    </div>
    <div class="scroll-roller scroll-roller-bottom" aria-hidden="true"><i></i><span></span><i></i></div>
  </dialog>`;
