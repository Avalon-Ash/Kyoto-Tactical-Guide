import * as cheerio from 'cheerio';
async function run() {
  const ids = [
    '26000647', // スマート
    '26019655', // 寿司誠
    '26018907', // ナカモト
    '26002143', // ヤマモト
    '26002673', // たま木亭
    '26011681', // あっぱれ屋
    '26006109', // なか彦 (大彦)
    '26000572', // 無鉄砲 総本店
    '26008696', // しゅばく
    '26003310', // 走井餅老舗
    '26001097', // シェ・アガタ
    '26030588', // 晴耕雨読
    '26028921', // ぎん琉
    '26018288', // たけ井
    '26003956', // 風來房
    '26032135'  // 焼肉きんぐ 桂
  ];
  for(const id of ids) {
     const url = 'https://tabelog.com/kyoto/A2601/A260101/' + id + '/';
     try {
       const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0'} });
       const text = await res.text();
       if (text.includes('【閉店】')) {
          console.log('CLOSED:', id);
       } else {
          console.log('OPEN:', id);
       }
     } catch(e) { console.log('Err:', id); }
  }
}
run();
