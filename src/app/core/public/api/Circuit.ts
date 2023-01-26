import {DebugOptions} from "core/internal/impl/DebugOptions";
import {Rect}         from "core/public/utils/math/Rect";
import {Vector}       from "core/public/utils/math/Vector";

import {Component} from "./Component";
import {Obj}       from "./Obj";
import {Port}      from "./Port";
import {Wire}      from "./Wire";


export interface Circuit {
    beginTransaction(): void;
    commitTransaction(): void;
    cancelTransaction(): void;

    locked: boolean;
    simEnabled: boolean;
    debugOptions: DebugOptions;

    // Queries
    pickObjectAt(pt: Vector, space: "screen" | "world"): Obj | undefined;
    pickObjectRange(bounds: Rect, space: "screen" | "world"): Obj[];
    selectedObjs(): Obj[];

    // Object manipulation
    placeComponentAt(pt: Vector, space: "screen" | "world", kind: string): Component;
    deleteObjs(objs: Obj[]): void;
    clearSelections(): void;

    connectWire(p1: Port, p2: Port): Wire | undefined;

    createIC(objs: Obj[]): Circuit | undefined;

    undo(): boolean;
    redo(): boolean;

    addRenderCallback(cb: () => void): void;
}
