import { JSDOM } from 'jsdom';

async function run() {
  const res = await fetch('https://chifaja.com/chifaja');
  const html = await res.text();
  const dom = new JSDOM(html);
  
  // store list section
  const KyotoH3 = Array.from(dom.window.document.querySelectorAll('h3')).find(h => h.textContent.includes('京都'));
  if (KyotoH3) {
      let current = KyotoH3.nextElementSibling;
      while (current) {
          console.log(current.textContent.trim().substring(0, 500));
          current = current.nextElementSibling;
      }
  }
}
run();
