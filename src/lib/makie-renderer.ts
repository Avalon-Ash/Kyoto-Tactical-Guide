import { createWardMask, createLandmarkTexture } from './makie-scene';

const VERTEX = `attribute vec2 position; varying vec2 uv;
void main(){ uv=vec2(position.x*.5+.5,.5-position.y*.5); gl_Position=vec4(position,0.,1.); }`;
const FRAGMENT = `precision mediump float;
varying vec2 uv;
uniform sampler2D art, wards, landmarks;
uniform vec2 pointer, anchor, texel;
uniform float selected, strength, night;
float heightAt(vec2 p) { vec3 c=texture2D(art,p).rgb; return dot(c,vec3(.3,.59,.11)); }
float chosen(vec2 p) { return (1.-step(.025,abs(texture2D(wards,p).r-selected)))*step(.01,selected); }
void main(){
  vec3 base=texture2D(art,uv).rgb;
  float region=chosen(uv);
  float edge=abs(region-chosen(uv+vec2(texel.x*1.3,0.)))+abs(region-chosen(uv+vec2(0.,texel.y*1.3)));
  vec2 gradient=vec2(heightAt(uv+vec2(texel.x,0.))-heightAt(uv-vec2(texel.x,0.)),heightAt(uv+vec2(0.,texel.y))-heightAt(uv-vec2(0.,texel.y)));
  vec3 normal=normalize(vec3(-gradient*2.,.65));
  vec3 light=normalize(vec3((pointer-uv)*1.8,.6));
  float spec=pow(max(dot(normal,normalize(light+vec3(0.,0.,1.))),0.),24.);
  float gold=smoothstep(.06,.55,max(base.r-base.b*.6,0.));
  float focus=exp(-dot((uv-anchor)*vec2(1.,1.1),(uv-anchor)*vec2(1.,1.1))*160.);
  vec2 motifUV=uv;
  // Only the chosen landmark lifts; district geometry and hit testing remain stationary.
  if (distance(uv,anchor)<.085) motifUV=anchor+(uv-anchor)/(1.+strength*.08)+vec2(0.,strength*.003);
  vec4 motif=texture2D(landmarks,motifUV);
  base*=mix(.86,.68,night);
  base+=vec3(.34,.23,.08)*region*gold*strength;
  base+=vec3(1.,.78,.37)*spec*gold*(.06+.35*strength*region);
  base+=vec3(.40,.27,.10)*edge*strength*.55;
  base=mix(base,motif.rgb*(.9+focus*strength*.6),motif.a);
  base+=vec3(.18,.11,.035)*focus*strength*(gold+motif.a);
  base=mix(base,base*vec3(.79,.87,1.),night*.65);
  gl_FragColor=vec4(base,1.);
}`;

export interface MakieState { selected:number; pointer:[number,number]; anchor:[number,number]; still:boolean; night:boolean }
export interface MakieRenderer { update(state:MakieState):void; dispose():void }

