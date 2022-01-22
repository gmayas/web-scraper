
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
        let data = [], links = [];
        const browser = await puppeteer.launch({
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
        //html = await page.evaluate(() => document.querySelector("header div.container__header div.header-third-row div.desktop-menu div#desktop-menu-container div.menu-content-desktop div.menuDepartments").outerHTML);
        //const urlAxios = "https://www.tiendasjumbo.co/buscapagina?fq=isAvailablePerSalesChannel_1:1&sl=49a31962-b0e8-431b-a189-2473c95aeeeb&PS=18&cc=18&sm=0&PageNumber=1&fq=C%3a%2f2000476%2f2000477%2f2000478%2f&O=OrderByTopSaleDESC";
        //console.log('html:', html);
        // Process Scraper
        html = await page.evaluate(() => document.querySelector("header div.container__header div.header-third-row div.desktop-menu div#desktop-menu-container div.menu-content-desktop div.menuDepartments").outerHTML);
        $ = cheerio.load(html);
        let department, hrefDepartment, category, hrefCategory, subCategory, hrefSubCategory; 
        // Get department 
        $('div.menuDepartments div.department a.redirect').each((indexDepartment, contentDepartment) => {
            department = removeAccents($(contentDepartment).text().trim().replace(/\s/g, "-").replace(/["]/g, 'plg').replace(/[,.;:]/g, '').toLowerCase());
            hrefDepartment = $(contentDepartment).attr('href');
            $(`div.menuDepartments div.department div.menuCategories div.${department} div.column div.category a.title`).each((indexCategory, contentCategory) => { 
                category = removeAccents($(contentCategory).text().trim().replace(/\s/g, "-").replace(/["]/g, 'plg').replace(/[,.;:]/g, '').toLowerCase());
                hrefCategory = $(contentCategory).attr('href');
                $(`div.menuDepartments div.department div.menuCategories div.${department} div.column div.category a`).each((indexSubCategory, contentSubCategory) => { 
                    subCategory = removeAccents($(contentSubCategory).text().trim().replace(/\s/g, "-").replace(/["]/g, 'plg').replace(/[,.;:]/g, '').toLowerCase());
                    hrefSubCategory = $(contentSubCategory).attr('href');
                    links.push({ department, hrefDepartment, category, hrefCategory, subCategory, hrefSubCategory });
                });
            });
        });
        const fileName = 'listCatTiendasMetro.json';
        const filePath = path.join(__dirname, `/tiendasMetroHTML/filesJson/${fileName}`);
        fs.writeFileSync(filePath, JSON.stringify(links), 'utf-8');
        //const urlAxios = "https://www.tiendasjumbo.co/supermercado/despensa";
        //const urlAxios = "https://www.tiendasmetro.co";
        //const response = await axios.get(urlAxios);
        //console.log('response:', response.data)
        //html = response.data;
        //const fileName = 'mainTiendasMetro.html';
        //const filePath = path.join(__dirname, `/tiendasJumboHTML/${fileName}`);
        //fs.writeFileSync(filePath, html, 'utf-8');
        /*$ = cheerio.load(html);
        let inicio, fin;        
        const buscapagina =  $('div.vitrine script').html();
        console.log('buscapagina:', buscapagina);
        inicio = buscapagina.indexOf('fq=');
        fin = buscapagina.indexOf('&PS');
        const fq = buscapagina.slice(inicio, fin);
        console.log('fq:', fq);
        inicio = buscapagina.indexOf('sl=');
        fin = buscapagina.indexOf('&cc');
        const sl = buscapagina.slice(inicio, fin);
        console.log('sl:', sl);*/
         
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
        await browser.close();
    } catch (e) {
        console.log('error:', e)
    };
};
//
main();
//
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

// Remove Accents y Tildes 
const removeAccents = (str) => { return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "") };


/*
const fileName = 'jumbo.html';
        const filePath = path.join(__dirname, `/filesHtml/${fileName}`);
        console.log('filePath:', filePath)
        await fs.writeFileSync(filePath, html, 'utf-8');
*/