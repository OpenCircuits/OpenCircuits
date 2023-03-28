import {Rect} from "math/Rect";

import {CircuitInternal, GUID, Prop} from "core/internal";
import {SelectionsManager}           from "core/internal/impl/SelectionsManager";

import {BaseObject} from "../BaseObject";

import {CircuitState} from "./CircuitState";


export abstract class BaseObjectImpl<State extends CircuitState = CircuitState> implements BaseObject {
    protected circuit: State;
    protected objID: GUID;

    public constructor(circuit: State, objID: GUID) {
        this.circuit = circuit;
        this.objID = objID;
    }

    protected get internal(): CircuitInternal {
        return this.circuit.circuit;
    }
    protected get selections(): SelectionsManager {
        return this.circuit.selections;
    }

    public get kind(): string {
        return this.internal.getObjByID(this.id).unwrap().kind;
    }

    public get id(): string {
        return this.objID;
    }

    public get bounds(): Rect {
        throw new Error("Unimplemented");
    }

    public set isSelected(val: boolean) {
        if (val)
            this.selections.select(this.objID);
        else
            this.selections.deselect(this.objID);
    }
    public get isSelected(): boolean {
        return this.selections.has(this.objID);
    }

    public set zIndex(val: number) {
        throw new Error("Unimplemented");
    }
    public get zIndex(): number {
        throw new Error("Unimplemented");
    }

    public select(): void {
        this.isSelected = true;
    }
    public deselect(): void {
        this.isSelected = false;
    }

    public exists(): boolean {
        return !!this.internal.getObjByID(this.objID);
    }

    public setProp(key: string, val: Prop): void {
        this.circuit.beginTransaction();
        this.internal.setPropFor(this.objID, key, val);
        this.circuit.commitTransaction();
    }
    public getProp(key: string): Prop | undefined {
        return this.internal.getObjByID(this.objID).unwrap().props[key];
    }
    public getProps(): Record<string, Prop> {
        throw new Error("Unimplemented");
    }
}
