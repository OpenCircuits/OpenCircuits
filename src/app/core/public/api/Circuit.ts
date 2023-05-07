import {Vector} from "Vector";

import {Rect} from "math/Rect";

import {GUID} from "core/schema/GUID";

import {CleanupFunc} from "core/utils/types"

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


// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Circuit {
    export type ObjQueryTypes = {
        "Component": Component;
        "Wire": Wire;
        "Port": Port;
        "Component | Wire": Component | Wire;
        "Component | Port": Component | Port;
        "Wire | Port": Wire | Port;
        "Obj": Obj;
    }
    export interface BaseObjQuery {
        with(props: { id: GUID }): this;
        at(pt: Vector, space?: Vector.Spaces): this;
        within(bounds: Rect, space?: Vector.Spaces): this;
    }
    export interface ObjQuery<K extends keyof ObjQueryTypes> extends BaseObjQuery {
        readonly result: ObjQueryTypes[K] | undefined;
    }
    export interface MultiObjQuery<K extends keyof ObjQueryTypes> extends BaseObjQuery {
        readonly result: Array<ObjQueryTypes[K]>;
    }
}

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
    find<K extends keyof Circuit.ObjQueryTypes>(kind: K): Circuit.ObjQuery<K>;
    findAll<K extends keyof Circuit.ObjQueryTypes>(kind: K): Circuit.MultiObjQuery<K>;
    // pickObjAt(pt: Vector, space?: Vector.Spaces): Obj | undefined;
    // pickComponentAt(pt: Vector, space?: Vector.Spaces): Component | undefined;
    // pickWireAt(pt: Vector, space?: Vector.Spaces): Wire | undefined;
    // pickPortAt(pt: Vector, space?: Vector.Spaces): Port | undefined;
    // pickObjRange(bounds: Rect): Obj[];

    // getComponent(id: GUID): Component | undefined;
    // getWire(id: GUID): Wire | undefined;
    // getPort(id: GUID): Port | undefined;
    // getObj(id: GUID): Obj | undefined;
    // getObjs(): Obj[];
    // getComponents(): Component[];
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
