/* eslint-disable unicorn/no-this-assignment */
/* eslint-disable @typescript-eslint/no-this-alias */

declare global {
    interface Array<T> {
        sum: () => T;
    }

    interface Set<T> {
        intersection<U>(other: ReadonlySet<U>): Set<T & U>;
        difference(other: ReadonlySet<T>): Set<T>;
        symmetricDifference(other: ReadonlySet<T>): Set<T>;
    }
}

Array.prototype.sum = function(this: number[]): number {
    return this.reduce((a, b) => (a + b), 0);
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
