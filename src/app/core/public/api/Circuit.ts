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
    pickObjectAt(pt: Vector): Obj | undefined;
    pickObjectRange(bounds: Rect): Obj[];
    selectedObjs(): Obj[];

    getComponent(id: GUID): Component | undefined;
    getWire(id: GUID): Wire | undefined;
    getPort(id: GUID): Port | undefined;
    getObj(id: GUID): Obj | undefined;
    getObjs(): Obj[];
    getComponentInfo(kind: string): ComponentInfo | undefined;

    selectionsMidpoint(space: Vector.Spaces): Vector;

    // Object manipulation
    placeComponentAt(pt: Vector, kind: string): Component;
    connectWire(p1: Port, p2: Port): Wire | undefined;
    deleteObjs(objs: Obj[]): void;
    clearSelections(): void;

    createIC(objs: Obj[]): Circuit | undefined;
    getICs(): Circuit[];

    undo(): boolean;
    redo(): boolean;

    copy(): Circuit;

    reset(): void;

    serialize(): string;
    deserialize(data: string): void;

    addRenderCallback(cb: () => void): void;

    subscribe(cb: (ev) => void): () => void;
}
