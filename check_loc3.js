import * as cheerio from 'cheerio';
async function run() {
  const ids = [
    '26019655', // 寿司誠 (Ukyo: 並河? Kameoka?)
    '26006109', // なか彦 (大彦) (GionShijo? Higashiyama?)
    '26003956', // 風來房 (Nagaokakyo?)
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
