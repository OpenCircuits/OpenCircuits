import {Margin} from "math/Rect";
import {Vector} from "Vector";


export interface Camera {
    cx: number;
    cy: number;
    pos: Vector;

    zoom: number;

    margin: Margin;

    translate(dPos: Vector): void;
    zoomTo(zoom: number, pos: Vector): void;
}
