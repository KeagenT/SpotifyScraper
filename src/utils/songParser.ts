import { load } from 'cheerio';
const ARTIST_SELECTOR = 'a:not([class])';
const ATTRIBUTE_SELECTOR = 'a';

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class SongParser {
    static toJSON (rowHTML: string): object {
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

    static extractArtistsFromElement ($: cheerio.Root): string[] {
        const artistsElements = $(ARTIST_SELECTOR);
        const artistsText: string[] = [];
        artistsElements.each((i, el) => {
            artistsText.push($(el).text());
        });
        return artistsText;
    }

    static extractTitleFromElement ($: cheerio.Root): string {
        const songAttributes = $(ATTRIBUTE_SELECTOR);
        return $(songAttributes[0]).text();
    }

    static extractAlbumFromElement ($: cheerio.Root): string | undefined {
        const songAttributes = $(ATTRIBUTE_SELECTOR);
        const length = songAttributes.length;
        return length > 1 ? $(songAttributes[length - 1]).text() : undefined;
    }
}
