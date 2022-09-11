const ALBUM_SELECTOR = 'a:not([class])';
const ATTRIBUTE_SELECTOR = 'a[class]';
export class Song {
    constructor(songRowElement) {
        this.title = this.extractTitleFromElement(songRowElement);
        this.artists = this.extractArtistsFromElement(songRowElement);
        this.album = this.extractAlbumFromElement(songRowElement);
    }
    extractArtistsFromElement(songRowElement) {
        const artistsElements = Array.from(songRowElement.querySelectorAll(ALBUM_SELECTOR));
        const artistsText = artistsElements.map((artist) => artist.textContent);
        return artistsText;
    }
    extractTitleFromElement(songRowElement) {
        const songAttributes = Array.from(songRowElement.querySelectorAll(ATTRIBUTE_SELECTOR));
        const title = songAttributes.first;
        return title.text;
    }
    extractAlbumFromElement(songRowElement) {
        const songAttributes = Array.from(songRowElement.querySelectorAll(ATTRIBUTE_SELECTOR));
        const album = songAttributes.last;
        return songAttributes.length > 1 ? album.text : undefined;
    }
    equals(otherSong) {
        return this.title === otherSong.title && this.artists === otherSong.artists;
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
