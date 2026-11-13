// GLSL ES 3.00 for the makie plate and its box.
// The lacquer is built the way the craft builds it: black ground, powder sprinkled in sizes, amber lacquer over it,
// polished back. Powder is resolved flake by flake only where a flake covers a few pixels; below that it is
// its own average, so a distant lid is calm and a close one is grainy — and nothing shimmers in between.

export const GROUND = `
uniform sampler2DArray uSoft, uIdent;
uniform vec4 uA[64], uB[64];
const vec2 HALF=vec2(360.,230.);
const float SWELL=17.;
// Height of the lid's own surface: a shallow dome, plus the banks, which swell as they wake.
float groundY(vec2 p){
  vec2 c=clamp(p,-HALF,HALF),uv=(c+HALF)/(2.*HALF);
  ivec3 sz=textureSize(uIdent,0);
  int id=int(texelFetch(uIdent,ivec3(clamp(ivec2(uv*vec2(sz.xy)),ivec2(0),sz.xy-1),0),0).r*255.+.5);
  float dome=3.2*(1.-(p.x/370.)*(p.x/370.))*(1.-(p.y/240.)*(p.y/240.));
  vec2 e=1.-smoothstep(HALF-44.,HALF-6.,abs(c));
  return dome+textureLod(uSoft,vec3(uv,0.),0.).r*SWELL*mix(.3,1.,uA[id].z)*e.x*e.y;
}`;
// How far a part's body stands off its own plane, 0..1, from the blurred silhouette (hs) and the drawn one (fa).
// A steep rounded wall just outside the drawing, then a dome: an inflated solid, not a cut-out. Shapes too thin to
// inflate keep a low body of their own.
const BODY = `
float bodyS(float hs){return smoothstep(.30,.50,hs)*.58+smoothstep(.46,.97,hs)*.42;}
float body(float hs,float fa){return max(bodyS(hs),fa*.3);}`;

// The box and the lid's ground.
export const boxVert = mode => `#version 300 es
#define MODE ${mode}
precision highp float; precision highp sampler2DArray;
in vec3 aPos, aNormal; in vec2 aUv, aMeta;
uniform mat4 uCamera; uniform mat3 uTilt; uniform float uOpening;
${GROUND}
out vec3 vWorld, vNormal, vTanX, vTanZ; out vec2 vUv, vMeta; out vec4 vPart;
void main(){
  vec3 p=aPos, n=aNormal;
#if MODE==1
  p.y=groundY(aUv);
#endif
  if(aMeta.y<.5){p.y+=uOpening*360.;p.z-=uOpening*650.;}
  vTanX=vec3(1.,0.,0.);vTanZ=vec3(0.,0.,1.);
  if(aMeta.x<24.5||aMeta.x>27.5||abs(aMeta.x-26.)<.5){vec3 c=vec3(0.,-48.,0.);p=uTilt*(p-c)+c;n=uTilt*n;vTanX=uTilt*vTanX;vTanZ=uTilt*vTanZ;}
  vWorld=p;vNormal=n;vUv=aUv;vMeta=aMeta;vPart=vec4(0.);
  gl_Position=uCamera*vec4(p,1.);
}`;

