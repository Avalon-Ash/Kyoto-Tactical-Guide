import { JSDOM } from 'jsdom';

async function run() {
  const res = await fetch('https://chifaja.com/chifaja');
  const html = await res.text();
  const dom = new JSDOM(html);
  
  const blocks = dom.window.document.querySelectorAll('h4');
  const results = [];
  for (const h4 of blocks) {
    const parent = h4.parentElement;
    const name = h4.textContent.trim();
    
    // find all tr
    const trs = parent.querySelectorAll('tr');
    let address = '';
    let tel = '';
    let hours = '';
    for (const tr of trs) {
       const th = tr.querySelector('th')?.textContent.trim();
       const td = tr.querySelector('td')?.textContent.trim();
       if (th && th.includes('住所')) address = td;
       if (th && th.includes('TEL')) tel = td;
       if (th && th.includes('営業時間')) hours = td;
    }
    
    results.push({name, address, tel, hours});
  }
  console.log(JSON.stringify(results.slice(0, 4), null, 2));
}
run();
