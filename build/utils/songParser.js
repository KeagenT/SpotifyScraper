import { load } from 'cheerio';
const ARTIST_SELECTOR = 'a:not([class])';
const ATTRIBUTE_SELECTOR = 'a';
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class SongParser {
    static toJSON(rowHTML) {
        const $ = load(rowHTML);
        const title = SongParser.extractTitleFromElement($);
        const artists = SongParser.extractArtistsFromElement($);
        const album = SongParser.extractAlbumFromElement($);
        const key = `${title}${album !== undefined ? album : 'N/A'}${artists.join('')}`;
        return {
            title,
            artists,
            album,
            key
        };
    }
    static extractArtistsFromElement($) {
        const artistsElements = $(ARTIST_SELECTOR);
        const artistsText = [];
        artistsElements.each((i, el) => {
            artistsText.push($(el).text());
        });
        return artistsText;
    }
    static extractTitleFromElement($) {
        const songAttributes = $(ATTRIBUTE_SELECTOR);
        return $(songAttributes[0]).text();
    }
    static extractAlbumFromElement($) {
        const songAttributes = $(ATTRIBUTE_SELECTOR);
        const length = songAttributes.length;
        return length > 1 ? $(songAttributes[length - 1]).text() : undefined;
    }
}
