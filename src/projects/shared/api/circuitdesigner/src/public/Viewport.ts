import {Vector} from "Vector";

import {GUID}        from "shared/api/circuit/public";
import {CleanupFunc} from "shared/api/circuit/utils/types";

import {MultiObservable} from "shared/api/circuit/public/Observable";
import {Prim}            from "shared/api/circuit/internal/assembly/Prim";

import {Camera} from "./Camera";
import {RenderOptions} from "shared/api/circuit/internal/assembly/RenderOptions";


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

    resize(w: number, h: number): void;

    attachCanvas(canvas: HTMLCanvasElement): CleanupFunc;
    detachCanvas(): void;

    setView(kind: "main"): void;
    setView(kind: "ic", id: GUID, type: "internal" | "display"): void;
}
