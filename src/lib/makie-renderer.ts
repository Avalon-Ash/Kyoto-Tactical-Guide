import { createLandmarkAtlas } from './makie-scene';

const VERTEX = `attribute vec2 position; varying vec2 uv;
void main(){ uv=vec2(position.x*.5+.5,.5-position.y*.5); gl_Position=vec4(position,0.,1.); }`;
const FRAGMENT = `precision mediump float;
varying vec2 uv;
uniform sampler2D art, landmarks, owners;
uniform vec2 pointer, anchor, texel;
uniform float selected, strength, night;
// Relight one composite surface. Keeping the motifs fixed avoids a floating decal.
vec3 surfaceAt(vec2 p) {
  vec4 motif=texture2D(landmarks,p);
  return mix(texture2D(art,p).rgb,motif.rgb,motif.a);
}
float heightAt(vec2 p) { return dot(surfaceAt(p),vec3(.3,.59,.11)); }
void main(){
  vec4 motif=texture2D(landmarks,uv);
  vec3 base=surfaceAt(uv);
  vec2 gradient=vec2(heightAt(uv+vec2(texel.x,0.))-heightAt(uv-vec2(texel.x,0.)),heightAt(uv+vec2(0.,texel.y))-heightAt(uv-vec2(0.,texel.y)));
  vec3 normal=normalize(vec3(-gradient*2.,.65));
  // A fixed upper-left key matches the painted roof planes. Pointer adds a small sheen.
  vec3 light=normalize(vec3(vec2(-.35,-.45)+(pointer-.5)*.35,.85));
  float spec=pow(max(dot(normal,normalize(light+vec3(0.,0.,1.))),0.),28.);
  float metal=smoothstep(.09,.6,max(base.r-base.b*.4,0.));
  float own=(1.-step(.025,abs(texture2D(owners,uv).r-selected)))*step(.01,selected);
  // Geographic boundaries are for picking only; never paint their hard edges.
  // A broad, continuous sheen blends the selected landmark into nearby lacquer.
  vec2 toLandmark=(uv-anchor)*vec2(1.,1.1);
  vec2 toPointer=(uv-pointer)*vec2(1.,1.1);
  float sheen=(exp(-dot(toLandmark,toLandmark)*95.)*.65
    +exp(-dot(toPointer,toPointer)*60.)*.35)*strength;
  float detail=own*motif.a*strength;
  vec3 glint=mix(vec3(.94,.76,.43),vec3(.73,.79,.86),night*.7);
  base*=mix(.88,.68,night);
  base*=.92+.12*max(dot(normal,light),0.);
  base+=glint*metal*(spec*(.07+.18*sheen+.24*detail)+.075*detail);
  base=mix(base,base*vec3(.79,.87,1.),night*.65);
  gl_FragColor=vec4(base,1.);
}`;

export interface MakieState { selected:number; pointer:[number,number]; anchor:[number,number]; still:boolean; night:boolean }
export interface MakieRenderer { update(state:MakieState):void; pickLandmark(x:number,y:number):string|null; dispose():void }

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
  let pickLandmark:(x:number,y:number)=>string|null=()=>null;
  let image:HTMLImageElement | undefined, toji:HTMLImageElement | undefined;
  let resize:ResizeObserver | undefined, intersection:IntersectionObserver | undefined;
  const dispose=()=>{
    dead=true; cancelAnimationFrame(frame); resize?.disconnect(); intersection?.disconnect();
    document.removeEventListener('visibilitychange',schedule);
    if(image) { image.onload=null; image.onerror=null; }
    if(toji) { toji.onload=null; toji.onerror=null; }
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
    // The study is optional: a failed asset preserves the original eleven motifs.
    let artLoaded=false, studySettled=false;
    const finish=()=>{
      if(dead || !artLoaded || !studySettled) return;
      try {
        const atlas=createLandmarkAtlas(1536,toji?.naturalWidth ? toji : undefined);
        texture(atlas.color,2,'landmarks'); texture(atlas.owners,3,'owners',true);
        pickLandmark=atlas.pick;
        texture(image!,0,'art'); ready=true; onReady(); schedule();
      } catch { onFailure(); dispose(); }
    };
    image=new Image(); image.onload=()=>{artLoaded=true;finish();};
    image.onerror=()=>{onFailure();dispose();};
    toji=new Image();
    toji.onload=toji.onerror=()=>{studySettled=true;finish();};
    toji.src='/art/toji-makie-study.webp';
    image.src='/art/kyoto-makie-relief.jpg';
    resize=new ResizeObserver(schedule); resize.observe(canvas);
    intersection=new IntersectionObserver(entries=>{visible=entries[0]?.isIntersecting??true;schedule();}); intersection.observe(canvas);
    document.addEventListener('visibilitychange',schedule);
    return {update(next){state=next;schedule();},pickLandmark:(x,y)=>pickLandmark(x,y),dispose};
  } catch(error) {dispose();throw error;}
}
