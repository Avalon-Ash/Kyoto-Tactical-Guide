import { JSDOM } from 'jsdom';

async function run() {
  const res = await fetch('https://chifaja.com/chifaja');
  const html = await res.text();
  const dom = new JSDOM(html);
  const lists = dom.window.document.querySelectorAll('.p-shop-item');
  const stores = [];
  
  for (const item of lists) {
    const name = item.querySelector('h4')?.textContent.trim();
    // find all ds/dt
    const dls = item.querySelectorAll('dl');
    let address = '';
    let tel = '';
    for (const dl of dls) {
      if (dl.textContent.includes('住所') || dl.querySelector('dt')?.textContent.includes('住所')) {
         address = dl.querySelector('dd')?.textContent.trim();
      }
      if (dl.textContent.includes('Tel') || dl.querySelector('dt')?.textContent.includes('TEL')) {
         tel = dl.querySelector('dd')?.textContent.trim();
      }
    }
    stores.push({name, address, tel});
  }
  
  console.log(JSON.stringify(stores, null, 2));
}
run();
