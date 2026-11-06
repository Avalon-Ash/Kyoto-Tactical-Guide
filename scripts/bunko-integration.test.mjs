import test, {before,after} from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {createServer} from 'vite';

let server,mountBunko,markup,createLibrary;
before(async()=>{
  server=await createServer({server:{middlewareMode:true,hmr:false},appType:'custom'});
  ({mountBunko}=await server.ssrLoadModule('/src/studies/toji/study.js'));
  ({BUNKO_MARKUP:markup}=await server.ssrLoadModule('/src/studies/toji/template.ts'));
  ({createBunkoLibrary:createLibrary}=await server.ssrLoadModule('/src/studies/toji/library.ts'));
  const {loadSpotsByWard}=await server.ssrLoadModule('/src/data/spots-loader.ts');
  // Finish real dynamic imports before tests intentionally tear down the reader.
  for(const [ward,lang] of [['W_HIGASHIYAMA','ja'],['W_HIGASHIYAMA','zh'],['W_KITA','zh']])await loadSpotsByWard(ward,lang);
});

test('pictogram filters combine search, retain category on locale change and clear together',async t=>{
  const {root,window}=environment(t);
  const library=createLibrary(()=>{},()=>{},root);
  const settle=async()=>{for(let i=0;i<20;i++)await Promise.resolve();};
  library.prepare('zh','W_HIGASHIYAMA');await settle();
  const count=()=>root.querySelectorAll('.volume-entry').length;
  const total=count();assert.ok(total>0);
  const temple=root.querySelector('[data-type="T_TEMPLE"]');temple.click();
  assert.equal(temple.getAttribute('aria-pressed'),'true');assert.ok(count()>0&&count()<total);
  const search=root.querySelector('#volume-search');search.value='清水';search.dispatchEvent(new window.Event('input'));
  assert.ok(count()>0);assert.ok([...root.querySelectorAll('.entry-name')].some(n=>n.textContent.includes('清水')));
  library.setLanguage('ja');await settle();
  assert.equal(root.querySelector('[data-type="T_TEMPLE"]').getAttribute('aria-pressed'),'true');
  assert.equal(root.querySelector('#map-label').textContent,'地図');
  root.querySelector('#clear-search').click();assert.equal(count(),total);assert.equal(search.value,'');
  assert.equal(root.querySelector('[data-type=""]').getAttribute('aria-pressed'),'true');
  assert.equal(window.document.activeElement,search);
  library.destroy();
});
after(async()=>{await server?.close();});

function environment(t,reduced=false){
  const dom=new JSDOM('<!doctype html><html lang="zh-Hant"><head><title>Main site</title></head><body><div class="bunko"></div></body></html>',{url:'http://localhost/'});
  const {window}=dom,root=window.document.querySelector('.bunko');root.innerHTML=markup;
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
  window.HTMLElement.prototype.setPointerCapture=function(id){this.capturedPointer=id;};
  window.HTMLElement.prototype.hasPointerCapture=function(id){return this.capturedPointer===id;};
  window.HTMLElement.prototype.releasePointerCapture=function(){this.capturedPointer=undefined;};
  window.HTMLDialogElement.prototype.showModal=function(){this.open=true;};
  window.HTMLDialogElement.prototype.close=function(){this.open=false;};
  window.HTMLElement.prototype.animate=function(){
    let resolve;const finished=new Promise(done=>{resolve=done;});
    const animation={finished,cancel:()=>resolve(),finish:()=>resolve()};animations.push(animation);return animation;
  };
  return {root,window,observers,listeners,animations,pendingFrames};
}

test('embedded reader remains usable without WebGL, shares language/ward, and releases its lifetime',async t=>{
  const env=environment(t),{root,window}=env,selected=[],languages=[];
  const controller=mountBunko(root,{embedded:true,language:'ja',wardId:'W_HIGASHIYAMA',paused:true,
    onExploreWard:id=>selected.push(id),onLanguageChange:lang=>languages.push(lang)});
  assert.equal(root.querySelector('#scene').dataset.renderer,'failed');
  assert.ok(root.classList.contains('night'),'home defaults to moonlight');
  assert.equal(root.querySelector('#cabinet-name').textContent,'東山区の函');
  assert.equal(window.document.title,'Main site','embedded renderer must not overwrite the host title');
  pointer(env,'pointerdown',200,100);pointer(env,'pointerup',200,100);
  assert.equal(root.querySelector('#library').open,true,'fallback canvas opens without a separate button');
  root.querySelector('#volume-language').click();assert.deepEqual(languages,['zh']);
  root.querySelector('#volume-map').click();assert.deepEqual(selected,['W_HIGASHIYAMA']);
  controller.destroy();controller.destroy();
  await Promise.resolve();
  assert.equal(root.querySelector('#library').open,false);
  assert.ok(env.listeners.length>10&&env.listeners.every(signal=>signal.aborted));
  assert.ok(env.observers.every(observer=>!observer.connected));
  assert.equal(env.pendingFrames.size,0);
});

