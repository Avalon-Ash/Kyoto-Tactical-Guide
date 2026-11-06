// Composed reliefs, not measured reconstructions. Shared craft, distinct silhouettes.
// Architectural reference links and deliberate simplifications are in the run record.
export const LANDMARK_STUDIES = {
  W_KITA: {zh:'三層金閣・鏡湖池',ja:'三層の金閣・鏡湖池'},
  W_KAMIGYO: {zh:'紫宸殿・南庭與回廊',ja:'紫宸殿・南庭と回廊'},
  W_SAKYO: {zh:'觀音殿・銀沙灘與向月台',ja:'観音殿・銀沙灘と向月台'},
  W_NAKAGYO: {zh:'雁行御殿・唐門',ja:'雁行の御殿・唐門'},
  W_HIGASHIYAMA: {zh:'懸造舞台・音羽山',ja:'懸造の舞台・音羽山'},
  W_SHIMOGYO: {zh:'御影堂・阿彌陀堂與銀杏',ja:'御影堂・阿弥陀堂と銀杏'},
  W_MINAMI: {zh:'五重塔・金銀山水',ja:'五重塔・金銀の山水'},
  W_UKYO: {zh:'大方丈・曹源池與借景',ja:'大方丈・曹源池と借景'},
  W_NISHIKYO: {zh:'書院・月見台與池庭',ja:'書院・月見台と池庭'},
  W_YAMASHINA: {zh:'山門石階・本殿與楓',ja:'山門の石段・本殿と楓'},
  W_FUSHIMI: {zh:'樓門・連綿鳥居',ja:'楼門・連なる鳥居'},
};

