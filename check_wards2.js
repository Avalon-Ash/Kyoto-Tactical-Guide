const locations = [
  "一保堂茶舗 嘉木 京都",
  "本家船はしや 京都",
  "洋食 おがた 京都",
  "鳥さき 京都",
  "さらさ西陣 京都",
  "一養軒 京都",
  "IL GARAGE 京都"
];

async function check() {
  for (const loc of locations) {
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(loc)}`;
    try {
      const resp = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
      const html = await resp.text();
      // find instances of 京都市 and the ward
      const matches = html.match(/京都市([^\s区]+区)/g);
      console.log(loc, '=>', matches ? [...new Set(matches)] : 'NO WARD FOUND');
    } catch(e) {
      console.error(e);
    }
    await new Promise(r => setTimeout(r, 1000));
  }
}
check();
