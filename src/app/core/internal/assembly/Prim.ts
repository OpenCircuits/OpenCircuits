import {Color} from "svg2canvas";

import {Vector} from "Vector";

import {BezierCurve} from "math/BezierCurve";
import {Transform} from "math/Transform";

import {Style} from "./Style";


export interface BezierCurvePrim {
    kind: "BezierCurve";

    curve: BezierCurve;

    style: Style;
}
export interface CirclePrim {
    kind: "Circle";

    pos: Vector;
    radius: number;

    style: Style;
}
export interface CircleSectorPrim {
    kind: "CircleSector";

    pos: Vector;
    radius: number;
    angles: [number, number];

    style: Style;
}
export interface LinePrim {
    kind: "Line";

    p1: Vector;
    p2: Vector;

    style: Style;
}
export interface PolygonPrim {
    kind: "Polygon";

    points: Vector[];

    style: Style;
}
export interface QuadCurvePrim {
    kind: "QuadCurve";

    p1: Vector;
    p2: Vector;
    c: Vector;

    style: Style;
}
export interface RectanglePrim {
    kind: "Rectangle";

    transform: Transform;

    style: Style;
}
export type BaseShapePrim =
    | BezierCurvePrim
    | CirclePrim
    | CircleSectorPrim
    | LinePrim
    | PolygonPrim
    | QuadCurvePrim
    | RectanglePrim;

// Represents a group of basic prims (non-SVG) that share a style.
type MakeBasePrimWithoutStyle<T> = T extends { style: Style } ? Omit<T, "style"> : T;
export type BaseShapePrimWithoutStyle = MakeBasePrimWithoutStyle<BaseShapePrim>;
export interface GroupPrim {
    kind: "Group";

    prims: BaseShapePrimWithoutStyle[];

    style: Style;
}

export interface SVGPrim {
    kind: "SVG";

    svg: string; // opaque handle for the SVG
    transform: Transform;

    tint?: Color;
}

export type Prim =
    | BaseShapePrim
    | SVGPrim
    | GroupPrim;
