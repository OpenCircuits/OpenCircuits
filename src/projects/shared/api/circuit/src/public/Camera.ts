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

export interface ReadonlyCamera {
    readonly cx: number;
    readonly cy: number;
    readonly pos: Vector;

    readonly zoom: number;
}

export interface Camera extends Observable<CameraEvent> {
    cx: number;
    cy: number;
    pos: Vector;

    zoom: number;

    translate(delta: Vector): void;
    zoomTo(zoom: number, pos: Vector): void;
}
