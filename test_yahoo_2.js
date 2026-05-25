import * as cheerio from 'cheerio';
async function get(q) {
  const url = 'https://search.yahoo.co.jp/search?p=' + encodeURIComponent(q);
  const headers = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' };
  const res = await fetch(url, { headers });
  const text = await res.text();
  const $ = cheerio.load(text);
  const results = [];
  $('div.sw-CardBase, li').each((i, el) => {
    results.push($(el).text());
  });
  console.log('Result for ' + q + ':\n', results.map(t=>t.substring(0, 150)).join('\n'));
}
async function run() {
    await get('スマート珈琲店 西京区');
    await get('寿司 誠 西京区');
    await get('大彦 ステーキ 西京区');
    await get('風来房 桂');
}
run();
