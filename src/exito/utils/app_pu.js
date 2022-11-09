const puppeteer = require('puppeteer');
//const urlPetition = 'https://www.exito.com/moda-y-accesorios/bodys-y-enterizos-bebe-nino-nina';
//
const getVariables = async (urlPetition) => {
  try {
    let variables = "";
    const browser = await puppeteer.launch({
      headless: true,
      slowMo: 1000
    });
    const page = await browser.newPage();
    await page.setViewport({
      width: 1122,
      height: 800,
      deviceScaleFactor: 1
    });
    await page.waitForTimeout(1500);
    await page.setViewport({ width: 1200, height: 800 })
    await page.setRequestInterception(true)
    page.on('request', async (request) => {
      request.continue()
    });
    page.on('response', async (response) => {
      const res = response.url();
      if (res.includes("productSearch")) {
        const decodeUrl = decodeURIComponent(res);
        const ini = decodeUrl.indexOf('"variables":"');
        const textData = decodeUrl.slice(ini);
        variables = textData.replace("variables", "").replace(/[":}]/g, "");
        //console.log('variables:', variables);
      }
    });
    await page.goto(urlPetition, { waitUntil: 'networkidle2', timeout: 0 });
    await browser.close()
    return variables;
  } catch (error) {
    console.error("error:", error.message);
    return "";
  };
};

module.exports = getVariables;