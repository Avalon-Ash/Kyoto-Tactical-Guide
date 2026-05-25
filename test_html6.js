async function get(q) {
  const url = 'https://html.duckduckgo.com/html/?q=' + encodeURIComponent(q);
  const headers = { 'User-Agent': 'Mozilla/5.0' };
  const res = await fetch(url, { headers });
  const text = await res.text();
  const a_tags = text.match(/<a class="[^"]*"[^>]*>/g);
  if(a_tags) {
      console.log(Array.from(new Set(a_tags.map(t => t.match(/class="([^"]*)"/)[1]))));
  }
}
get('風来房 桂 閉店');
