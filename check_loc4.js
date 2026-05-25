import * as cheerio from 'cheerio';
async function run() {
  const ids = [
    '26035570', // 大彦 second tabelog link
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
