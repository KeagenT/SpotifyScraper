const ARTISTS_SELECTOR = 'a:not([class])';
const ATTRIBUTE_SELECTOR = 'a';
export class Song {
    constructor(songRowElement) {
        this.songRowElement = songRowElement;
    }
    async getArtists(songRowElement) {
        const artistElements = await songRowElement.$$eval(ARTISTS_SELECTOR, artists => artists.map((artist) => artist.text));
        return artistElements;
    }
    async getTitle(songRowElement) {
        const songAttributes = await songRowElement.$$eval(ATTRIBUTE_SELECTOR, attributes => attributes.map((attribute) => attribute.text));
        const title = songAttributes[0];
        return title;
    }
    async getAlbum(songRowElement) {
        const songAttributes = await songRowElement.$$eval(ATTRIBUTE_SELECTOR, attributes => attributes.map((attribute) => attribute.text));
        const album = songAttributes[songAttributes.length - 1];
        return songAttributes.length > 1 ? album : undefined;
    }
    equals(otherSong) {
        return this.title === otherSong.title && this.artists === otherSong.artists;
    }
    async load() {
        this.title = await this.getTitle(this.songRowElement);
        this.artists = await this.getArtists(this.songRowElement);
        this.album = await this.getAlbum(this.songRowElement);
    }
    toJSON() {
        return {
            title: this.title,
            artists: this.artists,
            album: this.album
        };
    }
    toString() {
        return `${this.title}\n${this.artists.join(',')}\n${this.album !== undefined ? this.album : 'N/A'}`;
    }
}
