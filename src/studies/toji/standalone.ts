import '../../theme.css';
import './bunko.css';
import './study.css';
import { mountStudy } from './study-chrome.js';

const root=document.getElementById('bunko-study');
if(!root)throw new Error('Missing study root');
const controller=mountStudy(root);
if(import.meta.hot)import.meta.hot.dispose(()=>controller.destroy());

if (typeof window !== 'undefined') {
  const params = new URLSearchParams(window.location.search);
  if (params.get('probe') === 'flicker') {
    document.documentElement.dataset.probe = 'running';
    const canvas = root.querySelector('#scene');
    if (canvas instanceof HTMLCanvasElement) {
      void import('./probe.js').then(({ runFlickerProbe }) => runFlickerProbe(canvas)).then(result => {
        console.log('[probe:flicker]', JSON.stringify(result));
        const pre = document.createElement('pre');
        pre.id = 'probe-result';
        pre.textContent = JSON.stringify(result);
        root.appendChild(pre);
        document.documentElement.dataset.probe = 'done';
      }).catch(error => {
        console.error('[probe:flicker]', error);
        document.documentElement.dataset.probe = 'error';
      });
    }
  }
}

