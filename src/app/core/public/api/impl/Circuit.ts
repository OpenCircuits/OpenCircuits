import {CircuitInternal} from "core/internal/impl/CircuitInternal";
import {DebugOptions}    from "core/internal/impl/DebugOptions";
import {CircuitView}     from "core/internal/view/CircuitView";

import {Rect}      from "../../utils/math/Rect";
import {Vector}    from "../../utils/math/Vector";
import {Circuit}   from "../Circuit";
import {Component} from "../Component";
import {Obj}       from "../Obj";
import {Port}      from "../Port";
import {Wire}      from "../Wire";


export class CircuitImpl implements Circuit {
    protected circuit: CircuitInternal;
    protected view: CircuitView;

    public constructor(canvas: HTMLCanvasElement) {
        this.circuit = new CircuitInternal();
        this.view = new CircuitView(this.circuit, canvas);
    }

    // Transactions.  All ops between a begin/commit pair are applied atomically (For collaborative editing, undo/redo)
    // All queries within a transaction are coherent.
    // All ops outside begin/commit are applied individually
    public beginTransaction(): void {
        throw new Error("Unimplemented");
    }
    public commitTransaction(): void {
        throw new Error("Unimplemented");
    }
    public cancelTransaction(): void {
        throw new Error("Unimplemented");
    }

    public set locked(val: boolean) {
        throw new Error("Unimplemented");
    }
    public get locked(): boolean {
        return this.circuit.isLocked;
    }

    public set simEnabled(val: boolean) {
        throw new Error("Unimplemented");
    }
    public get simEnabled(): boolean {
        throw new Error("Unimplemented");
    }

    public set debugOptions(options: Partial<DebugOptions>) {
        throw new Error("Unimplemented");
    }
    public get debugOptions(): DebugOptions {
        throw new Error("Unimplemented");
    }

    // Queries
    public pickObjectAt(pt: Vector, space: "screen" | "world"): Obj | undefined {
        throw new Error("Unimplemented");
    }
    public pickObjectRange(bounds: Rect, space: "screen" | "world"): Obj[] {
        throw new Error("Unimplemented");
    }
    public selectedObjs(): Obj[] {
        throw new Error("Unimplemented");
    }

    // Object manipulation
    public placeComponentAt(pt: Vector, space: "screen" | "world", kind: string): Component {
        throw new Error("Unimplemented");
    }
    public deleteObjs(objs: Obj[]): void {
        throw new Error("Unimplemented");
    }
    public clearSelections(): void {
        throw new Error("Unimplemented");
    }

    // Wire connection can fail if i.e. p1 is reference-equal to p2
    public connectWire(p1: Port, p2: Port): Wire | undefined {
        throw new Error("Unimplemented");
    }

    public createIC(objs: Obj[]): Circuit | undefined {
        throw new Error("Unimplemented");
    }

    public undo(): boolean {
        throw new Error("Unimplemented");
    }
    public redo(): boolean {
        throw new Error("Unimplemented");
    }

    public addRenderCallback(cb: () => void): void {
        throw new Error("Unimplemented");
    }
}