export function buildLandmark(ward, primitives) {
  const {box,rod,quad,tri,mound,ribbon}=primitives;
  const gold=4,silver=5,shell=6,wood=7,roofGold=8,paper=9,red=10;
  const lerp=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);

  function roof(x,z,y,w,d,h=30,style='hip',material=roofGold,curved=false){
    const rotated=d>w;
    if(rotated)[w,d]=[d,w];
    const ring=(sx,sz,height)=>[[-sx,height,-sz],[sx,height,-sz],[sx,height,sz],[-sx,height,sz]].map(p=>[x+(rotated?p[2]:p[0]),p[1]+y,z+(rotated?-p[0]:p[2])]);
    const eave=ring(w,d,3),mid=ring(w*.8,d*.66,h*.28),ridge=ring(w*(style==='gable'?.94:.52),0,h);
    const curve=(edge,t)=>eave[edge].map((v,k)=>{
      const control=2*mid[edge][k]-(v+ridge[edge][k])/2;
      return v*(1-t)**2+2*control*t*(1-t)+ridge[edge][k]*t*t;
    });
    const tangent=(edge,t)=>eave[edge].map((v,k)=>{
      const control=2*mid[edge][k]-(v+ridge[edge][k])/2;
      return 2*((control-v)*(1-t)+(ridge[edge][k]-control)*t);
    });
    const normal=(i,j,u,t)=>{
      // The hip apex collapses to a point: use its limiting tangent.
      t=Math.min(t,.9999);
      const a=curve(i,t),b=curve(j,t),du=b.map((v,k)=>v-a[k]),dv=lerp(tangent(i,t),tangent(j,t),u);
      const n=[dv[1]*du[2]-dv[2]*du[1],dv[2]*du[0]-dv[0]*du[2],dv[0]*du[1]-dv[1]*du[0]];
      const length=Math.hypot(...n);return n.map(v=>v/length);
    };
    for(let i=0;i<4;i++){
      const j=(i+1)%4;
      if(curved){
        for(let row=0;row<12;row++)for(let col=0;col<18;col++){
          const u=col/18,U=(col+1)/18,t=row/12,T=(row+1)/12;
          const point=(s,v)=>lerp(curve(i,v),curve(j,v),s);
          const a=point(u,t),b=point(u,T),c=point(U,T),d=point(U,t);
          const A=normal(i,j,u,t),B=normal(i,j,u,T),C=normal(i,j,U,T),D=normal(i,j,U,t);
          tri(a,b,c,material,1,[A,B,C]);tri(a,c,d,material,1,[A,C,D]);
        }
      }else{
        quad(eave[i],mid[i],mid[j],eave[j],material);
        quad(mid[i],ridge[i],ridge[j],mid[j],material);
      }
      rod(eave[i],eave[j],1,gold);
      // Tile seams follow the curved slope instead of lying on a pasted facade.
      const seams=i%2?7:18;
      for(let k=1;k<seams;k++){
        if(curved){
          for(let row=0;row<12;row++){
            const a=lerp(curve(i,row/12),curve(j,row/12),k/seams),b=lerp(curve(i,(row+1)/12),curve(j,(row+1)/12),k/seams);
            a[1]+=.8;b[1]+=.8;rod(a,b,.36,gold,1,5);
          }
          continue;
        }
        const a=lerp(eave[i],eave[j],k/seams),b=lerp(mid[i],mid[j],k/seams),c=lerp(ridge[i],ridge[j],k/seams);
        a[1]+=.7;b[1]+=.7;c[1]+=.7;rod(a,b,.36,gold,1,5);rod(b,c,.36,gold,1,5);
      }
    }
    rod(ridge[0],[ridge[1][0],ridge[1][1]+1,ridge[1][2]],2,gold,1,10);
    for(const side of [-1,1]){
      const end=side<0?ridge[0]:ridge[1];
      rod(end,[end[0]+(rotated?0:side*7),end[1]+7,end[2]+(rotated?-side*7:0)],1.3,silver);
    }
  }
  function hall(x,z,y,w,d,h=35,{body=wood,top=roofGold,rise=32,style='hip',stairs=true,plinth=silver,screen=paper,roofClearance=5,curvedRoof=false}={}){
    box(x,y,z,w*2+12,4,d*2+12,plinth);
    box(x,y+4,z,w*1.65,h,d*1.55,body);
    for(let i=0;i<=8;i++){
      const px=x-w*.85+i*w*1.7/8;
      for(const side of [-1,1])rod([px,y+4,z+side*d*.88],[px,y+h+roofClearance,z+side*d*.88],1.7,gold);
      if(i<8){box(px+w*.1,y+12,z+d*.784,w*.14,h*.56,.8,screen);}
    }
    for(const side of [-1,1])for(let i=0;i<5;i++)rod([x+side*w*.87,y+4,z-d*.7+i*d*.35],[x+side*w*.87,y+h+roofClearance-1,z-d*.7+i*d*.35],1.4,gold);
    roof(x,z,y+h+roofClearance,w*1.14,d*1.18,rise,style,top,curvedRoof);
    if(stairs)for(let i=0;i<5;i++)box(x,y-3+i*1.4,z+d+22-i*4,w*.5,2,5,silver);
  }
  function railing(x,z,y,w){
    for(let i=0;i<=12;i++)rod([x-w/2+i*w/12,y,z],[x-w/2+i*w/12,y+10,z],.8,gold);
    rod([x-w/2,y+10,z],[x+w/2,y+10,z],1,gold);
  }
  function pine(x,z,height=65,seed=0){
    rod([x,1,z],[x+7,height*.62,z-4],3,wood,2);rod([x+7,height*.62,z-4],[x-4,height,z+3],2,gold,2);
    for(let j=0;j<4;j++){
      const px=x+(j%2?-1:1)*(22-j*3),pz=z+(j%3-1)*12,y=height*(.48+j*.14);
      rod([x+3,y-8,z],[px,y,pz],1.5,wood,2);
      mound(px,pz,26-j,18,5,2,y,2,seed+j);mound(px+3,pz+2,19,13,2,gold,y+4,2,seed+j);
    }
  }
  function tree(x,z,h=65,kind='maple',seed=0){
    rod([x,1,z],[x-5,h*.68,z],3,wood,2);
    for(let j=0;j<5;j++){
      const a=j*2.4+seed,px=x+Math.cos(a)*h*.42,pz=z+Math.sin(a)*h*.32,y=h*(.7+.14*Math.sin(a));
      rod([x-3,h*.4,z],[px,y,pz],1.7,wood,2);
      mound(px,pz,h*.34,h*.24,8,kind==='cherry'?silver:2,y,2,j+seed);
      for(let k=0;k<9;k++){
        const angle=k*2.399+j,cx=px+Math.cos(angle)*h*.25,cz=pz+Math.sin(angle)*h*.18,cy=y+7+(k%3);
        const points=kind==='ginkgo'?7:10;
        for(let t=0;t<points;t++){
          const b=angle+t/points*6.283,c=angle+(t+1)/points*6.283;
          const radius=t%2?2.5:5.5,next=t%2?5.5:2.5;
          tri([cx,cy,cz],[cx+Math.cos(c)*next,cy,cz+Math.sin(c)*next],[cx+Math.cos(b)*radius,cy,cz+Math.sin(b)*radius],kind==='cherry'?shell:kind==='maple'&&k%5===0?red:gold,2);
        }
      }
    }
  }
  function pond(x,z,rx,rz,seed=0){
    const point=(a,r=1)=>{const irregular=1+.08*Math.sin(a*5+seed);return [x+Math.cos(a)*rx*r*irregular,1.3,z+Math.sin(a)*rz*r*irregular];};
    for(let i=0;i<80;i++){
      const a=i/80*6.283,b=(i+1)/80*6.283;
      tri([x,1.3,z],point(b),point(a),11,0);
      quad(point(a,1),point(b,1),point(b,1.025),point(a,1.025),2,0);
      if(i%8<2)quad(point(a,.90),point(b,.90),point(b,.94),point(a,.94),shell,0);
      rod(point(a),point(b),.75,gold,0,4);
    }
    for(let j=0;j<6;j++)ribbon(Array.from({length:28},(_,i)=>[x-rx*.65+i*rx*1.3/27,z+rz*(j/8-.35)+Math.sin(i*.18+j)*3]),.35,roofGold,1.7);
  }
  function rocks(x,z,n=4){for(let i=0;i<n;i++)mound(x+(i-n/2)*22,z+Math.sin(i*2.8)*18,17+i%3*4,14,10+(i%3)*7,silver,1,1,i);}
  function path(points,width=12){ribbon(points,width,silver,1.8);ribbon(points.map(([x,z])=>[x+width,z]),.6,gold,2);}
  function steps(x,z,width,n,rise=3,run=8,base=0){for(let i=0;i<n;i++)box(x,base+i*rise,z-i*run,width,rise,run+1,silver);}
  function karamon(x,z,y=0){
    for(const px of [-37,37])for(const pz of [-14,14])rod([x+px,y,z+pz],[x+px,y+47,z+pz],3,gold);
    box(x,y+28,z,70,12,5,wood);roof(x,z,y+45,58,28,20,'gable');
    for(const side of [-1,1]){
      const curve=Array.from({length:33},(_,i)=>{const u=i/32*2-1;return [x+u*53,y+48+18*Math.exp(-u*u*5)+5*Math.pow(Math.abs(u),6),z+side*31];});
      for(let i=1;i<curve.length;i++){rod(curve[i-1],curve[i],2,gold);rod(curve[i-1].map((v,j)=>v-(j===1?4:0)),curve[i].map((v,j)=>v-(j===1?4:0)),1,silver);}
    }
    for(let i=-3;i<=3;i++)mound(x+i*8,z+4,3,3,2,gold,y+39,1,i);
  }
  function lantern(x,z){box(x,1,z,18,3,18,silver);rod([x,4,z],[x,27,z],3,silver);box(x,26,z,13,12,13,wood);for(const a of [-1,1])box(x+a*6.6,29,z,1,6,7,gold);roof(x,z,39,12,12,8);rod([x,47,z],[x,54,z],2,gold);}
  function mountain(x,z,rx,rz,h,seed){mound(x,z,rx,rz,h,3,1,1,seed);}

  const scenes={
    W_KITA(){
      pond(-10,65,265,122,3);mountain(-40,-155,230,46,21,2);
      const x=-35,z=-45;
      hall(x,z,4,82,58,29,{rise:22,body:wood,stairs:false});
      hall(x,z,58,71,51,27,{rise:22,body:gold,top:roofGold,stairs:false,plinth:gold,screen:roofGold});
      hall(x,z,111,53,40,24,{rise:25,body:gold,stairs:false,plinth:gold,screen:roofGold});
      // The small phoenix is an abstract crest, not a pagoda finial.
      rod([x,167,z],[x,180,z],1.4,gold);
      for(const side of [-1,1]){rod([x,180,z],[x+side*10,186,z-3],1.5,gold);rod([x+side*10,186,z-3],[x+side*20,183,z-6],.8,gold);}
      rod([x,180,z],[x+5,177,z+12],1,gold);
      mound(170,100,42,25,8,2);pine(168,98,53,8);rocks(-205,80,3);pine(-245,-90,78,2);pine(185,-130,65,6);
    },
    W_KAMIGYO(){
      // White south court, a single broad ceremonial hall, and a low U of corridors.
      box(0,1,50,350,1,216,paper,0);
      hall(0,-65,8,130,65,43,{body:red,rise:44});
      for(const x of [-215,215])hall(x,16,2,22,139,18,{body:red,rise:12,stairs:false});
      hall(-145,150,2,70,20,18,{body:red,rise:12,stairs:false});hall(145,150,2,70,20,18,{body:red,rise:12,stairs:false});
      for(const x of [-38,38])rod([x,3,150],[x,44,150],3,red);
      roof(0,150,44,62,35,23);
      tree(-92,67,46,'cherry',2);tree(92,67,43,'ginkgo',4);
      pine(-285,-110,65,5);pine(285,-85,68,8);
    },
    W_SAKYO(){
      mountain(30,-150,245,48,32,4);pond(-156,65,118,87,5);
      hall(-98,-55,3,64,49,30,{rise:24,stairs:false});hall(-98,-55,62,51,41,28,{rise:25,stairs:false});
      // Silver sand is in the garden; the pavilion itself is dark timber, not silver plated.
      box(115,1,54,205,3,119,silver,0);
      for(let i=0;i<22;i++)ribbon([[18+i*8,-3],[18+i*8,112]],.6,roofGold,4.2);
      const cx=185,cz=115,r=46,top=20,h=38;
      for(let i=0;i<64;i++){
        const a=i/64*6.283,b=(i+1)/64*6.283;
        quad([cx+Math.cos(a)*r,3,cz+Math.sin(a)*r],[cx+Math.cos(a)*top,h,cz+Math.sin(a)*top],[cx+Math.cos(b)*top,h,cz+Math.sin(b)*top],[cx+Math.cos(b)*r,3,cz+Math.sin(b)*r],silver);
        tri([cx,h,cz],[cx+Math.cos(b)*top,h,cz+Math.sin(b)*top],[cx+Math.cos(a)*top,h,cz+Math.sin(a)*top],paper);
      }
      rocks(-230,90,3);pine(-245,-110,75,2);pine(240,-110,69,6);hall(135,-107,3,68,36,23,{rise:24});
    },
    W_NAKAGYO(){
      // Six low, offset roofs communicate Ninomaru's staggered arrangement, no invented keep.
      const rooms=[[-192,-139,63,35],[-121,-98,72,39],[-42,-53,78,43],[43,-4,59,32],[112,37,66,37],[186,82,60,35]];
      rooms.forEach(([x,z,w,d],i)=>hall(x,z,5,w,d,27+(i%2)*4,{rise:27,stairs:false}));
      karamon(-115,120,2);path([[-115,199],[-115,156]],18);
      pond(211,-117,90,51,2);rocks(226,-145,3);pine(-282,10,63,1);pine(274,-76,58,3);
      // Foreground masonry and moat are part of the estate, not a clipped ward tile.
      for(let i=0;i<15;i++)box(-300+i*40,1,202,38,6,15,roofGold,0);
      ribbon([[-326,221],[316,221]],5,silver,1.5);
    },
    W_HIGASHIYAMA(){
      mountain(90,-119,230,68,56,8);mountain(-167,-80,116,80,30,3);
      // Exposed under-stage supports are essential to the silhouette.
      for(let i=0;i<8;i++)for(const z of [45,91,132]){
        const x=-154+i*44;rod([x,2,z],[x,76,z],3.2,wood);rod([x-1,5,z],[x+1,75,z],1,gold);
      }
      for(const y of [24,49,68])for(const z of [45,91,132])rod([-160,y,z],[160,y,z],2.2,wood);
      for(const x of [-154,-66,22,110])rod([x,8,133],[x+44,66,133],1.7,gold);
      box(0,74,82,338,5,112,roofGold);for(let i=0;i<31;i++)box(-163+i*11,79,82,.7,.3,110,gold);
      // The silver plinth used to share y=79 with the stage over z=26..40.
      // Raise the whole hall above the deck seams and seat it on a timber curb.
      box(0,79,-34,294,5,144,wood);
      hall(0,-34,84,143,68,39,{rise:47,stairs:false,roofClearance:12,curvedRoof:true});railing(0,139,79,335);
      for(const x of [-168,168]){rod([x,79,28],[x,89,28],1,gold);rod([x,89,28],[x,89,139],1,gold);}
      tree(-255,113,64,'maple',1);tree(252,92,71,'maple',3);pine(-235,-135,70,4);
    },
    W_SHIMOGYO(){
      // The unequal twin halls and horizontal connection distinguish this precinct.
      hall(-134,-30,7,101,78,42,{rise:46});hall(133,-45,7,111,89,47,{rise:51});
      hall(-3,-42,8,24,18,16,{rise:10,stairs:false});
      path([[-270,161],[250,161]],21);
      tree(-195,105,94,'ginkgo',7);karamon(184,145,1);
      for(let i=0;i<12;i++)box(-283+i*48,1,-185,45,15,7,paper);
      pine(-281,-130,57,3);pine(284,-124,66,4);
    },
    W_UKYO(){
      mountain(60,-151,235,51,44,6);mountain(-223,-142,92,53,30,2);
      pond(117,32,168,120,5);rocks(120,-48,5);mound(136,-43,13,14,42,roofGold);mound(163,-48,10,12,34,silver);
      hall(-150,37,7,103,61,31,{rise:34});
      box(-150,10,114,223,2,29,wood);for(let i=0;i<26;i++)box(-256+i*8.5,12,114,.55,.3,28,gold);
      pine(261,-100,75,2);pine(205,-143,70,5);pine(-243,-124,65,7);tree(280,122,50,'maple',2);
      path([[-270,164],[-220,147],[-160,143],[-95,148]],8);
    },
    W_NISHIKYO(){
      pond(48,81,247,107,7);mountain(130,-155,153,43,18,4);
      hall(-151,-74,7,85,43,25,{rise:25,stairs:false});hall(-2,-34,7,77,43,25,{rise:25,stairs:false});hall(135,4,7,63,43,25,{rise:26,stairs:false});
      // Open bamboo moon-viewing platform, without a roof or balustrade.
      box(-135,11,2,110,3,69,wood);
      for(let i=0;i<26;i++)rod([-188+i*4.2,15,-31],[-188+i*4.2,15,35],.65,gold,1,5);
      for(const x of [-179,-90])rod([x,1,29],[x,12,29],2,wood);
      path([[-260,158],[-227,127],[-203,92]],7);rocks(239,109,3);lantern(236,123);
      pine(-268,-94,62,2);pine(261,-100,73,5);pine(263,48,56,3);
      // Stepping stones are separated from the reflective water plane.
      for(let i=0;i<8;i++)mound(-220+i*19,150+Math.sin(i*.7)*12,11,7,3,silver,2,1,i);
    },
    W_YAMASHINA(){
      mountain(47,-135,240,57,38,2);box(20,1,-58,266,27,142,roofGold);
      hall(42,-85,29,95,52,30,{body:red,rise:32});karamon(20,2,28);
      steps(20,155,115,14,2,10);steps(-161,130,43,10,1.5,12);
      // Gate frames the climb; the lower passage remains open.
      for(const x of [-24,64])for(const z of [57,84])rod([x,15,z],[x,63,z],3,red);
      box(20,47,70,99,20,40,red);roof(20,70,69,67,35,26);
      tree(-232,33,100,'maple',2);tree(229,82,89,'maple',5);tree(-222,-108,67,'cherry',3);lantern(-77,117);lantern(118,117);
    },
    W_FUSHIMI(){
      mountain(90,-128,215,69,30,8);
      // A large foreground torii and two receding strands form a traversable-looking route.
      function torii(x,z,s,angle=0){
        const p=(px,py,pz)=>[x+(px*Math.cos(angle)-pz*Math.sin(angle))*s,py*s,z+(px*Math.sin(angle)+pz*Math.cos(angle))*s];
        for(const side of [-1,1]){rod(p(side*36,2,0),p(side*32,92,0),4.1*s,red);rod(p(side*36,0,0),p(side*35.6,13,0),4.8*s,roofGold);}
        rod(p(-49,74,0),p(49,74,0),3.5*s,red);rod(p(0,74,0),p(0,91,0),3*s,gold);
        const q=Array.from({length:17},(_,i)=>{const u=i/16*2-1;return p(u*55,94+7*u*u,0);});
        for(let i=1;i<q.length;i++){rod(q[i-1],q[i],4*s,roofGold);rod(q[i-1].map((v,j)=>v-(j===1?5*s:0)),q[i].map((v,j)=>v-(j===1?5*s:0)),2.5*s,red);}
      }
      path([[-196,170],[-148,121],[-88,68],[-4,23],[92,-40],[175,-126]],13);
      path([[-22,22],[84,42],[170,13],[229,-76]],10);
      torii(-151,123,1.25,-.18);
      for(let i=0;i<9;i++){const t=i/8;torii(-72+t*249,64-t*185,.75-t*.22,-.35);}
      for(let i=0;i<7;i++){const t=i/6;torii(58+t*170,57-t*129,.64-t*.18,.1);}
      // Low romon at the far left; the torii sequence remains the visual lead.
      for(const x of [-243,-167])rod([x,1,-99],[x,37,-99],3,red);
      box(-205,29,-99,96,22,48,red);roof(-205,-99,53,63,37,24);
      pine(-281,-129,72,3);pine(283,-118,74,5);tree(275,109,68,'maple',4);
    },
  };
  const scene=scenes[ward];
  if(!scene)throw new Error(`No relief composition for ${ward}`);
  scene();
}
