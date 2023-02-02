
declare global {
    interface Array<T> {
        sum: () => T;
    }
}

Array.prototype.sum = function(this: number[]): number {
    return this.reduce((a, b) => (a + b));
}

export {};
