/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable no-extend-native */
declare global {
    interface Array<T> {
        first: T
        last: T
    }
}

if (!Array.prototype.last) {
    Array.prototype.last = function<T>(): T {
        return this[this.length - 1];
    };
}

if (!Array.prototype.first) {
    Array.prototype.first = function<T>(): T {
        return this[0];
    };
}
export {};
