
const cheerio = require("cheerio");
const puppeteer = require("puppeteer");
//
const urlHome = "https://now.modelorama.com.mx/";
//
const main = async () => {
    try {
        let html, $;
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
        await page.click("#onetrust-accept-btn-handler");
        await page.click(".modeloramanow-age-verification-1-x-buttonPrimary");
        html = await page.evaluate(() => {
            return document.querySelectorAll(".vtex-menu-2-x-menuContainerNav")[0]["outerHTML"];
        });
        $ = cheerio.load(html);
        let data = [], links = [];
        $('ul.vtex-menu-2-x-menuContainer li div a').each((index, content) => {
            let href = $(content).attr('href');
            let id = $(content).attr('id');
            data.push({ id, href });
        });
        for (let i = 0; i < data.length; i++) {
            console.log('Procesando:', data[i].id);
            await page.hover(`#${data[i].id}`);
            html = await page.evaluate(() => {
                return document.querySelectorAll(".vtex-menu-2-x-menuContainerNav")[0]["outerHTML"];
            });
            $ = cheerio.load(html);
            $('ul.vtex-menu-2-x-menuContainer li div div section ul li div a').each((index, content) => {
                let link = $(content).attr('href').split("/");
                link = link.filter(word => word !== '');
                if (link.length > 1) {
                    links.push({ "departments": link[0], "category": link[1] });
                }
            });
            if (data[i].id === 'menu-item-category-otros') {
                html = await page.evaluate(() => {
                    return document.querySelectorAll(".vtex-menu-2-x-submenu")[0]["outerHTML"];
                });
                $ = cheerio.load(html);
                $('nav.vtex-menu-2-x-menuContainerNav ul li div a').each((index, content) => {
                    let link = $(content).attr('href')
                    let category = link.replace(/[/]/g, '');
                    links.push({ "departments": 'otros', category })
                });
            };
            if (data[i].id === 'menu-item-custom-promociones') {
                links.push({ "departments": "promociones", "category": "" })
            };
        };
        console.log('links:', links);
        await browser.close();
    } catch (e) {
        console.log('error:', e)
    };
};
//
main();
//