import fs from 'fs';

const names = [
  "北野天滿宮", "今出川駅", "相國寺", "廬山寺", "清浄華院", "梨木神社", "京都御所", "京都御苑", "同志社大学",
  "丸太町駅", "上七軒", "晴明神社", "白峯神宮", "妙顯寺", "本法寺", "一条戻橋", "西陣織會館", "堀川商店街",
  "澤屋 粟餅", "護王神社", "京都御苑 近衛邸跡", "京都御苑 縣井", "上御靈神社", "とらや 一条店", "鶴屋吉信 本店",
  "大將軍八神社", "妙蓮寺", "雨寶院", "千本釋迦堂", "千本ゑんま堂", "釘拔地藏", "幸神社", "三上家路地",
  "清荒神", "樂美術館", "菅原院天滿宮神社", "阿弥陀寺", "首途八幡宮", "宥清寺", "西陣 織成館", "西陣 鳥岩樓",
  "京都府庁旧本館", "京都御苑 九條池", "京都御苑 拾翠亭", "堀川水際公園", "一保堂茶舗 嘉木", "御料理 はやし",
  "長五郎餅本舗", "本家船はしや", "たわらや", "Le Petit Mec 今出川", "中国菜 Guu", "山中油店", "一条 ゑびす屋",
  "洋食 おがた", "一養軒", "IL GARAGE", "鳥さき", "天神市", "ha ra", "KAFE工船", "カフェ ミミミ", 
  "Coffee Base NASHINOKI", "さらさ西陣", "神馬", "YUGEN", "Stactile", "出町枡形商店街", "出町ふたば", "MARTIN"
];

async function check() {
  for (const name of names) {
    const url = 'https://html.duckduckgo.com/html/?q=' + encodeURIComponent(name + ' 京都 住所 区');
    try {
      const resp = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      const html = await resp.text();
      const match = html.match(/京都市([^\s区]+区)/);
      if (match) {
        console.log(name, '=>', match[1]);
      } else {
        console.log(name, '=> NOT FOUND');
      }
    } catch(e) {}
    await new Promise(r => setTimeout(r, 600));
  }
}
check();
