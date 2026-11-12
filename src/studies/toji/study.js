import {groundPoint, trailIntensity} from './geometry.js';
import {createRenderer, cameraMatrix} from './renderer.js';
import {translate} from '../../data/i18n';
import {progressToward,isTap,onLid,cabinetDragDirection,cabinetOffset,switchDistance,idlePlaybackAllowed} from './interaction.js';
import {CABINETS,cabinetFor,adjacentCabinet} from './collection';
import {LANDMARK_STUDIES} from './landmarks.js';
import {viewBox,clampPan,clampZoom,isZoomed,rubberBand,panLimit,planePoint,anchorPan,dragPan,isDoubleTap,ZOOM_STEP} from './view.js';
import {mountBackdrop,cabinetKeepout} from './backdrop.js';
import {WARD_ART} from './ward-art.js';

/**
 * The cabinet itself: canvas, light, zoom, cabinet changes and the lid. It owns no buttons and no page chrome.
 * The React home drives it through options and the returned controller; the standalone study page wraps it
 * with its own controls (study-chrome.js) through the same controller and onState.
 * @typedef {{language: import('../../types').Lang, night: boolean, paused: boolean, still: boolean, systemReduced: boolean,
 * flat: boolean, failed: boolean, demo: boolean, ground: number, bookState: string, cabinet: typeof CABINETS[number]}} BunkoState
 */
