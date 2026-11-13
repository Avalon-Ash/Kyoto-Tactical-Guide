// Vertex shader for explicit 3D meshes on a makie plate.
// Uses true vertex positions and normals (no soft-map body() inflation), preserves partVert grounding/hinge/sway/tilt,
// and transforms normals by the inverse-transpose Jacobian of the ground-bending displacement.
export const meshVert = (mode, ground) => `#version 300 es
#define MODE ${mode}
precision highp float; precision highp sampler2DArray;
uniform mat4 uCamera; uniform mat3 uTilt; uniform float uOpening;
${ground}
in vec3 aPos, aNormal; in vec2 aUv; in vec4 aOwner, aStyle;
invariant gl_Position;
out vec3 vWorld, vNormal, vTanX, vTanZ; out vec2 vUv, vMeta; out vec4 vPart;
void main(){
  int id=int(aOwner.x+.5); vec4 A=uA[id], B=uB[id];
  float foot=aOwner.y; vec2 anchor=aOwner.zw;
  float theta=A.y*aStyle.x, ct=cos(theta), st=sin(theta), cs=cos(A.x), sn=sin(A.x);
  vec2 r=aPos.xz-anchor, q=anchor+vec2(cs*r.x-sn*r.y,sn*r.x+cs*r.y)+B.xy;
  float upF=aStyle.x>0.?smoothstep(.1,.7,A.y):0.;
  float gy=mix(groundY(q),groundY(vec2(q.x,foot)),upF);
  float eps=1.5;
  float gyX0=mix(groundY(q-vec2(eps,0.)),groundY(vec2(q.x-eps,foot)),upF);
  float gyX1=mix(groundY(q+vec2(eps,0.)),groundY(vec2(q.x+eps,foot)),upF);
  float dgyX=(gyX1-gyX0)/(2.*eps);
  float dgyZ=(1.-upF)*(groundY(q+vec2(0.,eps))-groundY(q-vec2(0.,eps)))/(2.*eps);
  vec3 up=vec3(0.,ct,st), down=vec3(0.,-st,ct), right=vec3(1.,0.,0.);
  vec3 tx=right*cs+down*sn, tz=-right*sn+down*cs;
  vec3 jx=tx+vec3(0.,dgyX*cs+dgyZ*sn,0.), jy=up, jz=tz+vec3(0.,-dgyX*sn+dgyZ*cs,0.);
  vec3 nLocal=cross(jy,jz)*aNormal.x+cross(jz,jx)*aNormal.y+cross(jx,jy)*aNormal.z;
  float height=aPos.y+aStyle.w;
  vec3 p=vec3(q.x,gy+B.z+.35,foot)+down*(q.y-foot)+up*height;
  p.y+=uOpening*360.; p.z-=uOpening*650.;
  vec3 centre=vec3(0.,-48.,0.); p=uTilt*(p-centre)+centre;
  vWorld=p;
  vNormal=uTilt*normalize(nLocal);
  vTanX=uTilt*normalize(jx);
  vTanZ=uTilt*normalize(jz);
  vUv=aUv; vMeta=q; vPart=vec4(aOwner.x,aStyle.y,1.,height);
  gl_Position=uCamera*vec4(p,1.);
}`;
