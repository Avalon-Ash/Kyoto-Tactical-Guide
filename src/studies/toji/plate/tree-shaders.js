// Geometry has already established thickness. There is no silhouette -> body() step here.
// Both passes use exactly this vertex source (including invariant position).
export const treeVert = (mode, stamps, ground) => `#version 300 es
#define MODE ${mode}
#define STAMPS ${stamps ? 1 : 0}
precision highp float; precision highp sampler2DArray;
uniform mat4 uCamera; uniform mat3 uTilt; uniform float uOpening;
${ground}
#if STAMPS
in vec4 aPlacement,aStamp;
#else
in vec3 aPos,aNormal; in vec2 aUv;
#endif
in vec4 aOwner,aStyle;
invariant gl_Position;
out vec3 vWorld,vNormal,vTanX,vTanZ; out vec2 vUv,vMeta; out vec4 vPart,vTree; out vec2 vScale;
void main(){
  int id=int(aOwner.x+.5); vec4 A=uA[id],B=uB[id];
  vec2 anchor=aOwner.zw; float foot=aOwner.y,theta=A.y*aStyle.x,ct=cos(theta),st=sin(theta),cs=cos(A.x),sn=sin(A.x);
  vec2 rest; float height; vec3 localN; vec2 along=vec2(1.,0.);
#if STAMPS
  vec2 uv=vec2((gl_VertexID==1||gl_VertexID==2||gl_VertexID==4)?1.:0.,(gl_VertexID==2||gl_VertexID==4||gl_VertexID==5)?1.:0.);
  float c=cos(aPlacement.z),s=sin(aPlacement.z); along=vec2(c,s);
  vec2 corner=(uv-.5)*aStamp.xy; rest=aPlacement.xy+vec2(c*corner.x-s*corner.y,s*corner.x+c*corner.y);
  height=aPlacement.w;localN=vec3(0.,1.,0.);
  vTree=vec4(uv,aStamp.z,aStamp.w);vScale=aStamp.xy;
#else
  rest=aPos.xz;height=aPos.y;localN=aNormal;
  vTree=vec4(aUv,aStyle.z,0.);vScale=vec2(1.);
#endif
  vec2 r=rest-anchor,q=anchor+vec2(cs*r.x-sn*r.y,sn*r.x+cs*r.y)+B.xy;
  vec3 up=vec3(0.,ct,st),down=vec3(0.,-st,ct),right=vec3(1.,0.,0.);
  vec3 tx=right*cs+down*sn,tz=-right*sn+down*cs;
  float gy=groundY(anchor);
  vec3 p=vec3(q.x,gy+.6+B.z,foot)+down*(q.y-foot)+up*height;
  p.y+=uOpening*360.;p.z-=uOpening*650.;
  vec3 centre=vec3(0.,-48.,0.);p=uTilt*(p-centre)+centre;
  vWorld=p;vNormal=uTilt*(tx*localN.x+up*localN.y+tz*localN.z);
  vTanX=uTilt*(tx*along.x+tz*along.y);vTanZ=uTilt*(-tx*along.y+tz*along.x);
  vUv=rest;vMeta=q;vPart=vec4(aOwner.x,aStyle.y,1.,height);
  gl_Position=uCamera*vec4(p,1.);
}`;
