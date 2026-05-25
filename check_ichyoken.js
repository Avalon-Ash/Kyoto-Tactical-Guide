async function go() {
  const resp = await fetch("https://tabelog.com/kyoto/rstLst/?vs=1&sa=&sk=%E4%B8%80%E9%A4%8A%E8%BB%92&lid=hd_search1&vac_net=&svd=20240321&svt=1930&svps=2&hfc=1");
  const text = await resp.text();
  const match = text.match(/京都府京都市([^区]+区)/g);
  console.log("Match:", match ? [...new Set(match)] : 'None');
}
go();
