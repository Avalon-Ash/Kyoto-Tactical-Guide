import {buildScene, multiply, lookAt, ortho, groundPoint, trailIntensity, normalize} from './geometry.js';
import {vertex,fragment,depth} from './shaders.js';
import {createBunkoLibrary} from './library';
import {progressToward,isTap,onLid,swipeDirection,cabinetDragDirection,idlePlaybackAllowed} from './interaction.js';
import {CABINETS,cabinetFor,adjacentCabinet,volumeTitle} from './collection';
import {LANDMARK_STUDIES} from './landmarks.js';
import {mountBackdrop,cabinetKeepout} from './backdrop.js';

// Fixed home camera; render() and the backdrop's cabinet keepout share it.
const EYE=[430,720,920],CAMERA_VIEW=lookAt(EYE,[0,40,0]);
function cameraMatrix(width,height){const aspect=width/height,halfW=Math.max(475,340*aspect),halfH=halfW/aspect;return multiply(ortho(-halfW,halfW,-halfH,halfH,1,2200),CAMERA_VIEW);}

const words={
  zh:{back:'京都御秘帖',night:'月光',day:'暖日',title:'一座京都，藏於文庫。',intro:'掠過漆面，看屋簷隆起、金銀移光。這次，先端詳東寺。',flat:'平面對照',relief:'互動浮雕',edition:'初音調度意象・局部習作',loading:'正在鋪設金地…',caption:'梨地に、五重の影。',ready:'滑鼠／手指掠過，或按「演示一次」',playing:'正在演示：隆起 → 左右視差 → 金粉軌跡',flatStatus:'平面對照：相同構圖與材質，深度壓平',still:'減少動態：保留浮雕，停止位移、擺動與軌跡',demo:'演示一次 ↗',motion:'減少動態',ground:'地蒔 / GROUND',materialTitle:'同一片金地，三種表情。',nashiji:'梨地',nashijiDesc:'細粒，透漆的深淺',dense:'濃梨地',denseDesc:'密蒔，更厚實的金色',gyobu:'刑部梨地',gyobuDesc:'箔底，大而不規則的片粒',note:'沿水岸看螺鈿變色，屋脊是切金、切銀意象。金粒附著漆面，軌跡是光的餘韻。',scope:'東寺文庫樣板，點擊蓋面可展開南區真實景點書卷。簡化浮雕並非建築測繪模型；首頁與其他地標尚未整合。',openBook:'開盒・展卷',opening:'提蓋，展開南之卷…',closing:'收卷合蓋…',source:'參考：德川美術館・初音蒔繪料紙箱 ↗',failed:'無法啟用 WebGL。請使用支援硬體加速的瀏覽器開啟此展示頁。',canvas:'東寺文庫：點擊或 Enter 開盒展卷；方向鍵移光，空白鍵演示'},
  ja:{back:'京都御秘帖',night:'月光',day:'陽光',title:'京都を、ひとつの文庫に。',intro:'漆面をなぞると、軒が浮かび、金銀の光が移ろう。まずは東寺から。',flat:'平面と比較',relief:'浮彫を動かす',edition:'初音の調度に着想・部分習作',loading:'金地を準備しています…',caption:'梨地に、五重の影。',ready:'マウス・指でなぞる、または「動きを見る」',playing:'実演中：浮き上がり → 視差 → 光の余韻',flatStatus:'平面：構図と素材を保ち、奥行きを圧縮',still:'動きを抑制：浮彫を保ち、変位・揺れ・軌跡を停止',demo:'動きを見る ↗',motion:'動きを抑える',ground:'地蒔 / GROUND',materialTitle:'同じ金地、三つの表情。',nashiji:'梨地',nashijiDesc:'細かな粉、透漆の奥行き',dense:'濃梨地',denseDesc:'密に蒔かれた金の厚み',gyobu:'刑部梨地',gyobuDesc:'箔地と大きな不定形の粉',note:'水辺には螺鈿の色移り、屋根には切金・切銀の意匠。粉は漆面に留まり、光だけが余韻を残します。',scope:'東寺の文庫試作。蓋を選ぶと南区の実際の名所データを読めます。簡略化した浮彫であり実測模型ではありません。ホームと他の名所は未統合です。',openBook:'蓋を開き、巻へ',opening:'蓋を上げ、南の巻を開いています…',closing:'巻を収めています…',source:'参考：徳川美術館・初音蒔絵料紙箱 ↗',failed:'WebGL を使用できません。ハードウェアアクセラレーション対応のブラウザーでご覧ください。',canvas:'東寺の文庫：クリック・Enter で巻を開く。矢印キーで光を移動、スペースキーで実演'}
};
Object.assign(words.zh,{intro:'一區一函，一函一景。左右換盒，點蓋展卷；掠過山水建築，端詳金銀浮雕的光影。',scope:'十一行政區各藏一卷真實景點。各函以代表地標與庭園構成簡化浮雕，並非建築測繪或歷史復原；依初音調度意象創作。',switching:'正在換函…',ready:'掠過盒面移光；左右換函，點蓋展卷。'});
Object.assign(words.ja,{intro:'一区に一函、一函にひとつの景色。左右で函を選び、蓋から巻へ。山水と建築をなぞり、金銀の光と影を愉しむ。',scope:'十一の行政区ごとに実際の名所を収めています。各函は名所と庭園を組み合わせた簡略化した浮彫です。実測模型・歴史的復元ではありません。初音の調度に着想を得ています。',switching:'函を替えています…',ready:'漆面で光を移し、左右で函を選ぶ。蓋を押すと巻が開きます。'});
/**
 * @param {HTMLElement} root
 * @param {{language?: import('../../types').Lang, wardId?: string, night?: boolean, paused?: boolean, embedded?: boolean,
 * onLanguageChange?: (lang: import('../../types').Lang)=>void, onWardChange?: (ward: string)=>void,
 * onPreferencesChange?: (value: {night: boolean, paused: boolean})=>void, onExploreWard?: (ward: string)=>void}} options
 */
