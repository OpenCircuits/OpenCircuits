import {Rect} from "math/Rect";

import {CircuitInternal, GUID, Prop} from "core/internal";
import {SelectionsManager}           from "core/internal/impl/SelectionsManager";

import {BaseObject} from "../BaseObject";

import {CircuitState} from "./CircuitState";


export abstract class BaseObjectImpl implements BaseObject {
    protected state: CircuitState;
    protected objID: GUID;

    public constructor(state: CircuitState, objID: GUID) {
        this.state = state;
        this.objID = objID;
    }

    protected get circuit(): CircuitInternal {
        return this.state.circuit;
    }
    protected get selections(): SelectionsManager {
        return this.state.selections;
    }

    public get kind(): string {
        throw new Error("Unimplemented");
    }

    public get id(): string {
        return this.objID;
    }

    public get bounds(): Rect {
        throw new Error("Unimplemented");
    }

    public set isSelected(val: boolean) {
        this.selections.select(this.objID);
    }
    public get isSelected(): boolean {
        return this.selections.isSelected(this.objID);
    }

    public set zIndex(val: number) {
        throw new Error("Unimplemented");
    }
    public get zIndex(): number {
        throw new Error("Unimplemented");
    }

    public exists(): boolean {
        return !!this.circuit.getObjByID(this.objID);
    }

    public setProp(key: string, val: Prop): void {
        throw new Error("Unimplemented");
    }
    public getProp(key: string): Prop {
        throw new Error("Unimplemented");
    }
    public getProps(): Record<string, Prop> {
        throw new Error("Unimplemented");
    }
}