// A part of the plate hinges up from the lid on its foot line.
// MODE 5 (depth), 2 (colour) and 7 (depth as the lamp sees it) draw the solid: a grid over each group, pushed out
// along the part's normal into a thick rounded body. MODE 4 (mist) draws one flat quad per part.
export const partVert = mode => `#version 300 es
#define MODE ${mode}
precision highp float; precision highp sampler2DArray;
in vec2 aPos; in vec4 aPart, aInfo;
uniform mat4 uCamera; uniform mat3 uTilt; uniform float uOpening; uniform vec3 uLamp;
uniform sampler2DArray uFine;
${GROUND}
${BODY}
invariant gl_Position;
out vec3 vWorld, vNormal, vTanX, vTanZ; out vec2 vUv, vMeta; out vec4 vPart;
void main(){
  int id=int(aPart.x+.5);
  vec4 A=uA[id],B=uB[id];
  float foot=aPart.z,theta=A.y*abs(aInfo.z),ct=cos(theta),st=sin(theta);
  // Sway turns the picture in its own plane about its anchor.
  vec2 r=aPos-aInfo.xy;float cs=cos(A.x),sn=sin(A.x);
  vec2 q=aInfo.xy+vec2(cs*r.x-sn*r.y,sn*r.x+cs*r.y)+B.xy;
  float h=foot-q.y;
  vec3 n=vec3(0.,ct,st),down=vec3(0.,-st,ct);
  // Even asleep a part keeps most of its body: it is a solid thing lying on the lid.
  float thick=aPart.w*mix(.72,1.,A.z)*mix(.78,1.,A.y),slice=0.;
#if MODE==2||MODE==5||MODE==7
  vec3 tuv=vec3((aPos+HALF)/(2.*HALF),aPart.y);
  slice=body(textureLod(uSoft,tuv,0.).r,textureLod(uFine,tuv,1.).a);
#endif
  // Lying down, a part follows the banks under it; standing, it is rooted along its whole foot line. Either way
  // the ground never comes up through it. A layer that rides on another keeps clear of the body beneath (bias)
  // by the same share of its height that the body itself keeps asleep.
  float up=abs(aInfo.z)>0.?smoothstep(.1,.7,A.y):0.;
  float gy=mix(groundY(q),groundY(vec2(q.x,foot)),up);
  float offset=aInfo.w*mix(.6,1.,A.y)+slice*thick;
  // A tree rider uses its carrier's rigid root plane; a thin foot meets the real twig surface.
  if(aInfo.z<0.){gy=groundY(aInfo.xy)+.25;offset=aInfo.w+(slice-.3)*thick;}
  vec3 p=vec3(q.x,gy+B.z+.35,foot)-down*h+n*offset;
  p.y+=uOpening*360.;p.z-=uOpening*650.;
  vec3 c=vec3(0.,-48.,0.);p=uTilt*(p-c)+c;
  vWorld=p;vNormal=uTilt*n;vTanX=uTilt*vec3(1.,0.,0.);vTanZ=uTilt*down;
  vUv=aPos;vMeta=q;vPart=vec4((MODE==2||MODE==5||MODE==7)?B.w:aPart.x,aPart.y,slice,thick);
  gl_Position=uCamera*vec4(p,1.);
}`;

export const BLUR_VERT = `#version 300 es
out vec2 vUv;
void main(){vec2 p=vec2(float(gl_VertexID&1),float(gl_VertexID>>1))*2.;vUv=p;gl_Position=vec4(p*2.-1.,0.,1.);}`;
// Separable Gaussian. Pass 0 reads one layer of the painted array (its red channel, already mip-reduced);
// pass 1 reads the intermediate texture.
export const BLUR_FRAG = `#version 300 es
precision highp float; precision highp sampler2DArray;
in vec2 vUv; uniform sampler2DArray uArray; uniform sampler2D uTex; uniform int uPass; uniform float uLayer; uniform vec2 uStep;
out vec4 o;
void main(){
  float sum=0.,norm=0.;
  for(int i=-7;i<=7;i++){
    float w=exp(-float(i*i)/14.);vec2 uv=vUv+uStep*float(i);
    sum+=w*(uPass==0?textureLod(uArray,vec3(uv,uLayer),2.).r:texture(uTex,uv).r);norm+=w;
  }
  o=vec4(sum/norm,0.,0.,1.);
}`;

