const puppeteer = require('puppeteer');
const randomUseragent = require("random-useragent");
const path = require('path');
const fs = require('fs');
const proxyList = require("./proxy/proxyList");
const urlPetition = 'https://www.bodegaaurrera.com.mx';

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

(async () => {
    const proxy = getProxyData();
    const urlProxy = `http://${proxy.ip}:${proxy.port}`;
    const herder = randomUseragent.getRandom ((ua) => {
          return ua.browserName === 'Firefox'; 
    });
    const browser = await puppeteer.launch({
        headless: true,
        slowMo: 1000,
        ignoreHTTPSErrors:true,
       // args: ["--start-maximized", "--use-gl=egl", `--proxy-server=${urlProxy}`],
    });
    const page = await browser.newPage();
    await page.authenticate({
        username: proxy.username,
        password: proxy.password
    });
    await page.setViewport({
        width: 1122,
        height: 800,
        deviceScaleFactor: 1,
    });
    await page.setUserAgent(herder);
    await page.waitForTimeout(5000);
    await page.goto(urlPetition, {
        waitUntil: 'networkidle2',
        timeout: 0
    });
    const cookies = await page.cookies();
    const filePathIMG = path.join(__dirname, `/BodegaAurrera/cookies/screenshot_GC01.png`);
    await page.screenshot({ path: filePathIMG })
    await browser.close()
    const fileNamecookies = 'CookieBodega01.json';
    const filePathcookies = path.join(__dirname, `/BodegaAurrera/cookies/${fileNamecookies}`);
    fs.writeFileSync(filePathcookies, JSON.stringify(cookies), 'utf-8'); 
    
    console.log('...')
})()