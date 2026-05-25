async function get(q) {
  const url = 'https://html.duckduckgo.com/html/?q=' + encodeURIComponent(q + ' tabelog 京都');
  const headers = { 'User-Agent': 'Mozilla/5.0' };
  const res = await fetch(url, { headers });
  const text = await res.text();
  console.log(text.match(/class="[^"]*snippet[^"]*"/g));
}
get('スマート珈琲店 西京');
