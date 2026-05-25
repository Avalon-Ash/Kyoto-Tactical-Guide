async function get(q) {
  const url = 'https://html.duckduckgo.com/html/?q=' + encodeURIComponent(q + ' tabelog 京都');
  const headers = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Safari/537.36' };
  try {
    const res = await fetch(url, { headers });
    const text = await res.text();
    const t = text.match(/<a class="result__snippet[^>]+>(.*?)<\/a>/g);
    if(t) {
      console.log('Result for ' + q + ':\n' + t.slice(0, 3).map(x => x.replace(/<[^>]+>/g, '')).join('\n'));
      const m = text.match(/https:\/\/tabelog\.com\/kyoto\/A\d+\/A\d+\/\d+\//g);
      console.log(m ? [...new Set(m)] : 'No URLs');
    } else {
        console.log('No result for ' + q);
    }
  } catch(e) {
      console.log('Error for ' + q + ':', e.message);
  }
}
get('篩月');
get('嵯峨嵐山 文の助茶屋');
get('鶴屋吉信 嵐山店');
get('焼肉 弘 嵯峨野店');
get('竹林茶屋 嵐山');
