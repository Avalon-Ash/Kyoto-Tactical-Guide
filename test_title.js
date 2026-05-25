import * as cheerio from 'cheerio';
async function run() {
  const ids = [
    '26000647', // スマート
    '26019655', // 寿司誠
    '26006109', // なか彦 (大彦)
    '26003310', // 走井餅老舗
    '26032135'  // 焼肉きんぐ 桂
  ];
  for(const id of ids) {
     const url = 'https://tabelog.com/kyoto/A2601/A260101/' + id + '/';
     try {
       const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0'} });
       const text = await res.text();
       const $ = cheerio.load(text);
       console.log(id, $('title').text());
     } catch(e) { }
  }
}
run();
