import * as cheerio from 'cheerio';
async function run() {
  const url = 'https://search.yahoo.co.jp/search?p=' + encodeURIComponent('京都市立芸術大学 移転');
  const headers = { 'User-Agent': 'Mozilla/5.0' };
  try {
     const res = await fetch(url, { headers });
     const text = await res.text();
     const $ = cheerio.load(text);
     const summaries = [];
     $('div.sw-CardBase, li').each((i, el) => summaries.push($(el).text()));
     console.log(summaries.join(' ').substring(0, 500));
  } catch(e) {}
}
run();
