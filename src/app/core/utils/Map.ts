declare global {
    interface Map<K, V> {
        emplace(key: K, op: {
            insert?(key: K, map: Map<K, V>): V;
            update?(existing: V, key: K, map: Map<K, V>): V;
        }): V;
        getOrInsert(key: K, insertFn: (k: K) => V): V;
    }
}


// See https://github.com/tc39/proposal-upsert
// Adapted from https://github.com/zloirock/core-js/blob/0f121211809a214b6def16bbac51b9d05fb42bad/packages/core-js/internals/map-upsert.js
Map.prototype.emplace = function<K, V>(key: K, op: {
    insert?: (key: K, map: Map<K, V>) => V;
    update?: (existing: V, key: K, map: Map<K, V>) => V;
}): V | undefined {
    if (this.has(key)) {
        const value = this.get(key)!;
        if (!op.update)
            return value;

        const newValue = op.update(value, key, this);
        this.set(key, newValue);
        return newValue;
    } else if (op.insert) {
        const value = op.insert(key, this);
        this.set(key, value);
        return value;
    }
    return undefined;
}

Map.prototype.getOrInsert = function<K, V>(key: K, insert: ((k: K) => V)): V {
    return this.emplace(key, { insert })!;
}

export {};
