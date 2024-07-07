import {Vector} from "Vector";

import {Rect} from "math/Rect";

import {GUID} from "core/schema/GUID";

import {FastCircuitDiff} from "core/internal/impl/FastCircuitDiff";

import {Component}     from "./Component";
import {ComponentInfo} from "./ComponentInfo";
import {Obj}           from "./Obj";
import {Port}          from "./Port";
import {Wire}          from "./Wire";
import {Selections}    from "./Selections";
import {Observable}    from "./Observable";


export type {CircuitMetadata} from "core/schema/CircuitMetadata";

// TODO[model_refactor](leon) - make this more user friendly
export type CircuitEvent = {
    type: "change";
    diff: FastCircuitDiff;
}

export interface Circuit extends Observable<CircuitEvent> {
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

    readonly selections: Selections;

    // Queries
    pickObjAt(pt: Vector): Obj | undefined;
    pickComponentAt(pt: Vector): Component | undefined;
    pickWireAt(pt: Vector): Wire | undefined;
    pickPortAt(pt: Vector): Port | undefined;
    pickObjRange(bounds: Rect): Obj[];

    getObj(id: GUID): Obj | undefined;
    getComponent(id: GUID): Component | undefined;
    getWire(id: GUID): Wire | undefined;
    getPort(id: GUID): Port | undefined;

    getObjs(): Obj[];
    getComponents(): Component[];
    getWires(): Wire[];

    getComponentInfo(kind: string): ComponentInfo | undefined;

    // Object manipulation
    placeComponentAt(kind: string, pt: Vector): Component;
    deleteObjs(objs: Obj[]): void;

    undo(): boolean;
    redo(): boolean;

    copy(): Circuit;

    reset(): void;

    serialize(objs?: Obj[]): string;
    deserialize(data: string): void;

    // forceRedraw(): void;

    // setRenderOptions(options: Partial<RenderOptions>): void;
    // readonly renderOptions: RenderOptions;

    // // TODO[](leon) - Need to make a public-facing RenderHelper/RenderOptions
    // addRenderCallback(cb: (data: {
    //     renderer: RenderHelper;
    //     options: RenderOptionsI;
    // }) => void): CleanupFunc;
}

export interface RootCircuit extends Circuit {
    createIC(objs: Obj[]): Circuit | undefined;
    getICs(): Circuit[];
}

export interface IntegratedCircuitDisplay {
    size: Vector;
    setPinPos(pin: GUID, pos: Vector): void;
}
export interface IntegratedCircuit extends Circuit {
    readonly display: IntegratedCircuitDisplay;
}
