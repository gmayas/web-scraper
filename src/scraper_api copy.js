const scraperapiClient = require('scraperapi-sdk')('51d5aa11c839a3f5b61bd6b245967206')
const url = "https://www.bodegaaurrera.com.mx/api/v2/page/browse/cervezas-vinos-y-licores/licores-y-destilados/sakes?page=0&size=48&siteId=bodega";
//
const getData = async () => {
    for (let i = 0; i < 1000; i++) {
        try {
            const response = await scraperapiClient.get(url);
            let dataReturn = JSON.parse(response);
            //console.error('dataReturn:', dataReturn);
            console.error('Ok ...');
        }
        catch (error) {
            console.error('error ...');
            console.error('error:', error.message);
            
        };
    };
}
//
getData();