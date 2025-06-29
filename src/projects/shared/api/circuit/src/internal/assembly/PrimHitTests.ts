import {Vector} from "Vector";
import {CircleContains, CurveContains, RectContains} from "math/MathUtils";
import {LineCurve} from "math/Line";

import {Prim} from "./Prim";
import {Rect} from "math/Rect";
import {Bounds, OrientedBounds} from "./PrimBounds";


export function HitTest(prim: Prim, pt: Vector): boolean {
    if (prim.ignoreHit)
        return false;

    switch (prim.kind) {
    case "BezierCurve":
        return CurveContains(prim.curve, pt);
    case "Circle":
        return CircleContains(prim.pos, prim.radius, pt);
    case "CircleSector":
        return CircleContains(prim.pos, prim.radius, pt);
    case "Line":
        return CurveContains(new LineCurve(prim.p1, prim.p2), pt);
    case "Polygon":
        return RectContains(prim.bounds, pt);
    case "QuadCurve":
        return false; // Maybe allow quad curves to be hit?
    case "Rectangle":
        return RectContains(prim.transform, pt);
    case "SVG":
        return RectContains(prim.transform, pt);
    case "Text":
        return false;
    case "Group":
        return prim.prims.some((p) => HitTest(p as Prim, pt));
    }
}

export function IntersectionTest(prim: Prim, rect: Rect): boolean {
    if (prim.ignoreHit)
        return false;

    return (OrientedBounds(prim) ?? Bounds(prim))?.intersects(rect) ?? false;
}
