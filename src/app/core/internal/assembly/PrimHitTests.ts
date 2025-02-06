import {Vector} from "Vector";
import {BezierContains, CircleContains, RectContains} from "math/MathUtils";
import {Prim} from "./Prim";


export function HitTest(prim: Prim, pt: Vector): boolean {
    switch (prim.kind) {
    case "BezierCurve":
        return BezierContains(prim.curve, pt);
    case "Circle":
        return CircleContains(prim.pos, prim.radius, pt);
    case "CircleSector":
        throw new Error("Method not implemented.");
    case "Line":
        return false; // Maybe allow lines to be hit?
    case "Polygon":
        throw new Error("Method not implemented.");
    case "QuadCurve":
        throw new Error("Method not implemented.");
    case "Rectangle":
        return RectContains(prim.transform, pt);
    case "SVG":
        return RectContains(prim.transform, pt);
    }
}
