import {Curve}     from "./Curve";
import {Rect}      from "./Rect";
import {Transform} from "./Transform";
import {V, Vector} from "./Vector";

/**
 * Clamps a number between a given min and max.
 *
 * @param x   The number to clamp.
 * @param min The minimum.
 * @param max The maximum.
 * @returns   The clamped number.
 */
export function Clamp(x: number, min: number, max: number): number {
    return Math.max(Math.min(x, max), min);
}

/**
 * Performs a floating-point modulo with proper negative handling.
 *
 * @param x The input number.
 * @param q The modulu divisor.
 * @returns `x` % `q` with proper negative handling.
 */
export function FMod(x: number, q: number): number {
    return ((x % q) + q) % q;
}

/**
 * Returns the nearest point on the edge
 * of the given rectangle.
 *
 * @param rect The rectangle.
 * @param pos  The position to get the nearest point on.
 * @returns    The closest position on the edge of
 *             the rectangle from 'pos'.
 */
export function GetNearestPointOnRect(rect: Rect, pos: Vector): Vector {
    const bl = rect.bottomLeft, tr = rect.topRight;

    // First clamp point to within the rectangle
    pos = Vector.Clamp(pos, bl, tr);

    // Then find corresponding edge when point is inside the rectangle
    // (see https://www.desmos.com/calculator/edhaqiwgf1)
    const DR = Math.abs(tr.x - pos.x), DL = Math.abs(bl.x - pos.x);
    const DT = Math.abs(tr.y - pos.y), DB = Math.abs(bl.y - pos.y);
    const DX = Math.min(DR, DL), DY = Math.min(DT, DB);

    return V(
        (DY > DX) ? (DR < DL ? tr.x : bl.x) : pos.x,
        (DX > DY) ? (DT < DB ? tr.y : bl.y) : pos.y
    );
}

/**
 * Determines whether the given point is
 * within the rectangle defined by the
 * given transform.
 *
 * @param transform The transform that represents the rectangle.
 * @param pos       Must be in world coordinates *
 *                  The point to determine whether or not
 *                  it's within the rectangle.
 * @returns         True if the point is within the rectangle,
 *                  false otherwise.
 */
export function RectContains(transform: Transform, pos: Vector): boolean {
    const p  = transform.toLocalSpace(pos);

    // Check if point is within bounds
    return (p.x > -0.5 &&
            p.y > -0.5 &&
            p.x < 0.5 &&
            p.y < 0.5);
}

/**
 * Determines whether the given point
 * is within the circle defined by the
 * given transform.
 *
 * @param pos1 The center of the circle in world
 *             coordinates.
 * @param r    The radius of the circle in world
 *             units.
 * @param pos2 Must be in world coordinates *
 *             The point to determine whether or not
 *             it's within the circle.
 * @returns    True if the point is within the rectangle,
 *             false otherwise.
 */
export function CircleContains(pos1: Vector, r: number, pos2: Vector): boolean {
    return (pos2.sub(pos1).len2() <= r*r);
}

export function TransformContainsRect(a: Transform, rect: Rect): boolean {
    // TODO: Optimize this to not do full SAT
    const b = new Transform(rect.center, 0, rect.size);
    return TransformContains(a, b);
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
 *          True if the two transforms are overlapping,
 *          false otherwise.
 */
export function TransformContains(A: Transform, B: Transform): boolean {
    // If both transforms are non-rotated (modulu 180 degrees), do simple check
    if (Math.abs(A.angle) % Math.PI <= 1e-5 && Math.abs(B.angle) % Math.PI <= 1e-5) {
        return (Math.abs(A.pos.x - B.pos.x) * 2 < (A.scale.x + B.scale.x)) &&
               (Math.abs(A.pos.y - B.pos.y) * 2 < (A.scale.y + B.scale.y));
    }

    // Quick check circle-circle intersection
    const r1 = A.getRadius(), r2 = B.getRadius();
    const sr = r1 + r2;             // Sum of radius
    const dpos = A.pos.sub(B.pos);  // Delta position
    if (dpos.dot(dpos) > sr*sr)
        return false;

    /* Perform SAT */

    // Get corners in local space of transform A
    const a = A.getLocalCorners();

    // Transform B's corners into A local space
    const bworld = B.getCorners();

    // Turn to local-space
    // and Offset x and y to fix perfect lines
    //  where b[0] = b[1] & b[2] = b[3]
    const b = bworld.map((v) => A.toLocalSpace(v))
        .map((v, i) => v.add(0.0001*i));

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
 *                   Newton's method with; the smaller
 *                   the better but less accurate.
 * @param t0         The starting root value parameter.
 * @param x          Parameter 1 for the function.
 * @param y          Parameter 2 for the function.
 * @param f          The function to find the roots of.
 *                   In the form `f(t, x, y) = ...`.
 * @param df         The derivative of the function
 *                   In the form of `df(t, x, y)`.
 * @returns          The parameter 't' that results in
 *                   `f(t, x, y) = 0`.
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
 *  the given curve.
 *
 * Parametric function defined by
 * `X(t) = t(p2.x - p1.x) + p1.x` and
 * `Y(t) = t(p2.y - p1.y) + p1.y`.
 *
 * Solves for 't' from root of the derivative of
 * the distance function between the line and `pos`.
 * `D(t) = sqrt((X(t) - mx)^2 + (Y(t) - my)^2)`.
 *
 * @param curve The curve.
 * @param pos   The position.
 * @returns     True if position is within the curve,
 *              false otherwise.
 */
export function CurveContains(curve: Curve, pos: Vector): boolean {
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
 * @returns         The midpoint of all the given positions.
 */
export function CalculateMidpoint(positions: Vector[]): Vector {
    if (positions.length === 0)
        return V();
    return positions.reduce((sum, pos) => sum.add(pos), V()).scale(1 / positions.length);
}

/**
 * Return evenly spaced numbers over a specified interval.
 *
 * Returns num evenly spaced samples, calculated over the interval [`start`, `stop`].
 *
 * The endpoint of the interval can optionally be excluded.
 *
 * @param start            Start point (inclusive).
 * @param stop             End point (inclusive), unless `endpoint` is set to False.
 *                         In that case, the sequence consists of all but the last
 *                         of num + 1 evenly spaced samples, so that stop is excluded.
 * @param num              The number of points in the space.
 * @param options          Optional options.
 * @param options.endpoint If True, `stop` is the last sample. Otherwise, it is not included. Default is true.
 * @param options.centered If True, the samples are shifted around the midpoint of [`start`, `stop`]. Default is false.
 * @returns                An array of `num` uniform points on the domain [start, stop].
 */
export function linspace(start: number, stop: number, num: number, options = { endpoint: true, centered: false }) {
    const div = (options.endpoint ? num - 1 : num);
    const offset = (options.centered ? (((stop - start) / 2) / div) : 0);
    return new Array(num).fill(0).map((_, i) =>
        (start + (stop - start) * i/div + offset));
}

/**
 * Return evenly spaced values within a given interval.
 *
 * @param x0 Start point (inclusive).
 * @param xf End point (exclusive).
 * @param dx The spacing between each point.
 * @returns  An array of n uniform points on the domain `[x0, xf)`.
 */
export function arange(x0: number, xf: number, dx: number) {
    const N = Math.ceil((xf - x0) / dx);
    return new Array(N).fill(0).map((_, i) => x0 + dx * i);
}
