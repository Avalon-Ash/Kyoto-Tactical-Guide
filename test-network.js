const https = require('https');
https.get('https://google.com', (res) => {
  console.log('StatusCode:', res.statusCode);
}).on('error', (e) => {
  console.error(e);
});
