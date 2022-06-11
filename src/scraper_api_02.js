const scraperapiClient = require('scraperapi-sdk')('51d5aa11c839a3f5b61bd6b245967206')
const url = "https://www.bodegaaurrera.com.mx/api/v2/page/browse/cervezas-vinos-y-licores/licores-y-destilados/sakes?page=0&size=48&siteId=bodega";
//
const axios = require('axios');

(async() => {
  const { response } = await axios({
    data: {
      apiKey: '51d5aa11c839a3f5b61bd6b245967206',
      url
    },
    headers: { 'Content-Type': 'application/json' },
    method: 'GET',
    url: 'https://async.scraperapi.com/jobs'
  });
 
  console.log('Ok ...');
})();