// One fragment shader, compiled once per MODE so each pass carries only what it needs:
//   0 box   1 the lid's ground   2 a slice of a part (colour)   4 mist   5 a slice (depth only)
//   6 the shadow the box lays on what it stands on   7 a slice as the lamp sees it (the shade's depth picture)
export const frag = (mode, tree = 0) => `#version 300 es
#define MODE ${mode}
#define TREE ${tree}
precision highp float; precision highp sampler2DArray;
in vec3 vWorld, vNormal, vTanX, vTanZ; in vec2 vUv, vMeta; in vec4 vPart;
uniform sampler2DArray uFine, uSoft, uIdent;
#if TREE==1||TREE==2
uniform sampler2DArray uStamps;
in vec4 vTree; in vec2 vScale;
#endif
uniform vec3 uView, uKey, uLamp;
uniform float uTime, uNight, uPresence, uPx, uOpening;
uniform vec4 uA[64], uB[64];
uniform vec3 uTrails[20];
out vec4 outColor;

const vec2 HALF=vec2(360.,230.);
const vec3 GOLD=vec3(1.,.70,.26), PALE=vec3(.98,.84,.48), SILVER=vec3(.84,.85,.83), LACQ=vec3(.020,.015,.013), AMBER=vec3(1.,.86,.58);
const float SWELL=17., AMB=.17, KEY=.44, POOL=1.75, SHADE=.86;
const mat2 R1=mat2(.940,.342,-.342,.940),R2=mat2(.766,-.643,.643,.766),R3=mat2(.5,.866,-.866,.5);

vec3 puv(vec2 q,int layer){return vec3((q+HALF)/(2.*HALF),float(layer));}
ivec2 ident(vec2 p,int layer){
  ivec3 sz=textureSize(uIdent,0);
  return ivec2(texelFetch(uIdent,ivec3(clamp(ivec2((p+HALF)/(2.*HALF)*vec2(sz.xy)),ivec2(0),sz.xy-1),layer),0).rg*255.+.5);
}
${BODY}

#if MODE==6
void main(){
  vec2 d=max(abs(vWorld.xz-vec2(-34.,26.))-vec2(360.,232.),0.);
  outColor=vec4(0.,0.,0.,exp(-dot(d,d)/2600.)*mix(.34,.5,uNight)*(1.-uOpening*.2));
}
#elif MODE==5||MODE==7
void main(){
  if(uOpening>.999)discard;
#if TREE>0
  float alpha=1.;
#if TREE==2
  float cover=texture(uStamps,vTree.xyz).g;
  alpha=clamp((cover-.5)/max(fwidth(cover),.02)+.5,0.,1.);
  if(alpha<(MODE==7?.5:.04))discard;
#endif
  outColor=vec4(0.,0.,0.,alpha);
#else
  int layer=int(vPart.y+.5);ivec2 im=ident(vUv,layer);
  vec4 fine=texture(uFine,puv(vUv,layer));float hs=texture(uSoft,puv(vUv,layer)).r;
  vec4 A=uA[im.x];
  // The solid's own outline: the foot of its wall, or the drawn edge where the shape is too thin to have one.
  if(im.x==0||int(uB[im.x].w+.5)!=int(vPart.x+.5))discard;
  float alpha=max(clamp((hs-.31)/max(fwidth(hs)*1.4,.002)+.5,0.,1.),clamp((fine.a-.5)/max(fwidth(fine.a)*1.4,.004)+.5,0.,1.));
  if(im.y==11)alpha*=smoothstep(.02,.35,A.z);
  if(alpha<(MODE==7?.5:.04))discard;
  outColor=vec4(0.,0.,0.,alpha);
#endif
}
#else

float hash(vec2 p){vec3 q=fract(vec3(p.xyx)*.1031);q+=dot(q,q.yzx+33.33);return fract((q.x+q.y)*q.z);}
vec2 hash2(vec2 p){vec3 q=fract(vec3(p.xyx)*vec3(.1031,.1030,.0973));q+=dot(q,q.yzx+33.33);return fract((q.xx+q.yz)*q.zy);}
float vnoise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+1.),f.x),f.y);}

// Light, shared by every material of this fragment. The colours belong to the lights, not to the gold:
// by night the room is cool and dim, and the gold is gold again wherever the hand's light falls.
vec3 gN, gHk, gHp, gKeyC, gPoolC, gAmbC; float gAtt, gDk, gDp, gWake, gSh=1.;
vec3 light(){return AMB*gAmbC+(KEY*gDk*gKeyC+POOL*gAtt*gDp*gPoolC)*gSh;}
vec3 spec(float e){return (KEY*pow(max(dot(gN,gHk),0.),e)*gKeyC+POOL*gAtt*pow(max(dot(gN,gHp),0.),e)*gPoolC)*gSh;}
#if MODE==1||MODE==2
// Shade: the solids are drawn once more as the lamp sees them, into a depth picture; every point of the lid and of
// every solid asks that picture whether the lamp reaches it. A shadow therefore starts where the thing itself
// meets the lid, falls across whatever lies behind it, and needs no drawing of its own.
uniform highp sampler2DShadow uShade; uniform mat4 uShadeMat;
float shadeAt(vec3 w){
  vec4 t=uShadeMat*vec4(w,1.);vec3 q=t.xyz/t.w*.5+.5;
  if(q.x<=0.||q.x>=1.||q.y<=0.||q.y>=1.||q.z>=1.)return 1.;
  vec2 px=1.5/vec2(textureSize(uShade,0));float s=0.;
  for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++)s+=texture(uShade,vec3(q.xy+vec2(float(i),float(j))*px,q.z-.0006));
  return s/9.;
}
#endif
// What a polished surface mirrors: a dim room with a papered window high on the key side.
vec3 room(float rough){
  vec3 r=reflect(-uView,gN);
  float up=smoothstep(-.35,1.,r.y),win=smoothstep(mix(.74,.15,rough),1.,dot(r,uKey));
  return gAmbC*(.04+.30*up*up)+gKeyC*win*mix(1.15,.5,rough);
}
void setLight(vec3 n){
  gN=n;
  gKeyC=mix(vec3(1.,.95,.86),vec3(.64,.72,.90),uNight);
  gPoolC=mix(vec3(1.,.93,.80),vec3(.96,.96,1.),uNight);
  gAmbC=mix(vec3(1.,.96,.90),vec3(.50,.60,.84),uNight);
  vec3 toLamp=uLamp-vWorld;float d2=dot(toLamp,toLamp);vec3 lp=toLamp*inversesqrt(d2);
  gAtt=(uPresence/(1.+d2/24000.))+gWake*.55;
  gDk=max(dot(n,uKey),0.);gDp=max(dot(n,lp),0.);
  gHk=normalize(uKey+uView);gHp=normalize(lp+uView);
}
// One size of powder. Returns its coverage; glint is its sparkle. A flake is drawn only where it spans a few
// pixels; below that the layer is its own average, so nothing shimmers between sizes.
float flake(vec2 p,float cell,float size,float dens,float sq,float spread,out vec3 glint){
  float vis=smoothstep(1.3,3.2,cell/uPx);
  dens=min(dens,1.);
  float avg=dens*mix(1.95,3.57,sq)*size*size;
  vec3 broad=(KEY*pow(max(dot(gN,gHk),0.),12.)*gKeyC+POOL*gAtt*pow(max(dot(gN,gHp),0.),12.)*gPoolC)*gSh;
  vec2 g=p/cell,id=floor(g),r=hash2(id);
  float present=step(hash(id+7.31),dens);
  float sz=size*mix(1.,.55+.45*hash(id+11.3),1.-sq*.6);
  vec2 d=fract(g)-(.5+(r-.5)*(1.-2.*sz));
  float a=(hash(id+3.17)-.5)*mix(6.283,.5,sq),ca=cos(a),sa=sin(a);d=vec2(ca*d.x-sa*d.y,sa*d.x+ca*d.y);
  float ang=atan(d.y,d.x);
  float round_=length(d)*(1.+.26*sin(ang*3.+r.x*6.3)+.16*sin(ang*4.+r.y*9.)+.08*sin(ang*7.+r.x*4.));
  float dist=mix(round_,max(abs(d.x),abs(d.y)*mix(.8,1.25,r.x)),sq),aa=uPx/cell*.75;
  float cov=present*(1.-smoothstep(sz-aa,sz+aa,dist));
  vec3 nf=normalize(gN+vec3(r.x-.5,0.,r.y-.5)*spread);
  vec3 gl=(KEY*.45*pow(max(dot(nf,gHk),0.),70.)*gKeyC+POOL*gAtt*pow(max(dot(nf,gHp),0.),70.)*gPoolC)*gSh;
  glint=mix(avg*broad*.55,cov*gl*2.6,vis);
  return mix(avg,cov,vis);
}
vec3 coat(){return vec3(1.,.95,.86)*(spec(220.)*.42+spec(36.)*.10)+room(0.)*.045;}
// Nashiji: powder at three depths in amber lacquer. The deepest is never seen grain by grain: it is the glow of
// the ground itself. The amber takes more of the light the deeper a flake lies, so depth reads as colour.
vec3 nashiji(vec2 p,float dens,vec3 tint){
  vec3 L=light(),ga,gb,gc;
  float a=flake(R1*p,.62,.47,dens*1.05,0.,.55,ga),b=flake(R2*p+13.7,1.35,.45,dens*.78,0.,.5,gb),c=flake(R3*p+41.3,2.5,.38,dens*.15,0.,.4,gc);
  vec3 col=LACQ*(.6+L)+tint*vec3(.55,.26,.07)*min(dens,1.3)*(.03+.28*L);
  col=mix(col,tint*vec3(.92,.55,.19)*(.05+.58*L),a*.85);
  col=mix(col,tint*vec3(1.,.70,.30)*(.06+.78*L),b*.9);
  col=mix(col,tint*vec3(1.,.78,.40)*(.07+.86*L),c);
  return col+tint*AMBER*(ga*.8+gb*1.3+gc)+coat();
}
// Polished gold powder: a satin metal that carries the room on its curves. Asleep, it lies under the lacquer.
vec3 metal(vec2 p,vec3 f0,float rise){
  vec3 g;flake(p,.5,.4,.9,0.,.35,g);
  vec3 c=f0*f0*(.04+.30*light())+f0*room(.7)*.85+mix(f0,vec3(1.),.14)*(spec(34.)*.8+spec(9.)*.10+g*.5);
  return mix(c*vec3(.80,.60,.36)*.8,c,smoothstep(.12,.85,rise));
}
// Cut sheet metal, laid flat: a mirror.
vec3 sheet(vec3 f0){return f0*(.05+.18*light()+room(.12)*.8)+mix(f0,vec3(1.),.5)*(spec(160.)*1.5+spec(18.)*.18);}
vec4 finish(vec3 c,float a){
  // Compress by luminance so a bright gold stays gold; only the very brightest glints bleach.
  c*=1.25;float l=max(dot(c,vec3(.3,.55,.15)),1e-4),t=l/(1.+l*.42);
  c=mix(c*(t/l),vec3(t),smoothstep(.9,2.6,l)*.55);c=min(c,vec3(1.));
  c=mix(c,c*vec3(.92,.96,1.05)+vec3(.003,.005,.009),uNight*.6);
  return vec4(pow(c,vec3(.4545))*a,a);
}

#if MODE==0
void main(){
  if(uOpening>.999&&vMeta.y<.5)discard;
  int m=int(vMeta.x+.5);
  gWake=0.;
  setLight(normalize(vNormal));
  // Everything on the box is nashiji, metal or sheet in some proportion.
  float cloud=vnoise(vUv*vec2(.012,.05))*.6+vnoise(vUv*vec2(.04,.11))*.3;
  float side=float(m==20),inner=float(m==22||m==28);
  // Inside, the box is dense pale nashiji gathered in soft clouds (mura-nashiji); the tray's floor is denser still.
  vec3 c=(side+inner)*nashiji(vUv,mix(.5+.5*cloud,.85+.5*cloud+.3*float(m==28),inner),mix(GOLD,PALE,inner))*mix(1.,.9,inner);
  if(m==20||m==28){
    // A drift of larger flakes crosses the sides and the tray.
    vec3 bg;float bx=flake(R2*vUv,5.,.42,.4*smoothstep(.55,.9,vnoise(vUv*vec2(.006,.07)+3.)),0.,.3,bg);
    c=mix(c,GOLD*vec3(1.,.80,.44)*(.07+.72*light()),bx*.9)+GOLD*bg;
  }
  if(m==20){
    // The sides carry the picture on: water drawn in fine gold lines running round the box, cut gold scattered
    // along it, and a single line under the lid.
    float y=vUv.y,x=vUv.x,wv=sin(x*.021)*5.+sin(x*.047+1.3)*2.5;
    float d1=abs(y+64.+wv),d2=abs(y+71.+wv*.7+sin(x*.09)*1.5),d3=abs(y+57.+wv*1.2+sin(x*.06+2.)*2.),d4=abs(y+19.+wv*.35);
    float aa=max(uPx*.9,.25);
    float ln=max(max(1.-smoothstep(.55-aa,.55+aa,d1),1.-smoothstep(.4-aa,.4+aa,d2)),max((1.-smoothstep(.35-aa,.35+aa,d3))*step(.2,sin(x*.013+1.)),1.-smoothstep(.45-aa,.45+aa,d4)));
    c=mix(c,metal(vUv,GOLD,1.),ln);
    vec3 kg;float kx=flake(vUv*vec2(1.,1.)+7.,5.4,.30,.75*exp(-d1*d1/150.)*(.35+.65*vnoise(vec2(x*.03,2.))),1.,.26,kg);
    c=mix(c,sheet(GOLD)+GOLD*(.10+.25*light()),kx)+GOLD*kg*.6;
  }
  else if(m==27){
    // Kumihimo: vermilion silk, braided; a gold collar, then the tassel's loose threads.
    float braid=.5+.5*sin(vUv.y*1.7+vUv.x*2.)*sin(vUv.y*1.7-vUv.x*2.),tassel=smoothstep(64.,66.,vUv.y);
    float threads=.5+.5*sin(vUv.x*12.+sin(vUv.y*.9)*.8);
    c=vec3(.52,.065,.04)*(.07+.80*light())*mix(.62+.6*braid,.55+.6*threads,tassel)+vec3(1.,.82,.72)*spec(22.)*.16*mix(braid,threads,tassel);
    if(abs(vUv.y-63.)<2.2)c=metal(vUv,GOLD,1.);
  }
  else if(m==21)c=sheet(SILVER)*.9+SILVER*.03;
  else if(m==23)c=vec3(.80,.74,.60)*(.25+.6*light());
  else if(m!=22&&m!=28)c=metal(vUv,GOLD*(m==24?1.:.92),1.);
  outColor=finish(c,1.);
}
#else

void main(){
  if(uOpening>.999)discard;
  vec2 p=vUv;
#if MODE==1
  const int layer=0;
  if(abs(p.x)>HALF.x||abs(p.y)>HALF.y){
    // The border of the lid: the ground runs to the edge; a silver line, then a thin gold lip.
    vec2 e=abs(p)-HALF;float out_=max(e.x,e.y);
    gWake=0.;setLight(normalize(vNormal));
    outColor=finish(out_>7.4?metal(p,GOLD*.92,1.):out_>6.4?metal(p,SILVER*.8,1.):nashiji(p,.34,GOLD),1.);
    return;
  }
#else
  int layer=int(vPart.y+.5);
#endif
#if TREE>0
  int id=int(vPart.x+.5),mat=int(vPart.y+.5);
#else
  ivec2 im=ident(p,layer);int id=im.x,mat=im.y;
#if MODE==2
  if(id==0||int(uB[id].w+.5)!=int(vPart.x+.5))discard;
#elif MODE==4
  if(id!=int(vPart.x+.5))discard;
#endif
#endif
  vec4 A=uA[id];float rise=A.z,glow=A.w;
#if TREE>0
  vec4 fine=vec4(0.,float(TREE==3),0.,0.);float hs=1.,alpha=1.;vec2 grad=vec2(0.);
#if TREE==2
  vec4 ink=texture(uStamps,vTree.xyz); fine=vec4(0.,ink.r,ink.b,ink.g);
  if(ink.g<.04)discard;
  vec2 e=1./vec2(textureSize(uStamps,0).xy);
  grad=vec2(texture(uStamps,vTree.xyz+vec3(e.x,0.,0.)).r-texture(uStamps,vTree.xyz-vec3(e.x,0.,0.)).r,
    texture(uStamps,vTree.xyz+vec3(0.,e.y,0.)).r-texture(uStamps,vTree.xyz-vec3(0.,e.y,0.)).r)*vTree.w/(2.*e*vScale);
#elif TREE==1
  // Pipe UV follows the limb, so scale plates and longitudinal grain wrap the real wood.
  float u=vTree.x,v=vTree.y;
  float grain=sin(u*2.5+.5*sin(v*.31));
  float row=floor(v/6.5), cu=fract(u/5.+mod(row,2.)*.5)-.5, cv=fract(v/6.5)-.5;
  float seam=abs(length(vec2(cu*1.7,cv))-.48)*5.;
  fine.b=vTree.z>.5 ? 1.-smoothstep(.18,.6,seam) : smoothstep(.62,.93,grain);
  grad=vec2(grain*.13,cos(v*.9)*.06);
#endif
#else
  vec4 fine=texture(uFine,puv(p,layer));float hs=texture(uSoft,puv(p,layer)).r;
  float alpha=1.;
#if MODE==4
  // Coverage follows the unblurred silhouette: foil has an edge, not a powder halo.
  alpha=clamp((fine.a-.5)/max(fwidth(fine.a),.006)+.5,0.,1.)*.96;
  // Mist drifts, but never past the lip of the lid.
  vec2 lip=1.-smoothstep(HALF-5.,HALF-1.,abs(vMeta));alpha*=lip.x*lip.y;
#endif
  // Slope of the relief: wide taps for the swell, tight taps for the drawing on top of it.
#if MODE==1
  float eS=3.,sH=SWELL*mix(.3,1.,rise),cH=2.4,lH=.7;
#else
  float eS=1.6,sH=vPart.w,cH=2.2,lH=1.;
#endif
  float eC=max(uPx*.9,.55);
  vec4 st=vec4(texture(uSoft,puv(p+vec2(eS,0.),layer)).r,texture(uSoft,puv(p-vec2(eS,0.),layer)).r,
               texture(uSoft,puv(p+vec2(0.,eS),layer)).r,texture(uSoft,puv(p-vec2(0.,eS),layer)).r);
#if MODE==2
  st=vec4(bodyS(st.x),bodyS(st.y),bodyS(st.z),bodyS(st.w));
#endif
  vec2 gs=vec2(st.x-st.y,st.z-st.w)/(2.*eS)*sH*(mat==13?0.:1.);
  vec4 fx1=texture(uFine,puv(p+vec2(eC,0.),layer)),fx0=texture(uFine,puv(p-vec2(eC,0.),layer)),
       fz1=texture(uFine,puv(p+vec2(0.,eC),layer)),fz0=texture(uFine,puv(p-vec2(0.,eC),layer));
  vec2 grad=gs+vec2((fx1.g-fx0.g)*cH+(fx1.b-fx0.b)*lH,(fz1.g-fz0.g)*cH+(fz1.b-fz0.b)*lH)/(2.*eC)*mix(.55,1.,rise);
  grad*=min(1.,(MODE==2?4.5:2.4)/max(length(grad),1e-4));
 #endif
  // Reflections that linger where the hand has been; on water the same touches leave rings.
  gWake=0.;float ring=0.;
  for(int i=0;i<20;i++){
    vec2 d=vWorld.xz-uTrails[i].xy;float dd=dot(d,d),w=uTrails[i].z;
    gWake=max(gWake,exp(-dd/900.)*w);
    float l=sqrt(dd);ring+=w*exp(-l/46.)*sin(l*.55-(1.-w)*26.);
  }
#if MODE==1||MODE==2
  gSh=mix(1.,shadeAt(vWorld+normalize(vNormal)*(MODE==2?1.6:.6)),SHADE);
#endif
  setLight(normalize(normalize(vNormal)-grad.x*vTanX-grad.y*vTanZ));

  // Each material is some proportion of nashiji, polished metal and sheet, plus at most one layer of large flakes.
  float line=fine.b;vec3 L=light();
  float w=smoothstep(.02,.34,hs);                       // how far into a bank or a mist band
  float dens=.60+.16*vnoise(p*.02),wN=0.,wM=0.,wS=0.,bigD=0.,bigCell=6.6,bigSq=0.;
  vec3 tint=GOLD,f0=GOLD,c=vec3(0.);
  if(mat==1)wN=1.;
#if MODE==1
  else if(mat==2||mat==3){
    // A bank is the ground with the powder drawn together until it is nearly a field of gold (ikakeji);
    // mura-nashiji gathers it in clouds instead.
    float cloud=mat==3?vnoise(p*.045)*.6+vnoise(p*.13)*.3:.55;
    wM=w*(.25+.6*cloud);wN=1.-wM;dens=mix(dens,1.05+.3*cloud,w);f0=mix(GOLD,PALE,.3);tint=mix(GOLD,PALE,.3*w);c=PALE*line*(.14+.6*L)*w;
  }
  else if(mat==4){wN=1.;dens=mix(dens,.8,w);bigD=.85*w;c=PALE*line*(.12+.5*L)*w;}   // gyobu: large flakes laid one by one
#else
  else if(mat==2||mat==3||mat==4){wM=1.;f0=PALE;c=GOLD*line*(.14+.6*L)*mix(.5,1.,rise);}
#endif
  else if(mat==5){wM=1.;c=PALE*line*(.12+.6*L)*mix(.5,1.,rise);}
  else if(mat==6){wM=1.;f0=SILVER;}
  // Kirikane on a raised body. A stone is never asleep enough to become a dark lump: its facets stay drawn.
  else if(mat==7){wM=1.;f0=GOLD*.9;rise=max(rise,.6);bigD=.4;bigCell=7.;bigSq=1.;c=PALE*line*(.22+.6*L);}
  else if(mat==8){wM=1.;f0=mix(SILVER,GOLD,.25)*.9;rise=max(rise,.6);bigD=.4;bigCell=7.;bigSq=1.;c=SILVER*line*(.22+.6*L);}
  else if(mat==9||mat==12){wN=1.;}
  else if(mat==10){wS=1.;f0=PALE;c=PALE*glow*.5;}
  else if(mat==11){wS=1.;f0=SILVER;}
  else if(mat==13){wS=.82;wM=.18;f0=GOLD;tint=GOLD;} // continuous gold leaf, without scattered flakes
  else if(mat==14)c=LACQ*(.8+1.4*L)+coat()*2.2+GOLD*line*(.16+.80*L)*mix(.5,1.,rise);
  else c=mix(vec3(.10,.06,.025)*(.4+.5*L),vec3(1.,.62,.22)*1.15,glow)+LACQ;     // paper windows, lit from within when asked
#if TREE==1||TREE==2
  // Incised lines separate adjacent needles and leaf veins without turning every small leaf white.
  c*=.25;
#endif
  c+=wN*nashiji(p,dens,tint)+wM*metal(p,f0,rise)+wS*sheet(f0);
#if TREE==1||TREE==2
  c*=1.-fine.b*.40;
#endif
  vec3 bigG;float bigX=flake(R2*p,bigCell,mix(.47,.30,bigSq),bigD,bigSq,.26,bigG);
  if(mat==7||mat==8){
    vec3 foil=mat==7?PALE:SILVER;
    c=mix(c,sheet(foil)+foil*(.10+.25*L)+foil*glow*(.45+.45*sin(p.x*.31+p.y*.17-uTime*9.)),bigX)+foil*bigG*.6;
  }else c=mix(c,tint*vec3(1.,.80,.44)*(.07+.74*L),bigX*.92)+tint*AMBER*bigG;
  if(mat==9){
    // Aogai: thin shell. A narrow run of blue-green to pale rose that turns with the light, never a rainbow.
    vec2 r=hash2(floor(p/2.3));
    float t=dot(normalize(gN+vec3(r.x-.5,0.,r.y-.5)*.5),gHp)*2.4+r.x*1.7+gAtt*.6;
    vec3 film=mix(vec3(.16,.50,.50),vec3(.26,.40,.70),.5+.5*sin(t*3.1));
    film=mix(film,vec3(.80,.56,.64),smoothstep(.55,1.,.5+.5*sin(t*2.3+2.))*.45);
    c=mix(c,film*(.16+.60*L)+vec3(.9,1.,1.)*spec(120.)*.9,clamp((fine.g-.2)/max(fwidth(fine.g)*1.5,.004)+.5,0.,1.));
  }
  if(mat==12){
    // Water: silver flow lines polished flush, moving downstream, and rings where a finger crossed it.
    float flow=.55+.45*sin(p.y*.20-uTime*1.5+p.x*.06);
    vec3 wtr=c*vec3(.62,.72,.84)+SILVER*(.05+.14*L)+SILVER*line*(.22+.95*L)*(.5+.5*flow)+SILVER*max(ring,0.)*.5*(.2+L);
    c=mix(c,wtr,clamp((fine.g-.035)/max(fwidth(fine.g)*1.5,.004)+.5,0.,1.));
  }
#if MODE==1
  // Where a part lies, the lid keeps its image polished flush: togidashi under takamaki. Once the part has stood
  // up the image fades to a trace, or it would read as a second shadow left behind at the root.
  float print=0.;
  for(int j=1;j<4;j++){ivec2 o=ident(p,j);if(o.x>0&&o.y!=13)print=max(print,texture(uFine,puv(p,j)).a*(1.-.8*smoothstep(.15,.6,uA[o.x].y)));}
  c=mix(c,c*.42+GOLD*AMBER*(.03+.09*L),print*.85);
#elif MODE==2
  // A body is darker toward its foot, where it meets the lid and the light does not reach.
  c*=mix(.55,1.,smoothstep(0.,.55,vPart.z));
#endif
  outColor=finish(c,alpha);
}
#endif
#endif`;
