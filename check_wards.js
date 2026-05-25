const locations = [
  "丸太町駅",
  "一保堂茶舗 嘉木",
  "本家船はしや",
  "洋食 おがた",
  "鳥さき",
  "さらさ西陣",
  "一養軒",
  "IL GARAGE",
  "YUGEN"
];

async function check() {
  for (const loc of locations) {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(loc + ' 京都')}&format=json&addressdetails=1`;
    try {
      const resp = await fetch(url, { headers: { 'User-Agent': 'ais-test' } });
      const data = await resp.json();
      if (data && data.length > 0) {
        console.log(loc, '=>', data[0].address.ward || data[0].address.suburb || data[0].display_name);
      } else {
        console.log(loc, '=> NOT FOUND');
      }
    } catch(e) {
      console.error(e);
    }
    await new Promise(r => setTimeout(r, 1000));
  }
}
check();
