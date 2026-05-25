async function get(q) {
  const url = 'https://html.duckduckgo.com/html/?q=' + encodeURIComponent(q);
  const headers = { 'User-Agent': 'Mozilla/5.0' };
  const res = await fetch(url, { headers });
  const text = await res.text();
  console.log("length:", text.length);
  const msgs = text.match(/<div class="msg[^>]*>(.*?)<\/div>/g);
  console.log(msgs);
}
get('風来房 桂 閉店');
