
const names = [
  '北野白梅町駅', '金閣寺', '大徳寺', '今宮神社', '平野神社', '立命館大学', '北大路駅',
  '北山駅', '鞍馬口駅', '上賀茂神社', '建勲神社', '光悦寺', '源光庵', '常照寺',
  '船岡山', '志明院', '神光院', '船岡温泉', '一文字屋和助',
  '京都府立植物園', '陶板名画の庭', '堂本印象美術館', '等持院', '正伝寺',
  '深泥池', '上賀茂 社家町', 'マールブランシュ 北山本店',
  '大徳寺 高桐院', '龍源院', 'かざりや', '中華のサカイ 本店',
  'グリルはせがわ', '東洋亭 本店', '泉仙 大慈院店',
  'WIFE&HUSBAND', '西陣 魚新', '葵家やきもち総本舗', '嘯月', 'らぁ麺 とうひち',
  '手打蕎麦 かね井', 'PEAR PRESS', '久我神社', '敷地神社', 'しょうざんリゾート',
  '吟醸らーめん 久保田 北店', '大滝', 'さらさ西陣'
];

async function check() {
  for (const name of names) {
    const url = 'https://html.duckduckgo.com/html/?q=' + encodeURIComponent(name + ' 京都 住所 区');
    try {
      const resp = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      const html = await resp.text();
      const match = html.match(/京都市([^s区]+区)/);
      if (match) {
        console.log(name, '=>', match[1]);
      } else {
        console.log(name, '=> NOT FOUND');
      }
    } catch(e) {}
    await new Promise(r => setTimeout(r, 600));
  }
}
check();
