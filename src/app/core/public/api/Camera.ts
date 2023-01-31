import {Rect} from "math/Rect";


export interface Camera {
    resize(w: number, h: number): void;

    margin: Rect;
}
