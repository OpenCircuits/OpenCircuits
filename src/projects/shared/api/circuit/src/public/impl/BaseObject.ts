import {V} from "Vector";
import {Rect} from "math/Rect";

import {AddErrE}    from "shared/api/circuit/utils/MultiError";
import {GUID, Prop} from "shared/api/circuit/internal";

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
            return state.assembler.getBoundsFor(this.id).unwrapOr(Rect.Bounding([]));
        },

        set name(name: string | undefined) {
            state.internal.setPropFor(objID, "name", name);
        },
        get name(): string | undefined {
            return getObj().props["name"];
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
            state.internal.setPropFor(objID, "zIndex", val);
        },
        get zIndex(): number {
            return getObj().props["zIndex"] ?? 0;
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
            state.internal.beginTransaction();
            state.internal.setPropFor(objID, key, val).unwrap();
            state.internal.commitTransaction();
        },
        getProp(key: string): Prop | undefined {
            return getObj().props[key];
        },
        getProps(): Readonly<Record<string, Prop>> {
            return getObj().props;
        },
    } satisfies BaseObject;
}
