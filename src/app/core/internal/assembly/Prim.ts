import {Vector} from "Vector";

import {Style}  from "./rendering/Style";
import {Schema} from "core/schema";


export type Prims = Prim[];

export interface Prim {
    cull(camera: Schema.Camera): boolean;
    hitTest(pt: Vector): boolean;
    updateStyle(style: Style): void;
    render(ctx: CanvasRenderingContext2D): void;
}
