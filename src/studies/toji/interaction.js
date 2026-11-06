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

// The home uses deliberate drags on the cabinet itself, including slow drags.
// Axis locking prevents a vertical page scroll from becoming a cabinet change.
export function cabinetDragDirection(start,end,width){
  if(!start||!end||start.id!==end.id||start.axis!=='x')return 0;
  const dx=end.x-start.x,threshold=Math.max(44,Math.min(100,width*.12));
  return Math.abs(dx)>=threshold?-Math.sign(dx):0;
}

export const IDLE_RESUME_DELAY=1800;
export function idlePlaybackAllowed({embedded,reduced,visible,hidden,failed,bookState,dragging,idleFor}){
  return Boolean(embedded&&!reduced&&visible&&!hidden&&!failed&&bookState==='closed'&&!dragging&&idleFor>=IDLE_RESUME_DELAY);
}
