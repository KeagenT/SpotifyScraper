import puppeteer from 'puppeteer';
import { load } from 'cheerio';
const scrapingURL = 'https://open.spotify.com/playlist/5xlPVTUAFxxneWX9AuurrY?si=94538a99b1b0429e';
const TRACKLIST_ROW_SELECTOR = 'div[data-testid="tracklist-row"]';
const getSpotifyPlaylistPageHTML = async (url) => {
    const browser = await puppeteer.launch({
        headless: false
    });
    const page = await browser.newPage();
    await page.goto(url);
    await page.setViewport({
        width: 1920,
        height: 1080
    });
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    page.on('dialog', async (dialog) => {
        await dialog.dismiss();
    });
    let initialSelectorItems = 0;
    let loadedSelectorItems = 0;
    const delay = 2000;
    do {
        await page.waitForSelector(TRACKLIST_ROW_SELECTOR);
        await page.waitForTimeout(delay);
        initialSelectorItems = await getCount(page, TRACKLIST_ROW_SELECTOR);
        await scrollDownToLast(page, TRACKLIST_ROW_SELECTOR);
        await page.waitForTimeout(delay);
        loadedSelectorItems = await getCount(page, TRACKLIST_ROW_SELECTOR);
    } while (loadedSelectorItems > initialSelectorItems);
    const loadedHTML = await page.content();
    await browser.close();
    return loadedHTML;
};
async function getCount(page, selector) {
    return await page.$$eval(selector, a => a.length);
}
async function scrollDownToLast(page, selector) {
    await page.$$eval(`${selector}`, e => {
        e[e.length - 1].scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'end' });
    });
}
const pageHTML = await getSpotifyPlaylistPageHTML(scrapingURL);
// const fileLoadedHTML = fs.readFileSync('src/songs.html', 'utf-8')
const songArrayExtractor = async (pageHTML) => {
    const NAME = 0;
    const ARTIST = 1;
    const ALBUM = 2;
    const songs = [];
    const $ = await load(pageHTML);
    $(TRACKLIST_ROW_SELECTOR).each((index, trackRowElement) => {
        const songAttributes = [];
        $(trackRowElement).find('a').each((i, el) => {
            songAttributes.push($(el).text());
        });
        songs.push({
            name: songAttributes[NAME],
            artist: songAttributes[ARTIST],
            album: songAttributes[ALBUM]
        });
    });
    return songs;
};
const songsArray = await songArrayExtractor(pageHTML);
console.log(songsArray);
console.log(songsArray.length);