/**
 * @param {HTMLElement} root element that already holds BUNKO_STAGE
 * @param {{language?: import('../../types').Lang, wardId?: string, night?: boolean, paused?: boolean, embedded?: boolean,
 * onWardChange?: (ward: string)=>void, onOpenVolume?: (ward: string)=>void, onState?: (state: BunkoState)=>void}} options
 * onOpenVolume: called once the lid is open; without it the lid simply stays open until closed again.
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
let frame=0,last=0,lift=.55,px=0,py=0,tx=0,ty=0,demoStart=0;
let trails=[];
let bookState='closed',bookProgress=0,bookTarget=0,bookReadyAt=0,gesture=null,returnFocus=null;
let cabinet=cabinetFor(options.wardId??'W_MINAMI'),switchAnimation=null,updateMesh;
let dragOffset=0,dragAnimation=null,kick=0;
// Close-up: current and target zoom/pan; a pinch or pan writes both, the tick eases current toward target.
let zoom=1,zoomTarget=1,panX=0,panY=0,panTX=0,panTY=0,pinch=null,lastTap=null;
let lastActivity=-Infinity,idlePhase=0,autoPlaying=false;
let projection,render,dispose,poke;
const backdrop=mountBackdrop($('stage'),{night,motion:!still(),wardId:cabinet.id});
// The cabinets either side of this one stand on the same track. Each is a still picture of that cabinet at rest,
// drawn by the same renderer and kept until the cabinet changes; it travels with the box and becomes the box.
const ghosts=options.embedded?[-1,1].map(side=>{
  const ghost=document.createElement('canvas');ghost.className='neighbour';ghost.setAttribute('aria-hidden','true');ghost.dataset.side=String(side);
  canvas.before(ghost);return ghost;
}):[];
let ghostAnimations=[],ghostsStale=true,ghostTimer=0,rawDraw=null,setMeshRaw=null;
const spacing=()=>canvas.clientWidth*.82;
/** Puts the box and its neighbours at `offset` px along the track. */
function placeTrack(offset){
  ghostAnimations.forEach(a=>a.cancel());ghostAnimations=[];
  canvas.style.transform=offset?`translateX(${offset}px)`:'';
  for(const ghost of ghosts){
    ghost.style.transform=`translateX(${Number(ghost.dataset.side)*spacing()+offset}px)`;
    ghost.style.opacity=ghost.dataset.ward&&offset?String(Math.min(.9,Math.abs(offset)/60)):'0';
  }
}
/** Moves the whole track from one offset to another; resolves with the box's own animation. */
function slide(from,to,duration){
  const gap=spacing(),timing={duration,easing:'cubic-bezier(.3,.7,.2,1)',fill:'forwards'};
  ghostAnimations.forEach(a=>a.cancel());
  ghostAnimations=ghosts.filter(ghost=>typeof ghost.animate==='function').map(ghost=>{
    const at=Number(ghost.dataset.side)*gap,shown=ghost.dataset.ward?.9:0;
    return ghost.animate([{transform:`translateX(${at+from}px)`,opacity:from?shown:0},{transform:`translateX(${at+to}px)`,opacity:to?shown:0}],timing);
  });
  return canvas.animate([{transform:`translateX(${from}px)`},{transform:`translateX(${to}px)`}],timing);
}
function snapshotNeighbours(){
  ghostsStale=false;
  if(!ghosts.length||!rawDraw||!setMeshRaw||failed||!canvas.width)return;
  const own=cabinet.id;
  for(const ghost of ghosts){
    const ward=adjacentCabinet(own,Number(ghost.dataset.side)).id,ctx=ghost.getContext('2d');
    if(!ctx)continue;
    setMeshRaw(ward);
    rawDraw({time:performance.now(),moving:false,still:true,flat,night,ground,lift:.82,opening:0,px:0,py:0,zoom:1,panX:0,panY:0,trails:[],presence:0});
    // Same task as the draw: the WebGL canvas still holds the frame.
    ghost.width=canvas.width;ghost.height=canvas.height;ctx.drawImage(canvas,0,0);ghost.dataset.ward=ward;ghost.dataset.plate=canvas.dataset.plate??'false';
  }
  setMeshRaw(own);render?.(performance.now(),false);
}
/** The neighbours' pictures are out of date (another cabinet, another light, another size): hide them and redraw soon. */
function queueSnapshot(){
  ghostsStale=true;for(const ghost of ghosts)delete ghost.dataset.ward;
  clearTimeout(ghostTimer);
  ghostTimer=setTimeout(()=>{if(!destroyed&&ghostsStale&&bookState==='closed'&&!gesture)snapshotNeighbours();},350);
}
// The unseen track made faintly visible: one cut-gold tick per cabinet, and a light that travels with the box.
const track=$('track'),trackLight=document.createElement('b');
const ticks=CABINETS.map((_,i)=>{const tick=document.createElement('i');tick.style.left=`calc(var(--step)*${i+.5})`;track?.append(tick);return tick;});
track?.append(trackLight);
let armed=0;
/** offset: how far the box has been pulled from rest, px. Past the switch distance the next cabinet's tick answers. */
function syncTrack(offset=0){
  if(!track)return;
  const index=CABINETS.indexOf(cabinet),reach=switchDistance(canvas.clientWidth)||1,pull=Math.max(-1.25,Math.min(1.25,offset/reach));
  const next=offset&&Math.abs(offset)>=reach?-Math.sign(offset):0,target=(index+next+CABINETS.length)%CABINETS.length;
  ticks.forEach((tick,i)=>{tick.dataset.current=String(i===index);tick.dataset.armed=String(Boolean(next)&&i===target);});
  track.style.setProperty('--at',(index-pull).toFixed(3));track.dataset.dragging=String(Boolean(offset));
  if(next===armed)return;
  armed=next;canvas.dataset.armed=String(next);
  // Crossing the threshold is felt: the box checks for an instant and, where the device can, the hand feels a tick.
  canvas.style.scale=next&&!still()?'.985':'';
  if(next&&!still())navigator.vibrate?.(10);
}
function syncNight(){root.classList.toggle('night',night);}
function syncBackdrop(){const stage=$('stage'),w=stage.clientWidth,h=stage.clientHeight;if(w&&h)backdrop.resize(w,h,devicePixelRatio||1,cabinetKeepout(cameraMatrix(w,h),w,h));}
/** @returns {BunkoState} */
const snapshot=()=>({language,night,paused,still:still(),systemReduced:media.matches,flat,failed,demo:Boolean(demoStart),ground,bookState,cabinet});
const notify=()=>{if(!destroyed)options.onState?.(snapshot());};
function syncCabinet(){
  const name=cabinet.names[language];
  $('cabinet-context').textContent=`${name} · ${String(CABINETS.indexOf(cabinet)+1).padStart(2,'0')} / 11`;
  $('cabinet-place').textContent=cabinet.landmark.oldName[language];
  $('cabinet-landmark').textContent=LANDMARK_STUDIES[cabinet.id][language];
  $('cabinet-verse').textContent=WARD_ART[cabinet.id].verse[language];
  canvas.setAttribute('aria-label',translate(options.embedded?'bunko_canvas_home':'bunko_canvas_study',language).replace('{name}',name));
  canvas.dataset.ward=cabinet.id;
  syncTrack(dragOffset);
}
async function changeCabinet(direction,focusTarget=document.activeElement,fromOffset=0){
  if(bookState!=='closed')return;
  resetZoom(true);
  dragAnimation?.cancel();placeTrack(0);dragOffset=0;canvas.dataset.dragging='false';syncTrack(0);
  bookState='switching';demoStart=0;trails=[];gesture=null;hover=false;tx=ty=px=py=0;syncBook();
  const animate=async frames=>{
    if(still())return;
    switchAnimation=canvas.animate(frames,{duration:180,easing:'ease-in-out',fill:'forwards'});
    await switchAnimation.finished.catch(()=>{});
  };
  const distance=options.embedded?Math.max(100,canvas.clientWidth*.35):28;
  // On the home the whole track slides and the neighbour arrives as itself; elsewhere the box fades out and in.
  const together=Boolean(ghosts.length&&!still()&&render&&typeof canvas.animate==='function');
  if(together){
    if(ghostsStale)snapshotNeighbours();
    const gap=spacing();
    switchAnimation=slide(fromOffset,-direction*gap,240+220*(1-Math.min(1,Math.abs(fromOffset)/gap)));
    await switchAnimation.finished.catch(()=>{});
  }else await animate([{opacity:1,transform:`translateX(${fromOffset}px)`},{opacity:0,transform:`translateX(${-direction*Math.max(distance,Math.abs(fromOffset))}px)`}]);
  if(destroyed)return;
  cabinet=adjacentCabinet(cabinet.id,direction);kick=still()?0:direction;options.onWardChange?.(cabinet.id);updateMesh?.();backdrop.setWard(cabinet.id);
  lift=flat?.025:still()?.82:1;
  // Commit the new mesh before its label is revealed, even when a quiet tab defers RAF.
  render?.(performance.now(),false);syncCabinet();schedule();
  switchAnimation?.cancel();
  // The new cabinet is drawn in the box's own canvas in the same task the track snaps back: nothing is seen to jump.
  if(together)placeTrack(0);
  else await animate([{opacity:0,transform:`translateX(${direction*distance}px)`},{opacity:1,transform:'translateX(0)'}]);
  queueSnapshot();
  if(destroyed)return;
  switchAnimation?.cancel();switchAnimation=null;bookState='closed';
  // A deliberate selection starts the new scene immediately; later input still takes control.
  lastActivity=-Infinity;syncBook();schedule();
  // A control that asked for the change was disabled meanwhile; hand its focus back.
  if(focusTarget?.focus&&focusTarget!==canvas&&root.contains(focusTarget))focusTarget.focus({preventScroll:true});
}
function syncLanguage(){
  root.lang=language==='zh'?'zh-Hant':'ja';
  $('loading').textContent=translate(failed?'bunko_failed':'bunko_loading',language);
  const reset=translate('bunko_zoom_reset',language);$('zoom-reset').setAttribute('aria-label',reset);$('zoom-reset').title=reset;
  syncCabinet();notify();
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
    if(t>7||still()){demoStart=0;hover=false;tx=ty=0;notify();}
    else{tx=Math.sin(t*1.25)*.9;ty=Math.cos(t*.9)*.7;addTrail(tx*.63,ty*.45,time);}
  }
  bookProgress=progressToward(bookProgress,bookTarget,dt,still());
  if(bookProgress===1&&bookState==='opening'){bookState='unrolling';bookReadyAt=time+(still()?0:420);syncBook();}
  if(bookState==='unrolling'&&(time>=bookReadyAt||still()))enterReading();
  if(destroyed)return;
  if(bookProgress===0&&bookState==='closing'){bookState='closed';syncBook();returnFocus?.focus({preventScroll:true});}
  const target=flat?.025:still()?.82:autoPlaying?.88+Math.sin(idlePhase*.7)*.12:(hover||demoStart||bookState==='switching')?1:options.embedded?.88:.55;
  const ease=1-Math.exp(-dt/170);
  lift=still()?target:lift+(target-lift)*ease;
  px=still()?0:px+(tx-px)*ease;py=still()?0:py+(ty-py)*ease;
  if(Math.abs(target-lift)<.0005)lift=target;
  if(Math.abs(tx-px)<.0005)px=tx;if(Math.abs(ty-py)<.0005)py=ty;
  if(!pinch&&!gesture?.panning){
    const aspect=canvas.clientWidth/Math.max(1,canvas.clientHeight);[panTX,panTY]=clampPan(aspect,zoomTarget,panTX,panTY);
    const zEase=still()?1:1-Math.exp(-dt/110);
    zoom+=(zoomTarget-zoom)*zEase;panX+=(panTX-panX)*zEase;panY+=(panTY-panY)*zEase;
    if(Math.abs(zoomTarget-zoom)<.0005)zoom=zoomTarget;if(Math.abs(panTX-panX)<.05)panX=panTX;if(Math.abs(panTY-panY)<.05)panY=panTY;
  }
  syncZoomUi();
  trails=still()?[]:trails.filter(p=>trailIntensity(p.time,time)>0);
  render(time,Boolean(autoPlaying||demoStart||trails.length));
  canvas.dataset.autoplay=String(autoPlaying);canvas.dataset.idlePhase=idlePhase.toFixed(3);
  canvas.dataset.bookState=bookState;canvas.dataset.opening=bookProgress.toFixed(3);
  canvas.dataset.mode=flat?'flat':'relief';canvas.dataset.lift=lift.toFixed(3);canvas.dataset.trails=String(trails.length);canvas.dataset.still=String(still());canvas.dataset.zoom=zoom.toFixed(3);canvas.dataset.pan=`${panX.toFixed(1)},${panY.toFixed(1)}`;
  if(zoom!==zoomTarget||panX!==panTX||panY!==panTY||bookProgress!==bookTarget||bookState==='unrolling'||demoStart||trails.length||(!still()&&(lift!==target||px!==tx||py!==ty))||(options.embedded&&!still()&&bookState==='closed'))schedule();
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
  if(pinch){movePinch(e);return;}
  if(gesture&&gesture.id!==e.pointerId)return;
  if(gesture?.panning){movePan(e);return;}
  if(gesture&&Math.hypot(e.clientX-gesture.x,e.clientY-gesture.y)>8)gesture.moved=true;
  canvas.dataset.pointerType=e.pointerType;
  if(options.embedded&&gesture?.moved){
    // The box trails the finger along its unseen track; the light below still follows the finger itself.
    dragOffset=still()?0:cabinetOffset(e.clientX-gesture.x,canvas.clientWidth);
    placeTrack(dragOffset);canvas.dataset.dragging=String(Boolean(dragOffset));syncTrack(dragOffset);
  }
  const r=canvas.getBoundingClientRect();tx=Math.max(-1,Math.min(1,(e.clientX-r.left)/r.width*2-1));ty=Math.max(-1,Math.min(1,(e.clientY-r.top)/r.height*2-1));
  addTrail(tx,ty);schedule();
}
function demo(){if(still()||failed||bookState!=='closed')return;flat=false;demoStart=performance.now();notify();schedule();}
function setFlat(value){flat=Boolean(value);if(flat){demoStart=0;trails=[];}notify();schedule();}
function setGround(value){ground=value;notify();schedule();}
function syncBook(){
  backdrop.setMotion(!still()&&(bookState==='closed'||bookState==='switching'));
  $('stage').dataset.bookState=bookState;
  canvas.setAttribute('aria-expanded',String(['opening','unrolling','reading'].includes(bookState)));
  canvas.setAttribute('aria-disabled',String(!['closed','reading'].includes(bookState)));
  notify();
}
function enterReading(){bookState='reading';syncBook();options.onOpenVolume?.(cabinet.id);}
function openBook(trigger){
  if(bookState!=='closed')return;
  resetZoom();
  returnFocus=trigger;bookState='opening';bookTarget=1;demoStart=0;trails=[];tx=ty=0;
  syncBook();
  if(still()||failed){bookProgress=1;enterReading();}
  schedule();
}
function closeBook(){
  if(bookState==='closed'||bookState==='closing')return;
  bookState='closing';bookTarget=0;syncBook();
  if(still()||failed){bookProgress=0;bookState='closed';syncBook();returnFocus?.focus({preventScroll:true});}
  schedule();
}
listen(document,'keydown',e=>{if(e.key==='Escape'&&['opening','unrolling','reading'].includes(bookState)){e.preventDefault();closeBook();}});
function save(){
  if(!render)return;
  // Export the same visible scene at its current size; no separate evidence renderer.
  render(performance.now(),Boolean(demoStart||trails.length));
  const output=document.createElement('canvas');output.width=canvas.width;output.height=canvas.height;
  const ctx=output.getContext('2d');if(!ctx)return;
  backdrop.compose(ctx,output.width,output.height);ctx.drawImage(canvas,0,0);
  output.toBlob(blob=>{
    if(!blob||destroyed)return;
    const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`${cabinet.id.slice(2).toLowerCase()}-${flat?'flat':'relief'}-${ground}-${night?'night':'day'}.png`;a.click();
    setTimeout(()=>URL.revokeObjectURL(url),10000);
  },'image/png');
}
function syncMotion(){
  root.classList.toggle('reduce-motion',still());
  if(still()){demoStart=0;trails=[];tx=ty=0;switchAnimation?.finish();dragAnimation?.cancel();placeTrack(0);dragOffset=0;syncTrack(0);}
  syncBook();schedule();
}
listen(media,'change',syncMotion);
let ground=1;
listen(canvas,'pointerenter',e=>{if(e.pointerType!=='touch'){hover=true;point(e);}});
listen(canvas,'pointermove',point);
// Two fingers on the cabinet are a pinch: zoom the cabinet, never the page, never a tap or cabinet drag.
// Until every finger lifts, no touch may open the lid or change the cabinet.
const touches=new Map();let multiTouch=false;
const frac=e=>{const r=canvas.getBoundingClientRect();return [(e.clientX-r.left)/r.width,(e.clientY-r.top)/r.height];};
const aspectNow=()=>canvas.clientWidth/Math.max(1,canvas.clientHeight);
function setZoom(next,fx=.5,fy=.5,instant=false){
  const aspect=aspectNow(),z=clampZoom(next),anchor=planePoint(aspect,zoomTarget,panTX,panTY,fx,fy);
  zoomTarget=z;[panTX,panTY]=clampPan(aspect,z,...anchorPan(aspect,z,anchor,fx,fy));
  if(instant||still()){zoom=zoomTarget;panX=panTX;panY=panTY;}
  syncZoomUi();schedule();
}
function resetZoom(instant=false){pinch=null;zoomTarget=1;panTX=panTY=0;if(instant||still()){zoom=1;panX=panY=0;}syncZoomUi();schedule();}
function syncZoomUi(){
  const zoomed=isZoomed(zoomTarget)||Boolean(pinch);
  // Close-up owns every touch on the canvas; at full view the page may still scroll vertically.
  canvas.style.touchAction=zoomed||options.embedded?'none':'';canvas.dataset.zoomed=String(zoomed);
  $('zoom-reset').hidden=!isZoomed(zoomTarget);
}
function startPinch(){
  const [a,b]=[...touches.values()],r=canvas.getBoundingClientRect(),mid=[((a.x+b.x)/2-r.left)/r.width,((a.y+b.y)/2-r.top)/r.height];
  pinch={distance:Math.max(1,Math.hypot(a.x-b.x,a.y-b.y)),zoom,anchor:planePoint(aspectNow(),zoom,panX,panY,...mid)};
  hover=false;tx=ty=0;trails=[];syncZoomUi();
}
function movePinch(e){
  if(!touches.has(e.pointerId))return;
  touches.set(e.pointerId,{x:e.clientX,y:e.clientY});
  const [a,b]=[...touches.values()],r=canvas.getBoundingClientRect(),fx=((a.x+b.x)/2-r.left)/r.width,fy=((a.y+b.y)/2-r.top)/r.height,aspect=aspectNow();
  zoom=zoomTarget=clampZoom(pinch.zoom*Math.hypot(a.x-b.x,a.y-b.y)/pinch.distance);
  // The midpoint may travel too: two fingers zoom and pan at once.
  const [cx,cy]=anchorPan(aspect,zoom,pinch.anchor,fx,fy),l=panLimit(aspect,zoom);
  const v=viewBox(aspect,zoom);panX=panTX=rubberBand(cx,l.x,v.halfW*.5);panY=panTY=rubberBand(cy,l.y,v.halfH*.5);
  schedule();
}
function movePan(e){
  const r=canvas.getBoundingClientRect(),aspect=aspectNow(),[dx,dy]=dragPan(aspect,zoom,e.clientX-gesture.x,e.clientY-gesture.y,r.width,r.height),l=panLimit(aspect,zoom),v=viewBox(aspect,zoom);
  if(Math.hypot(e.clientX-gesture.x,e.clientY-gesture.y)>8){gesture.moved=true;canvas.dataset.dragging='true';}
  panX=panTX=rubberBand(gesture.panX+dx,l.x,v.halfW*.5);panY=panTY=rubberBand(gesture.panY+dy,l.y,v.halfH*.5);
  schedule();
}
const liftTouch=e=>{
  if(e.pointerType!=='touch')return;
  touches.delete(e.pointerId);
  if(pinch&&touches.size<2){pinch=null;syncZoomUi();schedule();}
  if(!touches.size)multiTouch=false;
};
// A finger may lift outside the canvas; the window still hears it, after the canvas handlers.
for(const type of ['pointerup','pointercancel'])listen(window,type,liftTouch);
// Safari's own pinch would zoom the page; the canvas keeps two-finger gestures for the cabinet.
listen(canvas,'gesturestart',e=>e.preventDefault());
listen(canvas,'touchmove',e=>{if(options.embedded||e.touches.length>1||isZoomed(zoomTarget))e.preventDefault();},{passive:false});
listen(canvas,'wheel',e=>{
  if(bookState!=='closed'||!(options.embedded||e.ctrlKey))return;
  e.preventDefault();activity();
  const [fx,fy]=frac(e);setZoom(zoomTarget*Math.exp(-e.deltaY*(e.ctrlKey?.01:.0015)),fx,fy);
},{passive:false});
listen($('zoom-reset'),'click',()=>{resetZoom();canvas.focus({preventScroll:true});});
listen(canvas,'pointerdown',e=>{
  if(e.pointerType==='touch'){
    touches.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(touches.size>1){
      multiTouch=true;
      if(gesture){endDrag();returnCabinet();release();}
      if(touches.size===2&&bookState==='closed'&&!failed)startPinch();
      return;
    }
  }
  // With no reader to hand over to, a second press puts the lid back.
  if(bookState==='reading'&&!options.onOpenVolume&&e.button===0){closeBook();return;}
  if(e.button!==0||bookState!=='closed'||gesture||multiTouch)return;
  dragAnimation?.cancel();placeTrack(0);dragOffset=0;
  if(ghostsStale)snapshotNeighbours();
  gesture={id:e.pointerId,x:e.clientX,y:e.clientY,time:e.timeStamp,moved:false,panning:isZoomed(zoomTarget),panX,panY};
  if(options.embedded||gesture.panning)canvas.setPointerCapture(e.pointerId);
  hover=true;demoStart=0;notify();point(e);
});
// On the home the light rests where the hand left it until the idle sweep picks it up.
const release=()=>{hover=false;if(!options.embedded)tx=ty=0;schedule();};
function endDrag(){
  const id=gesture?.id;gesture=null;canvas.dataset.dragging='false';
  if(id!==undefined&&canvas.hasPointerCapture(id))canvas.releasePointerCapture(id);
  schedule();
}
function returnCabinet(){
  const offset=dragOffset;dragOffset=0;placeTrack(0);syncTrack(0);
  if(offset&&!still()&&typeof canvas.animate==='function')dragAnimation=slide(offset,0,180);
}
listen(canvas,'pointerleave',()=>{if((options.embedded||gesture?.panning)&&gesture)return;endDrag();returnCabinet();release();});
listen(canvas,'pointercancel',()=>{endDrag();returnCabinet();release();});
listen(canvas,'lostpointercapture',()=>{if(gesture){endDrag();returnCabinet();release();}});
listen(canvas,'pointerup',e=>{
  if(!gesture||gesture.id!==e.pointerId||multiTouch)return;
  // Event time, not handler time: a slow frame must not turn a tap into a long press.
  const end={id:e.pointerId,x:e.clientX,y:e.clientY,time:e.timeStamp};
  const tap=isTap(gesture,end);
  if(gesture.panning){
    // In close-up a drag only pans; a double tap returns to the full view; a single tap does nothing.
    endDrag();
    if(tap){
      const t={x:end.x,y:end.y,time:end.time};
      if(isDoubleTap(lastTap,t)){lastTap=null;resetZoom();}
      else{
        lastTap=t;
        // A plate answers a touch in close-up: the part under the finger does what it does.
        if(projection&&poke){const r=canvas.getBoundingClientRect();canvas.dataset.poked=poke(...groundPoint(projection,(end.x-r.left)/r.width*2-1,1-(end.y-r.top)/r.height*2),performance.now());schedule();}
      }
    }
    if(e.pointerType==='touch')release();
    return;
  }
  lastTap=null;
  const direction=options.embedded?cabinetDragDirection(gesture,end,canvas.clientWidth):0,offset=dragOffset;
  endDrag();
  if(direction){e.preventDefault();release();void changeCabinet(direction,canvas,offset);return;}
  returnCabinet();
  if(tap&&failed)openBook(canvas);
  else if(tap&&projection){const r=canvas.getBoundingClientRect();const [x,z]=groundPoint(projection,(e.clientX-r.left)/r.width*2-1,1-(e.clientY-r.top)/r.height*2);if(onLid(x,z))openBook(canvas);}
  if(e.pointerType==='touch')release();
});
listen(canvas,'focus',()=>{hover=true;schedule();});listen(canvas,'blur',release);
listen(canvas,'keydown',e=>{
  if(e.key==='Escape'&&isZoomed(zoomTarget)){e.preventDefault();resetZoom();return;}
  if(e.key==='Enter'){e.preventDefault();if(bookState==='reading')closeBook();else openBook(canvas);return;}
  if(bookState!=='closed')return;
  if(['+','=','-','_','0'].includes(e.key)){e.preventDefault();if(e.key==='0')resetZoom();else setZoom(zoomTarget*(e.key==='-'||e.key==='_'?1/ZOOM_STEP:ZOOM_STEP));return;}
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
const resize=new ResizeObserver(()=>{syncBackdrop();schedule();queueSnapshot();});resize.observe(canvas);

function init(){
  const renderer=createRenderer(canvas,cabinet.id);
  updateMesh=()=>renderer.setMesh(cabinet.id);setMeshRaw=id=>renderer.setMesh(id);rawDraw=frame=>renderer.draw(frame);queueSnapshot();
  render=(time,moving)=>{projection=renderer.draw({time,moving,still:still(),flat,night,ground,lift,opening:bookProgress,px,py,zoom,panX,panY,trails,presence:hover||autoPlaying||demoStart?1:0,offset:dragOffset,kick});kick=0;};
  poke=renderer.poke;
  dispose=renderer.dispose;failed=false;$('loading').hidden=true;canvas.dataset.renderer='webgl';schedule();
}
function failure(error){failed=true;render=null;updateMesh=null;poke=null;rawDraw=setMeshRaw=null;canvas.dataset.renderer='failed';$('loading').hidden=false;syncLanguage();syncMotion();console.error('Toji study:',error);}
listen(canvas,'webglcontextlost',e=>{e.preventDefault();cancelAnimationFrame(frame);frame=0;dispose?.();failure('Context lost');});
listen(canvas,'webglcontextrestored',()=>{try{init();syncMotion();}catch(e){failure(e);}});
listen(window,'pagehide',event=>{cancelAnimationFrame(frame);frame=0;if(!event.persisted)dispose?.();});
listen(window,'pageshow',event=>{if(event.persisted)schedule();});
try{init();}catch(e){failure(e);}
syncNight();syncLanguage();syncMotion();syncBackdrop();
return {
  setPreferences(next){
    if(destroyed)return;
    night=next.night;paused=next.paused;backdrop.setNight(night);queueSnapshot();
    syncNight();syncMotion();schedule();
  },
  setLanguage(next){if(!destroyed&&next!==language){activity();language=next;syncLanguage();}},
  /** For the study page's own controls; the home uses gestures and keys only. */
  changeCabinet:(direction,focusTarget)=>changeCabinet(direction,focusTarget),
  openBook,closeBook,setFlat,demo,setGround,save,state:snapshot,
  destroy(){
    if(destroyed)return;destroyed=true;
    events.abort();intersection.disconnect();resize.disconnect();clearTimeout(ghostTimer);ghostAnimations.forEach(a=>a.cancel());ghosts.forEach(ghost=>ghost.remove());
    switchAnimation?.cancel();dragAnimation?.cancel();endDrag();cancelAnimationFrame(frame);frame=0;
    dispose?.();backdrop.destroy();render=null;updateMesh=null;
  },
};
}
