import {Rect} from "math/Rect";

import {Prim} from "./Prim";
import {V} from "Vector";
import {IsDefined} from "../../utils/Reducers";


export function Bounds(prim: Prim): Rect | undefined {
    switch (prim.kind) {
    case "BezierCurve":
        return prim.curve.bounds;
    case "Circle":
        return new Rect(prim.pos, V(prim.radius * 2));
    case "CircleSector":
        return undefined;
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
