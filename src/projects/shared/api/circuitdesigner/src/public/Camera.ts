import {Vector} from "Vector";
import {Obj} from "shared/api/circuit/public";
import {Observable} from "shared/api/circuit/public/Observable";
import {Matrix2x3} from "math/Matrix";
import {Margin} from "math/Rect";


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
    readonly matrix: Matrix2x3;

    cx: number;
    cy: number;
    pos: Vector;

    zoom: number;

    translate(delta: Vector, space?: Vector.Spaces): void;
    zoomTo(zoom: number, pos: Vector): void;

    toWorldPos(screenPos: Vector): Vector;

    zoomToFit(objs: Obj[], margin?: Margin, padRatio?: number): void;
}
