import { JSDOM } from 'jsdom';

async function run() {
  const res = await fetch('https://chifaja.com/chifaja');
  const html = await res.text();
  const dom = new JSDOM(html);
  
  const blocks = dom.window.document.querySelectorAll('h4');
  const results = [];
  for (const h4 of blocks) {
    const parent = h4.parentElement;
    results.push(parent.textContent.replace(/\\s+/g, ' ').trim());
  }
  console.log(JSON.stringify(results.slice(0, 4), null, 2));
}
run();
