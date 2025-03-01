import {Vector} from "Vector";
import {CircleContains, CurveContains, RectContains} from "math/MathUtils";
import {Prim} from "./Prim";
import {LineCurve} from "math/Line";


export function HitTest(prim: Prim, pt: Vector): boolean {
    if (prim.ignoreHit)
        return false;

    switch (prim.kind) {
    case "BezierCurve":
        return CurveContains(prim.curve, pt);
    case "Circle":
        return CircleContains(prim.pos, prim.radius, pt);
    case "CircleSector":
        throw new Error("Method not implemented.");
    case "Line":
        return CurveContains(new LineCurve(prim.p1, prim.p2), pt);
    case "Polygon":
        throw new Error("Method not implemented.");
    case "QuadCurve":
        return false; // Maybe allow quad curves to be hit?
    case "Rectangle":
        return RectContains(prim.transform, pt);
    case "SVG":
        return RectContains(prim.transform, pt);
    case "Group":
        return prim.prims.some((p) => HitTest(p as Prim, pt));
    }
}
