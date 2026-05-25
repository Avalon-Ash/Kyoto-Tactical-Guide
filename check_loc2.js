import * as cheerio from 'cheerio';
async function searchKyoto(q) {
  const url = 'https://html.duckduckgo.com/html/?q=' + encodeURIComponent(q + ' 住所 京都');
  const headers = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' };
  const res = await fetch(url, { headers });
  const text = await res.text();
  const $ = cheerio.load(text);
  const results = [];
  $('a.result__snippet').each((i, el) => {
    results.push($(el).text());
  });
  console.log(q, ':', results.join(' ').substring(0, 150));
}
async function run() {
    await searchKyoto('寿司 誠 京都'); 
    await searchKyoto('大彦 ステーキ 京都'); 
    await searchKyoto('風來房 定食 京都'); 
}
run();
