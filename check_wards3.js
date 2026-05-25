const locations = [
  "洋食 おがた 京都"
];

async function check() {
  for (const loc of locations) {
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(loc)}`;
    try {
      const resp = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
      const html = await resp.text();
      const matches = html.match(/.{0,20}区.{0,20}/g);
      console.log(loc, '=>', matches ? [...new Set(matches)] : 'NO WARD FOUND');
    } catch(e) {
      console.error(e);
    }
  }
}
check();