test('unmount during a cabinet animation cannot change the next mount or notify the old host',async t=>{
  const env=environment(t),{root}=env,changed=[];
  const first=mountBunko(root,{embedded:true,onWardChange:id=>changed.push(id)});
  root.querySelector('#next-cabinet').click();assert.equal(env.animations.length,1);
  first.destroy();
  for(let i=0;i<5;i++)await Promise.resolve();
  assert.deepEqual(changed,[]);
  root.innerHTML=markup;
  const second=mountBunko(root,{embedded:true,wardId:'W_KITA',paused:true});
  assert.equal(root.querySelector('#scene').dataset.ward,'W_KITA');
  root.querySelector('#open-book').click();assert.equal(root.querySelector('#library').open,true);
  second.destroy();
  assert.ok(env.listeners.every(signal=>signal.aborted));
  assert.ok(env.observers.every(observer=>!observer.connected));
});

function pointer(env,type,x,y,id=1){
  const event=new env.window.Event(type,{bubbles:true,cancelable:true});
  Object.assign(event,{pointerId:id,pointerType:'mouse',button:0,clientX:x,clientY:y});
  env.root.querySelector('#scene').dispatchEvent(event);
}

test('home cabinet drag respects reduced motion, selects one ward and supports keyboard return',async t=>{
  const env=environment(t,true),{root}=env,wards=[];
  const controller=mountBunko(root,{embedded:true,onWardChange:id=>wards.push(id)});
  assert.ok(root.classList.contains('reduce-motion'));
  pointer(env,'pointerdown',200,100);pointer(env,'pointermove',100,105);pointer(env,'pointerup',100,105);
  for(let i=0;i<5;i++)await Promise.resolve();
  assert.deepEqual(wards,['W_UKYO']);
  assert.equal(root.querySelector('#scene').dataset.ward,'W_UKYO');
  assert.equal(root.querySelector('#library').open,false);
  assert.equal(root.querySelector('#scene').hasPointerCapture(1),false);
  assert.equal(env.animations.length,0,'system motion preference suppresses cabinet transitions');
  root.querySelector('#scene').dispatchEvent(new env.window.KeyboardEvent('keydown',{key:'ArrowLeft',bubbles:true}));
  for(let i=0;i<5;i++)await Promise.resolve();
  assert.equal(root.querySelector('#scene').dataset.ward,'W_MINAMI');
  assert.equal(root.querySelector('#library').open,false);
  controller.destroy();
});

test('vertical, reversed, short and cancelled drags do not switch cabinets or accidentally open',async t=>{
  const env=environment(t),{root}=env,wards=[];
  const controller=mountBunko(root,{embedded:true,paused:true,onWardChange:id=>wards.push(id)});
  pointer(env,'pointerdown',200,100);pointer(env,'pointermove',205,180);pointer(env,'pointermove',80,190);pointer(env,'pointerup',80,190);
  pointer(env,'pointerdown',200,100);pointer(env,'pointermove',100,105);pointer(env,'pointermove',200,100);pointer(env,'pointerup',200,100);
  pointer(env,'pointerdown',200,100);pointer(env,'pointermove',180,100);pointer(env,'pointerup',180,100);
  pointer(env,'pointerdown',200,100);pointer(env,'pointermove',100,105);pointer(env,'pointercancel',100,105);pointer(env,'pointerup',100,105);
  for(let i=0;i<5;i++)await Promise.resolve();
  assert.deepEqual(wards,[]);
  assert.equal(root.querySelector('#scene').dataset.ward,'W_MINAMI');
  assert.equal(root.querySelector('#library').open,false);
  assert.equal(root.querySelector('#scene').hasPointerCapture(1),false);
  controller.destroy();
});
