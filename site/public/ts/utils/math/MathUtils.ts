import {WIRE_DIST_ITERATIONS,
        WIRE_NEWTON_ITERATIONS,
        WIRE_DIST_THRESHOLD2} from "../Constants";

import {Vector, V} from "./Vector";
import {Transform} from "./Transform";
import {BezierCurve} from "./BezierCurve";

/**
 * Clamps a number between a given min and max
 *
 * @param  {Number} x
 *         The number to clamp
 *
 * @param  {Number} min
 *         The minimum
 *
 * @param  {Number} max
 *         The maximum
 *
 * @return {Number}
 *         The clamped number
 */
export function Clamp(x: number, min: number, max: number): number {
    return Math.max(Math.min(x, max), min);
}

/**
 * Returns the nearest point on the edge
 * of the given rectangle.
 *
 * @param  {Vector} bl
 *         Bottom left corner of the rectangle
 *
 * @param  {Vector} tr
 *         Top right corner of the rectangle
 *
 * @param  {Vector} pos
 *         The position to get the nearest point on
 *
 * @return {Vector}
 *         The closest position on the edge of
 *         the rectangle from 'pos'
 */
export function GetNearestPointOnRect(bl: Vector, tr: Vector, pos: Vector): Vector {
    if (pos.x < bl.x)
        return V(bl.x, Clamp(pos.y, bl.y, tr.y));
    if (pos.x > tr.x)
        return V(tr.x, Clamp(pos.y, bl.y, tr.y));
    if (pos.y < bl.y)
        return V(Clamp(pos.x, bl.x, tr.x), bl.y);
    if (pos.y > tr.y)
        return V(Clamp(pos.x, bl.x, tr.x), tr.y);
    return V(0, 0);
}

/**
 * Determines whether the given point is
 * within the rectangle defined by the
 * given transform
 *
 * @param  {Transform} transform
 *         The transform that represents the rectangle
 *
 * @param  {Vector} pos
 *         * Must be in world coordinates *
 *         The point to determine whether or not
 *         it's within the rectangle
 *
 * @return {Boolean}
 *         True if the point is within the rectangle,
 *         false otherwise
 */
export function RectContains(transform: Transform, pos: Vector): boolean {
    const tr = transform.getSize().scale(0.5);  // top right corner
    const bl = transform.getSize().scale(-0.5); // bottom left corner
    const p  = transform.toLocalSpace(pos);

    // Check if point is within bounds
    return (p.x > bl.x &&
            p.y > bl.y &&
            p.x < tr.x &&
            p.y < tr.y);
}

/**
 * Determines whether the given point
 * is within the circle defined by the
 * given transform
 *
 * @param  {Vector} pos1
 *         The center of the circle in world
 *         coordinates
 *
 * @param  {number} r
 *         The radius of the circle in world
 *         units
 *
 * @param  {Vector} pos2
 *         * Must be in world coordinates *
 *         The point to determine whether or not
 *         it's within the circle
 *
 * @return {Boolean}
 *          True if the point is within the rectangle,
 *          false otherwise
 */
export function CircleContains(pos1: Vector, r: number, pos2: Vector): boolean {
    return (pos2.sub(pos1).len2() <= r*r);
}

/**
 * Compares two transforms to see if they overlap.
 * First tests it using a quick circle-circle
 * intersection using the 'radius' of the transform
 *
 * Then uses a SAT (Separating Axis Theorem) method
 * to determine whether or not the two transforms
 * are intersecting
 *
 * @param  {Transform} a
 *         The first transform
 *
 * @param  {Transform} b
 *         The second transform
 *
 * @return {Boolean}
 *         True if the two transforms are overlapping,
 *         false otherwise
 */
export function TransformContains(A: Transform, B: Transform): boolean {
    // If both transforms are non-rotated
    if (Math.abs(A.getAngle()) <= 1e-5 && Math.abs(B.getAngle()) <= 1e-5) {
        const aPos = A.getPos(), aSize = A.getSize();
        const bPos = B.getPos(), bSize = B.getSize();
        return (Math.abs(aPos.x - bPos.x) * 2 < (aSize.x + bSize.x)) &&
               (Math.abs(aPos.y - bPos.y) * 2 < (aSize.y + bSize.y));
    }

    // Quick check circle-circle intersection
    const r1 = A.getRadius();
    const r2 = B.getRadius();
    const sr = r1 + r2;                       // Sum of radius
    const dpos = A.getPos().sub(B.getPos());  // Delta position
    if (dpos.dot(dpos) > sr*sr)
        return false;

    /* Perform SAT */

    // Get corners in local space of transform A
    const a = A.getLocalCorners();

    // Transform B's corners into A local space
    const bworld = B.getCorners();
    const b = [];
    for (let i = 0; i < 4; i++) {
        b[i] = A.toLocalSpace(bworld[i]);

        // Offsets x and y to fix perfect lines
        // where b[0] = b[1] & b[2] = b[3]
        b[i].x += 0.0001*i;
        b[i].y += 0.0001*i;
    }

    const corners = a.concat(b);

    let minA, maxA, minB, maxB;

    // SAT w/ x-axis
    // Axis is <1, 0>
    // So dot product is just the x-value
    minA = maxA = corners[0].x;
    minB = maxB = corners[4].x;
    for (let j = 1; j < 4; j++) {
        minA = Math.min(corners[j].x, minA);
        maxA = Math.max(corners[j].x, maxA);
        minB = Math.min(corners[j+4].x, minB);
        maxB = Math.max(corners[j+4].x, maxB);
    }
    if (maxA < minB || maxB < minA)
        return false;

    // SAT w/ y-axis
    // Axis is <1, 0>
    // So dot product is just the y-value
    minA = maxA = corners[0].y;
    minB = maxB = corners[4].y;
    for (let j = 1; j < 4; j++) {
        minA = Math.min(corners[j].y, minA);
        maxA = Math.max(corners[j].y, maxA);
        minB = Math.min(corners[j+4].y, minB);
        maxB = Math.max(corners[j+4].y, maxB);
    }
    if (maxA < minB || maxB < minA)
        return false;

    // SAT w/ other two axes
    const normals = [b[3].sub(b[0]), b[3].sub(b[2])];
    for (const normal of normals) {
        minA = Infinity, maxA = -Infinity;
        minB = Infinity, maxB = -Infinity;
        for (let j = 0; j < 4; j++) {
            const s = corners[j].dot(normal);
            minA = Math.min(s, minA);
            maxA = Math.max(s, maxA);
            const s2 = corners[j+4].dot(normal);
            minB = Math.min(s2, minB);
            maxB = Math.max(s2, maxB);
        }
        if (maxA < minB || maxB < minA)
            return false;
    }

    return true;
}

