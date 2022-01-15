
const cheerio = require("cheerio");
const puppeteer = require("puppeteer");
const path = require('path');
const fs = require('fs');
const axios = require('axios');
//
const urlHome = "https://www.tiendasmetro.co/";
//
const main = async () => {
    try {
        let html, $;
        /*const browser = await puppeteer.launch({
            headless: true,
            slowMo: 1000,
            args: ["--start-maximized", "--use-gl=egl"],
        });
        const page = await browser.newPage();
        await page.setViewport({
            width: 1122,
            height: 800,
            deviceScaleFactor: 1,
        });
        await page.goto(urlHome, {
            waitUntil: 'load',
            timeout: 0
        });
       // await page.click(".button-categories");
        html = await page.evaluate(() => document.querySelector("header div.container__header div.storeMainMenu div.desktop-menu").outerHTML);*/
        //const urlAxios = "https://www.tiendasjumbo.co/buscapagina?fq=isAvailablePerSalesChannel_1:1&sl=49a31962-b0e8-431b-a189-2473c95aeeeb&PS=18&cc=18&sm=0&PageNumber=1&fq=C%3a%2f2000476%2f2000477%2f2000478%2f&O=OrderByTopSaleDESC";
        //console.log('html:', html);
        //const fileName = 'CatTiendasMetro.html';
        //const filePath = path.join(__dirname, `/filesHtml/${fileName}`);
        //fs.writeFileSync(filePath, html, 'utf-8');
        //const urlAxios = "https://www.tiendasjumbo.co/supermercado/despensa";
        const urlAxios = "https://www.tiendasmetro.co/buscapagina?sl=f4c983d7-a76d-4ae9-8dc6-775a5fc50853&PS=18&cc=18&sm=0&PageNumber=1&&fq=C%3a%2f277%2f288%2f289%2f&O=OrderByBestDiscountDESC";
        const response = await axios.get(urlAxios);
        console.log('response:', response.data)
        html = response.data;
        const fileName = 'TiendasMetroCatPag.html';
        const filePath = path.join(__dirname, `/filesHtml/${fileName}`);
        fs.writeFileSync(filePath, html, 'utf-8');
        /*$ = cheerio.load(html);
        const buscapagina =  $('div.vitrine script').html();
        console.log('buscapagina:', buscapagina);
        const inicio = buscapagina.indexOf('fq=');
        const fin = buscapagina.indexOf('&PS');
        const fq = buscapagina.slice(inicio, fin);
        console.log('fq:', fq);*/
         
        /*const urlAxios = "https://www.tiendasjumbo.co/buscapagina?fq=isAvailablePerSalesChannel_1:1&sl=49a31962-b0e8-431b-a189-2473c95aeeeb&PS=18&cc=18&sm=0&PageNumber=1&fq=C%3a%2f2000666%2f&O=OrderByTopSaleDESC";
        const response = await axios.get(urlAxios);
        html = response.data;
        $ = cheerio.load(html);
        let listProductid = []; 
        $('div.product-shelf ul li div div div button').each((index, content) => {
            let dataProductid = $(content).attr('data-productid');
            if (!(typeof dataProductid === 'undefined' || dataProductid === '' || dataProductid === null || dataProductid === 0)) { 
                listProductid.push(dataProductid)
            };
        });
        
        console.log('listProductid:', listProductid); 
        let data = [], links = [];*/


        //console.log('links:', links);
        //await browser.close();
    } catch (e) {
        console.log('error:', e)
    };
};
//
main();
//



/*
const fileName = 'jumbo.html';
        const filePath = path.join(__dirname, `/filesHtml/${fileName}`);
        console.log('filePath:', filePath)
        await fs.writeFileSync(filePath, html, 'utf-8');
*/