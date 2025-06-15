/**
 * Utility function that works identically to Array.map, but applies for Objects (Records).
 *
 * Simply maps each key in the object to a different value based on the previous values.
 *
 * @param obj  The object/record to map to a different object/record.
 * @param func The mapping function.
 * @returns    A new object with same keys and different values.
 */
export function MapObj<Ks extends string|number, V1s, V2s>(
    obj: Record<Ks, V1s>,
    func: (entry: [Ks, V1s], i: number, obj: Record<Ks, V1s>) => V2s,
): Record<Ks, V2s> {
    return Object.fromEntries(
        Object.entries<V1s>(obj)
            .map(([key, val], i) =>
                [key as Ks, func([key as Ks, val], i, obj)]
            )
    ) as Record<Ks, V2s>;
}

/**
 * Utility function that takes a set of entries [Key, Val] and makes a Record from them, but concatenating
 *  same keys to a single array entry.
 *
 * @param entries The list of entries.
 * @returns       A record from the keys to all the associated values.
 */
export function FromConcatenatedEntries<K extends string, V>(entries: Array<[K, V]>): Record<K, V[]> {
    return entries.reduce((prev, [key, val]) => ({
        ...prev,
        [key]: [...(prev[key] ?? []), val],
    }), {} as Record<K, V[]>);
}

export function InvertRecord<K extends string | number, V extends string | number>(r: Record<K, V>): Record<V, K> {
    return Object.fromEntries(Object.entries(r).map(([k, v]) => [v, k]));
}


export function extend<
    O extends Record<string | number | symbol, unknown>,
    E extends Record<string | number | symbol, unknown>
>(obj: O, ext: E): O & E {
    for (const prop in ext) {
        if (Object.getOwnPropertyDescriptor && Object.defineProperty) {
            const propertyDescriptor = Object.getOwnPropertyDescriptor(ext, prop)!;
            Object.defineProperty(obj, prop, propertyDescriptor);
        } else {
            (obj[prop] as unknown) = ext[prop];
        }
    }
    return obj as O & E;
}
