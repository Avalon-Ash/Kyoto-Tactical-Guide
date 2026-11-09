import '../../theme.css';
import { BUNKO_MARKUP } from './template';
import { mountBunko } from './study.js';

const root=document.getElementById('bunko-study');
if(!root)throw new Error('Missing study root');
root.innerHTML=BUNKO_MARKUP;
const controller=mountBunko(root);
if(import.meta.hot)import.meta.hot.dispose(()=>controller.destroy());
