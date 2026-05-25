import * as cheerio from 'cheerio';
async function run() {
  const ids = [
    '26004446',
    '26005250',
    '26001297',
    '26001312',
    '26025913',
    '26000713',
    '26004769',
    '26032681',
    '26007108',
    '26000967',
    '26000808',
    '26019365',
    '26000921',
    '26032809',
    '26000403',
    '26000814',
    '26031118',
    '26037294',
    '26017027',
    '26000715',
    '26030903',
    '26028179',
    '26032124',
    '26005146'
  ];
  for(const id of ids) {
     const url = 'https://tabelog.com/kyoto/A2601/A260101/' + id + '/';
     try {
       const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0'} });
       const text = await res.text();
       const $ = cheerio.load(text);
       const title = $('title').text();
       if (title.includes('閉店') || text.includes('【閉店】')) {
          console.log('CLOSED:', id, title);
       } else if (title.includes('移転') || text.includes('【移転】')) {
          console.log('MOVED:', id, title);
       } else {
          console.log('OPEN:', id, title);
       }
     } catch(e) { }
  }
}
run();
