import puppeteer, { Page } from 'puppeteer';
import { SongParser } from './utils/songParser.js';
import fs from 'fs';
import {spawn} from 'child_process';

const gymabelle = 'https://open.spotify.com/playlist/65PV8krerMrd0ypJTLRy6P?si=c8f4ad71af284a3c'
const Salaryman = 'https://open.spotify.com/playlist/3Tyevvw4MrIcgLhHp9UD5G?si=655f2d871b25443a';
const Cyberpunk = 'https://open.spotify.com/playlist/1SDeudnS5JLaxo7BB7p15g?si=c2dd54c1b0384858';
const scrapingURL = Cyberpunk;
const TRACKLIST_ROW_SELECTOR = 'div[data-testid="tracklist-row"]';
const NUMBERED_ROW_SELECTOR = 'div[aria-rowindex]';

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
    let pendingSongsHTML;
    do {
        await page.waitForSelector(TRACKLIST_ROW_SELECTOR);
        await page.waitForNetworkIdle();
        firstLoadedRowNumber = await getFirstSongNumber(page);
        pendingSongsHTML = await getAllLoadedSongRowHTML(page, TRACKLIST_ROW_SELECTOR);
        pendingSongsHTML.forEach(song => {
            scrapedSongsHTML.push(song);
        });
        await scrollDownToLast(page, NUMBERED_ROW_SELECTOR);
        await page.waitForNetworkIdle();
        rowNumberAfterScroll = await getFirstSongNumber(page);
    } while (firstLoadedRowNumber !== rowNumberAfterScroll);

    await browser.close();
    return scrapedSongsHTML;
};

async function getAllLoadedSongRowHTML (page: Page, selector = TRACKLIST_ROW_SELECTOR): Promise<string[]> {
    page.waitForSelector(selector);
    return await page.$$eval(selector, songs => songs.map(song => song.outerHTML));
}

async function getCount (page: Page, selector: string): Promise<any> {
    return await page.$$eval(selector, a => a.length);
}

async function getFirstSongNumber (page: Page, selector = NUMBERED_ROW_SELECTOR): Promise<any> {
    await page.waitForSelector(selector);
    return await page.$$eval(selector, div => div[div.length - 1].getAttribute('aria-rowindex'));
}

async function scrollDownToLast (page: Page, selector: string): Promise<any> {
    await page.$$eval(`${selector}`, e => {
        e[e.length - 1].scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'end' });
    });
}

function onlyUnique (array: any[]): any[] {
    return [...new Map(array.map(item => [item.key, item])).values()];
}


const scrapedSongs = await getSpotifyPlaylistPageSongArray();
let parsedSongs = scrapedSongs.map(scrapedSong => SongParser.toJSON(scrapedSong));
parsedSongs = onlyUnique(parsedSongs);
const JSONParsed = JSON.stringify(parsedSongs, null, 4);
console.log(parsedSongs)
fs.writeFile("./src/scrapedSongs.json", JSONParsed, 'utf8', function (err) {
    if (err) {
        return console.log(err);
    }

    console.log("The file was saved!");
});
function pbcopy(data) {
    var proc = spawn('pbcopy'); 
    proc.stdin.write(data); proc.stdin.end();
}
pbcopy(JSONParsed);

/*
const rawData = fs.readFileSync('src/scrapedSongs.json', 'utf8');
const JSONFromFile = JSON.parse(rawData);
const uniqueParsed = onlyUnique(JSONFromFile).map(({key, ...songs}) => songs);
console.log(uniqueParsed);
console.log(uniqueParsed.length);
*/