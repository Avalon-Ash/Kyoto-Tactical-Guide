import * as cheerio from 'cheerio';
async function run() {
     const url = 'https://tabelog.com/kyoto/A2601/A260401/26028921/';
     try {
       const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0'} });
       const text = await res.text();
       const $ = cheerio.load(text);
       console.log($('title').text());
     } catch(e) { }
}
run();
