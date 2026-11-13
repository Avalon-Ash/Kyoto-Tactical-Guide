// The standalone study page: craft controls around the same cabinet the home uses.
// Nothing here is loaded by the React app. Its strings stay with the page instead of the app's i18n.ts.
import {BUNKO_STAGE} from './template';
import {mountBunko} from './study.js';
import {swipeDirection} from './interaction.js';
import {CABINETS,adjacentCabinet,volumeTitle} from './collection';

const words={
  zh:{back:'京都御秘帖',language:'日本語',night:'月光',day:'暖日',save:'保存畫面',title:'一座京都，藏於文庫。',intro:'一區一函，一函一景。左右換盒，點蓋開盒；掠過山水建築，端詳金銀浮雕的光影。',flat:'平面對照',relief:'互動浮雕',edition:'初音調度意象・局部習作',ready:'掠過盒面移光；左右換函，點蓋開盒。',playing:'正在演示：隆起 → 左右視差 → 金粉軌跡',flatStatus:'平面對照：相同構圖與材質，深度壓平',still:'減少動態：部品平伏不立起，光仍隨指尖',switching:'正在換函…',opening:'提蓋，展開{volume}…',closing:'收卷合蓋…',reading:'{volume}已展開；再按一次合蓋。',failed:'無法啟用 WebGL。請使用支援硬體加速的瀏覽器開啟此展示頁。',demo:'演示一次 ↗',motion:'減少動態',openBook:'開盒・展卷',ground:'地蒔 / GROUND',materialTitle:'同一片金地，三種表情。',nashiji:'梨地',nashijiDesc:'細粒，透漆的深淺',dense:'濃梨地',denseDesc:'密蒔，更厚實的金色',gyobu:'刑部梨地',gyobuDesc:'箔底，大而不規則的片粒',note:'沿水岸看螺鈿變色，屋脊是切金、切銀意象。金粒附著漆面，軌跡是光的餘韻。',scope:'十一行政區各有一函。各函以代表地標與庭園構成簡化浮雕，並非建築測繪或歷史復原；依初音調度意象創作。景點書卷請從首頁進入。',source:'參考：德川美術館・初音蒔繪料紙箱 ↗',cabinet:'之函',count:'藏 {n} 處',previous:'上一函',next:'下一函',nav:'文庫選區；左右方向鍵或在此橫滑換函',exhibit:'京都十一區文庫',pageTitle:'{name}文庫｜京都御秘帖'},
  ja:{back:'京都御秘帖',language:'繁體中文',night:'月光',day:'陽光',save:'画像を保存',title:'京都を、ひとつの文庫に。',intro:'一区に一函、一函にひとつの景色。左右で函を選び、蓋を開く。山水と建築をなぞり、金銀の光と影を愉しむ。',flat:'平面と比較',relief:'浮彫を動かす',edition:'初音の調度に着想・部分習作',ready:'漆面で光を移し、左右で函を選ぶ。蓋を押すと開きます。',playing:'実演中：浮き上がり → 視差 → 光の余韻',flatStatus:'平面：構図と素材を保ち、奥行きを圧縮',still:'動きを抑制：部品は伏せたまま、光は指に従う',switching:'函を替えています…',opening:'蓋を上げ、{volume}を開いています…',closing:'巻を収めています…',reading:'{volume}を開きました。もう一度押すと蓋を閉じます。',failed:'WebGL を使用できません。ハードウェアアクセラレーション対応のブラウザーでご覧ください。',demo:'動きを見る ↗',motion:'動きを抑える',openBook:'蓋を開く',ground:'地蒔 / GROUND',materialTitle:'同じ金地、三つの表情。',nashiji:'梨地',nashijiDesc:'細かな粉、透漆の奥行き',dense:'濃梨地',denseDesc:'密に蒔かれた金の厚み',gyobu:'刑部梨地',gyobuDesc:'箔地と大きな不定形の粉',note:'水辺には螺鈿の色移り、屋根には切金・切銀の意匠。粉は漆面に留まり、光だけが余韻を残します。',scope:'十一の行政区ごとに一函。各函は名所と庭園を組み合わせた簡略化した浮彫で、実測模型・歴史的復元ではありません。初音の調度に着想を得ています。名所の巻はホームからご覧ください。',source:'参考：徳川美術館・初音蒔絵料紙箱 ↗',cabinet:'の函',count:'{n} 件を収蔵',previous:'前の函',next:'次の函',nav:'文庫の選択。左右キー・この欄の横スワイプで函を替える',exhibit:'京都十一区の文庫',pageTitle:'{name}の文庫｜京都御秘帖'},
};

