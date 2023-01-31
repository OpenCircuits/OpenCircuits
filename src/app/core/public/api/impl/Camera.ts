import {Rect} from "math/Rect";

import {Camera} from "../Camera";


export class CameraImpl implements Camera {
    public resize(w: number, h: number): void {
        throw new Error("Method not implemented.");
    }

    public set margin(m: Rect) {
        throw new Error("Method not implemented.");
    }
    public get margin(): Rect {
        throw new Error("Method not implemented.");
    }
}
