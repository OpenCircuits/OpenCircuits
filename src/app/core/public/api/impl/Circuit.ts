import {Vector} from "Vector";

import {Rect} from "math/Rect";

import {CircuitInternal}                 from "core/internal/impl/CircuitInternal";
import {NewExampleComponentInfoProvider} from "core/internal/impl/ComponentInfo";
import {DebugOptions}                    from "core/internal/impl/DebugOptions";
import {SelectionsManager}               from "core/internal/impl/SelectionsManager";
import {CircuitView}                     from "core/internal/view/CircuitView";

import {Camera}        from "../Camera";
import {Circuit}       from "../Circuit";
import {Component}     from "../Component";
import {ComponentInfo} from "../ComponentInfo";
import {Obj}           from "../Obj";
import {Port}          from "../Port";
import {Wire}          from "../Wire";

import {ComponentImpl} from "./Component";
import {PortImpl}      from "./Port";
import {WireImpl}      from "./Wire";


export class CircuitImpl implements Circuit {
    protected circuit: CircuitInternal;

    // Moved from CircuitInternal
    protected readonly selections: SelectionsManager;
    public isLocked: boolean;

    protected view: CircuitView;

    public constructor() {
        this.circuit = new CircuitInternal(NewExampleComponentInfoProvider());
        // this.view = new CircuitView(this.circuit, canvas);

        this.selections = new SelectionsManager();
        this.isLocked = false;
    }

    // Transactions.  All ops between a begin/commit pair are applied atomically (For collaborative editing, undo/redo)
    // All queries within a transaction are coherent.
    // All ops outside begin/commit are applied individually
    public beginTransaction(): void {
        this.circuit.beginTransaction();
    }
    public commitTransaction(): void {
        this.circuit.commitTransaction();
    }
    public cancelTransaction(): void {
        this.circuit.cancelTransaction();
    }

    public get id(): string {
        throw new Error("Method not implemented.");
    }

    public set name(val: string) {
        throw new Error("Method not implemented.");
    }
    public get name(): string {
        throw new Error("Method not implemented.");
    }

    public set desc(val: string) {
        throw new Error("Method not implemented.");
    }
    public get desc(): string {
        throw new Error("Method not implemented.");
    }

    public set thumbnail(val: string) {
        throw new Error("Method not implemented.");
    }
    public get thumbnail(): string {
        throw new Error("Method not implemented.");
    }

    public set locked(val: boolean) {
        throw new Error("Unimplemented");
    }
    public get locked(): boolean {
        // TODO: Decide which level to enforce this at.  Is it serialized?
        throw new Error("Unimplemented");
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

    public get camera(): Camera {
        throw new Error("Method not implemented.");
    }

    // Queries
    public pickObjectAt(pt: Vector): Obj | undefined {
        throw new Error("Unimplemented");
    }
    public pickObjectRange(bounds: Rect): Obj[] {
        throw new Error("Unimplemented");
    }
    public selectedObjs(): Obj[] {
        throw new Error("Unimplemented");
    }

    public getComponent(id: string): Component | undefined {
        return new ComponentImpl(this.circuit, id);
    }
    public getWire(id: string): Wire | undefined {
        return new WireImpl(this.circuit, id);
    }
    public getPort(id: string): Port | undefined {
        return new PortImpl(this.circuit, id);
    }
    public getObj(id: string): Obj | undefined {
        return (this.getComponent(id) ?? this.getWire(id) ?? this.getPort(id));
    }
    public getObjs(): Obj[] {
        throw new Error("Method not implemented.");
    }
    public getComponentInfo(kind: string): ComponentInfo | undefined {
        throw new Error("Method not implemented.");
    }

    public selectionsMidpoint(space: Vector.Spaces): Vector {
        throw new Error("Method not implemented.");
    }

    // Object manipulation
    public placeComponentAt(pt: Vector, kind: string): Component {
        // TODO: Deal with `pt` being in screen space
        this.circuit.beginTransaction();
        const comp = this.circuit.placeComponent(kind, { x: pt.x, y: pt.y });
        this.circuit.commitTransaction();

        return new ComponentImpl(this.circuit, comp.id);
    }
    // Wire connection can fail if i.e. p1 is reference-equal to p2
    public connectWire(p1: Port, p2: Port): Wire | undefined {
        throw new Error("Unimplemented");
    }
    public deleteObjs(objs: Obj[]): void {
        throw new Error("Unimplemented");
    }
    public clearSelections(): void {
        throw new Error("Unimplemented");
    }

    public createIC(objs: Obj[]): Circuit | undefined {
        throw new Error("Unimplemented");
    }
    public getICs(): Circuit[] {
        throw new Error("Method not implemented.");
    }

    public undo(): boolean {
        throw new Error("Unimplemented");
    }
    public redo(): boolean {
        throw new Error("Unimplemented");
    }

    public copy(): Circuit {
        throw new Error("Method not implemented.");
    }

    public reset(): void {
        throw new Error("Method not implemented.");
    }

    public serialize(): string {
        throw new Error("Method not implemented.");
    }
    public deserialize(data: string): void {
        throw new Error("Method not implemented.");
    }

    public addRenderCallback(cb: () => void): void {
        throw new Error("Unimplemented");
    }

    public subscribe(cb: (ev: any) => void): () => void {
        throw new Error("Method not implemented.");
    }
}