const STUDY_MARKUP=`<main>
    <header><a class="back" href="../">← <span data-i18n="back"></span></a><div class="tools"><button id="language" type="button" data-i18n="language"></button><button id="night" type="button"></button></div></header>
    <div class="intro"><p class="eyebrow">KYOTO / ELEVEN BUNKO</p><h2 class="hero-title" data-i18n="title"></h2><p data-i18n="intro"></p></div>
    <section class="exhibit">
      <div class="exhibit-top"><div class="comparison" role="group"><button id="flat" type="button" data-i18n="flat"></button><button id="relief" type="button" data-i18n="relief"></button></div><span class="edition" data-i18n="edition"></span></div>
      <nav id="cabinet-nav" class="cabinet-nav" tabindex="0">
        <button id="previous-cabinet" type="button"><span aria-hidden="true">←</span><span id="previous-name"></span></button>
        <div class="cabinet-identity" aria-live="polite" aria-atomic="true"><small id="cabinet-number"></small><h2 id="cabinet-name"></h2><p id="cabinet-count"></p></div>
        <button id="next-cabinet" type="button"><span id="next-name"></span><span aria-hidden="true">→</span></button>
      </nav>
      ${BUNKO_STAGE}
      <div class="exhibit-bottom"><p id="status" role="status"></p><div class="actions"><button id="demo" type="button" data-i18n="demo"></button><button id="motion" type="button" data-i18n="motion"></button><button id="save" type="button" data-i18n="save"></button></div></div>
    </section>
    <section class="materials"><div><p class="eyebrow" data-i18n="ground"></p><h2 data-i18n="materialTitle"></h2></div><div class="material-options" role="group"><button type="button" data-material="1"><i class="nashiji"></i><strong data-i18n="nashiji"></strong><small data-i18n="nashijiDesc"></small></button><button type="button" data-material="2"><i class="dense"></i><strong data-i18n="dense"></strong><small data-i18n="denseDesc"></small></button><button type="button" data-material="3"><i class="gyobu"></i><strong data-i18n="gyobu"></strong><small data-i18n="gyobuDesc"></small></button></div></section>
    <div class="notes"><p data-i18n="note"></p><p data-i18n="scope"></p><a href="https://www.tokugawa-art-museum.jp/collections/初音蒔絵料紙箱/" target="_blank" rel="noopener noreferrer" data-i18n="source"></a></div>
    <footer>KYOTO / THE MAKI-E COLLECTION <span>STUDY 01 — 2026.11</span></footer>
  </main>`;

