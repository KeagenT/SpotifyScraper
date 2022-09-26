import puppeteer, { Page } from 'puppeteer';
import { SongParser } from './utils/songParser.js';

const scrapingURL = 'https://open.spotify.com/playlist/7wXtRYW8fjEqV4gGdhnuQE?si=9c3f62aa06b049df';
const TRACKLIST_ROW_SELECTOR = 'div[data-testid="tracklist-row"]';
const NUMBERED_ROW_SELECTOR = 'div[style="transform: translateY(0px);"] div[aria-rowindex]';

const getSpotifyPlaylistPageSongArray = async (url: string = scrapingURL): Promise<any> => {
    const browser = await puppeteer.launch({
        headless: false
    });
    const page = await browser.newPage();
    await page.goto(url);
    await page.setViewport({
        width: 1920,
        height: 1080
    });
    let firstLoadedRowNumber;
    let rowNumberAfterScroll;
    let scrapedSongsHTML: string[] = [];
    do {
        await page.waitForSelector(TRACKLIST_ROW_SELECTOR);
        await page.waitForNetworkIdle();
        firstLoadedRowNumber = await getFirstSongNumber(page);
        let pendingSongsHTML = await getAllLoadedSongRowHTML(page, TRACKLIST_ROW_SELECTOR);
        scrapedSongsHTML = [...scrapedSongsHTML, ...pendingSongsHTML];
        await scrollDownToLast(page, TRACKLIST_ROW_SELECTOR);
        await page.waitForNetworkIdle();
        rowNumberAfterScroll = await getFirstSongNumber(page);
        pendingSongsHTML = await getAllLoadedSongRowHTML(page, TRACKLIST_ROW_SELECTOR);
        scrapedSongsHTML = [...scrapedSongsHTML, ...pendingSongsHTML];
    } while (firstLoadedRowNumber !== rowNumberAfterScroll);

    await browser.close();
    return scrapedSongsHTML;
};

async function getAllLoadedSongRowHTML (page: Page, selector = TRACKLIST_ROW_SELECTOR): Promise<string[]> {
    return await page.$$eval(selector, songs => songs.map(song => song.outerHTML));
}

async function getCount (page: Page, selector: string): Promise<any> {
    return await page.$$eval(selector, a => a.length);
}

async function getFirstSongNumber (page: Page, selector = NUMBERED_ROW_SELECTOR): Promise<any> {
    return await page.$eval(selector, div => div.getAttribute('aria-rowindex'));
}

async function scrollDownToLast (page: Page, selector: string): Promise<any> {
    await page.$$eval(`${selector}`, e => {
        e[e.length - 1].scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'end' });
    });
}

function onlyUnique (self: any[]): any[] {
    const keys = self.map(item => item.key);
    const uniqueKeys = [...new Set(keys)];
    return self.filter((el, i) => uniqueKeys.indexOf(el.key) === i);
}

const scrapedSongs = await getSpotifyPlaylistPageSongArray();
const parsedSongs = scrapedSongs.map(scrapedSong => SongParser.toJSON(scrapedSong));
let uniqueSongs = onlyUnique(parsedSongs);
uniqueSongs = uniqueSongs.map(({ key, ...songs }) => songs);
console.log(uniqueSongs);
console.log(uniqueSongs.length);
