import {GUID}        from "core/public";
import {CleanupFunc} from "core/utils/types";

import {MultiObservable} from "core/public/api/Observable";
import {Camera} from "./Camera";


export type ViewportEvents = {
    "onrender": {
        renderer: unknown; // TODO
    };
    "oncamerachange": {
        dx: number;
        dy: number;
        dz: number;
    };
}

export interface Viewport extends MultiObservable<ViewportEvents> {
    readonly curCamera: Camera;

    resize(w: number, h: number): void;

    attachCanvas(canvas: HTMLCanvasElement): CleanupFunc;
    detachCanvas(): void;

    setView(kind: "main"): void;
    setView(kind: "ic", id: GUID, type: "internal" | "display"): void;
}
