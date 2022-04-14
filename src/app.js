
const cheerio = require("cheerio");
const puppeteer = require("puppeteer");
const path = require('path');
const fs = require('fs');
const axios = require('axios');

//
const urlHome = "https://listado.mercadolibre.com.mx/supermercado/";
//const urlHome = "https://listado.mercadolibre.com.mx/supermercado/_Deal_supermercado_Discount_10-100";
//
const main = async () => {
    try {
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
            waitUntil: 'networkidle2',
            timeout: 0
        });
        await page.waitForTimeout(3000);
        let html, $, links = [];
        // Process Scraper
        html = await page.evaluate(() => document.querySelector("div.ui-cpg__container").outerHTML);
        $ = cheerio.load(html);
        let department, hrefDepartment, category, hrefCategory;
        $('div.ui-cpg__department').each((indexDepartment, contentDepartment) => { 
            const htmlDepartment = $(contentDepartment).html();
            const $Department = cheerio.load(htmlDepartment);
            //console.log('htmlDepartment:', htmlDepartment);
            department =  $Department('a.ui-cpg__department-link img').attr('alt');
            hrefDepartment = $Department('a.ui-cpg__department-link').attr('href');
            const htmlCategories = $Department('div.ui-cpg__department-menu').html();
            if (htmlCategories) {
                console.log('htmlCategories:', htmlCategories);
                const $Categories = cheerio.load(htmlCategories);
                $Categories('ul.ui-cpg__department-menu-list li.ui-cpg__department-menu-list-item').each((indexCategory, contentCategory) => { 
                    const htmlCategory = $(contentCategory).html();
                    const $Category = cheerio.load(htmlCategory);
                    category =  $Category('a').html();
                    hrefCategory = $Category('a').attr('href');
                    links.push({ department, hrefDepartment, category, hrefCategory });
                });
                console.log('...');
            } else {
                links.push({ department, hrefDepartment, "category": "", "hrefCategory": "" });
            }
            console.log('...');
        });
        await browser.close();
        const fileName = 'categoriesSupermercado.json';
        const filePath = path.join(__dirname, `/mercadoLibreHTML/filesJson/${fileName}`);
        fs.writeFileSync(filePath, JSON.stringify(links), 'utf-8'); 
        //const fileName = 'ofertasPag01.html';
        //const filePath = path.join(__dirname, `/mercadoLibreHTML/${fileName}`);
        //fs.writeFileSync(filePath, html, 'utf-8');
          
    } catch (error) {
        console.log('error message:', error.message)
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