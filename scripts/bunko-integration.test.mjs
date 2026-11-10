import test, {before,after} from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {createServer} from 'vite';

let server,mountBunko,mountStudy,stage;
before(async()=>{
  server=await createServer({server:{middlewareMode:true,hmr:false},appType:'custom'});
  ({mountBunko}=await server.ssrLoadModule('/src/studies/toji/study.js'));
  ({mountStudy}=await server.ssrLoadModule('/src/studies/toji/study-chrome.js'));
  ({BUNKO_STAGE:stage}=await server.ssrLoadModule('/src/studies/toji/template.ts'));
});
after(async()=>{await server?.close();});

function environment(t,reduced=false){
  const dom=new JSDOM('<!doctype html><html lang="zh-Hant"><head><title>Main site</title></head><body><div class="bunko"></div></body></html>',{url:'http://localhost/'});
  const {window}=dom,root=window.document.querySelector('.bunko');root.innerHTML=stage;
  const media=new window.EventTarget();media.matches=reduced;
  const observers=[],listeners=[],animations=[],pendingFrames=new Map();let frame=0;
  class Observer {
    constructor(){this.connected=false;observers.push(this);}
    observe(){this.connected=true;}
    disconnect(){this.connected=false;}
  }
  const globals={window,document:window.document,AbortController:window.AbortController,Option:window.Option,
    matchMedia:()=>media,IntersectionObserver:Observer,ResizeObserver:Observer,
    requestAnimationFrame:callback=>{pendingFrames.set(++frame,callback);return frame;},
    cancelAnimationFrame:id=>pendingFrames.delete(id)};
  const originals=new Map(Object.keys(globals).map(key=>[key,Object.getOwnPropertyDescriptor(globalThis,key)]));
  for(const [key,value] of Object.entries(globals))Object.defineProperty(globalThis,key,{configurable:true,writable:true,value});
  t.after(()=>{dom.window.close();for(const [key,descriptor] of originals){if(descriptor)Object.defineProperty(globalThis,key,descriptor);else delete globalThis[key];}});
  const add=window.EventTarget.prototype.addEventListener;
  t.mock.method(window.EventTarget.prototype,'addEventListener',function(type,callback,options){
    if(options?.signal)listeners.push(options.signal);return add.call(this,type,callback,options);
  });
  t.mock.method(window.HTMLCanvasElement.prototype,'getContext',()=>null);
  t.mock.method(console,'error',()=>{}); // This suite deliberately exercises the no-WebGL path.
  window.HTMLElement.prototype.scrollTo=()=>{};
  // jsdom has no layout: give the canvas a phone's width so drag distances mean something.
  Object.defineProperty(window.HTMLCanvasElement.prototype,'clientWidth',{configurable:true,get:()=>375});
  window.HTMLElement.prototype.setPointerCapture=function(id){this.capturedPointer=id;};
  window.HTMLElement.prototype.hasPointerCapture=function(id){return this.capturedPointer===id;};
  window.HTMLElement.prototype.releasePointerCapture=function(){this.capturedPointer=undefined;};
  window.HTMLElement.prototype.animate=function(){
    let resolve;const finished=new Promise(done=>{resolve=done;});
    const animation={finished,cancel:()=>resolve(),finish:()=>resolve()};animations.push(animation);return animation;
  };
  return {root,window,observers,listeners,animations,pendingFrames};
}

function pointer(env,type,x,y,id=1){
  const event=new env.window.Event(type,{bubbles:true,cancelable:true});
  Object.assign(event,{pointerId:id,pointerType:'mouse',button:0,clientX:x,clientY:y});
  env.root.querySelector('#scene').dispatchEvent(event);
}
const settle=async()=>{for(let i=0;i<5;i++)await Promise.resolve();};

test('the home stage carries no study controls, reader or search',t=>{
  const {root}=environment(t);
  const controller=mountBunko(root,{embedded:true,paused:true});
  assert.deepEqual([...root.querySelectorAll('button')].map(b=>b.id),['zoom-reset']);
  assert.equal(root.querySelectorAll('input,select,dialog,nav,form').length,0);
  controller.destroy();
});

