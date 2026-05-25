async function get(q) {
  const url = 'https://search.yahoo.co.jp/search?p=' + encodeURIComponent(q);
  const headers = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' };
  try {
    const res = await fetch(url, { headers });
    const text = await res.text();
    // Yahoo search usually has snippet in <span class="sw-Card__summary"> or similar, just text match
    // Let's just find common phrases like "閉店" nearby the name.
    console.log("length of yahoo:", text.length);
    const m = text.match(/<span class="[^"]*summary[^"]*">(.*?)<\/span>/g);
    if(m) {
        console.log(m.slice(0,3).map(x => x.replace(/<[^>]+>/g, '')));
    }
  } catch(e) {
      console.log('Error:', e.message);
  }
}
get('風来房 桂 閉店');
