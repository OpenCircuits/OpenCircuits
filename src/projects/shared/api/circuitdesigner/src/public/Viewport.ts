import {Vector} from "Vector";
import {Margin} from "math/Rect";

import {GUID}        from "shared/api/circuit/public";
import {CleanupFunc} from "shared/api/circuit/utils/types";

import {MultiObservable} from "shared/api/circuit/utils/Observable";
import {Prim}            from "shared/api/circuit/internal/assembly/Prim";
import {RenderOptions}   from "shared/api/circuit/internal/assembly/RenderOptions";

import {Camera} from "./Camera";
import {Cursor} from "../input/Cursor";
import {DebugOptions} from "./impl/DebugOptions";


// Re-export prim types
export type * from "shared/api/circuit/internal/assembly/Prim";
export type * from "shared/api/circuit/internal/assembly/RenderOptions";

export interface RenderHelper {
    draw(prim: Prim): void;
    options: RenderOptions;
}

export type ViewportEvents = {
    "onrender": {
        renderer: RenderHelper;
    };
    "onresize": {
        w: number;
        h: number;
    };
    // I dont know why this was here
    // "oncamerachange": {
    //     dx: number;
    //     dy: number;
    //     dz: number;
    // };
}

export interface Viewport extends MultiObservable<ViewportEvents> {
    readonly camera: Camera;
    readonly screenSize: Vector;

    cursor?: Cursor;
    // A margin relative to the current viewport (Camera) used
    // for calculating the current "usable" viewport specifically
    // for fitting the camera. I.e. when the ItemNav is open, this margin
    // cuts off part of the canvas that is actually usable. (Issue #656)
    // TODO[master](leon) - See if maybe we can replace this with tracking if the ItemNav is open
    margin: Margin;

    debugOptions: DebugOptions;

    resize(w: number, h: number): void;

    attachCanvas(canvas: HTMLCanvasElement): CleanupFunc;
    detachCanvas(): void;

    setView(kind: "main"): void;
    setView(kind: "ic", id: GUID, type: "internal" | "display"): void;
}
