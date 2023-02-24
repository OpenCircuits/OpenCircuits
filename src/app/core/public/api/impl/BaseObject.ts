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
        const tmp = this.circuit.getObjByID(this.objID);
        if (!tmp)
            throw new Error(`Object does not exist!`);
        return tmp.kind;
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
        this.circuit.setPropFor(this.objID, key, val);
    }
    
    public getProp(key: string): Prop {
        throw new Error("Unimplemented");
    }

    public getProps(): Record<string, Prop> {
        throw new Error("Unimplemented");
    }
}
