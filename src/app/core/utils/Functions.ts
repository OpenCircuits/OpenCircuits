

/**
 * Utility function that works identically to Array.map, but applies for Objects (Records).
 *
 * Simply maps each key in the object to a different value based on the previous values.
 *
 * @param obj  The object/record to map to a different object/record.
 * @param func The mapping function.
 * @returns      A new object with same keys and different values.
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
