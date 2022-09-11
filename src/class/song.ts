const ALBUM_SELECTOR = 'a:not([class])';
const ATTRIBUTE_SELECTOR = 'a[class]';

export class Song {
    title: string;
    artists: string [];
    album: string | undefined;

    constructor (songRowElement: Element) {
        this.title = this.extractTitleFromElement(songRowElement);
        this.artists = this.extractArtistsFromElement(songRowElement);
        this.album = this.extractAlbumFromElement(songRowElement);
    }

    extractArtistsFromElement (songRowElement: Element): string[] {
        const artistsElements: Element[] = Array.from(songRowElement.querySelectorAll(ALBUM_SELECTOR));
        const artistsText: string[] = artistsElements.map((artist: any) => artist.textContent);
        return artistsText;
    }

    extractTitleFromElement (songRowElement: Element): string {
        const songAttributes: Element[] = Array.from(songRowElement.querySelectorAll(ATTRIBUTE_SELECTOR));
        const title: any = songAttributes.first;
        return title.text;
    }

    extractAlbumFromElement (songRowElement: Element): string | undefined {
        const songAttributes: Element[] = Array.from(songRowElement.querySelectorAll(ATTRIBUTE_SELECTOR));
        const album: any = songAttributes.last;
        return songAttributes.length > 1 ? album.text : undefined;
    }

    equals (otherSong: Song): boolean {
        return this.title === otherSong.title && this.artists === otherSong.artists;
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