export function mountBunko(root,options={}){
const $=id=>root.querySelector(`[id="${id}"]`);
let destroyed=false;
const events=new AbortController();
const listen=(target,type,handler,settings={})=>target.addEventListener(type,handler,{...(typeof settings==='boolean'?{capture:settings}:settings),signal:events.signal});
const canvas=/** @type {HTMLCanvasElement} */($('scene'));
let language=options.language??'zh',night=options.night??true,flat=false,paused=options.paused??false,hover=false,visible=true,failed=false;
const media=matchMedia('(prefers-reduced-motion: reduce)');
const still=()=>paused||media.matches;
let frame=0,last=0,lift=.55,px=0,py=0,tx=0,ty=0,demoStart=0,draws=0;
let trails=[];
let bookState='closed',bookProgress=0,bookTarget=0,bookReadyAt=0,gesture=null,returnFocus=null;
let cabinet=cabinetFor(options.wardId??'W_MINAMI'),railGesture=null,switchAnimation=null,updateMesh,suppressRailClickUntil=0;
let dragOffset=0,dragAnimation=null;
let lastActivity=-Infinity,idlePhase=0,autoPlaying=false;
const library=createBunkoLibrary(closeBook,toggleLanguage,root,options.onExploreWard);
let projection,render,dispose;
const backdrop=mountBackdrop($('stage'),{night,motion:!still()});
function syncBackdrop(){const stage=$('stage'),w=stage.clientWidth,h=stage.clientHeight;if(w&&h)backdrop.resize(w,h,devicePixelRatio||1,cabinetKeepout(cameraMatrix(w,h),w,h));}
const status=()=>{const key=bookState==='switching'?'switching':bookState==='opening'||bookState==='unrolling'?'opening':bookState==='closing'?'closing':failed?'failed':still()?'still':flat?'flatStatus':demoStart?'playing':'ready';$('status').textContent=key==='opening'?(language==='zh'?`提蓋，展開${volumeTitle(cabinet.id,language)}…`:`蓋を上げ、${volumeTitle(cabinet.id,language)}を開いています…`):words[language][key];};
function syncCabinet(){
  const zh=language==='zh',name=cabinet.names[language];
  $('cabinet-number').textContent=`${String(CABINETS.indexOf(cabinet)+1).padStart(2,'0')} / 11`;
  $('cabinet-name').textContent=name+(zh?'之函':'の函');
  $('cabinet-count').textContent=zh?`藏 ${cabinet.count} 處`:`${cabinet.count} 件を収蔵`;
  $('cabinet-context').textContent=`${name} · ${String(CABINETS.indexOf(cabinet)+1).padStart(2,'0')} / 11`;
  $('cabinet-place').textContent=cabinet.landmark.oldName[language];
  $('cabinet-landmark').textContent=LANDMARK_STUDIES[cabinet.id][language];
  $('cabinet-art-note').hidden=cabinet.relief;
  $('cabinet-art-note').textContent=zh?'梨地素函 · 地標浮雕待製':'梨地の素函 · 浮彫は未制作';
  for(const [id,direction] of [['previous',-1],['next',1]]){
    const adjacent=adjacentCabinet(cabinet.id,direction).names[language];
    $(`${id}-name`).textContent=adjacent;
    $(`${id}-cabinet`).setAttribute('aria-label',`${zh?(direction<0?'上一函':'下一函'):(direction<0?'前の函':'次の函')}：${adjacent}`);
  }
  $('cabinet-nav').setAttribute('aria-label',zh?'文庫選區；左右方向鍵或在此橫滑換函':'文庫の選択。左右キー・この欄の横スワイプで函を替える');
  canvas.setAttribute('aria-label',zh?`${name}文庫：點擊或 Enter 開盒展卷；方向鍵移光`:`${name}の文庫：クリック・Enter で巻を開く。矢印キーで光を移動`);
  if(options.embedded)canvas.setAttribute('aria-label',zh?`${name}文庫：左右拖動或方向鍵換函；點蓋或 Enter 開卷`:`${name}の文庫：左右のドラッグ・矢印キーで函を選択。蓋を押すか Enter で巻を開く`);
  canvas.dataset.ward=cabinet.id;
  if(!options.embedded)document.title=zh?`${name}文庫｜京都御秘帖`:`${name}の文庫｜京都御秘帖`;
  root.querySelector('.exhibit').setAttribute('aria-label',zh?'京都十一區文庫':'京都十一区の文庫');
}
async function changeCabinet(direction,focusTarget=document.activeElement,fromOffset=0){
  if(bookState!=='closed')return;
  dragAnimation?.cancel();canvas.style.transform='';dragOffset=0;canvas.dataset.dragging='false';
  bookState='switching';demoStart=0;trails=[];gesture=null;hover=false;tx=ty=px=py=0;syncBook();status();
  const animate=async frames=>{
    if(still())return;
    switchAnimation=canvas.animate(frames,{duration:180,easing:'ease-in-out',fill:'forwards'});
    await switchAnimation.finished.catch(()=>{});
  };
  const distance=options.embedded?Math.max(100,canvas.clientWidth*.35):28;
  await animate([{opacity:1,transform:`translateX(${fromOffset}px)`},{opacity:0,transform:`translateX(${-direction*Math.max(distance,Math.abs(fromOffset))}px)`}]);
  if(destroyed)return;
  cabinet=adjacentCabinet(cabinet.id,direction);options.onWardChange?.(cabinet.id);updateMesh?.();
  lift=flat?.025:still()?.82:1;
  // Commit the new mesh before its label is revealed, even when a quiet tab defers RAF.
  render?.(performance.now(),false);syncCabinet();schedule();
  switchAnimation?.cancel();
  await animate([{opacity:0,transform:`translateX(${direction*distance}px)`},{opacity:1,transform:'translateX(0)'}]);
  if(destroyed)return;
  switchAnimation?.cancel();switchAnimation=null;bookState='closed';
  // A deliberate selection starts the new scene immediately; later input still takes control.
  lastActivity=-Infinity;syncBook();status();schedule();
  if(focusTarget?.closest('#cabinet-nav'))focusTarget.focus({preventScroll:true});
}
$('previous-cabinet').onclick=()=>{void changeCabinet(-1,$('previous-cabinet'));};
$('next-cabinet').onclick=()=>{void changeCabinet(1,$('next-cabinet'));};
listen($('cabinet-nav'),'keydown',e=>{if(['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();void changeCabinet(e.key==='ArrowLeft'?-1:1);}});
listen($('cabinet-nav'),'pointerdown',e=>{if(e.pointerType==='touch'&&bookState==='closed')railGesture={id:e.pointerId,x:e.clientX,y:e.clientY,time:performance.now()};});
listen($('cabinet-nav'),'pointercancel',()=>{railGesture=null;});
listen($('cabinet-nav'),'pointerup',e=>{const direction=swipeDirection(railGesture,{id:e.pointerId,x:e.clientX,y:e.clientY,time:performance.now()});railGesture=null;if(direction){suppressRailClickUntil=performance.now()+400;e.preventDefault();void changeCabinet(direction);}});
listen($('cabinet-nav'),'click',e=>{if(performance.now()<suppressRailClickUntil){e.preventDefault();e.stopPropagation();}},true);
function translate(){
  root.lang=language==='zh'?'zh-Hant':'ja';
  if(!options.embedded)document.documentElement.lang=root.lang;
  root.querySelectorAll('[data-i18n]').forEach(el=>el.textContent=words[language][el.getAttribute('data-i18n')]);
  $('language').textContent=language==='zh'?'日本語':'繁體中文';
  $('night').textContent=words[language][night?'day':'night'];
  $('save').textContent=language==='zh'?'保存畫面':'画像を保存';
  canvas.setAttribute('aria-label',words[language].canvas);
  library.setLanguage(language);syncCabinet();status();
}
function schedule(){if(!destroyed&&!frame&&visible&&!document.hidden&&render)frame=requestAnimationFrame(tick);}
function activity(){
  if(!options.embedded)return;
  lastActivity=performance.now();autoPlaying=false;canvas.dataset.autoplay='false';schedule();
}
if(options.embedded)for(const type of ['pointerdown','pointermove','keydown','wheel'])listen(document,type,activity,{capture:true,passive:true});
function tick(time){
  frame=0;
  if(!visible||document.hidden)return;
  autoPlaying=idlePlaybackAllowed({embedded:options.embedded,reduced:still(),visible,hidden:document.hidden,failed,bookState,dragging:Boolean(gesture),idleFor:time-lastActivity});
  // An unattended scene need not draw at a high-refresh monitor's full rate.
  if(autoPlaying&&time-last<1000/30){schedule();return;}
  const dt=Math.min(50,time-last||16);last=time;
  if(autoPlaying){
    idlePhase+=dt/1000;
    tx=Math.sin(idlePhase*1.25)*.9;ty=Math.cos(idlePhase*.9)*.7;
    addTrail(tx*.63,ty*.45,time);
  }
  if(demoStart){
    const t=(time-demoStart)/1000;
    if(t>7||still()){demoStart=0;hover=false;tx=ty=0;status();}
    else{tx=Math.sin(t*1.25)*.9;ty=Math.cos(t*.9)*.7;addTrail(tx*.63,ty*.45,time);}
  }
  bookProgress=progressToward(bookProgress,bookTarget,dt,still());
  if(bookProgress===1&&bookState==='opening'){bookState='unrolling';bookReadyAt=time+(still()?0:420);syncBook();}
  if(bookState==='unrolling'&&(time>=bookReadyAt||still())){bookState='reading';library.show();syncBook();}
  if(bookProgress===0&&bookState==='closing'){bookState='closed';syncBook();returnFocus?.focus({preventScroll:true});status();}
  const target=flat?.025:still()?.82:autoPlaying?.88+Math.sin(idlePhase*.7)*.12:(hover||demoStart||bookState==='switching')?1:.55;
  const ease=1-Math.exp(-dt/170);
  lift=still()?target:lift+(target-lift)*ease;
  px=still()?0:px+(tx-px)*ease;py=still()?0:py+(ty-py)*ease;
  if(Math.abs(target-lift)<.0005)lift=target;
  if(Math.abs(tx-px)<.0005)px=tx;if(Math.abs(ty-py)<.0005)py=ty;
  trails=still()?[]:trails.filter(p=>trailIntensity(p.time,time)>0);
  render(time,Boolean(autoPlaying||demoStart||trails.length));
  canvas.dataset.autoplay=String(autoPlaying);canvas.dataset.idlePhase=idlePhase.toFixed(3);
  canvas.dataset.bookState=bookState;canvas.dataset.opening=bookProgress.toFixed(3);
  canvas.dataset.mode=flat?'flat':'relief';canvas.dataset.lift=lift.toFixed(3);canvas.dataset.trails=String(trails.length);canvas.dataset.still=String(still());
  if(bookProgress!==bookTarget||bookState==='unrolling'||demoStart||trails.length||(!still()&&(lift!==target||px!==tx||py!==ty))||(options.embedded&&!still()&&bookState==='closed'))schedule();
}
function addTrail(x,y,time=performance.now()){
  if(still()||flat||bookState!=='closed'||!projection)return;
  const [wx,wz]=groundPoint(projection,x,-y);
  if(Math.abs(wx)>364||Math.abs(wz)>234)return;
  const previous=trails.at(-1);
  if(previous&&Math.hypot(wx-previous.x,wz-previous.z)<4)return;
  trails.push({x:wx,z:wz,time});if(trails.length>20)trails.shift();
}
function point(e){
  if(bookState!=='closed')return;
  if(gesture&&gesture.id!==e.pointerId)return;
  if(gesture&&Math.hypot(e.clientX-gesture.x,e.clientY-gesture.y)>8)gesture.moved=true;
  canvas.dataset.pointerType=e.pointerType;
  if(options.embedded&&gesture?.moved){
    const dx=e.clientX-gesture.x,dy=e.clientY-gesture.y;
    if(!gesture.axis){
      if(Math.abs(dx)>Math.abs(dy)*1.25)gesture.axis='x';
      else if(Math.abs(dy)>Math.abs(dx)*1.25)gesture.axis='y';
    }
    if(gesture.axis==='x'){
      hover=false;tx=ty=0;trails=[];
      dragOffset=still()?0:Math.max(-canvas.clientWidth*.85,Math.min(canvas.clientWidth*.85,dx));
      canvas.style.transform=`translateX(${dragOffset}px)`;canvas.dataset.dragging='true';schedule();
    }
    return;
  }
  const r=canvas.getBoundingClientRect();tx=Math.max(-1,Math.min(1,(e.clientX-r.left)/r.width*2-1));ty=Math.max(-1,Math.min(1,(e.clientY-r.top)/r.height*2-1));
  addTrail(tx,ty);schedule();
}
function demo(){if(still()||failed||bookState!=='closed'||!cabinet.relief)return;flat=false;syncMode();demoStart=performance.now();status();schedule();}
function syncBook(){
  const busy=bookState!=='closed';
  backdrop.setMotion(!still()&&(bookState==='closed'||bookState==='switching'));
  $('stage').dataset.bookState=bookState;
  $('open-book').setAttribute('aria-expanded',String(['opening','unrolling','reading'].includes(bookState)));
  for(const id of ['save','open-book','previous-cabinet','next-cabinet'])$(id).disabled=busy;
  for(const id of ['flat','relief'])$(id).disabled=busy||!cabinet.relief;
  $('demo').disabled=busy||still()||failed||!cabinet.relief;
  canvas.setAttribute('aria-disabled',String(busy));
}
function openBook(trigger){
  if(bookState!=='closed')return;
  returnFocus=trigger;bookState='opening';bookTarget=1;demoStart=0;trails=[];tx=ty=0;
  library.prepare(language,cabinet.id);syncBook();status();
  if(still()||failed){bookProgress=1;bookState='reading';library.show();syncBook();}
  schedule();
}
function closeBook(){
  if(bookState==='closed'||bookState==='closing')return;
  library.hide();bookState='closing';bookTarget=0;syncBook();status();
  if(still()||failed){bookProgress=0;bookState='closed';syncBook();returnFocus?.focus({preventScroll:true});status();}
  schedule();
}
$('open-book').onclick=()=>openBook($('open-book'));
listen(document,'keydown',e=>{if(e.key==='Escape'&&['opening','unrolling'].includes(bookState)){e.preventDefault();closeBook();}});
function syncMode(){ $('flat').setAttribute('aria-pressed',String(flat));$('relief').setAttribute('aria-pressed',String(!flat));status();schedule(); }
$('flat').onclick=()=>{flat=true;demoStart=0;trails=[];syncMode();};
$('relief').onclick=()=>{flat=false;syncMode();};
$('demo').onclick=demo;
$('save').onclick=()=>{
  if(!render)return;
  // Export the same visible scene at its current size; no separate evidence renderer.
  render(performance.now(),Boolean(demoStart||trails.length));
  const output=document.createElement('canvas');output.width=canvas.width;output.height=canvas.height;
  const ctx=output.getContext('2d');if(!ctx)return;
  backdrop.compose(ctx,output.width,output.height);ctx.drawImage(canvas,0,0);
  output.toBlob(blob=>{
    if(!blob||destroyed)return;
    const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`toji-${flat?'flat':'relief'}-${ground}-${night?'night':'day'}.png`;a.click();
    setTimeout(()=>URL.revokeObjectURL(url),10000);
  },'image/png');
};
function toggleLanguage(){language=language==='zh'?'ja':'zh';translate();options.onLanguageChange?.(language);}
$('language').onclick=toggleLanguage;
$('night').onclick=()=>{night=!night;backdrop.setNight(night);root.classList.toggle('night',night);$('night').setAttribute('aria-pressed',String(night));translate();schedule();options.onPreferencesChange?.({night,paused});};
function syncMotion(){
  root.classList.toggle('reduce-motion',still());
  $('motion').setAttribute('aria-pressed',String(still()));
  /** @type {HTMLButtonElement} */($('motion')).disabled=media.matches;
  /** @type {HTMLButtonElement} */($('demo')).disabled=still()||failed;
  if(still()){demoStart=0;trails=[];tx=ty=0;switchAnimation?.finish();dragAnimation?.cancel();canvas.style.transform='';dragOffset=0;}status();syncBook();schedule();
}
$('motion').onclick=()=>{paused=!paused;syncMotion();options.onPreferencesChange?.({night,paused});};listen(media,'change',syncMotion);
let ground=1;
root.querySelectorAll('[data-material]').forEach(button=>listen(button,'click',()=>{
  ground=Number(button.getAttribute('data-material'));
  root.querySelectorAll('[data-material]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));schedule();
}));
listen(canvas,'pointerenter',e=>{if(e.pointerType!=='touch'){hover=true;point(e);}});
listen(canvas,'pointermove',point);
listen(canvas,'pointerdown',e=>{
  if(e.button!==0||bookState!=='closed'||gesture)return;
  dragAnimation?.cancel();canvas.style.transform='';dragOffset=0;
  gesture={id:e.pointerId,x:e.clientX,y:e.clientY,time:performance.now(),moved:false,axis:null};
  if(options.embedded)canvas.setPointerCapture(e.pointerId);
  hover=true;demoStart=0;status();point(e);
});
const release=()=>{hover=false;tx=ty=0;schedule();};
function endDrag(){
  const id=gesture?.id;gesture=null;canvas.dataset.dragging='false';
  if(id!==undefined&&canvas.hasPointerCapture(id))canvas.releasePointerCapture(id);
}
function returnCabinet(){
  const offset=dragOffset;dragOffset=0;canvas.style.transform='';
  if(offset&&!still())dragAnimation=canvas.animate([{transform:`translateX(${offset}px)`},{transform:'translateX(0)'}],{duration:160,easing:'ease-out'});
}
listen(canvas,'pointerleave',()=>{if(options.embedded&&gesture)return;endDrag();returnCabinet();release();});
listen(canvas,'pointercancel',()=>{endDrag();returnCabinet();release();});
listen(canvas,'lostpointercapture',()=>{if(gesture){endDrag();returnCabinet();release();}});
listen(canvas,'pointerup',e=>{
  if(!gesture||gesture.id!==e.pointerId)return;
  const end={id:e.pointerId,x:e.clientX,y:e.clientY,time:performance.now()};
  const tap=isTap(gesture,end),direction=options.embedded?cabinetDragDirection(gesture,end,canvas.clientWidth):0,offset=dragOffset;
  endDrag();
  if(direction){e.preventDefault();release();void changeCabinet(direction,canvas,offset);return;}
  returnCabinet();
  if(tap&&failed)openBook(canvas);
  else if(tap&&projection){const r=canvas.getBoundingClientRect();const [x,z]=groundPoint(projection,(e.clientX-r.left)/r.width*2-1,1-(e.clientY-r.top)/r.height*2);if(onLid(x,z))openBook(canvas);}
  if(e.pointerType==='touch')release();
});
listen(canvas,'focus',()=>{hover=true;schedule();});listen(canvas,'blur',release);
listen(canvas,'keydown',e=>{
  if(e.key==='Enter'){e.preventDefault();openBook(canvas);return;}
  if(bookState!=='closed')return;
  if(options.embedded&&['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();void changeCabinet(e.key==='ArrowLeft'?-1:1,canvas);return;}
  if(e.key===' '){e.preventDefault();if(options.embedded)openBook(canvas);else demo();return;}
  if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;
  e.preventDefault();hover=true;
  tx=Math.max(-1,Math.min(1,tx+(e.key==='ArrowLeft'?-.25:e.key==='ArrowRight'?.25:0)));
  ty=Math.max(-1,Math.min(1,ty+(e.key==='ArrowUp'?-.25:e.key==='ArrowDown'?.25:0)));
  addTrail(tx,ty);schedule();
});
listen(document,'visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;demoStart=0;trails=[];autoPlaying=false;canvas.dataset.autoplay='false';}else schedule();});
const intersection=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(!visible){cancelAnimationFrame(frame);frame=0;demoStart=0;trails=[];autoPlaying=false;canvas.dataset.autoplay='false';}else schedule();});intersection.observe(canvas);
const resize=new ResizeObserver(()=>{syncBackdrop();schedule();});resize.observe(canvas);

function init(){
  const gl=canvas.getContext('webgl',{alpha:true,antialias:true,powerPreference:'low-power'});
  if(!gl)throw Error('WebGL unavailable');
  const resources=[];
  const shader=(type,source)=>{const s=gl.createShader(type);resources.push(()=>gl.deleteShader(s));gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;};
  const program=source=>{
    const p=gl.createProgram();resources.push(()=>gl.deleteProgram(p));gl.attachShader(p,shader(gl.VERTEX_SHADER,vertex));gl.attachShader(p,shader(gl.FRAGMENT_SHADER,source));gl.linkProgram(p);
    if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(p));
    const names=['camera','lightMatrix','opening','pointer','lift','time','moving','light','eye','ground','night','trails[0]','shadowMap'];
    return {p,uniform:Object.fromEntries(names.map(n=>[n,gl.getUniformLocation(p,n)])),attributes:['position','normal','surface'].map(n=>gl.getAttribLocation(p,n))};
  };
  try{
    const main=program(fragment),shadow=program(depth),buffer=gl.createBuffer();let mesh;
    resources.push(()=>gl.deleteBuffer(buffer));
    updateMesh=()=>{mesh=buildScene(cabinet.id);gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,mesh,gl.STATIC_DRAW);};
    updateMesh();
    const framebuffer=gl.createFramebuffer(),texture=gl.createTexture(),depthBuffer=gl.createRenderbuffer();
    resources.push(()=>gl.deleteFramebuffer(framebuffer),()=>gl.deleteTexture(texture),()=>gl.deleteRenderbuffer(depthBuffer));
    gl.bindTexture(gl.TEXTURE_2D,texture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1024,1024,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    gl.bindRenderbuffer(gl.RENDERBUFFER,depthBuffer);gl.renderbufferStorage(gl.RENDERBUFFER,gl.DEPTH_COMPONENT16,1024,1024);
    gl.bindFramebuffer(gl.FRAMEBUFFER,framebuffer);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,texture,0);gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.RENDERBUFFER,depthBuffer);
    if(gl.checkFramebufferStatus(gl.FRAMEBUFFER)!==gl.FRAMEBUFFER_COMPLETE)throw Error('Shadow framebuffer unavailable');
    gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);
    const eye=EYE;
    function bind(prog,matrix,lightMatrix,time,moving){
      gl.useProgram(prog.p);gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
      for(let i=0;i<3;i++)if(prog.attributes[i]>=0){gl.enableVertexAttribArray(prog.attributes[i]);gl.vertexAttribPointer(prog.attributes[i],i===2?2:3,gl.FLOAT,false,32,i*12);}
      const u=prog.uniform;
      gl.uniformMatrix4fv(u.camera,false,matrix);gl.uniformMatrix4fv(u.lightMatrix,false,lightMatrix);
      gl.uniform1f(u.opening,bookProgress*bookProgress*(3-2*bookProgress));
      gl.uniform2f(u.pointer,flat||still()?0:px,flat||still()?0:py);gl.uniform1f(u.lift,lift);gl.uniform1f(u.time,time/1000);
      gl.uniform1f(u.moving,moving&&!still()&&!flat?1:0);
    }
    render=(time,moving)=>{
      const dpr=Math.min(devicePixelRatio||1,1.5),w=Math.max(1,Math.round(canvas.clientWidth*dpr)),h=Math.max(1,Math.round(canvas.clientHeight*dpr));
      if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
      projection=cameraMatrix(w,h);
      const lightPos=[-390+px*170,650,280+py*140],lightDir=normalize(lightPos);
      const lightMatrix=multiply(ortho(-560,560,-540,540,1,1700),lookAt(lightPos,[0,0,0]));
      gl.bindFramebuffer(gl.FRAMEBUFFER,framebuffer);gl.viewport(0,0,1024,1024);gl.clearColor(1,1,1,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
      // Unbind the sampled texture during the shadow pass to avoid framebuffer feedback.
      gl.bindTexture(gl.TEXTURE_2D,null);bind(shadow,lightMatrix,lightMatrix,time,moving);gl.drawArrays(gl.TRIANGLES,0,mesh.length/8);
      gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,w,h);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
      bind(main,projection,lightMatrix,time,moving);const u=main.uniform;
      gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,texture);gl.uniform1i(u.shadowMap,0);
      gl.uniform3fv(u.light,lightDir);gl.uniform3fv(u.eye,eye);gl.uniform1f(u.ground,ground);gl.uniform1f(u.night,night?1:0);
      const packed=new Float32Array(60);
      trails.forEach((p,i)=>packed.set([p.x,p.z,trailIntensity(p.time,time,still())],i*3));
      gl.uniform3fv(u['trails[0]'],packed);gl.drawArrays(gl.TRIANGLES,0,mesh.length/8);
      canvas.dataset.vertices=String(mesh.length/8);
      canvas.dataset.renderedWard=cabinet.id;
      canvas.dataset.frames=String(++draws);
    };
    dispose=()=>resources.splice(0).reverse().forEach(f=>f());failed=false;$('loading').hidden=true;canvas.dataset.renderer='webgl';schedule();
  }catch(error){resources.reverse().forEach(f=>f());throw error;}
}
function failure(error){failed=true;render=null;updateMesh=null;canvas.dataset.renderer='failed';$('loading').hidden=false;$('loading').textContent=words[language].failed;syncMotion();console.error('Toji study:',error);}
listen(canvas,'webglcontextlost',e=>{e.preventDefault();cancelAnimationFrame(frame);frame=0;dispose?.();failure('Context lost');});
listen(canvas,'webglcontextrestored',()=>{try{init();syncMotion();}catch(e){failure(e);}});
listen(window,'pagehide',event=>{cancelAnimationFrame(frame);frame=0;if(!event.persisted)dispose?.();});
listen(window,'pageshow',event=>{if(event.persisted)schedule();});
try{init();}catch(e){failure(e);}
root.classList.toggle('night',night);$('night').setAttribute('aria-pressed',String(night));
translate();syncMotion();syncBook();syncBackdrop();
return {
  setPreferences(next){
    if(destroyed)return;
    night=next.night;paused=next.paused;backdrop.setNight(night);
    root.classList.toggle('night',night);$('night').setAttribute('aria-pressed',String(night));
    translate();syncMotion();schedule();
  },
  setLanguage(next){if(next!==language){activity();language=next;translate();}},
  destroy(){
    if(destroyed)return;destroyed=true;
    events.abort();intersection.disconnect();resize.disconnect();
    switchAnimation?.cancel();dragAnimation?.cancel();endDrag();cancelAnimationFrame(frame);frame=0;
    library.destroy();dispose?.();backdrop.destroy();render=null;updateMesh=null;
  },
};
}
