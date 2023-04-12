declare global {
    interface Map<K, V> {
        upsert: (key: K, updateFn?: (k: K, v: V) => V, insertFn?: (k: K) => V) => V | undefined;
        getOrInsert: (key: K, insertFn: (k: K) => V) => V;
    }
}


// See https://github.com/tc39/proposal-upsert
// Adapted from https://github.com/zloirock/core-js/blob/0f121211809a214b6def16bbac51b9d05fb42bad/packages/core-js/internals/map-upsert.js
Map.prototype.upsert = function <K, V>(key: K, updateFn?: (k: K, v: V) => V, insertFn?: (k: K) => V): V | undefined {
    if (this.has(key))
    {
        const value = this.get(key)!;
        if (!updateFn)
            return value;

        const newValue = updateFn(key, value);
        this.set(key, newValue);
        return newValue;
    } else if (insertFn) {
        const value = insertFn(key);
        this.set(key, value);
        return value;
    }
    return undefined;
}

Map.prototype.getOrInsert = function <K, V>(key: K, insertFn: (k: K) => V): V {
    return this.upsert(key, undefined, insertFn)!;
}

export {};
