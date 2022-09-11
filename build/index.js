import puppeteer from 'puppeteer';
import { Song } from './class/song.js';
const scrapingURL = 'https://open.spotify.com/playlist/7wXtRYW8fjEqV4gGdhnuQE?si=cfbe46dafa3442e3&nd=1';
const TRACKLIST_ROW_SELECTOR = 'div[data-testid="tracklist-row"]';
const getSpotifyPlaylistPageSongArray = async (url = scrapingURL) => {
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
    const scrapedSongs = [];
    let loadedSongsHTML;
    let count = 0;
    do {
        await page.waitForSelector(TRACKLIST_ROW_SELECTOR);
        await page.waitForNetworkIdle();
        initialSelectorItems = await getCount(page, TRACKLIST_ROW_SELECTOR);
        loadedSongsHTML = await getAllLoadedSongRowHTML(page, TRACKLIST_ROW_SELECTOR);
        //const parsedSongs = parseAllLoadedSongRowHTML(await loadedSongsHTML);
        //pushOnlyNewSongs(scrapedSongs, parsedSongs);
        await scrollDownToLast(page, TRACKLIST_ROW_SELECTOR);
        await page.waitForNetworkIdle();
        loadedSelectorItems = await getCount(page, TRACKLIST_ROW_SELECTOR);
        count += 1;
    } while (loadedSelectorItems > initialSelectorItems && count < 6);
    await browser.close();
    return loadedSongsHTML;
};
async function getAllLoadedSongRowHTML(page, selector = TRACKLIST_ROW_SELECTOR) {
    return await page.$$(selector);
}
function songInScraped(scrapedSongs, song) {
    let songFound = false;
    scrapedSongs.forEach((scrapedSong) => {
        if (scrapedSong.equals(song)) {
            songFound = true;
            return songFound;
        }
    });
    return songFound;
}
function parseAllLoadedSongRowHTML(songsRowHTML) {
    return songsRowHTML.map((songRowHTML) => new Song(songRowHTML));
}
function pushOnlyNewSongs(OldSongs, CurrentlyloadedSongs) {
    CurrentlyloadedSongs.forEach((song) => {
        if (!songInScraped(OldSongs, song)) {
            OldSongs.push(song);
        }
    });
}
async function getCount(page, selector) {
    return await page.$$eval(selector, a => a.length);
}
async function scrollDownToLast(page, selector) {
    await page.$$eval(`${selector}`, e => {
        e[e.length - 1].scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'end' });
    });
}
const scrapedSongs = await getSpotifyPlaylistPageSongArray();
console.log(scrapedSongs);
