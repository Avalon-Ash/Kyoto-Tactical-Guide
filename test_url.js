async function getURL(q) {
  const url = 'https://search.yahoo.co.jp/search?p=' + encodeURIComponent(q + ' tabelog 京都');
  const headers = { 'User-Agent': 'Mozilla/5.0' };
  const res = await fetch(url, { headers });
  const text = await res.text();
  const m = text.match(/https:\/\/tabelog\.com\/kyoto\/A\d+\/A\d+\/\d+\//g);
  console.log(q, ':', m ? [...new Set(m)].slice(0, 2) : 'NOT FOUND');
}
async function run() {
    await getURL('スマート珈琲 西京店');
    await getURL('寿司 誠');
    await getURL('リストランテ ナカモト');
    await getURL('喫茶 ヤマモト');
    await getURL('たま木亭');
    await getURL('ステーキ大彦');
    await getURL('らーめん ぎん琉');
    await getURL('風來房');
}
run();
