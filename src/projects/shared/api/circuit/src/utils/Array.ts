/* eslint-disable unicorn/no-this-assignment */
/* eslint-disable @typescript-eslint/no-this-alias */

declare global {
    interface Array<T> {
        sum(): T;
        count(filter: (el: T, i: number, arr: T[]) => boolean): number;
        with(index: number, value: T): T[];
        toSorted(compareFn?: ((a: T, b: T) => number) | undefined): T[];
        zip<U>(other: U[]): Array<[T, U]>;
        chunk(chunkSize: number): T[][];
    }

    interface Set<T> {
        union<U>(other: ReadonlySet<U>): Set<T | U>;
        intersection<U>(other: ReadonlySet<U>): Set<T & U>;
        difference(other: ReadonlySet<T>): Set<T>;
        symmetricDifference(other: ReadonlySet<T>): Set<T>;
    }
}

Array.prototype.sum = function(this: number[]): number {
    return this.reduce((a, b) => (a + b), 0);
}
Array.prototype.count = function<T>(this: T[], filter: (el: T, i: number, arr: T[]) => boolean): number {
    return this.filter(filter).length;
}
Array.prototype.with = function<T>(this: T[], index: number, value: T): T[] {
    const newArray = [...this];
    newArray[index] = value;
    return newArray;
}
Array.prototype.toSorted = function<T>(this: T[], compareFn?: ((a: T, b: T) => number) | undefined): T[] {
    const newArray = [...this];
    newArray.sort(compareFn);
    return newArray;
}
Array.prototype.zip = function<T, U>(this: T[], other: U[]): Array<[T, U]> {
    return this.map((t, i) => [t, other[i]]);
}

Array.prototype.chunk = function<T>(this: T[], chunkSize: number): T[][] {
    return new Array(Math.ceil(this.length / chunkSize))
        .fill([])
        .map((_, i) => this.slice(i * chunkSize, i * chunkSize + chunkSize));
}

Set.prototype.union = function<T, U>(this: Set<T>, other: Set<U>): Set<T | U> {
    const result = new Set<T|U>(this);
    for (const elem of other)
        result.add(elem);
    return result;
}
Set.prototype.intersection = function<T, U>(this: Set<T>, other: Set<U>): Set<T & U> {
    let smallerElems: Set<T> | Set<U>;
    let largerHas: Set<T> | Set<U>;
    if (this.size <= other.size) {
       smallerElems = this;
       largerHas = other;
    } else {
       smallerElems = other;
       largerHas = this;
    }
    const result = new Set<T & U>();
    for (const elem of smallerElems) {
        if (largerHas.has(elem as T & U)) {
          result.add(elem as T & U);
        }
    }
    return result;
}
Set.prototype.difference = function<T>(this: Set<T>, other: Set<T>): Set<T> {
    const result = new Set<T>();
    for (const item of this) {
      if (!other.has(item)) {
        result.add(item);
      }
    }
    return result;
}
Set.prototype.symmetricDifference = function<T>(this: Set<T>, other: Set<T>): Set<T> {
    const result = new Set<T>();
    for (const item of this) {
        if (!other.has(item))
            result.add(item);
    }
    for (const item of other) {
        if (!this.has(item))
            result.add(item);
    }
    return result;
}

export {};
