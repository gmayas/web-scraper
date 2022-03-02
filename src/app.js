
const cheerio = require("cheerio");
const puppeteer = require("puppeteer");
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const { CLIENT_RENEG_LIMIT } = require("tls");
//
const urlHome = "https://www.sams.com.mx/";
//
const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
    'Content-Type': 'application/json',
    origin: 'https://www.sams.com.mx/',
    referer: 'https://www.sams.com.mx/',
    Connection: 'keep-alive',
    banner: 'WM_OD',
    Accept: 'application/json, text/javascript, */*; q=0.01',
    experience: 'isSimplifiedCheckout=true'
};

const getTaxonimySams = async () => {
    try {
        let data = [], departments = [];;
        const urlAxios = "https://www.sams.com.mx/sams/home/?format=json";
        const response = await axios.get(urlAxios, headers);
        data = response.data.headerArea.filter((f) => f.name == "Taxonomy");
        data.map((value, index) => {
            const arrayDepartments = value.contents[index].departments;
            arrayDepartments.map((valueDep) => { departments.push(valueDep) });
        });
        const fileName = 'taxtSams.json';
        const filePath = path.join(__dirname, `/samsHTML/filesJson/${fileName}`);
        fs.writeFileSync(filePath, JSON.stringify({ departments }), 'utf-8');
    } catch (error) {
        console.log('error:', error)
        const fileName = 'errorGetTaxonimySams.json';
        const filePath = path.join(__dirname, `/samsHTML/filesJson/${fileName}`);
        fs.writeFileSync(filePath, JSON.stringify(error), 'utf-8');
    };
};

const setTimestamp = () => {
    //const dateNow = new Date();
    //console.log('dateNow:', dateNow);
    return Math.floor(new Date(Date.now()));
};

const getProductDetail = async (i, skuId, upc) => {
    try {
        const paramTimestamp = setTimestamp();
        const url = `https://www.sams.com.mx/rest/model/atg/commerce/catalog/ProductCatalogActor/getSkuSummaryDetails?skuId=${skuId}&upc=${upc}&storeId=0000009999&_=${paramTimestamp}`;
        console.log('index:', i);
        console.log('skuId, upc:', skuId, upc);
        console.log('paramTimestamp:', paramTimestamp);
        console.log('url:', url);
        const response = await axios.get(url, headers);
        console.log('response status:', response.status);
        let data = response.data;
        return { url, data, statusRes: response.status };
    } catch (error) {
        console.log('error:', { message: error.message, status: error.response.status });
        //return { url: "", data: {}, statusRes: error.response.status };
        console.log('Re run getProductDetail in 5 seg...');
        setTimeout(async () => {
            console.log('Re run getProductDetail go ...');
            return await getProductDetail(i, skuId, upc);
        }, 50000);
        
    };
};

const setProductDetail = async (products) => {
    try {
        let productDetail, productsDetail = [];
        for (let i = 0; i < products.length; i++) {
            const { skuId, upc } = products[i];
            productDetail = await getProductDetail(i, skuId, upc);
            //console.log('productDetail:', JSON.stringify(productDetail))
            products[i].productDetail = productDetail;
            //console.log('productDetail:', JSON.stringify(products[i].productDetail))
            productsDetail.push(products[i]);
        };
        return productsDetail;
    } catch (error) {
        console.log('error:', { message: error.message });
    };
};

