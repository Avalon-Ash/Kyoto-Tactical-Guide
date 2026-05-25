
async function check() {
  const url = 'https://html.duckduckgo.com/html/?q=' + encodeURIComponent('MALEBRANCHE 北山本店 住所 区');
  try {
    const resp = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const html = await resp.text();
    const match = html.match(/.{0,20}区.{0,20}/g);
    console.log([...new Set(match)]);
  } catch(e) {}
}
check();