test('home cabinet works without WebGL, hands the opened ward to the host and releases its lifetime',async t=>{
  const env=environment(t),{root,window}=env,opened=[],states=[];
  const controller=mountBunko(root,{embedded:true,language:'ja',wardId:'W_HIGASHIYAMA',paused:true,
    onOpenVolume:id=>opened.push(id),onState:state=>states.push(state.bookState)});
  const canvas=root.querySelector('#scene');
  assert.equal(canvas.dataset.renderer,'failed');
  assert.ok(root.classList.contains('night'),'home defaults to moonlight');
  assert.equal(root.querySelector('#cabinet-context').textContent,'東山区 · 05 / 11');
  assert.ok(canvas.getAttribute('aria-label').startsWith('東山区の文庫'));
  assert.equal(window.document.title,'Main site','the cabinet must not overwrite the host title');
  assert.equal(window.document.documentElement.lang,'zh-Hant','the cabinet must not overwrite the host language');
  pointer(env,'pointerdown',200,100);pointer(env,'pointerup',200,100);
  assert.deepEqual(opened,['W_HIGASHIYAMA'],'a tap opens the lid and hands over exactly once');
  assert.equal(states.at(-1),'reading');
  controller.setLanguage('zh');
  assert.ok(canvas.getAttribute('aria-label').startsWith('東山區文庫'));
  controller.destroy();controller.destroy();
  await Promise.resolve();
  assert.ok(env.listeners.length>10&&env.listeners.every(signal=>signal.aborted));
  assert.ok(env.observers.every(observer=>!observer.connected));
  assert.equal(env.pendingFrames.size,0);
});

test('unmount during a cabinet animation cannot change the next mount or notify the old host',async t=>{
  const env=environment(t),{root}=env,changed=[];
  const first=mountBunko(root,{embedded:true,onWardChange:id=>changed.push(id)});
  void first.changeCabinet(1);assert.equal(env.animations.length,1);
  first.destroy();
  await settle();
  assert.deepEqual(changed,[]);
  root.innerHTML=stage;
  const opened=[],second=mountBunko(root,{embedded:true,wardId:'W_KITA',paused:true,onOpenVolume:id=>opened.push(id)});
  assert.equal(root.querySelector('#scene').dataset.ward,'W_KITA');
  second.openBook();assert.deepEqual(opened,['W_KITA']);
  second.destroy();
  assert.ok(env.listeners.every(signal=>signal.aborted));
  assert.ok(env.observers.every(observer=>!observer.connected));
});

test('home cabinet drag respects reduced motion, selects one ward and supports keyboard return',async t=>{
  const env=environment(t,true),{root}=env,wards=[],opened=[];
  const controller=mountBunko(root,{embedded:true,onWardChange:id=>wards.push(id),onOpenVolume:id=>opened.push(id)});
  assert.ok(root.classList.contains('reduce-motion'));
  pointer(env,'pointerdown',200,100);pointer(env,'pointermove',20,105);pointer(env,'pointerup',20,105);
  await settle();
  assert.deepEqual(wards,['W_UKYO']);
  assert.equal(root.querySelector('#scene').dataset.ward,'W_UKYO');
  assert.deepEqual(opened,[]);
  assert.equal(root.querySelector('#scene').hasPointerCapture(1),false);
  assert.equal(env.animations.length,0,'system motion preference suppresses cabinet transitions');
  root.querySelector('#scene').dispatchEvent(new env.window.KeyboardEvent('keydown',{key:'ArrowLeft',bubbles:true}));
  await settle();
  assert.equal(root.querySelector('#scene').dataset.ward,'W_MINAMI');
  assert.deepEqual(opened,[]);
  controller.destroy();
});

test('vertical, reversed, caress-length and cancelled drags do not switch cabinets or accidentally open',async t=>{
  const env=environment(t),{root}=env,wards=[],opened=[];
  const controller=mountBunko(root,{embedded:true,paused:true,onWardChange:id=>wards.push(id),onOpenVolume:id=>opened.push(id)});
  pointer(env,'pointerdown',200,100);pointer(env,'pointermove',205,180);pointer(env,'pointermove',80,190);pointer(env,'pointerup',80,190);
  pointer(env,'pointerdown',200,100);pointer(env,'pointermove',20,105);pointer(env,'pointermove',200,100);pointer(env,'pointerup',200,100);
  pointer(env,'pointerdown',200,100);pointer(env,'pointermove',60,100);pointer(env,'pointerup',60,100);
  pointer(env,'pointerdown',200,100);pointer(env,'pointermove',20,105);pointer(env,'pointercancel',20,105);pointer(env,'pointerup',20,105);
  await settle();
  assert.deepEqual(wards,[]);assert.deepEqual(opened,[]);
  assert.equal(root.querySelector('#scene').dataset.ward,'W_MINAMI');
  assert.equal(root.querySelector('#scene').hasPointerCapture(1),false);
  controller.destroy();
});

