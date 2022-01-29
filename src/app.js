
const cheerio = require("cheerio");
const puppeteer = require("puppeteer");
const path = require('path');
const fs = require('fs');
const axios = require('axios');
//
const urlHome = "https://www.costco.com.mx/";
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
        // Process Scraper
        html = await page.evaluate(() => document.querySelector("main header.main-header div div nav.sm-navigation div div.navigation-wrapper ul#theMenu").outerHTML);
        $ = cheerio.load(html);
        let department, hrefDepartment, category, hrefCategory, subCategory, hrefSubCategory;
        let ul;
        // Get department 
        $('li.topmenu ').each((indexDepartment, contentDepartment) => {
            const htmlDepartment = $(contentDepartment).html();
            const $Department = cheerio.load(htmlDepartment);
            hrefDepartment = $Department('a.show-sub-menu').attr('href');
            if (hrefDepartment) {
                const idCostcosCat = $Department('a.show-sub-menu').attr('aria-controls');
                department = getFirstItem(hrefDepartment);
                $Department(`ul#${idCostcosCat} li`).each((indexCategory, contentCategory) => {
                    const htmlCategory = $Department(contentCategory).html();
                    const $Category = cheerio.load(htmlCategory);
                    hrefCategory = $Category('a.show-sub-menu').attr('href');
                    if (hrefCategory) {
                        const idCostcosSubCat = $Category('a.cat-trigger').attr('data-category');
                        category = getSecondItem(hrefCategory);
                        //ul = $Department(`ul#${idCostcosCat} li ul`).html();
                        //console.log('ul: ', ul);
                        //links.push({ department, hrefDepartment, category, hrefCategory, idCostcosSubCat, htmlCategory, subCategory, hrefSubCategory });    
                        $Category(`ul li`).each((indexSubCategory, contentSubCategory) => {
                            const htmlSubCategory = $Category(contentSubCategory).html();
                            const $SubCategory = cheerio.load(htmlSubCategory);
                            const menuitem = $SubCategory('a').attr('role');
                            if (!menuitem){
                                hrefSubCategory = $SubCategory('a').attr('href');
                                if (hrefSubCategory) {
                                    subCategory = getThirdItem(hrefSubCategory);
                                    links.push({ department, hrefDepartment, category, hrefCategory, subCategory, hrefSubCategory });    
                               };
                            }
                        });
                    };
                });
            };
            const title = $Department('a').attr('title');
            if (title === "Vida Saludable") {
                hrefDepartment = $Department('a').attr('href')
                department = removeAccents(title.trim().replace(/\s/g, "-").replace(/["]/g, 'plg').replace(/[,.;:]/g, '').toLowerCase())
                links.push({ department, hrefDepartment, "category": "", "hrefCategory": "", "subCategory": "", "hrefSubCategory": "" });
            };
        });
        const fileName = 'listDepCostcoMexico.json';
        const filePath = path.join(__dirname, `/coscoHTML/filesJson/${fileName}`);
        fs.writeFileSync(filePath, JSON.stringify(links), 'utf-8');
        //const fileName = 'listDepCostcoMexico.html';
        //const filePath = path.join(__dirname, `/coscoHTML/${fileName}`);
        //fs.writeFileSync(filePath, html, 'utf-8');
        //const filePath = path.join(__dirname, `/coscoHTML/filesJson/${fileName}`);
        //fs.writeFileSync(filePath, JSON.stringify(links), 'utf-8');
        /*
        //const urlAxios = "https://www.tiendasjumbo.co/supermercado/despensa";
        const urlAxios = "https://www.costco.com.mx/Electronicos/Pantallas-y-Proyectores/c/cos_1.1";
        const response = await axios.get(urlAxios);
        //console.log('response:', response.data)ñ
        html = response.data;
        const fileName = 'catPantallasCosco.html';
        const filePath = path.join(__dirname, `/coscoHTML/${fileName}`);
        fs.writeFileSync(filePath, html, 'utf-8');
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


/*
const fileName = 'jumbo.html';
        const filePath = path.join(__dirname, `/filesHtml/${fileName}`);
        console.log('filePath:', filePath)
        await fs.writeFileSync(filePath, html, 'utf-8');
*/