import '../../theme.css';
import './bunko.css';
import './study.css';
import { mountStudy } from './study-chrome.js';

const root=document.getElementById('bunko-study');
if(!root)throw new Error('Missing study root');
const controller=mountStudy(root);
if(import.meta.hot)import.meta.hot.dispose(()=>controller.destroy());
