import {Rect} from "math/Rect";

import {AddErrE}    from "core/utils/MultiError";
import {GUID, Prop} from "core/internal";

import {BaseObject} from "../BaseObject";

import {CircuitState, CircuitTypes} from "./CircuitState";


export function BaseObjectImpl<T extends CircuitTypes>(
    state: CircuitState<T>,
    objID: GUID,
) {
    function getObj() {
        return state.internal.doc.getObjByID(objID)
            .mapErr(AddErrE(`API BaseObj: Attempted to get obj with ID ${objID} that doesn't exist!`))
            .unwrap();
    }

    return {
        get kind(): string {
            return getObj().kind;
        },
        get id(): string {
            return objID;
        },
        get bounds(): Rect {
            throw new Error("Unimplemented!");
        },

        set isSelected(val: boolean) {
            if (val)
                state.selectionsManager.select(objID);
            else
                state.selectionsManager.deselect(objID);
        },
        get isSelected(): boolean {
            return state.selectionsManager.has(objID);
        },
        set zIndex(val: number) {
            throw new Error("Unimplemented!");
        },
        get zIndex(): number {
            throw new Error("Unimplemented!");
        },

        select(): void {
            this.isSelected = true;
        },
        deselect(): void {
            this.isSelected = false;
        },

        exists(): boolean {
            return state.internal.doc.getObjByID(objID).ok;
        },

        setProp(key: string, val: Prop): void {
            state.internal.setPropFor(objID, key, val);
        },
        getProp(key: string): Prop | undefined {
            return getObj().props[key];
        },
        getProps(): Readonly<Record<string, Prop>> {
            return getObj().props;
        },
    } satisfies BaseObject;
}
