async function get(q) {
  const url = 'https://html.duckduckgo.com/html/?q=' + encodeURIComponent(q + ' tabelog 京都');
  const headers = { 'User-Agent': 'Mozilla/5.0' };
  try {
    const res = await fetch(url, { headers });
    const text = await res.text();
    const t = text.match(/<a class="result__snippet[^>]+>(.*?)<\/a>/g);
    if(t) {
      console.log('Result for ' + q + ':\n' + t.slice(0, 3).map(x => x.replace(/<[^>]+>/g, '')).join('\n'));
    } else {
        console.log('No result for ' + q);
    }
  } catch(e) {
      console.log('Error for ' + q + ':', e.message);
  }
}
async function run() {
    await get('寿司 誠 西京区 閉店');
    await get('中村軒 西京区 閉店');
    await get('リストランテ ナカモト 閉店');
    await get('喫茶 ヤマモト 閉店');
    await get('たま木亭 閉店');
    await get('俺のラーメン あっぱれ屋 閉店');
    await get('大彦牛排 西京区 閉店');
    await get('無鉄砲 総本店 閉店');
    await get('しゅばく 閉店');
    await get('走井餅老舗 閉店');
    await get('シェ・アガタ 閉店');
    await get('スマート珈琲店 西京店 閉店');
    await get('晴耕雨読 閉店');
    await get('ラーメン ぎん琉 閉店');
    await get('麺屋 たけ井 本店 閉店');
    await get('風来房 閉店');
    await get('焼肉きんぐ 京都桂店 閉店');
}
run();
