import {V} from "Vector";

import {CalculateMidpoint} from "math/MathUtils";
import {Rect}              from "math/Rect";
import {Transform}         from "math/Transform";

import {Prim} from "./Prim";
import {IsDefined} from "../../utils/Reducers";


export function Bounds(prim: Prim): Rect | undefined {
    switch (prim.kind) {
    case "BezierCurve":
        return prim.curve.bounds;
    case "Circle":
        return new Rect(prim.pos, V(prim.radius * 2));
    case "CircleSector":
        return new Rect(prim.pos, V(prim.radius * 2));
    case "Line":
        return Rect.FromPoints(prim.p1, prim.p2);
    case "Polygon":
        return Rect.FromPoints(...prim.points);
    case "QuadCurve":
        return prim.curve.bounds;
    case "Rectangle":
        return prim.transform.asRect();
    case "SVG":
        return prim.transform.asRect();
    case "Text":
        // Text doesn't know its own size because that requires canvas,
        // so make sure you have another prim surrounding it otherwise it will get culled.
        return Rect.From({ cx: prim.pos.x, cy: prim.pos.y, height: 0, width: 0 });
    case "Group":
        const prims = prim.prims.map((p) => Bounds({ ...p, style: prim.style })).filter(IsDefined)
        if (prims.length === 0)
            return undefined;
        return Rect.Bounding(prims);
    }
}

export function OrientedBounds(prim: Prim): Transform | undefined {
    // Only returns bounds if they are BETTER than AA bounds like above
    switch (prim.kind) {
    case "BezierCurve":
        return undefined;
    case "Circle":
        return undefined;
    case "CircleSector":
        return undefined;
    case "Line":
        const { p1, p2 } = prim;
        return new Transform(CalculateMidpoint([p1, p2]), p1.sub(p2).angle(), V(p1.distanceTo(p2), 0.1));
    case "Polygon":
        return prim.ignoreHit ? undefined : prim.bounds;
    case "QuadCurve":
        return undefined;
    case "Rectangle":
        return prim.transform;
    case "SVG":
        return prim.transform;
    case "Text":
        return undefined;
    case "Group":
        return undefined;
    }
}
