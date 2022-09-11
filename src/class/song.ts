import { ElementHandle } from 'puppeteer';

const ARTISTS_SELECTOR = 'a:not([class])';
const ATTRIBUTE_SELECTOR = 'a';

export class Song {
    songRowElement: ElementHandle;
    title: string;
    artists: string[];
    album: string | undefined;

    constructor (songRowElement: ElementHandle<Element>) {
        this.songRowElement = songRowElement;
    }

    async getArtists (songRowElement: ElementHandle<Element>): Promise<string[]> {
        const artistElements: string[] = await songRowElement.$$eval(ARTISTS_SELECTOR, artists => artists.map((artist: any) => artist.text));
        return artistElements;
    }

    async getTitle (songRowElement: ElementHandle<Element>): Promise<string> {
        const songAttributes: string[] = await songRowElement.$$eval(ATTRIBUTE_SELECTOR, attributes => attributes.map((attribute: any) => attribute.text));
        const title: string = songAttributes[0];
        return title;
    }

    async getAlbum (songRowElement: ElementHandle<Element>): Promise<string | undefined> {
        const songAttributes: string[] = await songRowElement.$$eval(ATTRIBUTE_SELECTOR, attributes => attributes.map((attribute: any) => attribute.text));
        const album: any = songAttributes[songAttributes.length - 1];
        return songAttributes.length > 1 ? album : undefined;
    }

    equals (otherSong: Song): boolean {
        return this.title === otherSong.title && this.artists === otherSong.artists;
    }

    async load (): Promise<void> {
        this.title = await this.getTitle(this.songRowElement);
        this.artists = await this.getArtists(this.songRowElement);
        this.album = await this.getAlbum(this.songRowElement);
    }

    toJSON (): object {
        return {
            title: this.title,
            artists: this.artists,
            album: this.album
        };
    }

    toString (): string {
        return `${this.title}\n${this.artists.join(',')}\n${this.album !== undefined ? this.album : 'N/A'}`;
    }
}
