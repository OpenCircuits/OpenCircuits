import {Vector} from "Vector";

import {Rect} from "math/Rect";

import {DebugOptions} from "core/internal/impl/DebugOptions";
import {GUID}         from "core/schema/GUID";

import {Camera}        from "./Camera";
import {Component}     from "./Component";
import {ComponentInfo} from "./ComponentInfo";
import {Obj}           from "./Obj";
import {Port}          from "./Port";
import {Wire}          from "./Wire";
import {RenderHelper}  from "core/internal/view/rendering/RenderHelper";
import {RenderOptions} from "core/internal/view/rendering/RenderOptions";


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

    // Queries
    pickObjAt(pt: Vector, space?: Vector.Spaces): Obj | undefined;
    pickComponentAt(pt: Vector, space?: Vector.Spaces): Component | undefined;
    pickWireAt(pt: Vector, space?: Vector.Spaces): Wire | undefined;
    pickPortAt(pt: Vector, space?: Vector.Spaces): Port | undefined;
    pickObjRange(bounds: Rect): Obj[];
    readonly selectedObjs: Obj[];

    getComponent(id: GUID): Component | undefined;
    getWire(id: GUID): Wire | undefined;
    getPort(id: GUID): Port | undefined;
    getObj(id: GUID): Obj | undefined;
    getObjs(): Obj[];
    getComponentInfo(kind: string): ComponentInfo | undefined;

    /**
     * Returns the average of the positions of the components selected
     * as a Vector object.
     *
     * @param space Defines the coordinate-space which can be
     *              either "screen space" or "world space.".
     * @returns     A Vector object where x and y are the averages
     *              of the positions of the selected components.
     */
    selectionsMidpoint(space: Vector.Spaces): Vector;

    // Object manipulation
    placeComponentAt(pt: Vector, kind: string): Component;
    connectWire(p1: Port, p2: Port): Wire | undefined;
    deleteObjs(objs: Obj[]): void;
    clearSelections(): void;

    createIC(objs: Obj[]): Circuit | undefined;
    getICs(): Circuit[];

    loadImages(imgSrcs: string[], onProgress: (pctDone: number) => void): Promise<void>;

    undo(): boolean;
    redo(): boolean;

    copy(): Circuit;

    reset(): void;

    serialize(): string;
    deserialize(data: string): void;

    resize(w: number, h: number): void;
    readonly canvas?: HTMLCanvasElement;
    attachCanvas(canvas: HTMLCanvasElement): () => void;
    detachCanvas(): void;

    forceRedraw(): void;

    // TODO[](leon) - Need to make a public-facing RenderHelper/RenderOptions
    addRenderCallback(cb: (data: { renderer: RenderHelper, options: RenderOptions, circuit: Circuit }) => void): void;

    subscribe(cb: (ev: any) => void): () => void;
}
