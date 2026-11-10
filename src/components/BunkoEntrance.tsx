import { useEffect, useRef } from 'react';
import type { Lang } from '../types';
import { BUNKO_STAGE } from '../studies/toji/template';
import { mountBunko } from '../studies/toji/study.js';
import '../studies/toji/bunko.css';

export interface BunkoPreferences { night: boolean; paused: boolean }
interface Props {
  lang: Lang;
  wardId: string;
  preferences: BunkoPreferences;
  onWardChange: (ward: string) => void;
  /** The lid is open: unroll that ward's volume. */
  onOpenVolume: (ward: string) => void;
}

/** React owns navigation, language and preferences; the controller owns the canvas. */
export function BunkoEntrance(props: Props) {
  const root=useRef<HTMLDivElement>(null);
  const current=useRef(props);current.current=props;
  const controller=useRef<ReturnType<typeof mountBunko> | null>(null);
  useEffect(()=>{
    const element=root.current;
    if(!element)return;
    // Static source markup only. All ward text is written with textContent.
    element.innerHTML=BUNKO_STAGE;
    const initial=current.current;
    const instance=mountBunko(element,{
      embedded:true,language:initial.lang,wardId:initial.wardId,...initial.preferences,
      onWardChange:ward=>current.current.onWardChange(ward),
      onOpenVolume:ward=>current.current.onOpenVolume(ward),
    });
    controller.current=instance;
    return ()=>{instance.destroy();controller.current=null;element.replaceChildren();};
  },[]);
  useEffect(()=>{controller.current?.setLanguage(props.lang);},[props.lang]);
  useEffect(()=>{controller.current?.setPreferences(props.preferences);},[props.preferences]);
  return <div ref={root} className="bunko" data-embedded="true" />;
}
