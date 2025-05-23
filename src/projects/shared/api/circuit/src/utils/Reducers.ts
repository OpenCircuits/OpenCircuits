/**
 * Utility reducer that can reduce a generic object with a specific "dist" parameter.
 * This is useful for generically finding a "minimum" from a set of objects and then
 *  getting other properties from it without needing some secondary lookup.
 *
 * @param prev The previous object in the reduction.
 * @param cur  The current object in the reduction to compare against the previous.
 * @returns    The object that has the minimal `dist`.
 */
export const MinDist = <O extends { dist: number }>(
    prev: O,
    cur: O
) => ((prev.dist <= cur.dist) ? prev : cur);


export const IsDefined = <T>(val: T | undefined): val is T  => (!!val);

export const Get = <I extends number>(i: I) => <T extends any[]>(val: T): T[I] => (val[i]);
