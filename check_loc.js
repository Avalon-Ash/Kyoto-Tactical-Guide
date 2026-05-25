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
    await searchKyoto('中村軒'); // Nishikyo
    await searchKyoto('リストランテ ナカモト'); // Not Nishikyo
    await searchKyoto('喫茶 ヤマモト'); // Ukyo (Saga)
    await searchKyoto('たま木亭'); // Uji
    await searchKyoto('俺のラーメン あっぱれ屋'); // Joyo
    await searchKyoto('無鉄砲 総本店'); // Kizugawa
    await searchKyoto('しゅばく'); // Uji
    await searchKyoto('走井餅老舗'); // Yawata
    await searchKyoto('シェ・アガタ'); // Uji
    await searchKyoto('晴耕雨読 カフェ'); // Uji
    await searchKyoto('らーめん ぎん琉'); 
    await searchKyoto('麺屋 たけ井 本店'); // Joyo
    await searchKyoto('焼肉きんぐ 京都桂店');
}
run();
