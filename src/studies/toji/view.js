// Cabinet close-up: pure view maths for zoom and pan (UI renewal P1).
// The camera is orthographic, so zooming shrinks the view box and panning moves its
// centre on the camera plane. zoom=1 with no pan is exactly the original home framing.
// Pan (cx, cy) is in camera-plane units; y points up, like ortho's bottom/top.

export const ZOOM_MIN=1,ZOOM_MAX=3,ZOOM_STEP=1.4;
const PIXEL_CAP=2.2e6;
const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));

export function baseHalf(aspect){const halfW=Math.max(475,340*aspect);return {halfW,halfH:halfW/aspect};}
export function clampZoom(zoom){return clamp(zoom,ZOOM_MIN,ZOOM_MAX);}
/** Above this the cabinet is "in hand": one finger pans instead of switching cabinets. */
export function isZoomed(zoom){return zoom>1.02;}

export function viewBox(aspect,zoom=1,cx=0,cy=0){
  const b=baseHalf(aspect),halfW=b.halfW/zoom,halfH=b.halfH/zoom;
  return {left:cx-halfW,right:cx+halfW,bottom:cy-halfH,top:cy+halfH,halfW,halfH};
}
/** The zoomed view never leaves the original full frame, so the cabinet cannot be lost. */
export function panLimit(aspect,zoom){const b=baseHalf(aspect),k=Math.max(0,1-1/zoom);return {x:b.halfW*k,y:b.halfH*k};}
export function clampPan(aspect,zoom,cx,cy){const l=panLimit(aspect,zoom);return [clamp(cx,-l.x,l.x),clamp(cy,-l.y,l.y)];}
/** Past the limit the pan resists softly instead of stopping dead. */
export function rubberBand(value,limit,dimension){
  const over=Math.abs(value)-limit;
  if(over<=0||dimension<=0)return value;
  return Math.sign(value)*(limit+(1-1/(over*.55/dimension+1))*dimension);
}
/** Screen fraction (0..1, y down) → camera-plane point. */
export function planePoint(aspect,zoom,cx,cy,fx,fy){const v=viewBox(aspect,zoom,cx,cy);return [cx+(fx*2-1)*v.halfW,cy+(1-fy*2)*v.halfH];}
/** Centre that keeps a camera-plane point under the same screen fraction at a new zoom. */
export function anchorPan(aspect,zoom,point,fx,fy){const b=baseHalf(aspect);return [point[0]-(fx*2-1)*b.halfW/zoom,point[1]-(1-fy*2)*b.halfH/zoom];}
/** Screen-pixel drag → camera-plane delta at the current zoom. */
export function dragPan(aspect,zoom,dxPx,dyPx,widthPx,heightPx){const v=viewBox(aspect,zoom);return [-dxPx/widthPx*2*v.halfW,dyPx/heightPx*2*v.halfH];}
/** A close-up earns more pixels, within a canvas budget a phone can hold. */
export function renderDpr(deviceDpr,zoom,cssW,cssH){
  const device=deviceDpr||1,base=Math.min(device,1.5);
  if(zoom<=1.2||cssW<=0||cssH<=0)return base;
  return Math.max(base,Math.min(device,2,Math.sqrt(PIXEL_CAP/(cssW*cssH))));
}
export function isDoubleTap(previous,tap){return Boolean(previous&&tap&&tap.time-previous.time>=0&&tap.time-previous.time<=320&&Math.hypot(tap.x-previous.x,tap.y-previous.y)<=28);}
