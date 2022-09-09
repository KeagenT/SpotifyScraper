import puppeteer, { Page } from 'puppeteer';
import { Song } from './class/song';
import 'utils/arrays.ts';

const scrapingURL = 'https://open.spotify.com/playlist/5xlPVTUAFxxneWX9AuurrY?si=94538a99b1b0429e';
const TRACKLIST_ROW_SELECTOR = 'div[data-testid="tracklist-row"]';

const getSpotifyPlaylistPageHTML = async (url: string = scrapingURL): Promise<string> => {
    const browser = await puppeteer.launch({
        headless: false
    });
    const page = await browser.newPage();
    await page.goto(url);
    await page.setViewport({
        width: 1920,
        height: 1080
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

async function getAllLoadedSongRowHTML (page: Page, selector = TRACKLIST_ROW_SELECTOR): Promise<Element[]> {
    const loadedSongs = page.$$eval(selector, songsHTMLArray => songsHTMLArray);
    return await loadedSongs;
}

function songInScraped ({ scrapedSongs, song }: { scrapedSongs: Song[], song: Song}): boolean {
    let songFound = false;
    scrapedSongs.forEach((scrapedSong) => {
        if (scrapedSong.equals(song)) {
            songFound = true;
            return songFound;
        }
    });
    return songFound;
}

function parseAllLoadedSongRowHTML (songsRowHTML: Element[]): Song[] {
    return songsRowHTML.map((songRowHTML) => new Song(songRowHTML));
}

async function getCount (page: Page, selector: string): Promise<any> {
    return await page.$$eval(selector, a => a.length);
}

async function scrollDownToLast (page: Page, selector: string): Promise<any> {
    await page.$$eval(`${selector}`, e => {
        e[e.length - 1].scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'end' });
    });
}
