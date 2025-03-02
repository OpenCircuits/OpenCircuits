import {Rect} from "math/Rect";

import {Prim} from "./Prim";
import {V} from "Vector";


export function Bounds(prim: Prim): Rect {
    switch (prim.kind) {
    case "BezierCurve":
        return prim.curve.bounds;
    case "Circle":
        return new Rect(prim.pos, V(prim.radius * 2));
    case "CircleSector":
        throw new Error("Method not implemented.");
    case "Line":
        return Rect.FromPoints(prim.p1, prim.p2);
    case "Polygon":
        throw new Error("Method not implemented.");
    case "QuadCurve":
        throw new Error("Method not implemented.");
    case "Rectangle":
        return prim.transform.asRect();
    case "SVG":
        return prim.transform.asRect();
    case "Text":
        // Text doesn't know its own size because that requires canvas
        return Rect.From({cx: prim.pos.x, cy: prim.pos.y, height: 0, width: 0});
    case "Group":
        return Rect.Bounding(prim.prims.map((p) => Bounds({ ...p, style: prim.style })));
    }
}
