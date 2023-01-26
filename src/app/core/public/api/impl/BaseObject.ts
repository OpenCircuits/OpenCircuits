import {CircuitInternal, GUID, Prop} from "core/internal";
import {Rect}                        from "core/public/utils/math/Rect";

import {BaseObject} from "../BaseObject";


export abstract class BaseObjectImpl implements BaseObject {
    protected circuit: CircuitInternal;
    protected objID: GUID;

    protected constructor(circuit: CircuitInternal, objID: GUID) {
        this.circuit = circuit;
        this.objID = objID;
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
        throw new Error("Unimplemented");
    }
    public get isSelected(): boolean {
        throw new Error("Unimplemented");
    }

    public set zIndex(val: number) {
        throw new Error("Unimplemented");
    }
    public get zIndex(): number {
        throw new Error("Unimplemented");
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
