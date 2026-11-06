import { useEffect, useRef } from 'react';
import type { Lang } from '../types';
import { BUNKO_MARKUP } from '../studies/toji/template';
import { mountBunko } from '../studies/toji/study.js';
import '../studies/toji/study.css';

export interface BunkoPreferences { night: boolean; paused: boolean }
interface Props {
  lang: Lang;
  wardId: string;
  preferences: BunkoPreferences;
  onLanguageChange: () => void;
  onWardChange: (ward: string) => void;
  onPreferencesChange: (value: BunkoPreferences) => void;
  onExploreWard: (ward: string) => void;
}

/** React owns navigation; the scoped controller owns the canvas and its reader. */
export function BunkoEntrance(props: Props) {
  const root=useRef<HTMLDivElement>(null);
  const current=useRef(props);current.current=props;
  const controller=useRef<ReturnType<typeof mountBunko> | null>(null);
  useEffect(()=>{
    const element=root.current;
    if(!element)return;
    // Static source markup only. All spot/locale text is written with textContent.
    element.innerHTML=BUNKO_MARKUP;
    const initial=current.current;
    const instance=mountBunko(element,{
      embedded:true,language:initial.lang,wardId:initial.wardId,...initial.preferences,
      onLanguageChange:()=>current.current.onLanguageChange(),
      onWardChange:ward=>current.current.onWardChange(ward),
      onPreferencesChange:value=>current.current.onPreferencesChange(value),
      onExploreWard:ward=>current.current.onExploreWard(ward),
    });
    controller.current=instance;
    return ()=>{instance.destroy();controller.current=null;element.replaceChildren();};
  },[]);
  useEffect(()=>{controller.current?.setLanguage(props.lang);},[props.lang]);
  return <div ref={root} className="bunko" data-embedded="true" />;
}
