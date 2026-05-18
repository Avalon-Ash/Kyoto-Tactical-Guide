import { JSDOM } from 'jsdom';

async function run() {
  const res = await fetch('https://chifaja.com/chifaja');
  const html = await res.text();
  const dom = new JSDOM(html);
  const stores = [];
  
  // Try to find store names and descriptions from the page
  const lists = dom.window.document.querySelectorAll('a');
  for (const a of lists) {
    if (a.href && a.href.includes('/shop/')) {
       stores.push({name: a.textContent.trim(), url: a.href});
    }
  }
  
  const h3s = dom.window.document.querySelectorAll('h3, h4');
  for (const h of h3s) {
    stores.push({h: h.textContent.trim()});
  }
  
  console.log(JSON.stringify(stores, null, 2));
}
run();
