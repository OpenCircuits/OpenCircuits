import {Vector} from "Vector";

import {Rect} from "math/Rect";

import {GUID} from "core/schema/GUID";

import {DebugOptions} from "core/internal/impl/DebugOptions";

import {RenderHelper}  from "core/internal/view/rendering/RenderHelper";
import {RenderOptions} from "core/internal/view/rendering/RenderOptions";

import {Camera}        from "./Camera";
import {Component}     from "./Component";
import {ComponentInfo} from "./ComponentInfo";
import {Obj}           from "./Obj";
import {Port}          from "./Port";
import {Wire}          from "./Wire";
import {Selections}    from "./Selections";
import {CleanupFunc}   from "core/utils/types";


export type {CircuitMetadata} from "core/schema/CircuitMetadata";

export interface Circuit {
    beginTransaction(): void;
    commitTransaction(): void;
    cancelTransaction(): void;

    // Metadata
    readonly id: GUID;
    name: string;
    desc: string;
    thumbnail: string;

    // Other data
    locked: boolean;
    simEnabled: boolean;
    debugOptions: DebugOptions;

    readonly camera: Camera;
    readonly selections: Selections;

    // Queries
    pickObjAt(pt: Vector, space?: Vector.Spaces): Obj | undefined;
    pickComponentAt(pt: Vector, space?: Vector.Spaces): Component | undefined;
    pickWireAt(pt: Vector, space?: Vector.Spaces): Wire | undefined;
    pickPortAt(pt: Vector, space?: Vector.Spaces): Port | undefined;
    pickObjRange(bounds: Rect): Obj[];

    getComponent(id: GUID): Component | undefined;
    getWire(id: GUID): Wire | undefined;
    getPort(id: GUID): Port | undefined;
    getObj(id: GUID): Obj | undefined;
    getObjs(): Obj[];
    getComponents(): Component[];
    getWires(): Wire[];
    getComponentInfo(kind: string): ComponentInfo | undefined;

    // Object manipulation
    placeComponentAt(pt: Vector, kind: string): Component;
    deleteObjs(objs: Obj[]): void;

    createIC(objs: Obj[]): Circuit | undefined;
    getICs(): Circuit[];

    loadImages(imgSrcs: string[], onProgress: (pctDone: number) => void): Promise<void>;

    undo(): boolean;
    redo(): boolean;

    copy(): Circuit;

    reset(): void;

    serialize(objs?: Obj[]): string;
    deserialize(data: string): void;

    resize(w: number, h: number): void;
    attachCanvas(canvas: HTMLCanvasElement): CleanupFunc;
    detachCanvas(): void;

    forceRedraw(): void;

    // TODO[](leon) - Need to make a public-facing RenderHelper/RenderOptions
    addRenderCallback(cb: (data: {
        renderer: RenderHelper;
        options: RenderOptions;
        circuit: Circuit;
    }) => void): CleanupFunc;

    subscribe(cb: (ev: any) => void): CleanupFunc;
}
