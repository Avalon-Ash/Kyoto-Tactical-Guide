import * as cheerio from 'cheerio';
async function getTabelog(id) {
     const url = 'https://tabelog.com/kyoto/A2601/A260403/' + id + '/';
     try {
       const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0'} });
       const text = await res.text();
       const title = cheerio.load(text)('title').text();
       console.log(id, ':', title);
     } catch (e) {}
}
async function run() {
    await getTabelog('26000923'); // 篩月
    await getTabelog('26030279'); // 竹取茶屋
}
run();