/** @param {HTMLElement} root */
export function mountStudy(root){
  root.innerHTML=STUDY_MARKUP;
  const $=id=>/** @type {HTMLElement} */(root.querySelector(`[id="${id}"]`));
  const openButton=document.createElement('button');
  openButton.id='open-book';openButton.className='open-book';openButton.type='button';
  $('stage').append(openButton);
  const events=new AbortController(),listen=(target,type,handler,capture=false)=>target.addEventListener(type,handler,{capture,signal:events.signal});
  let railGesture=null,suppressRailClickUntil=0;
  /** @type {ReturnType<typeof mountBunko>} */
  let controller;

  /** @param {import('./study.js').BunkoState} state */
  function render(state){
    const t=words[state.language],{cabinet,bookState}=state,name=cabinet.names[state.language],busy=bookState!=='closed';
    const fill=(text,values)=>text.replace(/\{(\w+)\}/g,(_,key)=>values[key]);
    document.documentElement.lang=state.language==='zh'?'zh-Hant':'ja';
    document.documentElement.dataset.theme=state.night?'dark':'light';
    document.title=fill(t.pageTitle,{name});
    root.querySelectorAll('[data-i18n]').forEach(el=>{el.textContent=t[el.getAttribute('data-i18n')];});
    $('night').textContent=t[state.night?'day':'night'];$('night').setAttribute('aria-pressed',String(state.night));
    const number=String(CABINETS.indexOf(cabinet)+1).padStart(2,'0');
    $('cabinet-number').textContent=`${number} / 11`;$('cabinet-name').textContent=name+t.cabinet;$('cabinet-count').textContent=fill(t.count,{n:cabinet.count});
    for(const [id,direction] of [['previous',-1],['next',1]]){
      const adjacent=adjacentCabinet(cabinet.id,direction).names[state.language];
      $(`${id}-name`).textContent=adjacent;$(`${id}-cabinet`).setAttribute('aria-label',`${t[id]}：${adjacent}`);
    }
    $('cabinet-nav').setAttribute('aria-label',t.nav);
    root.querySelector('.exhibit').setAttribute('aria-label',t.exhibit);
    const key=bookState==='switching'?'switching':bookState==='opening'||bookState==='unrolling'?'opening':bookState==='closing'?'closing':bookState==='reading'?'reading':state.failed?'failed':state.still?'still':state.flat?'flatStatus':state.demo?'playing':'ready';
    $('status').textContent=fill(t[key],{volume:volumeTitle(cabinet.id,state.language)});
    openButton.textContent=`${t.openBook} ↗`;
    for(const id of ['save','open-book','previous-cabinet','next-cabinet','flat','relief'])/** @type {HTMLButtonElement} */($(id)).disabled=busy;
    /** @type {HTMLButtonElement} */($('demo')).disabled=busy||state.still||state.failed;
    /** @type {HTMLButtonElement} */($('motion')).disabled=state.systemReduced;
    $('motion').setAttribute('aria-pressed',String(state.still));
    $('flat').setAttribute('aria-pressed',String(state.flat));$('relief').setAttribute('aria-pressed',String(!state.flat));
    root.querySelectorAll('[data-material]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.getAttribute('data-material'))===state.ground)));
  }

  controller=mountBunko(root,{onState:render});
  const preferences=change=>{const {night,paused}=controller.state();controller.setPreferences({night,paused,...change});};
  $('language').onclick=()=>controller.setLanguage(controller.state().language==='zh'?'ja':'zh');
  $('night').onclick=()=>preferences({night:!controller.state().night});
  $('motion').onclick=()=>preferences({paused:!controller.state().paused});
  $('flat').onclick=()=>controller.setFlat(true);$('relief').onclick=()=>controller.setFlat(false);
  $('demo').onclick=()=>controller.demo();$('save').onclick=()=>controller.save();
  openButton.onclick=()=>controller.openBook(openButton);
  root.querySelectorAll('[data-material]').forEach(button=>listen(button,'click',()=>controller.setGround(Number(button.getAttribute('data-material')))));
  $('previous-cabinet').onclick=()=>{void controller.changeCabinet(-1,$('previous-cabinet'));};
  $('next-cabinet').onclick=()=>{void controller.changeCabinet(1,$('next-cabinet'));};
  // The rail keeps its quick swipe and arrow keys; the cabinet itself keeps the light.
  const nav=$('cabinet-nav');
  listen(nav,'keydown',e=>{if(['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();void controller.changeCabinet(e.key==='ArrowLeft'?-1:1);}});
  listen(nav,'pointerdown',e=>{if(e.pointerType==='touch'&&controller.state().bookState==='closed')railGesture={id:e.pointerId,x:e.clientX,y:e.clientY,time:performance.now()};});
  listen(nav,'pointercancel',()=>{railGesture=null;});
  listen(nav,'pointerup',e=>{const direction=swipeDirection(railGesture,{id:e.pointerId,x:e.clientX,y:e.clientY,time:performance.now()});railGesture=null;if(direction){suppressRailClickUntil=performance.now()+400;e.preventDefault();void controller.changeCabinet(direction);}});
  listen(nav,'click',e=>{if(performance.now()<suppressRailClickUntil){e.preventDefault();e.stopPropagation();}},true);
  return {...controller,destroy(){events.abort();controller.destroy();}};
}
