
const cheerio = require("cheerio");
const puppeteer = require("puppeteer");
const path = require('path');
const fs = require('fs');
const axios = require('axios');
//
const urlHome = "https://listado.mercadolibre.com.mx/supermercado/";
//
const main = async () => {
    try {
        console.log("Starting Job Supermercado Mercado Libre Mexico ...")
        let sendToRabbit = [];
        let departments = await getDepartments();
        if (departments.length > 0) {
            //const token = await getTokenAuth();
            //const response = await getTokenMercadoLibre();
            const Ok = true; //response.data.Ok;
            if (Ok) {
                const token_ml = "APP_USR-1132674507199580-042814-565ec7509e3c3b620c0eb6c6fd2246bb-927528";      //response.data.token_ml.access_token;
                for (let i = 0; i < departments.length; i++) {
                    const department = departments[i];
                    console.log("department:", department);
                    //await sendQueueToRabbit(department, token, token_ml);
                }
            } else {
                console.log('Not send queue to Rabbit departments, Check MercadoLibre token generator !!!', response);
            };
        } else {
            console.log('Not send queue to Rabbit departments error in the process...');
            await reRunStart();
        };
        console.log("End Supermercado Mercado Libre Mexico ...")
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




const getDepartments = async () => {
    try {
        const browser = await puppeteer.launch({
            headless: true,
            slowMo: 1000,
            args: ["--start-maximized", "--use-gl=egl"],
        });
        const page = await browser.newPage();
        await page.authenticate({
            username: proxy.username,
            password: proxy.password
        })
        await page.setViewport({
            width: 1122,
            height: 800,
            deviceScaleFactor: 1,
        });
        await page.goto(urlHome, {
            waitUntil: 'networkidle2',
            timeout: 0
        });
        await page.waitForTimeout(2000);
        // Process Scraper
        let html, $, links = [];
        html = await page.evaluate(() => document.querySelector("div.ui-cpg__container").outerHTML);
        $ = cheerio.load(html);
        let department, idDepartment, category, idCategory;
        $('div.ui-cpg__department').each((indexDepartment, contentDepartment) => { 
            const htmlDepartment = $(contentDepartment).html();
            const $Department = cheerio.load(htmlDepartment);
            department =  $Department('a.ui-cpg__department-link img').attr('alt');
            idDepartment = $Department('a.ui-cpg__department-link').attr('id');
            const htmlCategories = $Department('div.ui-cpg__department-menu').html();
            links.push({ department, idDepartment, category , idCategory  });
        });
        await browser.close();
        //const fileName = 'departmentsSupermercado.json';
        //const filePath = path.join(__dirname, `/filesJson/${fileName}`);
        //fs.writeFileSync(filePath, JSON.stringify(links), 'utf-8'); 
        return links;
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