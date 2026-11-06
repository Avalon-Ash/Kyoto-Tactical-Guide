export const vertex = `
attribute vec3 position, normal;
attribute vec2 surface;
uniform mat4 camera, lightMatrix;
uniform vec2 pointer;
uniform float lift, time, moving, opening;
varying vec3 world, rest, norm;
varying vec4 shadowPosition;
varying float material, part;
void main(){
  vec3 p=position, n=normal;
  if(surface.y>.5&&surface.y<2.5){
    float kx=pointer.x*.18*lift,kz=pointer.y*.11*lift;
    p.x+=position.y*kx;
    p.z+=position.y*kz;
    p.y*=lift;
    n=normalize(vec3(n.x,(n.y-kx*n.x-kz*n.z)/max(lift,.02),n.z));
    if(surface.y>1.5) p.x+=sin(time*1.7+position.z*.025)*position.y*.018*moving;
  }
  if(surface.y<2.5){p.y+=opening*360.;p.z-=opening*650.;}
  world=p; rest=position; norm=n; material=surface.x;
  part=surface.y;
  shadowPosition=lightMatrix*vec4(p,1.);
  gl_Position=camera*vec4(p,1.);
}`;
export const depth = `precision highp float;
varying float part;uniform float opening;
void main(){if(opening>.999&&part<2.5)discard;vec2 e=fract(gl_FragCoord.z*vec2(1.,255.));e.x-=e.y/255.;gl_FragColor=vec4(e,0.,1.);}`;
export const fragment = `precision highp float;
varying vec3 world, rest, norm;
varying vec4 shadowPosition;
varying float material, part;
uniform sampler2D shadowMap;
uniform vec3 light, eye;
uniform float ground, night, time, opening;
uniform vec3 trails[20];
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float shadow(){
  vec3 s=shadowPosition.xyz/shadowPosition.w*.5+.5;
  if(s.x<0.||s.x>1.||s.y<0.||s.y>1.)return 1.;
  float sum=0.;
  float bias=max(.0004,.0012*(1.-dot(normalize(norm),light)));
  for(int x=-1;x<=1;x++) for(int y=-1;y<=1;y++){
    vec2 d=texture2D(shadowMap,s.xy+vec2(float(x),float(y))*1.7/1024.).rg;
    sum+=step(s.z-bias,d.x+d.y/255.);
  }
  return .34+.66*sum/9.;
}
void main(){
  if(opening>.999&&part<2.5)discard;
  float m=material<.5?ground:material;
  vec2 p=rest.xz+rest.y*.37;
  vec2 cell=floor(p*1.6);
  float seed=hash(cell);
  vec2 f=fract(p*1.6)-(.15+.7*vec2(seed,hash(cell+17.)));
  float angle=seed*6.283;
  f=mat2(cos(angle),-sin(angle),sin(angle),cos(angle))*f;
  float grain=1.-smoothstep(.08+seed*.13,.16+seed*.13,length(f*vec2(1.,1.6)));
  float buried=hash(floor(p*3.3));
  float dense=smoothstep(-1.3,1.4,sin(p.x*.016)+sin(p.y*.025+p.x*.006));
  vec3 base=vec3(.48,.31,.13),n=normalize(norm);
  float rough=.52;
  if(m<3.5){
    base=mix(vec3(.48,.32,.15),vec3(.70,.51,.25),dense*.75);
    if(m>1.5)base=mix(vec3(.58,.40,.18),vec3(.81,.64,.34),buried*.7);
    float flake=grain*(.45+.55*seed);
    if(m>2.5){
      vec2 q=p*.13,id=floor(q);float best=8.,second=8.,facet=0.;
      for(int x=-1;x<=1;x++)for(int y=-1;y<=1;y++){
        vec2 c=id+vec2(float(x),float(y));
        vec2 center=c+vec2(hash(c),hash(c+31.));float dist=length(q-center);
        if(dist<best){second=best;best=dist;facet=hash(c+91.);}else second=min(second,dist);
      }
      float seam=smoothstep(.015,.075,second-best);
      base=mix(vec3(.47,.32,.16),mix(vec3(.67,.49,.25),vec3(.88,.73,.44),facet),seam);
      flake=facet*.8;seed=facet;rough=.31;
    }else{
      base+=vec3(.30,.25,.13)*flake;
      base-=vec3(.08,.06,.03)*buried;
    }
    n=normalize(n+vec3(seed-.5,.0,hash(cell+8.)-.5)*(.06+.12*grain));
  }else if(m<4.5){base=vec3(.86,.66,.32);rough=.22;}
  else if(m<5.5){base=vec3(.68,.69,.63);rough=.25;}
  else if(m<6.5){
    vec3 view=normalize(eye-world);float angle=dot(view,n);
    base=.50+.28*cos(vec3(0.,2.,4.)+angle*8.+rest.x*.035);
    base=mix(base,vec3(.84,.88,.78),.25);rough=.14;
  }else if(m<7.5){base=vec3(.21,.12,.065);rough=.65;}
  else if(m<8.5){base=mix(vec3(.29,.20,.10),vec3(.52,.37,.17),grain*.6);rough=.36;}
  else if(m<9.5){base=vec3(.83,.76,.59)+vec3(.025)*buried;rough=.9;}
  else if(m<10.5){base=mix(vec3(.32,.065,.035),vec3(.55,.17,.065),buried*.4)+vec3(.11,.07,.025)*grain;rough=.3;}
  else{
    float wave=sin(rest.x*.08+sin(rest.z*.055)*2.1);
    base=mix(vec3(.26,.28,.19),vec3(.61,.59,.40),.48+.16*wave)+grain*vec3(.11,.10,.06);
    n=normalize(n+vec3(cos(rest.x*.08)*.09,0.,sin(rest.z*.055)*.06));rough=.28;
  }
  vec3 view=normalize(eye-world),halfway=normalize(view+light);
  float diffuse=max(0.,dot(n,light)),spec=pow(max(0.,dot(n,halfway)),mix(90.,12.,rough));
  float shade=shadow();
  vec3 color=base*(.42+.72*diffuse*shade)+vec3(.52,.44,.29)*spec*shade*(1.-rough);
  float trail=0.;
  for(int i=0;i<20;i++){
    vec2 delta=world.xz-trails[i].xy;
    trail=max(trail,exp(-dot(delta,delta)/850.)*trails[i].z);
  }
  // The metal stays attached to the object: a local reflection lingers after touch.
  color+=trail*(.11+grain*.42)*vec3(.58,.43,.20);
  color=mix(color,color*vec3(.72,.85,1.13)+vec3(.025,.035,.055),night*.65);
  gl_FragColor=vec4(color,1.);
}`;
