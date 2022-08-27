const { chromium } = require('playwright');
const urlPetition = 'https://www.bodegaaurrera.com.mx/cervezas-vinos-y-licores/cervezas/clara?page=0';

(async () => {
  const browser = await chromium.launch()
  const page = await browser.newPage()

  await page.setViewportSize({ width: 1200, height: 800 })

  page.on('request', request =>
    console.log('>>', request.method(), request.url()))
  page.on('response', response =>
    console.log('<<', response.status(), response.url()))

  await page.goto(urlPetition)

  await page.screenshot({ path: 'screenshot_pw01.png' })

  await browser.close()
})()