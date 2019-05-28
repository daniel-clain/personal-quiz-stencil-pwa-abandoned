
import puppeteer from 'puppeteer'

test('submits a new question', async () => {
  const page = await goToQuestionsPage()
  await page.type('.add-question__value input', 'This is an e2e test question')
  await page.type('.add-question__answer textarea', 'This is an e2e test answer')
  await page.click('.add-question button')
  await page.waitFor(100000)


});

const goToQuestionsPage = async () => {
  const puppeteerLaunchOptions: puppeteer.LaunchOptions = {
    headless: false,
    slowMo: 80
  }
  const browser = await puppeteer.launch(puppeteerLaunchOptions);
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 })
  await page.goto('http://localhost:3333/')
  await page.click('nav button#add-question')
  return page

}
