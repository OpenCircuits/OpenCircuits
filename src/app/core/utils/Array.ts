
declare global {
    interface Array<T> {
        sum: () => T;
    }

    interface Set<T> {
        intersection<U>(other: ReadonlySet<U>): Set<T & U>;
    }
}

Array.prototype.sum = function(this: number[]): number {
    return this.reduce((a, b) => (a + b));
}

export {};
