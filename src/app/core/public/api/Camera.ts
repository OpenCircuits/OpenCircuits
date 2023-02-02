import {Margin} from "math/Rect";


export interface Camera {
    resize(w: number, h: number): void;

    margin: Margin;
}