test('the box sways with a caress and returns to rest without changing cabinet',t=>{
  const env=environment(t),{root}=env;
  const controller=mountBunko(root,{embedded:true});
  const canvas=root.querySelector('#scene');
  pointer(env,'pointerdown',200,100);pointer(env,'pointermove',191,100);
  assert.equal(canvas.style.transform,'','inside the dead zone the box rests');
  pointer(env,'pointermove',100,100);
  assert.equal(canvas.style.transform,`translateX(${-(100-14)*.6}px)`);
  pointer(env,'pointerup',100,100);
  assert.equal(canvas.style.transform,'');assert.equal(canvas.dataset.ward,'W_MINAMI');
  controller.destroy();
});

test('preferences and language arrive from the host without remounting the canvas',t=>{
  const env=environment(t),{root}=env;
  const controller=mountBunko(root,{embedded:true,wardId:'W_HIGASHIYAMA',paused:true});
  const canvas=root.querySelector('#scene');
  controller.setPreferences({night:false,paused:false});
  assert.equal(root.classList.contains('night'),false);
  assert.equal(root.classList.contains('reduce-motion'),false);
  controller.setPreferences({night:true,paused:true});
  assert.equal(root.classList.contains('night'),true);
  assert.equal(root.classList.contains('reduce-motion'),true);
  assert.equal(root.querySelector('#scene'),canvas);
  assert.equal(canvas.dataset.ward,'W_HIGASHIYAMA');
  controller.destroy();
});

test('shared play preference cannot override system reduced motion',t=>{
  const {root}=environment(t,true);
  const controller=mountBunko(root,{embedded:true,paused:true});
  controller.setPreferences({night:false,paused:false});
  assert.equal(root.classList.contains('reduce-motion'),true);
  assert.equal(controller.state().still,true);assert.equal(controller.state().systemReduced,true);
  controller.destroy();
});

test('standalone study wraps the same cabinet with its own controls',async t=>{
  const env=environment(t),{root,window}=env;
  const study=mountStudy(root);
  const $=id=>root.querySelector(`#${id}`);
  assert.equal(root.classList.contains('night'),true,'the study also defaults to moonlight');
  assert.equal(window.document.title,'南區文庫｜京都御秘帖');
  $('night').click();
  assert.equal(root.classList.contains('night'),false);assert.equal(window.document.documentElement.dataset.theme,'light');
  $('language').click();
  assert.equal(window.document.documentElement.lang,'ja');assert.equal($('cabinet-name').textContent,'南区の函');
  $('motion').click();
  assert.equal($('motion').getAttribute('aria-pressed'),'true');assert.equal($('demo').disabled,true);
  $('flat').click();assert.equal($('flat').getAttribute('aria-pressed'),'true');
  root.querySelector('[data-material="3"]').click();
  assert.equal(root.querySelector('[data-material="3"]').getAttribute('aria-pressed'),'true');
  $('next-cabinet').click();await settle();
  assert.equal($('scene').dataset.ward,'W_UKYO');assert.equal($('cabinet-number').textContent,'08 / 11');
  // No reader here: the lid opens, stays open, and a second press closes it.
  $('open-book').click();
  assert.equal($('stage').dataset.bookState,'reading');assert.equal($('next-cabinet').disabled,true);
  pointer(env,'pointerdown',200,100);
  assert.equal($('stage').dataset.bookState,'closed');assert.equal($('next-cabinet').disabled,false);
  study.destroy();
  assert.ok(env.listeners.every(signal=>signal.aborted));
});

test('standalone motion control yields to the system preference',t=>{
  const {root}=environment(t,true);
  const study=mountStudy(root);
  assert.equal(root.querySelector('#motion').disabled,true);
  assert.equal(root.querySelector('#motion').getAttribute('aria-pressed'),'true');
  study.destroy();
});
