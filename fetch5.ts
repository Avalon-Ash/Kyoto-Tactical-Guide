import { JSDOM } from 'jsdom';

async function run() {
  const res = await fetch('https://chifaja.com/chifaja');
  const html = await res.text();
  const dom = new JSDOM(html);
  
  const blocks = dom.window.document.querySelectorAll('h4');
  for (const h4 of blocks) {
    const parent = h4.parentElement;
    console.log("----");
    console.log(parent.innerHTML.substring(0, 500));
  }
}
run();
