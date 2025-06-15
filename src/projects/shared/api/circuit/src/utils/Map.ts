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

export function InvertMap<K, V>(map: Map<K, V>): Map<V, K> {
    return new Map(map.entries().map(([k, v]) => [v, k]));
}

export {};
