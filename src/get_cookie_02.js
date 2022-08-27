let request = require("request-promise");
const cookieJar = request.jar();
//request = request.defaults({jar: cookieJar});
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
    const urlProxy = `http://${proxy.username}:${proxy.password}@${proxy.ip}:${proxy.port}`;
    request = request.defaults({
        method: 'GET',
        proxy: urlProxy, 
        jar: cookieJar
    })
    const result = await request(urlPetition)
    const cookies = cookieJar.getCookieString(urlPetition);
    const fileNamecookies = 'CookieBodega02.json';
    const filePathcookies = path.join(__dirname, `/BodegaAurrera/cookies/${fileNamecookies}`);
    fs.writeFileSync(filePathcookies, JSON.stringify(cookies), 'utf-8'); 
    console.log('...')
})()

