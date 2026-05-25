async function get(q) {
  const url = 'https://html.duckduckgo.com/html/?q=' + encodeURIComponent(q);
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
    await get('リストランテ ナカモト 閉店');
    await get('喫茶 ヤマモト 閉店');
    await get('たま木亭 閉店');
    await get('大彦ステーキ 西京区 閉店');
    await get('しゅばく 閉店');
    await get('シェ・アガタ 閉店');
    await get('スマート珈琲店 西京 閉店');
    await get('晴耕雨読 カフェ 京都 閉店');
    await get('風来房 桂 閉店');
}
run();
