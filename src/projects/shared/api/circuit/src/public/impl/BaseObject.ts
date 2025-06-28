import {Rect} from "math/Rect";

import {AddErrE}    from "shared/api/circuit/utils/MultiError";
import {GUID, Prop} from "shared/api/circuit/internal";

import {BaseObject} from "../BaseObject";

import {CircuitState, CircuitTypes} from "./CircuitState";


export class BaseObjectImpl<T extends CircuitTypes> implements BaseObject {
    protected readonly state: CircuitState<T>;

    public readonly id: GUID;

    // ID of the integrated circuit this object belongs to, if any.
    protected readonly icId?: GUID;

    public constructor(state: CircuitState<T>, objId: GUID, icId?: GUID) {
        this.state = state;

        this.id = objId;
        this.icId = icId;
    }

    protected getCircuitInfo() {
        if (this.icId) {
            return this.state.internal.getICInfo(this.icId)
                .mapErr(AddErrE(`ComponentImpl: Attempted to get IC info for component with ID '${this.id}' that doesn't exist in IC ${this.icId}!`))
                .unwrap();
        }
        return this.state.internal.getInfo();
    }

    private getObj() {
        return this.getCircuitInfo()
            .getObjByID(this.id)
            .mapErr(AddErrE(`BaseObjImpl: Attempted to get obj with ID '${this.id}' that doesn't exist!`))
            .unwrap();
    }

    public get kind(): string {
        return this.getObj().kind;
    }
    public get bounds(): Rect {
        if (this.icId)
            throw new Error(`BaseObjImpl: Bounds cannot be accessed for object inside an IC! Object ID: '${this.id}', IC ID: '${this.icId}'`);
        return this.state.assembler.getBoundsFor(this.id)
                                   .unwrapOr(Rect.Bounding([]));
    }

    public set name(name: string | undefined) {
        if (this.icId)
            throw new Error(`BaseObjImpl: Cannot set name for object with ID '${this.id}' in IC ${this.icId}! IC objects are immutable!`);
        this.state.internal.setPropFor(this.id, "name", name).unwrap();
    }
    public get name(): string | undefined {
        return this.getObj().props["name"];
    }

    public set isSelected(val: boolean) {
        if (val)
            this.select();
        else
            this.deselect();
    }
    public get isSelected(): boolean {
        return this.getObj().props["isSelected"] ?? false;
    }

    public select(): void {
        if (this.icId)
            throw new Error(`BaseObjImpl: Cannot select object with ID '${this.id}' in IC ${this.icId}! IC objects are immutable!`);
        this.state.internal.setPropFor(this.id, "isSelected", true).unwrap();
    }
    public deselect(): void {
        if (this.icId)
            throw new Error(`BaseObjImpl: Cannot deselect object with ID '${this.id}' in IC ${this.icId}! IC objects are immutable!`);
        this.state.internal.setPropFor(this.id, "isSelected", false).unwrap();
    }

    public exists(): boolean {
        if (this.icId) {
            return this.state.internal.getICInfo(this.icId)
                .andThen((icInfo) => icInfo.getObjByID(this.id)).ok;
        }
        return this.state.internal.getObjByID(this.id).ok;
    }

    public setProp(key: string, val: Prop): void {
        if (this.icId)
            throw new Error(`BaseObjImpl: Cannot set prop for object with ID '${this.id}' in IC ${this.icId}! IC objects are immutable!`);
        this.state.internal.setPropFor(this.id, key, val).unwrap();
    }
    public getProp(key: string): Prop | undefined {
        return this.getObj().props[key];
    }
    public getProps(): Readonly<Record<string, Prop>> {
        return this.getObj().props;
    }
}
