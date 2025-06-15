import {Vector} from "Vector";
import {Obj} from "shared/api/circuit/public";
import {Observable} from "shared/api/circuit/utils/Observable";
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
    cx: number;
    cy: number;
    pos: Vector;

    zoom: number;

    translate(delta: Vector): void;
    zoomTo(zoom: number, pos: Vector): void;

    zoomToFit(objs: Obj[], margin?: Margin, padRatio?: number): void;
}
