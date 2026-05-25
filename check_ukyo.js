import * as cheerio from 'cheerio';
async function searchKyoto(q) {
  const url = 'https://search.yahoo.co.jp/search?p=' + encodeURIComponent(q + ' tabelog 京都');
  const headers = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' };
  const res = await fetch(url, { headers });
  const text = await res.text();
  const $ = cheerio.load(text);
  const results = [];
  $('div.sw-CardBase, li').each((i, el) => {
    results.push($(el).text());
  });
  const snippet = results.join(' ');
  if (snippet.includes('閉店')) {
      console.log('CLOSED:', q);
  } else {
      console.log('OPEN:', q);
  }
}
async function run() {
    await searchKyoto('錦水亭');
    await searchKyoto('嵯峨野湯');
    await searchKyoto('竹仙');
    await searchKyoto('吉兆 嵐山本店');
    await searchKyoto('アラビカ京都 嵐山');
    await searchKyoto('老松 嵐山本店');
    await searchKyoto('嵯峨嵐山 文の助茶屋');
    await searchKyoto('パンとエスプレッソと嵐山庭園');
    await searchKyoto('鯛匠 HANANA');
    await searchKyoto('ぎゃあてい');
    await searchKyoto('竹林茶屋 嵐山');
    await searchKyoto('平野屋 嵯峨');
    await searchKyoto('鶴屋吉信 嵐山店');
    await searchKyoto('廣川 うなぎ');
    await searchKyoto('ステーキ おおつか 嵐山');
    await searchKyoto('嵐山 よしむら');
    await searchKyoto('篩月');
    await searchKyoto('豆腐料理 嵯峨野');
    await searchKyoto('ピッツェリア ルガラ');
    await searchKyoto('そばしき 嵐山総本店');
    await searchKyoto('らーめん 嵐丸');
    await searchKyoto('本家 琴きき茶屋');
    await searchKyoto('嵐山 喜重郎');
    await searchKyoto('焼肉処 弘 嵯峨野店');
    await searchKyoto('Kew 龍安寺');
    await searchKyoto('焼肉 やる気 西院店');
}
run();
