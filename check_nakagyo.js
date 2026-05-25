const locations = ["IL GARAGE 京都 住所", "鳥さき 京都 住所", "YUGEN 京都 住所"];
async function go() {
  for (const loc of locations) {
    const resp = await fetch("https://html.duckduckgo.com/html/?q=" + encodeURIComponent(loc), { headers: {'User-Agent':'PostmanRuntime/7.32.3'} });
    const text = await resp.text();
    const match = text.match(/.{0,20}区.{0,20}/g);
    console.log(loc, "=>", match ? match[0] : 'None');
    await new Promise(r => setTimeout(r, 600));
  }
}
go();
