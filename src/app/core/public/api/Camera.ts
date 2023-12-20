import {Vector} from "Vector";
import {Margin} from "math/Rect";

import {Obj} from "./Obj";


export interface Camera {
    cx: number;
    cy: number;
    pos: Vector;

    zoom: number;

    translate(delta: Vector, space?: Vector.Spaces): void;
    zoomTo(zoom: number, pos: Vector): void;

    toWorldPos(screenPos: Vector): Vector;

    zoomToFit(objs: Obj[], margin?: Margin, padRatio?: number): void;
}
