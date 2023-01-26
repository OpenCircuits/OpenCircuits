import {DebugOptions} from "core/internal/impl/DebugOptions";
import {Rect} from "core/public/utils/math/Rect";
import {Vector} from "core/public/utils/math/Vector";
import {IComponent} from "./Component";
import {Obj} from "./Obj";
import {IPort} from "./Port";
import {IWire} from "./Wire";


export interface ICircuit {
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
    placeComponentAt(pt: Vector, space: "screen" | "world", kind: string): IComponent;
    deleteObjs(objs: Obj[]): void;
    clearSelections(): void;

    connectWire(p1: IPort, p2: IPort): IWire | undefined;

    createIC(objs: Obj[]): ICircuit | undefined;

    undo(): boolean;
    redo(): boolean;

    addRenderCallback(cb: () => void): void;
}
