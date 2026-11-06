import { makieIcon, typeMotifs } from '../../lib/makie-icons';
import { loadSpotsByWard } from '../../data/spots-loader';
import { buildGoogleMapsUrl } from '../../components/SpotCard';
import { AREA_NAMES } from '../../data/areas';
import { TYPES } from '../../data/types';
import type { FlatSpot, Lang } from '../../types';
import { cabinetFor, volumeTitle } from './collection';

const text = {
  zh: {title:'南之卷',close:'收卷合蓋',search:'卷內尋訪',placeholder:'景點、食處、關鍵字',type:'類型',all:'所有類型',clear:'清除',loading:'正在展開南區書卷…',error:'書卷暫時無法載入，請再試一次。',retry:'重新載入',empty:'此卷中沒有符合的條目。試著換個關鍵字，或清除篩選。',map:'在 Google Maps 尋路 ↗',reservation:'需預約',unit:'處',note:'景點內容沿用京都御秘帖資料；出發前請確認營業與預約資訊。'},
  ja: {title:'南の巻',close:'巻を収める',search:'巻の中を探す',placeholder:'名所・食処・キーワード',type:'種類',all:'すべての種類',clear:'クリア',loading:'南の巻を開いています…',error:'巻を読み込めませんでした。もう一度お試しください。',retry:'再読み込み',empty:'該当する項目がありません。キーワードを変えるか、絞り込みを解除してください。',map:'Google Maps で探す ↗',reservation:'要予約',unit:'件',note:'京都御秘帖のデータを使用しています。訪問前に営業・予約情報をご確認ください。'},
};

export function filterVolume(spots: FlatSpot[], query: string, typeId: string): FlatSpot[] {
  const normalize=(value:string)=>value.normalize('NFKC').toLocaleLowerCase();
  const terms=normalize(query).trim().split(/\s+/).filter(Boolean);
  return spots.filter(s=>(!typeId||s.typeId===typeId)&&terms.every(t=>normalize(`${s.name} ${s.jaName ?? ''} ${s.desc} ${s.tags}`).includes(t)));
}

/** A language switch invalidates every outstanding result, including failures. */
export function createRequestGate() {
  let version=0;
  return {next:()=>++version,current:(ticket:number)=>ticket===version};
}

