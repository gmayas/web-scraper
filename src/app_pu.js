const puppeteer = require('puppeteer');
const proxyList = require("./proxy/proxyList");
const fs = require("fs");
const path = require("path");
//const urlPetition = 'https://www.exito.com/';
const urlPetition = 'https://www.exito.com/moda-y-accesorios/bodys-y-enterizos-bebe-nino-nina';
//const urlPetition = 'https://www.carulla.com/';
//const urlPetition = 'https://www.chedraui.com.mx/';


const getProxyData = () => {
  const proxies = proxyList;
  const randomNumber = Math.floor(Math.random() * proxies.length);
  const proxyItem = proxies[randomNumber];
  const proxy = {
    ip: proxyItem.ip,
    port: proxyItem.port,
    username: proxyItem.username,
    password: proxyItem.password,
  };
  return proxy;
};

const saveLog = async (data) => {
  try {
      const fileName = `PU-mercado-lacteos-huevos-y-refrigerados-huevos.log`;
      const content = `${data}\n`;
      const filePath = path.join(__dirname, `/logs/${fileName}`);
      fs.appendFileSync(filePath, content, "utf-8");
  } catch (error) {
      console.error('error:', error.message);
  };
};


(async () => {
  //const proxy = getProxyData();
  //const urlProxy = `http://${proxy.ip}:${proxy.port}`;
  const browser = await puppeteer.launch({
    headless: true,
    slowMo: 1000,
    //args: ["--start-maximized", "--use-gl=egl", `--proxy-server=${urlProxy}`],
  });
  const page = await browser.newPage();
 /* await page.authenticate({
    username: proxy.username,
    password: proxy.password
  });*/
  await page.setViewport({
    width: 1122,
    height: 800,
    deviceScaleFactor: 1,
  });
  await page.waitForTimeout(5000);
  await page.setViewport({ width: 1200, height: 800 })
  await page.setRequestInterception(true)
  page.on('request', async (request) => {
      //console.log('request: ', request.method(), request.url());
      //await saveLog(`request: ${request.method()} - ${request.url()}`);
      request.continue()
  });
  page.on('response', async (response) => {
    //console.log('response:', response.status(), response.url());
    const res = response.url();
    if (res.includes("productSearch")) { 
      const decodeUrl = decodeURIComponent(res);
      const ini = decodeUrl.indexOf('"variables":"');
      const textData = decodeUrl.slice(ini);
      const variables  =textData.replace("variables", "").replace(/[":}]/g, "");
      const decodedData = atob(variables);
      console.log('textData:', textData);
      console.log('variables:', variables);
      console.log('decodedData:', decodedData);
      await saveLog(`${decodeUrl}\n${variables}\n${decodedData} `);
    }
  });
  await page.goto(urlPetition, { waitUntil: 'networkidle2', timeout: 0 });
  //await page.screenshot({ path: 'screenshot_pu.png' })
  await browser.close()
})()