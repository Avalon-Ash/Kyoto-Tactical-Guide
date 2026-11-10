export const OPEN_DURATION=1150;
export function progressToward(current,target,elapsed,reduced){
  if(reduced)return target;
  const step=Math.max(0,elapsed)/OPEN_DURATION;
  return target>current?Math.min(target,current+step):Math.max(target,current-step);
}
export function isTap(start,end){
  return Boolean(start&&end&&!start.moved&&start.id===end.id&&Math.hypot(end.x-start.x,end.y-start.y)<=8&&end.time>=start.time&&end.time-start.time<700);
}
export function onLid(x,z){return Number.isFinite(x)&&Number.isFinite(z)&&Math.abs(x)<=370&&Math.abs(z)<=240;}

// The standalone study retains its quick-swipe collection rail.
export function swipeDirection(start,end){
  if(!start||!end||start.id!==end.id||end.time-start.time<0||end.time-start.time>700)return 0;
  const dx=end.x-start.x,dy=end.y-start.y;
  return Math.abs(dx)>=50&&Math.abs(dy)<30?-Math.sign(dx):0;
}

// The home cabinet sits on an unseen track. A finger on it always moves the light; the box itself
// trails the finger at DRAG_FOLLOW after a small dead zone, so a caress only sways it.
// Once the box centre has travelled into a side zone (switchDistance) letting go changes the cabinet.
export const DRAG_DEAD=14,DRAG_FOLLOW=.6,SWITCH_SHARE=.26,SWITCH_MAX=200;
export function switchDistance(width){return Math.min(SWITCH_MAX,width*SWITCH_SHARE);}
/** Finger travel in px → how far the box centre has moved from rest. */
export function cabinetOffset(dx,width){
  const travel=(Math.abs(dx)-DRAG_DEAD)*DRAG_FOLLOW;
  return travel<=0?0:Math.sign(dx)*Math.min(travel,width*.85);
}
export function cabinetDragDirection(start,end,width){
  if(!start||!end||start.id!==end.id||!(width>0))return 0;
  const offset=cabinetOffset(end.x-start.x,width);
  return Math.abs(offset)>=switchDistance(width)?-Math.sign(offset):0;
}

export const IDLE_RESUME_DELAY=1800;
export function idlePlaybackAllowed({embedded,reduced,visible,hidden,failed,bookState,dragging,idleFor}){
  return Boolean(embedded&&!reduced&&visible&&!hidden&&!failed&&bookState==='closed'&&!dragging&&idleFor>=IDLE_RESUME_DELAY);
}
