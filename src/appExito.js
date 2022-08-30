'use strict';
const axios = require('axios');
const cheerio = require("cheerio");
const path = require('path');
const fs = require('fs');
const puppeteer = require("puppeteer");
const proxyList = require("../src/proxy/proxyList");
// urlHome
const urlHome = "https://www.exito.com/";
//

// Main function
const start = async () => {
    try {
        //console.log("Starting Job Costco ...")
        let departments = await getDepartmentsAndCategories();
        /*if (departments.length > 0) {
            const token = await getTokenAuth();
            for (let i = 0; i < departments.length; i++) {
                const department = departments[i];
                await sendQueueToRabbit(department, token);
            }
        } else {
            console.log('Not send queue to Rabbit departments error in the process...');
            await reRunStart();
        };*/
        console.log("End Job Exito ...")
    } catch (exception) {
        console.log(exception);
    }
};

const getDepartmentsAndCategories = async () => {
    try {
        //const proxy = await getProxyData();
        //const urlProxy = `http://${proxy.ip}:${proxy.port}`;
        const browser = await puppeteer.launch({
            headless: true,
            slowMo: 1000,
            //args: ["--start-maximized", "--use-gl=egl"],
            //args: ["--start-maximized", "--use-gl=egl", `--proxy-server=${urlProxy}`],
        });
        const page = await browser.newPage();

        await page.authenticate({
            /* username: proxy.username,
             password: proxy.password*/
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
        //
        await page.waitForTimeout(1500);
        //
        // Process Scraper
        let html, $, links = [], data = [], dataPre = [];
        let departmentName, hrefDepartment, catagoryName, hrefCategory, subCatagoryName, hrefSubCategory;
        await page.click(".exito-category-menu-3-x-button");
        html = await page.evaluate(() => document.querySelector("body div.MuiDrawer-root div.exito-category-menu-3-x-container div.exito-category-menu-3-x-containerDrawer div.exito-category-menu-3-x-categoryList ul.exito-category-menu-3-x-categoryListD").outerHTML);
        $ = cheerio.load(html);
        $('ul.exito-category-menu-3-x-categoryListD li').each((index, content) => {
            let id = $(content).attr('id');
            data.push({ id });
        });
        //
        for (let i = 0; i < data.length; i++) {
            const { id } = data[i];
            console.log('Procesando:', id);
            const textHover = `[id="${id}"]`;
            await page.waitForTimeout(1500);
            await page.hover(textHover);
            html = await page.evaluate(() => document.querySelector("body div.MuiDrawer-root div.exito-category-menu-3-x-container div.exito-category-menu-3-x-containerDrawer section.exito-category-menu-3-x-contentSideMenu div.exito-category-menu-3-x-sideMenu").outerHTML);
            $ = cheerio.load(html);
            //
            $('div.exito-category-menu-3-x-sideMenu').each((index, content) => {
                const htmlDepartment = $(content).html();
                const $Department = cheerio.load(htmlDepartment);
                departmentName = $Department('div.exito-category-menu-3-x-sideMenuTitle a.exito-category-menu-3-x-categoryTitle').text();
                hrefDepartment = $Department('div.exito-category-menu-3-x-sideMenuTitle a.exito-category-menu-3-x-categoryTitle').attr('href');
            });
            //
            $('div.exito-category-menu-3-x-contentColumns div.exito-category-menu-3-x-column div.exito-category-menu-3-x-itemSideMenu').each((index, content) => {
                const htmlCategory = $(content).html();
                const $Category = cheerio.load(htmlCategory);
                $Category('a').each((index, content) => {
                    const htmlSubCategory = $(content).html();
                    dataPre.push({ index, htmlSubCategory })
                    const $SubCategory = cheerio.load(htmlSubCategory);
                    if (index == 0) {
                        catagoryName = $SubCategory('strong').text();
                        hrefCategory = $(content).attr('href');
                    } else {
                        subCatagoryName = $SubCategory('p').text();
                        hrefSubCategory = $(content).attr('href');
                        //
                        links.push({
                            department: {
                                name: departmentName,
                                href: hrefDepartment
                            }, category: {
                                name: catagoryName,
                                href: hrefCategory
                            }, subCategory: {
                                name: subCatagoryName,
                                href: hrefSubCategory
                            }
                        });
                        console.log("-----")
                    };
                });
            });
            console.log(`...`);
        };
        await saveFile(dataPre);
        dataPre = [];
        await saveFileLinks(links);
        //await saveFileHTML(id, html);
        //await saveFile(data);
        /*const $Department = cheerio.load(htmlDepartment);
                let id = $(content).attr('id');
                let hRef = $(content).attr('href');
                let text = $(content).text();
                console.log(`id = ${id}, hRef = ${hRef}, text = ${text}`);
                dataPre.push({ id, hRef, text });*/







        //$ = cheerio.load(html);
        //let department, hrefDepartment, category, hrefCategory, subCategory, hrefSubCategory;
        // Get department 

        // Process Scraper
        await browser.close();
        // Get
        return links;
    } catch (e) {
        console.log('error:', e.message)
        await saveFileLog(e.message);
        return [];
    };
};

// Get num item
const getNumItem = (hRef, NumItem) => {
    let arr = hRef;
    arr = arr.replace(/^[/]/, ""); //Quitarmos diagonales principio y final
    arr = arr.split('/'); // Convertimos en array
    let data = arr[NumItem]; //Obtenemos el elemento NumItem
    return clearName(data.trim().toLowerCase());;
};

const clearName = (str) => {
    try {
        if (str !== "") {
            return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/[,.;:]/g, "").replace(/[\s]/g, "-").replace(/["]/g, 'plg');
        }
        return "";
    } catch (error) {
        console.log('error:', error)
        return "";
    };
};

const getProxyData = async () => {
    const proxies = proxyList;
    let randomNumber = Math.floor(Math.random() * proxies.length);
    const proxyItem = proxies[randomNumber];
    let proxy = {
        ip: proxyItem.ip,
        port: proxyItem.port,
        username: proxyItem.username,
        password: proxyItem.password,
    };

    return proxy;
};

const saveFile = async (data) => {
    try {
        const fileName = 'listCat04.json';
        const filePath = path.join(__dirname, `/exito/${fileName}`);
        fs.writeFileSync(filePath, JSON.stringify(data), 'utf-8');
    } catch (error) {
        console.error('error:', error.message);
    }
};

const saveFileLinks = async (data) => {
    try {
        const fileName = 'listLink01.json';
        const filePath = path.join(__dirname, `/exito/${fileName}`);
        fs.writeFileSync(filePath, JSON.stringify(data), 'utf-8');
    } catch (error) {
        console.error('error:', error.message);
    }
};

const saveFileHTML = async (id, data) => {
    try {
        const fileName = 'htlmCat02.html';
        const content = `<!--${id}-->\n${data}\n`
        const filePath = path.join(__dirname, `/exito/${fileName}`);
        fs.appendFileSync(filePath, content, 'utf-8');
    } catch (error) {
        console.error('error:', error.message);
    }
};

const saveFileLog = async (data) => {
    try {
        const fileName = 'Exito.log';
        const content = `${data}\n`;
        const filePath = path.join(__dirname, `/exito/${fileName}`);
        fs.appendFileSync(filePath, content, 'utf-8');
    } catch (error) {
        console.error('error:', error.message);
    }
};

(async () => {
    await start();
})();
