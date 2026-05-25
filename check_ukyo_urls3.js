import * as cheerio from 'cheerio';
async function searchKyoto(q) {
  const url = 'https://search.yahoo.co.jp/search?p=' + encodeURIComponent(q);
  const headers = { 'User-Agent': 'Mozilla/5.0' };
  try {
      const res = await fetch(url, { headers });
      const text = await res.text();
      const $ = cheerio.load(text);
      let t = [];
      $('div.sw-CardBase, li, a').each((i,el) => t.push($(el).text()));
      const j = t.join(' ');
      if (j.includes('閉店')) {
          console.log('CLOSED:', q);
      } else {
          console.log('OPEN:', q);
      }
      console.log('--- snippet:', j.substring(0, 150));
  } catch(e) { }
}
async function run() {
    await searchKyoto('嵯峨嵐山 文の助茶屋 閉店');
    await searchKyoto('鶴屋吉信 嵐山店 閉店');
    await searchKyoto('焼肉 弘 嵯峨野店 閉店');
    await searchKyoto('竹林茶屋 嵐山 閉店');
    await searchKyoto('篩月 閉店');
}
run();