const getProducts = async () => {
    try {
        const paramTimestamp = setTimestamp();
        console.log('paramTimestamp:', paramTimestamp);
        const urlAxios = `https://www.sams.com.mx/sams/browse/vinos-licores-y-cervezas/cervezas/clara/_/N-95v?_=${paramTimestamp}`;
        console.log('urlAxios:', urlAxios)
        const response = await axios.get(urlAxios, headers);
        console.log('response status:', response.status)
        let data = response.data.mainArea.filter((f) => f.name == "ResultsList");
        let products = [];
        data.map((value, index) => {
            const arrayproducts = value.contents[index].records;
            arrayproducts.map((dataProduct, i) => {
                const skuId = dataProduct.attributes["sku.repositoryId"].join();
                const upc = dataProduct.attributes["product.repositoryId"].join();
                const skuDisplayName = dataProduct.attributes["skuDisplayName"].join();
                const resProduct = {
                    recordIndex: i,
                    skuId,
                    upc,
                    skuDisplayName,
                    dataProduct,
                };
                products.push(resProduct)
            });
        });
        const productsDetail = await setProductDetail(products);
        const fileName = 'cervezas-clara-products.json';
        const filePath = path.join(__dirname, `/samsHTML/filesJson/${fileName}`);
        fs.writeFileSync(filePath, JSON.stringify(productsDetail), 'utf-8');
        //return JSON.stringify(productsDetail);
        //
    } catch (error) {
        console.log('error:', { message: error.message });
        console.log('Re run getProducts in 5 seg ...');
        setTimeout(async () => {
            console.log('Re run getProducts go ...');
           return await getProducts();
        }, 50000);
    };
};

const main = async () => {
    try {
        //let html, $;
        //let data = [], links = []; 
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
        // Process Scraper
        html = await page.evaluate(() => document.querySelector("main header.main-header div div nav.sm-navigation div div.navigation-wrapper ul#theMenu").outerHTML);
        $ = cheerio.load(html);
        let department, hrefDepartment, category, hrefCategory, subCategory, hrefSubCategory;
        // Get department 
        $('li.topmenu ').each((indexDepartment, contentDepartment) => {
            const htmlDepartment = $(contentDepartment).html();
            const $Department = cheerio.load(htmlDepartment);
            hrefDepartment = $Department('a.show-sub-menu').attr('href');
            if (hrefDepartment) {
                const idCostcosCat = $Department('a.show-sub-menu').attr('aria-controls');
                department = getNumItem(hrefDepartment, 0);
                $Department(`ul#${idCostcosCat} li`).each((indexCategory, contentCategory) => {
                    const htmlCategory = $Department(contentCategory).html();
                    const $Category = cheerio.load(htmlCategory);
                    hrefCategory = $Category('a.show-sub-menu').attr('href');
                    if (hrefCategory) {
                        category = getNumItem(hrefCategory, 1);
                        $Category(`ul li`).each((indexSubCategory, contentSubCategory) => {
                            const htmlSubCategory = $Category(contentSubCategory).html();
                            const $SubCategory = cheerio.load(htmlSubCategory);
                            const menuitem = $SubCategory('a').attr('role');
                            if (!menuitem) {
                                hrefSubCategory = $SubCategory('a').attr('href');
                                if (hrefSubCategory) {
                                    subCategory = getNumItem(hrefSubCategory, 2);
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
        const fileName = 'listDepCostcoMexico02.json';
        const filePath = path.join(__dirname, `/coscoHTML/filesJson/${fileName}`);
        fs.writeFileSync(filePath, JSON.stringify(links), 'utf-8');
        */
        //const fileName = 'listDepCostcoMexico.html';
        //const filePath = path.join(__dirname, `/coscoHTML/${fileName}`);
        //fs.writeFileSync(filePath, html, 'utf-8');
        //const filePath = path.join(__dirname, `/coscoHTML/filesJson/${fileName}`);
        //fs.writeFileSync(filePath, JSON.stringify(links), 'utf-8');




        //let departments = newDepartments//.map((value, index) => { const res = { newDepartments: value.newContents[index].departments }; return res; });

        //f.contents.name == "Category Navigation Menu"
        //departments = data.filter( (f) =>{ return f.contents});
        //const fileName = 'gralSams.html';
        //const fileName = 'taxtSams.json';
        //const filePath = path.join(__dirname, `/samsHTML/filesJson/${fileName}`);
        //fs.writeFileSync(filePath, JSON.stringify({departments}), 'utf-8');
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
        //await browser.close();
        //
        await getProducts();


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