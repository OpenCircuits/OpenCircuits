import {Vector} from "Vector";
import {Margin} from "math/Rect";

import {Obj}        from "./Obj";
import {Observable} from "./Observable";


export type CameraEvent = {
    type: "dragStart";
} | {
    type: "dragEnd";
} | {
    type: "change";
    dx: number;
    dy: number;
    dz: number;
}

export interface Camera extends Observable<CameraEvent> {
    cx: number;
    cy: number;
    pos: Vector;

    zoom: number;

    translate(delta: Vector, space?: Vector.Spaces): void;
    zoomTo(zoom: number, pos: Vector): void;

    toWorldPos(screenPos: Vector): Vector;

    zoomToFit(objs: Obj[], margin?: Margin, padRatio?: number): void;
}
