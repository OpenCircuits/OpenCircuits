import {BezierCurve} from "./BezierCurve";
import {Transform}   from "./Transform";
import {V, Vector}   from "./Vector";

/**
 * Clamps a number between a given min and max.
 *
 * @param x   The number to clamp.
 * @param min The minimum.
 * @param max The maximum.
 * @returns     The clamped number.
 */
export function Clamp(x: number, min: number, max: number): number {
    return Math.max(Math.min(x, max), min);
}

/**
 * Returns the nearest point on the edge
 * of the given rectangle.
 *
 * @param bl  Bottom left corner of the rectangle.
 * @param tr  Top right corner of the rectangle.
 * @param pos The position to get the nearest point on.
 * @returns     The closest position on the edge of
 *      the rectangle from 'pos'.
 */
export function GetNearestPointOnRect(bl: Vector, tr: Vector, pos: Vector): Vector {
    // First clamp point to within the rectangle
    pos = Vector.Clamp(pos, bl, tr);

    // Then find corresponding edge when point is inside the rectangle
    // (see https://www.desmos.com/calculator/edhaqiwgf1)
    const DR = Math.abs(tr.x - pos.x), DL = Math.abs(bl.x - pos.x);
    const DT = Math.abs(tr.y - pos.y), DB = Math.abs(bl.y - pos.y);
    const DX = Math.min(DR, DL), DY = Math.min(DT, DB);

    pos.x = (DY > DX) ? (DR < DL ? tr.x : bl.x) : pos.x;
    pos.y = (DX > DY) ? (DT < DB ? tr.y : bl.y) : pos.y;

    return pos;
}

/**
 * Determines whether the given point is
 * within the rectangle defined by the
 * given transform.
 *
 * @param transform The transform that represents the rectangle.
 * @param pos       Must be in world coordinates *
 *            The point to determine whether or not
 *            it's within the rectangle.
 * @returns           True if the point is within the rectangle,
 *            false otherwise.
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
 * given transform.
 *
 * @param pos1 The center of the circle in world
 *       coordinates.
 * @param r    The radius of the circle in world
 *       units.
 * @param pos2 Must be in world coordinates *
 *       The point to determine whether or not
 *       it's within the circle.
 * @returns      True if the point is within the rectangle,
 *       false otherwise.
 */
export function CircleContains(pos1: Vector, r: number, pos2: Vector): boolean {
    return (pos2.sub(pos1).len2() <= r*r);
}

/**
 * Compares two transforms to see if they overlap.
 * First tests it using a quick circle-circle
 * intersection using the 'radius' of the transform.
 *
 * Then uses a SAT (Separating Axis Theorem) method
 * to determine whether or not the two transforms
 * are intersecting.
 *
 * @param A The first transform.
 * @param B The second transform.
 * @returns
 *    True if the two transforms are overlapping,
 *    false otherwise.
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

    const corners = [...a, ...b];

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
 * the function 'f' given a derivative 'df'.
 *
 * @param iterations The number of iterations to perform
 *             Newton's method with; the smaller
 *             the better but less accurate.
 * @param t0         The starting root value parameter.
 * @param x          Parameter 1 for the function.
 * @param y          Parameter 2 for the function.
 * @param f          The function to find the roots of.
 *             In the form `f(t, x, y) = ...`.
 * @param df         The derivative of the function
 *             In the form of `df(t, x, y)`.
 * @returns            The parameter 't' that results in
 *             `f(t, x, y) = 0`.
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
    } while ((iterations--) > 0);
    return t;
}


const WIRE_DIST_THRESHOLD  = 0.1;
const WIRE_DIST_THRESHOLD2 = WIRE_DIST_THRESHOLD ** 2;
const WIRE_DIST_ITERATIONS = 10;
const WIRE_NEWTON_ITERATIONS = 5;

/**
 * Finds if the given position is within
 *  the given bezier curve.
 *
 * Parametric function defined by
 * `X(t) = t(p2.x - p1.x) + p1.x` and
 * `Y(t) = t(p2.y - p1.y) + p1.y`.
 *
 * Solves for 't' from root of the derivative of
 * the distance function between the line and `pos`.
 * `D(t) = sqrt((X(t) - mx)^2 + (Y(t) - my)^2)`.
 *
 * @param curve The bezier curve.
 * @param pos   The position.
 * @returns       True if position is within the bezier curve,
 *        false otherwise.
 */
