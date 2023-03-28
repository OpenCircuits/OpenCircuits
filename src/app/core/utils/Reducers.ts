/**
 * Utility reducer that can reduce a generic object with a specific "dist"
 *  parameter. This finding an object with the minimum "distance" and then
 *  getting other properties from this object.
 *
 * @param prev The previous object in the reduction.
 * @param cur  The current object in the reduction to compare against the previous.
 * @returns    The object that has the minimal `dist`.
 */
export const MinDist = <O extends { dist: number }>(
    prev: O,
    cur: O
) => ((prev.dist <= cur.dist) ? prev : cur);
