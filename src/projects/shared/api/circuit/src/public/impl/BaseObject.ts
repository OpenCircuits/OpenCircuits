import {Rect} from "math/Rect";

import {AddErrE}    from "shared/api/circuit/utils/MultiError";
import {GUID, Prop} from "shared/api/circuit/internal";

import {BaseObject} from "../BaseObject";

import {CircuitState, CircuitTypes} from "./CircuitState";


export class BaseObjectImpl<T extends CircuitTypes> implements BaseObject {
    protected readonly state: CircuitState<T>;

    public readonly id: GUID;

    public constructor(state: CircuitState<T>, objId: GUID) {
        this.state = state;

        this.id = objId;
    }

    private getObj() {
        return this.state.internal.getObjByID(this.id)
            .mapErr(AddErrE(`API BaseObj: Attempted to get obj with ID '${this.id}' that doesn't exist!`))
            .unwrap();
    }

    public get kind(): string {
        return this.getObj().kind;
    }
    public get bounds(): Rect {
        return this.state.assembler.getBoundsFor(this.id)
                                   .unwrapOr(Rect.Bounding([]));
    }

    public set name(name: string | undefined) {
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
    public set zIndex(val: number) {
        this.state.internal.setPropFor(this.id, "zIndex", val).unwrap();
    }
    public get zIndex(): number {
        return this.getObj().props["zIndex"] ?? 0;
    }

    public select(): void {
        this.state.internal.setPropFor(this.id, "isSelected", true).unwrap();
    }
    public deselect(): void {
        this.state.internal.setPropFor(this.id, "isSelected", false).unwrap();
    }

    public exists(): boolean {
        return this.state.internal.getObjByID(this.id).ok;
    }

    public setProp(key: string, val: Prop): void {
        this.state.internal.setPropFor(this.id, key, val).unwrap();
    }
    public getProp(key: string): Prop | undefined {
        return this.getObj().props[key];
    }
    public getProps(): Readonly<Record<string, Prop>> {
        return this.getObj().props;
    }
}
