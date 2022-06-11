const axios = require("axios");
const proxyList = require("./proxy/proxyList");

const urlTest = "https://anthonvg-my-public-ip.herokuapp.com/v4/ip";
const url = " https://super.walmart.com.mx/api/rest/model/atg/commerce/catalog/ProductCatalogActor/getSkuPriceInventoryPromotions?skuId=00750100866021,00740100500451,00750100866020,00750100866019,00750100864524,00750103504500,00002696485274,00750104371225,00750103502020,00002696417719,00002696433422,00740100501058,00002696490429,00002696482396,00750103502010,00750100861113,00761011301237,00761011301384,00500028105537,00750103504502&storeId=0000009999";

const getData = async () => {
  for (let i = 0; i < 1000; i++) {
    let response, responseTest;
    const headers = {
      "content-type": "application/json",
      accept: "application/json",
      "accept-encoding": "gzip, deflate, br",
      "accept-language": "es-ES,es;q=0.9",
      banner: "WM_OD",
      origin: "https://super.walmart.com.mx/",
      referer: "https://super.walmart.com.mx/",
      "sec-ch-ua-platform": "Windows",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.67 Safari/537.36"
    };
    try {
      const proxy = getProxyData();
      responseTest = await axios({
        method: "get",
        url: urlTest,
        proxy: {
          host: proxy.ip,
          port: proxy.port,
          auth: { username: proxy.username, password: proxy.password },
        },
      });
      console.log('responseTest IP: ', responseTest.data.ip);
      response = await axios({
        method: "get",
        url: url,
        headers,
        proxy: {
          host: proxy.ip,
          port: proxy.port,
          auth: { username: proxy.username, password: proxy.password },
        },
      });
      console.log('response.status;:', response.status);
    } catch (error) {
      console.log('error:', error.message);
      console.log('response code:', error.response.status);
      console.log('responseTest: ', responseTest.data);
      //console.log('...');
    }
  }
};
const getProxyData = () => {
  const proxies = proxyList;
  let randomNumber = Math.floor(Math.random() * proxies.length);
  const proxyItem = proxies[randomNumber];
  let proxy = {
    ip: proxyItem.ip,
    port: proxyItem.port,
    username: proxyItem.username,
    password: proxyItem.password,
  };
  return proxy;
};