/** Native WebGL 2.5D material, no render loop while idle/offscreen. */
export function createMakieRenderer(canvas: HTMLCanvasElement, onReady:()=>void, onFailure:()=>void): MakieRenderer {
  const gl = canvas.getContext('webgl', { alpha:false, antialias:false, powerPreference:'low-power' });
  if (!gl) throw new Error('WebGL unavailable');
  const resources: (()=>void)[] = [];
  const compile = (type:number,source:string) => {
    const shader=gl.createShader(type);
    if (!shader) throw new Error('Shader allocation failed');
    resources.push(()=>gl.deleteShader(shader)); gl.shaderSource(shader,source); gl.compileShader(shader);
    if (!gl.getShaderParameter(shader,gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader) ?? 'Shader compilation failed');
    return shader;
  };
  let dead=false, ready=false, visible=true, frame=0, previous=0, strength=0;
  let state:MakieState={selected:0,pointer:[.5,.5],anchor:[.5,.5],still:false,night:false};
  let image:HTMLImageElement | undefined;
  let resize:ResizeObserver | undefined, intersection:IntersectionObserver | undefined;
  const dispose=()=>{
    dead=true; cancelAnimationFrame(frame); resize?.disconnect(); intersection?.disconnect();
    document.removeEventListener('visibilitychange',schedule);
    if(image) { image.onload=null; image.onerror=null; }
    resources.reverse().forEach(remove=>remove());
  };
  function schedule() {
    if(!dead && ready && visible && !document.hidden && !frame) frame=requestAnimationFrame(draw);
  }
  let draw:(time:number)=>void = ()=>{};
  try {
    const program=gl.createProgram();
    if(!program) throw new Error('Program allocation failed');
    resources.push(()=>gl.deleteProgram(program));
    gl.attachShader(program,compile(gl.VERTEX_SHADER,VERTEX)); gl.attachShader(program,compile(gl.FRAGMENT_SHADER,FRAGMENT)); gl.linkProgram(program);
    if(!gl.getProgramParameter(program,gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) ?? 'Program link failed');
    gl.useProgram(program);
    const buffer=gl.createBuffer(); resources.push(()=>gl.deleteBuffer(buffer));
    gl.bindBuffer(gl.ARRAY_BUFFER,buffer); gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
    const position=gl.getAttribLocation(program,'position'); gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
    const locations=Object.fromEntries(['selected','strength','night','pointer','anchor','texel'].map(name=>[name,gl.getUniformLocation(program,name)]));
    const texture=(source:TexImageSource,unit:number,name:string,nearest=false)=>{
      const t=gl.createTexture(); if(!t) throw new Error('Texture allocation failed'); resources.push(()=>gl.deleteTexture(t));
      gl.activeTexture(gl.TEXTURE0+unit); gl.bindTexture(gl.TEXTURE_2D,t);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,nearest?gl.NEAREST:gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,nearest?gl.NEAREST:gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,source); gl.uniform1i(gl.getUniformLocation(program,name),unit);
    };
    texture(createWardMask(1024),1,'wards',true);
    texture(createLandmarkTexture(1536),2,'landmarks');
    draw=(time)=>{
      frame=0; if(dead || !ready || !visible || document.hidden) return;
      const target=state.selected ? 1 : 0;
      const dt=Math.min(time-previous,50); previous=time;
      strength=state.still?target:strength+(target-strength)*(1-Math.exp(-dt/75));
      if(Math.abs(target-strength)<.003) strength=target;
      const dpr=Math.min(window.devicePixelRatio || 1,1.5);
      const width=Math.max(1,Math.round(canvas.clientWidth*dpr)),height=Math.max(1,Math.round(canvas.clientHeight*dpr));
      if(canvas.width!==width || canvas.height!==height) {canvas.width=width;canvas.height=height;}
      gl.viewport(0,0,width,height); gl.useProgram(program);
      gl.uniform1f(locations.selected,state.selected); gl.uniform1f(locations.strength,strength); gl.uniform1f(locations.night,state.night?1:0);
      gl.uniform2fv(locations.pointer,state.still?state.anchor:state.pointer); gl.uniform2fv(locations.anchor,state.anchor);
      gl.uniform2f(locations.texel,1/1536,1/1536); gl.drawArrays(gl.TRIANGLES,0,6);
      if(strength!==target && !state.still) schedule();
    };
    image=new Image(); image.onload=()=>{
      if(dead) return;
      try { texture(image!,0,'art'); ready=true; onReady(); schedule(); }
      catch { onFailure(); dispose(); }
    }; image.onerror=()=>{onFailure();dispose();}; image.src='/art/kyoto-makie-relief.jpg';
    resize=new ResizeObserver(schedule); resize.observe(canvas);
    intersection=new IntersectionObserver(entries=>{visible=entries[0]?.isIntersecting??true;schedule();}); intersection.observe(canvas);
    document.addEventListener('visibilitychange',schedule);
    return {update(next){state=next;schedule();},dispose};
  } catch(error) {dispose();throw error;}
}
