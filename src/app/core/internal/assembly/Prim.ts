import {Color} from "svg2canvas";

import {Vector} from "Vector";

import {BezierCurve} from "math/BezierCurve";
import {Transform} from "math/Transform";

import {Style} from "./Style";


export type BezierCurvePrim = {
    kind: "BezierCurve";

    curve: BezierCurve;

    style: Style;
}
export type CirclePrim = {
    kind: "Circle";

    pos: Vector;
    radius: number;

    style: Style;
}
export type CircleSectorPrim = {
    kind: "CircleSector";

    pos: Vector;
    radius: number;
    angles: [number, number];

    style: Style;
}
export type LinePrim = {
    kind: "Line";

    p1: Vector;
    p2: Vector;

    style: Style;
}
export type PolygonPrim = {
    kind: "Polygon";

    points: Vector[];

    style: Style;
}
export type QuadCurvePrim = {
    kind: "QuadCurve";

    p1: Vector;
    p2: Vector;
    c: Vector;

    style: Style;
}
export type RectanglePrim = {
    kind: "Rectangle";

    transform: Transform;

    style: Style;
}
export type SVGPrim = {
    kind: "SVG";

    svg: string; // opaque handle for the SVG
    transform: Transform;

    tint?: Color;
}

export type Prim =
    | BezierCurvePrim
    | CirclePrim
    | CircleSectorPrim
    | LinePrim
    | PolygonPrim
    | QuadCurvePrim
    | RectanglePrim
    | SVGPrim;
