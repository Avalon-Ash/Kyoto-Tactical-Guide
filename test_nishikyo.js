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
    await get('寿司 誠 京都');
    await get('大彦 ステーキ 京都');
    await get('スマート珈琲店 西京');
    await get('風来房 京都');
}
run();
