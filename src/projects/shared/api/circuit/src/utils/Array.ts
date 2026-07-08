/* eslint-disable unicorn/no-this-assignment */
/* eslint-disable @typescript-eslint/no-this-alias */

declare global {
    interface Array<T> {
        sum(): T;
        count(filter: (el: T, i: number, arr: T[]) => boolean): number;
        zip<U>(other: U[]): Array<[T, U]>;
        chunk(chunkSize: number): T[][];
        padEnd(targetLen: number, val: T): T[];
    }
}

Array.prototype.sum = function (this: number[]): number {
    return this.reduce((a, b) => a + b, 0);
};
Array.prototype.count = function <T>(this: T[], filter: (el: T, i: number, arr: T[]) => boolean): number {
    return this.filter(filter).length;
};
Array.prototype.zip = function <T, U>(this: T[], other: U[]): Array<[T, U]> {
    return this.map((t, i) => [t, other[i]]);
};

Array.prototype.chunk = function <T>(this: T[], chunkSize: number): T[][] {
    return new Array(Math.ceil(this.length / chunkSize))
        .fill([])
        .map((_, i) => this.slice(i * chunkSize, (i + 1) * chunkSize));
};

Array.prototype.padEnd = function <T>(this: T[], targetLen: number, val: T): T[] {
    if (this.length >= targetLen) {
        return this;
    }
    return [...this, ...new Array(targetLen - this.length).fill(val)];
};

export {};