export function createBunkoLibrary(onClose:()=>void, onLanguage:()=>void, root:HTMLElement, onExploreWard?:(ward:string)=>void) {
  const events=new AbortController();
  const el=<T extends HTMLElement>(id:string)=>{
    const element=root.querySelector(`[id="${id}"]`);
    if(!element)throw new Error(`Missing library element: ${id}`);
    return element as T;
  };
  const dialog=el<HTMLDialogElement>('library'),search=el<HTMLInputElement>('volume-search'),type=el('volume-types');
  const results=el('volume-results'),status=el('volume-status'),retry=el<HTMLButtonElement>('retry-volume');
  const gate=createRequestGate();
  let lang:Lang='zh',spots:FlatSpot[]=[],active=false,loading=false,loadFailed=false,typeId='';
  let cabinet=cabinetFor('W_MINAMI');
  const write=(id:string,value:string)=>{el(id).textContent=value;};
  const node=<K extends keyof HTMLElementTagNameMap>(tag:K,value?:string,className?:string)=>{
    const result=document.createElement(tag);if(value!==undefined)result.textContent=value;if(className)result.className=className;return result;
  };
  function labels(){
    const t=text[lang];
    write('map-label',lang==='zh'?'地圖':'地図');
    el('volume-map').setAttribute('aria-label',lang==='zh'?'地圖與完整篩選':'地図・詳しい絞り込み');
    write('volume-title',volumeTitle(cabinet.id,lang));write('close-book',t.close);write('search-label',t.search);write('type-label',t.type);
    write('clear-label',t.clear);el('clear-search').title=t.clear;write('retry-volume',t.retry);write('volume-note',t.note);
    write('volume-language',lang==='zh'?'日本語':'繁體中文');search.placeholder=t.placeholder;
    write('volume-subtitle',`${cabinet.landmark.oldName[lang]} · ${cabinet.names[lang]}`);
    write('volume-index',`KYOTO / ${cabinet.id.slice(2)}`);
    write('volume-seal',cabinet.names[lang]);
  }
  function options(){
    const ids=[...new Set(spots.map(s=>s.typeId))].sort((a,b)=>(TYPES[a]?.sortOrder??99)-(TYPES[b]?.sortOrder??99));
    if(spots.length&&!ids.includes(typeId))typeId='';
    const short:Record<string,string[]>={T_HUB:['交通','交通'],T_TEMPLE:['寺社','寺社'],T_SHOP:['商肆','商店'],T_MODERN:['近代','近代'],T_NATURE:['山水','自然'],T_FOOD:['食處','食事'],T_ACG:['繪草','創作']};
    type.replaceChildren(...['',...ids].map(id=>{
      const button=node('button');button.type='button';button.dataset.type=id;
      const label=id?(TYPES[id]?.name[lang]??id):text[lang].all;
      button.setAttribute('aria-label',label);button.title=label;
      const icon=node('span',undefined,'hira-icon');icon.innerHTML=makieIcon(typeMotifs[id]??'all');
      button.append(icon,node('span',id?(short[id]?.[lang==='zh'?0:1]??label):(lang==='zh'?'全部':'すべて')));
      return button;
    }));
  }

  function render(){
    labels();type.querySelectorAll('button').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.type===typeId)));results.replaceChildren();retry.hidden=!loadFailed;
    if(loading){status.textContent=lang==='zh'?`正在展開${volumeTitle(cabinet.id,lang)}…`:`${volumeTitle(cabinet.id,lang)}を開いています…`;return;}
    if(loadFailed){status.textContent=text[lang].error;return;}
    const filtered=filterVolume(spots,search.value,typeId),t=text[lang];
    status.textContent=`${filtered.length} / ${spots.length} ${t.unit}`;
    if(!filtered.length){results.append(node('p',t.empty,'volume-empty'));return;}
    for(const spot of filtered){
      const detail=node('details',undefined,'volume-entry');detail.dataset.spotId=spot.id;
      detail.open=spot.id===cabinet.landmark.spotId&&!search.value&&!typeId;
      const summary=node('summary'),index=node('span',spot.id,'entry-index'),name=node('span',spot.name,'entry-name');
      summary.append(index,name,node('span',TYPES[spot.typeId]?.name[lang]??spot.typeId,'entry-type'));detail.append(summary);
      const content=node('div',undefined,'entry-content');
      content.append(node('p',AREA_NAMES[spot.areaId]?.[lang]??spot.areaId,'entry-area'),node('p',spot.desc,'entry-description'));
      if(spot.tags)content.append(node('p',spot.tags,'entry-tags'));
      if(spot.reservationRequired)content.append(node('p',t.reservation,'entry-reservation'));
      const link=node('a',t.map);link.href=buildGoogleMapsUrl(spot);link.target='_blank';link.rel='noopener noreferrer';
      content.append(link);detail.append(content);results.append(detail);
    }
  }
  async function load(){
    const ticket=gate.next(),requestedLanguage=lang,requestedWard=cabinet.id;loading=true;loadFailed=false;spots=[];options();render();
    try{
      const data=await loadSpotsByWard(requestedWard,requestedLanguage);
      if(!active||!gate.current(ticket))return;
      if(!data.length)throw new Error(`Empty volume: ${requestedWard}`);
      spots=data;loading=false;options();render();
    }catch{
      if(!active||!gate.current(ticket))return;
      loading=false;loadFailed=true;render();
    }
  }
  const resetView=()=>{el('volume-body').scrollTo({top:0});render();};
  search.addEventListener('input',resetView,{signal:events.signal});type.addEventListener('click',event=>{const button=(event.target as Element).closest<HTMLButtonElement>('button[data-type]');if(button){typeId=button.dataset.type??'';resetView();}},{signal:events.signal});
  el('clear-search').onclick=()=>{search.value='';typeId='';resetView();search.focus();};
  el('close-book').onclick=onClose;el('volume-language').onclick=onLanguage;retry.onclick=()=>{void load();};
  dialog.addEventListener('cancel',e=>{e.preventDefault();onClose();},{signal:events.signal});
  dialog.querySelector('form')?.addEventListener('submit',e=>e.preventDefault(),{signal:events.signal});
  el('volume-map').hidden=!onExploreWard;el('volume-map').onclick=()=>onExploreWard?.(cabinet.id);
  return {
    prepare(next:Lang,wardId='W_MINAMI'){
      if(wardId!==cabinet.id){search.value='';typeId='';}
      cabinet=cabinetFor(wardId);dialog.dataset.ward=wardId;lang=next;active=true;void load();
    },
    show(){
      if(!dialog.open)dialog.showModal();
      el('volume-body').scrollTo({top:0});
      root.classList.add('reading');search.focus({preventScroll:true});
    },
    hide(){active=false;gate.next();dialog.close();root.classList.remove('reading');},
    setLanguage(next:Lang){if(lang===next)return;lang=next;if(active)void load();else labels();},
    destroy(){active=false;gate.next();events.abort();dialog.close();root.classList.remove('reading');},
  };
}
