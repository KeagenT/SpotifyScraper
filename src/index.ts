import puppeteer, { Page } from 'puppeteer'

const scrapingURL = 'https://open.spotify.com/playlist/7wXtRYW8fjEqV4gGdhnuQE?si=69ad3d75d7744cb7'
const TRACKLIST_ROW_SELECTOR = 'div[data-testid="tracklist-row"]'
const getSongs = async (url: string): Promise<void> => {
  const browser = await puppeteer.launch({
    headless: false
  })
  const page = await browser.newPage()
  await page.goto(url)
  await page.setViewport({
    width: 1920,
    height: 1080
  })
  const delay = 1000
  let preCount = 0
  let postCount = 0
  do {
    preCount = await getCount(page, TRACKLIST_ROW_SELECTOR)
    await scrollDown(page, TRACKLIST_ROW_SELECTOR)
    await page.waitForTimeout(delay)
    postCount = await getCount(page, TRACKLIST_ROW_SELECTOR)
  } while (postCount > preCount)
  await page.waitForTimeout(delay)
  await page.screenshot({
    path: 'screenshot.png',
    fullPage: true
  })

  await browser.close()
}

async function getCount (page: Page, selector: string): Promise<any> {
  await page.waitForSelector(selector)
  return await page.$$eval(selector, a => a.length)
}

async function scrollDown (page: Page, selector: string): Promise<any> {
  await page.waitForSelector(selector)
  await page.$eval(`${selector}:last-child`, e => {
    e.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'end' })
  })
}

await getSongs(scrapingURL)
