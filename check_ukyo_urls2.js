async function getURL(q) {
  const url = 'https://search.yahoo.co.jp/search?p=' + encodeURIComponent(q + ' tabelog 京都');
  const headers = { 'User-Agent': 'Mozilla/5.0' };
  try {
      const res = await fetch(url, { headers });
      const text = await res.text();
      const m = text.match(/https:\/\/tabelog\.com\/kyoto\/A\d+\/A\d+\/\d+\//g);
      console.log(q, ':', m ? [...new Set(m)].slice(0, 1) : 'NOT FOUND');
  } catch(e) { }
}
async function run() {
    await getURL('高雄 錦水亭');
    await getURL('嵯峨野湯');
    await getURL('嵯峨豆腐 竹仙');
    await getURL('吉兆 嵐山本店');
    await getURL('アラビカ京都 嵐山');
    await getURL('老松 嵐山本店');
    await getURL('嵯峨嵐山 文の助茶屋');
    await getURL('パンとエスプレッソと嵐山庭園');
    await getURL('嵐山 鯛匠 HANANA');
    await getURL('ぎゃあてい');
    await getURL('竹林茶屋 嵐山');
    await getURL('平野屋 嵯峨');
    await getURL('鶴屋吉信 嵐山店');
    await getURL('廣川 うなぎ');
    await getURL('ステーキおおつか 嵐山');
    await getURL('嵐山 よしむら');
    await getURL('篩月');
    await getURL('豆腐料理 嵯峨野');
    await getURL('ピッツェリア ルガラ');
    await getURL('そばしき 嵐山総本店');
    await getURL('らーめん 嵐丸');
    await getURL('琴きき茶屋');
    await getURL('嵐山 喜重郎');
    await getURL('焼肉処 弘 嵯峨野店');
    await getURL('Kew 龍安寺');
    await getURL('焼肉 やる気 西院店');
}
run();