/**
 * Uses Newton's method to find the roots of
 * the function 'f' given a derivative 'df'
 *
 * @param  {Number} iterations
 *         The number of iterations to perform
 *         Newton's method with; the smaller
 *         the better but less accurate
 *
 * @param  {Number} t0
 *         The starting root value parameter
 *
 * @param  {Number} x
 *         Parameter 1 for the function
 *
 * @param  {Number} y
 *         Parameter 2 for the function
 *
 * @param  {Function} f
 *         The function to find the roots of
 *         In the form f(t, x, y) = ...
 *
 * @param  {Function} df
 *         The derivative of the function
 *         In the form of df(t, x, y)
 *
 * @return {Number}
 *         The parameter 't' that results in
 *         f(t, x, y) = 0
 */
export function FindRoots(iterations: number, t0: number, x: number, y: number,
                          f:  (t: number, x: number, y: number) => number,
                          df: (t: number, x: number, y: number) => number): number {
    let t = t0;
    do {
        const v  = f(t, x, y);
        const dv = df(t, x, y);
        if (dv === 0)
            break;
        t = t - v / dv;
        t = Clamp(t, 0.01, 0.99);
    } while((iterations--) > 0);
    return t;
}

/**
 * Finds if the given position is within
 *  the given bezier curve
 *
 * Parametric function defined by
 * X(t) = t(p2.x - p1.x) + p1.x
 * Y(t) = t(p2.y - p1.y) + p1.y
 *
 * Solves for 't' from root of the derivative of
 * the distance function between the line and `pos`
 * D(t) = sqrt((X(t) - mx)^2 + (Y(t) - my)^2)
 *
 * @param  {BezierCurve} curve
           The bezier curve
 *
 * @param  {Vector} pos
           The position
 *
 * @return {boolean}
 *         True if position is within the bezier curve
           False otherwise
 */
export function BezierContains(curve: BezierCurve, pos: Vector): boolean {
    let minDist = 1e20;
    let t0 = -1;
    for (let tt = 0; tt <= 1.0; tt += 1.0 / WIRE_DIST_ITERATIONS) {
        const dist = curve.getPos(tt).sub(pos).len();
        if (dist < minDist) {
            t0 = tt;
            minDist = dist;
        }
    }

    const f1  = (t: number, x: number, y: number): number => curve.getPos(t).sub(x, y).len2();
    const df1 = (t: number, x: number, y: number): number => curve.getPos(t).sub(x, y).scale(2).dot(curve.getDerivative(t));

    // Newton's method to find parameter for when slope is undefined AKA denominator function = 0
    const t1 = FindRoots(WIRE_NEWTON_ITERATIONS, t0, pos.x, pos.y, f1, df1);
    if (curve.getPos(t1).sub(pos).len2() < WIRE_DIST_THRESHOLD2)
        return true;

    const f2  = (t: number, x: number, y: number): number => curve.getDerivative(t).dot(curve.getPos(t).sub(x, y));
    const df2 = (t: number, x: number, y: number): number => curve.getDerivative(t).dot(curve.getDerivative(t)) + curve.getPos(t).sub(x, y).dot(curve.get2ndDerivative(t));

    // Newton's method to find parameter for when slope is 0 AKA numerator function = 0
    const t2 = FindRoots(WIRE_NEWTON_ITERATIONS, t0, pos.x, pos.y, f2, df2);
    if (curve.getPos(t2).sub(pos).len2() < WIRE_DIST_THRESHOLD2)
        return true;

    return false;
}

/**
 * Finds the midpoint from a list of positions
 *
 * @param  {Array<Vector>} positions
           The list of positions
 *
 * @return {Vector}
 *         The midpoint of all the given positions
 */
export function CalculateMidpoint(positions: Array<Vector>): Vector {
    return positions.reduce((sum, pos) => sum.add(pos), V()).scale(1.0 / positions.length);
}
