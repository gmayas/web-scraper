
const cheerio = require("cheerio");
const puppeteer = require("puppeteer");
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const { querySelectorDeep } = require("query-selector-shadow-dom");
//import { querySelectorAllDeep, querySelectorDeep } from 'query-selector-shadow-dom';
//puppeteer.registerCustomQueryHandler('shadow', QueryHandler);

//
const urlHome = "https://super.walmart.com.mx/"


const getDepartments = async () => {
    try {

        const browser = await puppeteer.launch({
            headless: true,
            ignoreHTTPSErrors: true,
            slowMo: 1000,
            args: ["--start-maximized", "--use-gl=egl"],
        });
        const page = await browser.newPage();
        /*await page.authenticate({
            username: proxy.username,
            password: proxy.password
        })*/
        await page.setViewport({
            width: 1122,
            height: 800,
            deviceScaleFactor: 1,
        });
        await page.goto(urlHome, {
            waitUntil: 'networkidle2',
            timeout: 0
        });
        //await page.waitForTimeout(2000);
        // Process Scraper
        let html, $, links = [];
        await page.waitForTimeout(2000);
        const cookies = await page.cookies();
        await browser.close();
        
        //let data = JSON.stringify(...cookies);
        //console.log('data:',...data);
        const fileNamecookies = 'bodyMainWalmart01.json';
        const filePathcookies = path.join(__dirname, `/Walmart/${fileNamecookies}`);
        fs.writeFileSync(filePathcookies, ...cookies, 'utf-8'); 
        const fileName = 'bodyMainWalmart01.html';
        const filePath = path.join(__dirname, `/Walmart/${fileName}`);
        fs.writeFileSync(filePath, html, 'utf-8'); 
        return links;
    } catch (e) {
        console.log('error:', e)
        return [];
    };
};

//
const main = async () => {
    try {
        console.log("Starting Desafio humano Bodega Aurrera ...")
        let departments = await getDepartments();
        console.log("End Starting Desafio humano Bodega Aurrera ...")
    } catch (error) {
        console.log('error message:', error.message)
    };
};
//
main();
//

const getChildrenCategories = () => {
    try {

    } catch (e) {
        console.log('error:', e)
        return [];
    };
};







// Es URL?
const isURL = (hRef) => {
    let res = false;
    if (!(typeof hRef === 'undefined' || hRef === '' || hRef === null)) {
        res = hRef.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
    };
    return (res !== null)
};

// Get last item
const getLastItem = (hRef) => {
    let arr = hRef;
    arr = arr.replace(/^[/]/, ""); //Quitarmos diagonales principio y final
    arr = arr.split('/'); // Convertimos en array
    return arr.pop(); //Obtenemos el ultimo elemento

}

// Get num item
const getNumItem = (hRef, NumItem) => {
    let arr = hRef;
    arr = arr.replace(/^[/]/, ""); //Quitarmos diagonales principio y final
    arr = arr.split('/'); // Convertimos en array
    let data = arr[NumItem]; //Obtenemos el elemento NumItem
    return removeAccents(data.trim().toLowerCase());;
};

// Get first item
const getFirstItem = (hRef) => {
    let arr = hRef;
    arr = arr.replace(/^[/]/, ""); //Quitarmos diagonales principio y final
    arr = arr.split('/'); // Convertimos en array
    let data = arr[0];
    //.trim().replace(/\s/g, "-").replace(/["]/g, 'plg').replace(/[,.;:]/g, '').toLowerCase());
    return removeAccents(data.trim().toLowerCase());; //Obtenemos el primer elemento
};

// Get second item
const getSecondItem = (hRef) => {
    let arr = hRef;
    arr = arr.replace(/^[/]/, ""); //Quitarmos diagonales principio y final
    arr = arr.split('/'); // Convertimos en array
    let data = arr[1];
    //.trim().replace(/\s/g, "-").replace(/["]/g, 'plg').replace(/[,.;:]/g, '').toLowerCase());
    return removeAccents(data.trim().toLowerCase());; //Obtenemos el primer elemento
};

// Get third item
const getThirdItem = (hRef) => {
    let arr = hRef;
    console.log('hRef:', hRef);
    arr = arr.replace(/^[/]/, ""); //Quitarmos diagonales principio y final
    arr = arr.split('/'); // Convertimos en array
    console.log('arr:', arr);
    let data = arr[2];
    //.trim().replace(/\s/g, "-").replace(/["]/g, 'plg').replace(/[,.;:]/g, '').toLowerCase());
    return removeAccents(data.trim().toLowerCase());; //Obtenemos el primer elemento
};

// Remove Accents y Tildes 
const removeAccents = (str) => { return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "") };




const getHtmlSams = async () => {

    const urlAxios = "https://www.sams.com.mx/vinos-licores-y-cervezas/cervezas/clara/_/N-95v";
    const response = await axios.get(urlAxios);
    //console.log('response:', response.data)
    let html = response.data;
    const fileName = 'N-95v.html';
    const filePath = path.join(__dirname, `/samsHTML/${fileName}`);
    fs.writeFileSync(filePath, html, 'utf-8');
}



/*
const fileName = 'jumbo.html';
        const filePath = path.join(__dirname, `/filesHtml/${fileName}`);
        console.log('filePath:', filePath)
        await fs.writeFileSync(filePath, html, 'utf-8');
*/