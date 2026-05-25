async function check(q) {
  const url = 'https://search.yahoo.co.jp/search?p=' + encodeURIComponent(q + ' tabelog 京都');
  const headers = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' };
  const res = await fetch(url, { headers });
  const text = await res.text();
  
  if (text.includes('閉店')) console.log('CLOSED?', q);
}
async function run() {
    console.log("Checking closures...");
    await check('スマート珈琲 西京店');
    await check('寿司 誠');
    await check('リストランテ ナカモト');
    await check('喫茶 ヤマモト');
    await check('たま木亭');
    await check('俺のラーメン あっぱれ屋');
    await check('ステーキ大彦');
    await check('ステーキなか彦');
    await check('無鉄砲 総本店');
    await check('しゅばく');
    await check('走井餅老舗');
    await check('シェ・アガタ');
    await check('晴耕雨読');
    await check('らーめん ぎん琉');
    await check('麺屋 たけ井 本店');
    await check('風來房');
}
run();
