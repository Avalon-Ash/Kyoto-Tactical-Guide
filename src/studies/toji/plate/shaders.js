// GLSL ES 3.00 for the makie plate and its box.
// The lacquer is built the way the craft builds it: black ground, powder sprinkled in sizes, amber lacquer over it,
// polished back. Powder is resolved flake by flake only where a flake covers a few pixels; below that it is
// its own average, so a distant lid is calm and a close one is grainy — and nothing shimmers in between.

const GROUND = `
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
  vec2 e=1.-smoothstep(HALF-14.,HALF,abs(c));
  return dome+textureLod(uSoft,vec3(uv,0.),0.).r*SWELL*mix(.3,1.,uA[id].z)*e.x*e.y;
}`;

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
  if(aMeta.x<24.5){vec3 c=vec3(0.,-48.,0.);p=uTilt*(p-c)+c;n=uTilt*n;vTanX=uTilt*vTanX;vTanZ=uTilt*vTanZ;}
  vWorld=p;vNormal=n;vUv=aUv;vMeta=aMeta;vPart=vec4(0.);
  gl_Position=uCamera*vec4(p,1.);
}`;

// A part of the plate: a cut-out that hinges up from the lid on its foot line and is built out in slices.
// Instances are the slices. MODE: 5 slice depth only, 2 slice colour, 3 shadow on the lid, 4 mist.
export const partVert = mode => `#version 300 es
#define MODE ${mode}
precision highp float; precision highp sampler2DArray;
in vec2 aPos; in vec4 aPart, aInfo;
uniform mat4 uCamera; uniform mat3 uTilt; uniform float uOpening, uSlices; uniform vec3 uLamp;
${GROUND}
out vec3 vWorld, vNormal, vTanX, vTanZ; out vec2 vUv, vMeta; out vec4 vPart;
void main(){
  int id=int(aPart.x+.5);
  vec4 A=uA[id],B=uB[id];
  float foot=aPart.z,theta=A.y*aInfo.z,ct=cos(theta),st=sin(theta);
  // Sway turns the picture in its own plane about its anchor.
  vec2 r=aPos-aInfo.xy;float cs=cos(A.x),sn=sin(A.x);
  vec2 q=aInfo.xy+vec2(cs*r.x-sn*r.y,sn*r.x+cs*r.y)+B.xy;
  float h=foot-q.y;
  vec3 n=vec3(0.,ct,st),down=vec3(0.,-st,ct);
  float slice=(MODE==2||MODE==5)?1.-float(gl_InstanceID)/max(uSlices-1.,1.):MODE==3?.5:0.;
  float thick=aPart.w*mix(.45,1.,A.z)*mix(.5,1.,A.y);
  vec3 p=vec3(q.x,groundY(vec2(aInfo.x,foot))+B.z+.35,foot)-down*h+n*(aInfo.w*A.y+slice*thick);
#if MODE==3
  {
    // Flatten onto the lid, thrown away from the lamp.
    vec2 off=(p.xz-uLamp.xz)*(max(p.y,0.)/330.);
    p=vec3(p.x+off.x,groundY(p.xz+off)+.25,p.z+off.y);n=vec3(0.,1.,0.);down=vec3(0.,0.,1.);
  }
#endif
  p.y+=uOpening*360.;p.z-=uOpening*650.;
  vec3 c=vec3(0.,-48.,0.);p=uTilt*(p-c)+c;
  vWorld=p;vNormal=uTilt*n;vTanX=uTilt*vec3(1.,0.,0.);vTanZ=uTilt*down;
  vUv=aPos;vMeta=vec2(0.,0.);vPart=vec4(aPart.x,aPart.y,slice,thick);
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
//   0 box   1 the lid's ground   2 a slice of a part (colour)   3 a part's shadow   4 mist   5 a slice (depth only)
//   6 the shadow the box lays on what it stands on
export const frag = mode => `#version 300 es
#define MODE ${mode}
precision highp float; precision highp sampler2DArray;
in vec3 vWorld, vNormal, vTanX, vTanZ; in vec2 vUv, vMeta; in vec4 vPart;
uniform sampler2DArray uFine, uSoft, uIdent;
uniform vec3 uView, uKey, uLamp;
uniform float uTime, uNight, uPresence, uPx, uOpening;
uniform vec4 uA[64];
uniform vec3 uTrails[20];
out vec4 outColor;

const vec2 HALF=vec2(360.,230.);
const vec3 GOLD=vec3(1.,.72,.30), PALE=vec3(1.,.86,.55), SILVER=vec3(.80,.84,.84), LACQ=vec3(.020,.015,.013), AMBER=vec3(1.,.86,.58);
const float SWELL=17., AMB=.17, KEY=.44, POOL=1.75;
const mat2 R1=mat2(.940,.342,-.342,.940),R2=mat2(.766,-.643,.643,.766),R3=mat2(.5,.866,-.866,.5);

vec3 puv(vec2 q,int layer){return vec3((q+HALF)/(2.*HALF),float(layer));}
ivec2 ident(vec2 p,int layer){
  ivec3 sz=textureSize(uIdent,0);
  return ivec2(texelFetch(uIdent,ivec3(clamp(ivec2((p+HALF)/(2.*HALF)*vec2(sz.xy)),ivec2(0),sz.xy-1),layer),0).rg*255.+.5);
}
// A part is a pillow: a wall at its edge, then a dome, with its own drawing raised a little on top.
float relief(float hs,vec4 fine){return (.26+.62*smoothstep(.42,.98,hs))*(.78+.22*fine.g)+fine.b*.12;}

#if MODE==6
void main(){
  vec2 d=max(abs(vWorld.xz-vec2(-34.,26.))-vec2(360.,232.),0.);
  outColor=vec4(0.,0.,0.,exp(-dot(d,d)/2600.)*mix(.34,.5,uNight)*(1.-uOpening*.2));
}
#elif MODE==3||MODE==5
void main(){
  if(uOpening>.999)discard;
  int layer=int(vPart.y+.5);ivec2 im=ident(vUv,layer);
  if(im.x!=int(vPart.x+.5))discard;
  vec4 fine=texture(uFine,puv(vUv,layer));float hs=texture(uSoft,puv(vUv,layer)).r;
  float alpha=im.y==13?smoothstep(.03,.42,hs)*.94:clamp((fine.a-.5)/max(fwidth(fine.a)*1.4,.004)+.5,0.,1.);
  vec4 A=uA[im.x];
  if(im.y==11)alpha*=smoothstep(.02,.35,A.z);
#if MODE==5
  if(alpha<.04||relief(hs,fine)+.03<vPart.z)discard;
  outColor=vec4(0.,0.,0.,alpha);
#else
  if(abs(vWorld.x)>372.||abs(vWorld.z)>242.)discard;
  float soft_=im.y==13?alpha*.35:textureLod(uFine,puv(vUv,layer),1.6).a;
  if(soft_<.04)discard;
  outColor=vec4(0.,0.,0.,soft_*mix(.30,.52,A.y)*mix(.7,1.,uPresence));
#endif
}
#else

float hash(vec2 p){vec3 q=fract(vec3(p.xyx)*.1031);q+=dot(q,q.yzx+33.33);return fract((q.x+q.y)*q.z);}
vec2 hash2(vec2 p){vec3 q=fract(vec3(p.xyx)*vec3(.1031,.1030,.0973));q+=dot(q,q.yzx+33.33);return fract((q.xx+q.yz)*q.zy);}
float vnoise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+1.),f.x),f.y);}

// Light, shared by every material of this fragment.
vec3 gN, gHk, gHp; float gAtt, gDk, gDp, gWake;
float light(){return AMB+KEY*gDk+POOL*gAtt*gDp;}
float spec(float e){return KEY*pow(max(dot(gN,gHk),0.),e)+POOL*gAtt*pow(max(dot(gN,gHp),0.),e);}
void setLight(vec3 n){
  gN=n;
  vec3 toLamp=uLamp-vWorld;float d2=dot(toLamp,toLamp);vec3 lp=toLamp*inversesqrt(d2);
  gAtt=(uPresence/(1.+d2/24000.))+gWake*.55;
  gDk=max(dot(n,uKey),0.);gDp=max(dot(n,lp),0.);
  gHk=normalize(uKey+uView);gHp=normalize(lp+uView);
}
// One size of powder. Returns (coverage, sparkle energy). A flake is drawn only where it spans a few pixels;
// below that the layer is its own average, so nothing shimmers between sizes.
vec2 flake(vec2 p,float cell,float size,float dens,float sq,float spread){
  float vis=smoothstep(1.3,3.2,cell/uPx);
  float avg=dens*mix(1.95,3.57,sq)*size*size;
  float broad=KEY*pow(max(dot(gN,gHk),0.),12.)+POOL*gAtt*pow(max(dot(gN,gHp),0.),12.);
  vec2 far=vec2(avg,avg*broad*.55);
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
  float gl=KEY*.45*pow(max(dot(nf,gHk),0.),70.)+POOL*gAtt*pow(max(dot(nf,gHp),0.),70.);
  return mix(far,vec2(cov,cov*gl*2.6),vis);
}
vec3 coat(){return vec3(1.,.95,.86)*(spec(220.)*.42+spec(36.)*.10);}
// Nashiji: three sizes of flake under amber lacquer.
vec3 nashiji(vec2 p,float dens,vec3 tint){
  vec2 a=flake(R1*p,.62,.40,dens,0.,.55),b=flake(R2*p+13.7,1.5,.42,dens*.6,0.,.5),c=flake(R3*p+41.3,2.7,.40,dens*.13,0.,.4);
  float cov=1.-(1.-a.x)*(1.-b.x)*(1.-c.x);
  return LACQ*(.6+light())+tint*AMBER*(cov*(.11+.62*light())+(a.y+b.y+c.y)*1.3)+coat();
}
// Polished gold powder: a satin metal. Asleep, it lies under the lacquer.
vec3 metal(vec2 p,vec3 f0,float rise){
  vec2 m=flake(p,.5,.4,.9,0.,.35);
  vec3 c=f0*(.14+.70*light())+mix(f0,vec3(1.),.35)*(spec(30.)*.6+m.y*.5);
  return mix(c*vec3(.62,.46,.28)*.75,c,smoothstep(.12,.85,rise));
}
// Cut sheet metal, laid flat: a mirror.
vec3 sheet(vec3 f0){return f0*(.07+.30*light())+mix(f0,vec3(1.),.5)*(spec(160.)*1.5+spec(18.)*.18);}
float tone(float x){return x/(1.+x*.32);}
vec4 finish(vec3 c,float a){
  c*=1.25;c=vec3(tone(c.r),tone(c.g),tone(c.b));
  c=mix(c,c*vec3(.74,.86,1.10)+vec3(.004,.006,.010),uNight*.7);
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
  float side=float(m==20),inner=float(m==22);
  vec3 c=(side+inner)*nashiji(vUv,mix(.34+.5*cloud,.8,inner),mix(GOLD,PALE,inner))*mix(1.,.8,inner);
  if(m==20){
    // A drift of larger flakes crosses the sides.
    vec2 big=flake(R2*vUv,5.,.42,.4*smoothstep(.55,.9,vnoise(vUv*vec2(.006,.07)+3.)),0.,.3);
    c+=PALE*AMBER*(big.x*(.1+.45*light())+big.y);
  }
  else if(m==21)c=sheet(SILVER)*.9+SILVER*.03;
  else if(m==23)c=vec3(.80,.74,.60)*(.25+.6*light());
  else if(m!=22)c=metal(vUv,GOLD*(m==24?1.:.92),1.);
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
  ivec2 im=ident(p,layer);int id=im.x,mat=im.y;
#if MODE!=1
  if(id!=int(vPart.x+.5))discard;
#endif
  vec4 A=uA[id];float rise=A.z,glow=A.w;
  vec4 fine=texture(uFine,puv(p,layer));float hs=texture(uSoft,puv(p,layer)).r;
  float alpha=1.;
#if MODE==4
  alpha=smoothstep(.03,.42,hs)*.94;
#endif
  // Slope of the relief: wide taps for the swell, tight taps for the drawing on top of it.
#if MODE==1
  float eS=3.,sH=SWELL*mix(.3,1.,rise),cH=2.4,lH=.7;
#else
  float eS=1.6,sH=vPart.w*1.5,cH=max(vPart.w*.22,1.),lH=max(vPart.w*.12,.7);
#endif
  float eC=max(uPx*.9,.55);
  vec2 gs=vec2(texture(uSoft,puv(p+vec2(eS,0.),layer)).r-texture(uSoft,puv(p-vec2(eS,0.),layer)).r,
               texture(uSoft,puv(p+vec2(0.,eS),layer)).r-texture(uSoft,puv(p-vec2(0.,eS),layer)).r)/(2.*eS)*sH*(mat==13?0.:1.);
  vec4 fx1=texture(uFine,puv(p+vec2(eC,0.),layer)),fx0=texture(uFine,puv(p-vec2(eC,0.),layer)),
       fz1=texture(uFine,puv(p+vec2(0.,eC),layer)),fz0=texture(uFine,puv(p-vec2(0.,eC),layer));
  vec2 grad=gs+vec2((fx1.g-fx0.g)*cH+(fx1.b-fx0.b)*lH,(fz1.g-fz0.g)*cH+(fz1.b-fz0.b)*lH)/(2.*eC)*mix(.55,1.,rise);
  grad*=min(1.,2.4/max(length(grad),1e-4));
  // Reflections that linger where the hand has been; on water the same touches leave rings.
  gWake=0.;float ring=0.;
  for(int i=0;i<20;i++){
    vec2 d=vWorld.xz-uTrails[i].xy;float dd=dot(d,d),w=uTrails[i].z;
    gWake=max(gWake,exp(-dd/900.)*w);
    float l=sqrt(dd);ring+=w*exp(-l/46.)*sin(l*.55-(1.-w)*26.);
  }
  setLight(normalize(normalize(vNormal)-grad.x*vTanX-grad.y*vTanZ));

  // Each material is some proportion of nashiji, polished metal and sheet, plus at most one layer of large flakes.
  float line=fine.b,L=light();
  float w=smoothstep(.02,.34,hs);                       // how far into a bank or a mist band
  float dens=.32+.10*vnoise(p*.02),wN=0.,wM=0.,wS=0.,bigD=0.,bigCell=6.6,bigSq=0.;
  vec3 tint=GOLD,f0=GOLD,c=vec3(0.);
  if(mat==1)wN=1.;
#if MODE==1
  else if(mat==2||mat==3){
    // A bank is the same ground with the powder drawn together; mura-nashiji clouds it.
    float cloud=mat==3?vnoise(p*.045)*.5+vnoise(p*.13)*.25:.2;
    wN=1.;dens=mix(dens,.62+.5*cloud+.25*hs,w);tint=mix(GOLD,PALE,.35*w);c=PALE*line*(.12+.5*L)*w;
  }
  else if(mat==4){wN=1.;dens=mix(dens,.5,w);bigD=.85*w;c=PALE*line*(.1+.4*L)*w;}   // gyobu: large flakes laid one by one
#else
  else if(mat==2||mat==3||mat==4){wM=1.;f0=PALE*.96;c=GOLD*line*(.12+.5*L)*rise;}
#endif
  else if(mat==5){wM=1.;c=PALE*line*(.10+.55*L)*rise;}
  else if(mat==6){wM=1.;f0=SILVER;}
  else if(mat==7){wM=1.;f0=GOLD*.86;bigD=.5;bigCell=5.2;bigSq=1.;}                 // kirikane on a raised body
  else if(mat==8){wM=1.;f0=SILVER*.8;bigD=.5;bigCell=5.2;bigSq=1.;}
  else if(mat==9||mat==12){wN=1.;}
  else if(mat==10){wS=1.;f0=PALE;c=PALE*glow*.5;}
  else if(mat==11){wS=1.;f0=SILVER;}
  else if(mat==13){float dns=smoothstep(.04,.75,hs);wN=1.;dens=.40+1.25*dns;tint=PALE;bigD=.16*dns;bigCell=5.2;}
  else if(mat==14)c=LACQ*(.8+1.4*L)+coat()*2.2+GOLD*line*(.16+.80*L)*mix(.5,1.,rise);
  else c=mix(vec3(.11,.075,.035)*(.5+L),vec3(1.,.66,.26)*1.5,glow)+LACQ;     // paper windows, lit from within when asked
  vec3 ground=nashiji(p,dens,tint);
  c+=wN*ground+wM*metal(p,f0,rise)+wS*sheet(f0);
  vec2 big=flake(R2*p,bigCell,mix(.47,.30,bigSq),bigD,bigSq,.26);
  if(mat==7||mat==8){
    vec3 foil=mat==7?PALE:SILVER;
    c=mix(c,sheet(foil)+foil*glow*(.45+.45*sin(p.x*.31+p.y*.17-uTime*9.)),big.x)+foil*big.y*.6;
  }else c+=PALE*AMBER*(big.x*(.10+.50*L)+big.y*1.2);
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
  // Where a part stands, the lid keeps its image polished flush: togidashi under takamaki.
  float print=0.;
  for(int j=1;j<4;j++){ivec2 o=ident(p,j);if(o.x>0&&o.y!=13)print=max(print,texture(uFine,puv(p,j)).a);}
  c=mix(c,c*.42+GOLD*AMBER*(.03+.09*L),print*.85);
#elif MODE==2
  // The flanks of a part are a little darker than its face, like lacquer under the gold.
  c*=mix(.74,1.,smoothstep(0.,.6,vPart.z));
#endif
  outColor=finish(c,alpha);
}
#endif
#endif`;
