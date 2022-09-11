var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import puppeteer from 'puppeteer';
import { SongParser } from './utils/songParser.js';
const scrapingURL = 'https://open.spotify.com/playlist/7wXtRYW8fjEqV4gGdhnuQE?si=9c3f62aa06b049df';
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
    let scrapedSongsHTML = [];
    do {
        await page.waitForSelector(TRACKLIST_ROW_SELECTOR);
        await page.waitForNetworkIdle();
        initialSelectorItems = await getCount(page, TRACKLIST_ROW_SELECTOR);
        let pendingSongsHTML = await getAllLoadedSongRowHTML(page, TRACKLIST_ROW_SELECTOR);
        scrapedSongsHTML = [...scrapedSongsHTML, ...pendingSongsHTML];
        await scrollDownToLast(page, TRACKLIST_ROW_SELECTOR);
        await page.waitForNetworkIdle();
        loadedSelectorItems = await getCount(page, TRACKLIST_ROW_SELECTOR);
        pendingSongsHTML = await getAllLoadedSongRowHTML(page, TRACKLIST_ROW_SELECTOR);
        scrapedSongsHTML = [...scrapedSongsHTML, ...pendingSongsHTML];
    } while (loadedSelectorItems > initialSelectorItems);
    await browser.close();
    return scrapedSongsHTML;
};
async function getAllLoadedSongRowHTML(page, selector = TRACKLIST_ROW_SELECTOR) {
    return await page.$$eval(selector, songs => songs.map(song => song.outerHTML));
}
async function getCount(page, selector) {
    return await page.$$eval(selector, a => a.length);
}
async function scrollDownToLast(page, selector) {
    await page.$$eval(`${selector}`, e => {
        e[e.length - 1].scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'end' });
    });
}
function onlyUnique(self) {
    const keys = self.map(item => item.key);
    const uniqueKeys = [...new Set(keys)];
    return self.filter((el, i) => uniqueKeys.indexOf(el.key) === i);
}
const scrapedSongs = await getSpotifyPlaylistPageSongArray();
const parsedSongs = scrapedSongs.map(scrapedSong => SongParser.toJSON(scrapedSong));
let uniqueSongs = onlyUnique(parsedSongs);
uniqueSongs = uniqueSongs.map((_a) => {
    var { key } = _a, songs = __rest(_a, ["key"]);
    return songs;
});
console.log(uniqueSongs);
console.log(uniqueSongs.length);