export function BezierContains(curve: BezierCurve, pos: Vector): boolean {
    let minDist = 1e20;
    let t0 = -1;
    for (let tt = 0; tt <= 1; tt += 1 / WIRE_DIST_ITERATIONS) {
        const dist = curve.getPos(tt).sub(pos).len();
        if (dist < minDist) {
            t0 = tt;
            minDist = dist;
        }
    }

    const f1  = (t: number, x: number, y: number): number => curve.getPos(t).sub(x, y).len2();
    const df1 = (t: number, x: number, y: number): number => curve.getPos(t).sub(x, y).scale(2)
                                                                  .dot(curve.getDerivative(t));

    // Newton's method to find parameter for when slope is undefined AKA denominator function = 0
    const t1 = FindRoots(WIRE_NEWTON_ITERATIONS, t0, pos.x, pos.y, f1, df1);
    if (curve.getPos(t1).sub(pos).len2() < WIRE_DIST_THRESHOLD2)
        return true;

    const f2  = (t: number, x: number, y: number): number => curve.getDerivative(t).dot(curve.getPos(t).sub(x, y));
    const df2 = (t: number, x: number, y: number): number => curve.getDerivative(t).dot(curve.getDerivative(t))
                                                             + curve.getPos(t).sub(x, y).dot(curve.get2ndDerivative(t));

    // Newton's method to find parameter for when slope is 0 AKA numerator function = 0
    const t2 = FindRoots(WIRE_NEWTON_ITERATIONS, t0, pos.x, pos.y, f2, df2);

    return (curve.getPos(t2).sub(pos).len2() < WIRE_DIST_THRESHOLD2);
}

/**
 * Finds the midpoint from a list of positions.
 *
 * @param positions The list of positions.
 * @returns           The midpoint of all the given positions.
 */
export function CalculateMidpoint(positions: Vector[]): Vector {
    return positions.reduce((sum, pos) => sum.add(pos), V()).scale(1 / positions.length);
}

/**
 * Calculates the decimal value of a binary-coded-decimal
 *  represented by a list of booleans.
 *
 * @param bcd The binary-coded-decimal as a list of booleans.
 * @returns     The decimal equivalent of the binary-coded-decimal.
 */
export function BCDtoDecimal(bcd: boolean[]): number {
    return bcd.reduce((sum, on, i) => sum + (on ? 1 << i : 0), 0);
}

/**
 * Calculates the BCD representation of the input number.
 *
 * @param decimal The number to convert (`decimal >= 0`).
 * @throws An Error if decimal is not a valid integer `>= 0`.
 * @returns         The BCD representation of the input.
 */
export function DecimalToBCD(decimal: number): boolean[] {
    if (!Number.isInteger(decimal) || decimal < 0)
        throw "input must be a nonnegative integer";
    const result: boolean[] = [];
    while (decimal) {
        result.push(decimal % 2 === 1);
        decimal = Math.floor(decimal / 2);
    }
    return result;
}

/**
 * Creates a "linear space" or uniform/collocated grid from [x0, xf] with n points
 *  uniformly between them.
 *
 * @param x0 Start point (inclusive).
 * @param xf End point (inclusive).
 * @param n  The number of points in the space.
 * @returns    An array of n uniform points on the domain [x0, xf].
 */
export function linspace(x0: number, xf: number, n: number) {
    return new Array(n).fill(0).map((_, i) => x0 + (xf - x0) * i/(n-1));
}

/**
 * Creates a "linear space" or uniform/staggered grid from `[x0, xf)` with spacing dx.
 *
 * @param x0 Start point (inclusive).
 * @param xf End point (exclusive).
 * @param dx The spacing between each point.
 * @returns    An array of n uniform points on the domain `[x0, xf)`.
 */
export function linspaceDX(x0: number, xf: number, dx: number) {
    const N = Math.ceil((xf - x0) / dx);
    return new Array(N).fill(0).map((_, i) => x0 + dx * i);
}
