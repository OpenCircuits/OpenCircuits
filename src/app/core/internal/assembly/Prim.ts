import {Vector} from "Vector";

import {Schema} from "core/schema";


export type Prims = Prim[];

export interface Prim {
    readonly kind: string;

    cull(camera: Schema.Camera): boolean;
    hitTest(pt: Vector): boolean;
}
