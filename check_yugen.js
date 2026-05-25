async function go() {
  const resp = await fetch("https://html.duckduckgo.com/html/?q=" + encodeURIComponent("YUGEN cafe 京都"), { headers: {'User-Agent':'PostmanRuntime/7.32.3'} });
  const text = await resp.text();
  const match = text.match(/.{0,20}区.{0,20}/g);
  console.log("Match:", match ? [...new Set(match)] : 'None');
}
go();
