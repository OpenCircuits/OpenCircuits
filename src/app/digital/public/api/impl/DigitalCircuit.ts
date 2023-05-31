import type {Circuit} from "core/public/api/Circuit";

import {CircuitImpl, MultiObjQueryImpl, ObjQueryImpl} from "core/public/api/impl/Circuit";

import {extend} from "core/utils/Functions";

import {DigitalCircuit, DigitalMultiObjQuery, DigitalObjQuery, ToDigital} from "../DigitalCircuit";
import {DigitalCircuitState, DigitalTypes}                                from "./DigitalCircuitState";


export function DigitalCircuitImpl(state: DigitalCircuitState) {
    const base = CircuitImpl<DigitalCircuit, DigitalTypes>(state);


    function getObjsByKind<K extends keyof Circuit.ObjQueryTypes>(kind: K): Array<Circuit.ObjQueryTypes[K]> {
        const objs = [...state.internal.doc.getObjs()].map(state.constructObj);
        if (kind === "Obj")
            return objs as Array<ToDigital<Circuit.ObjQueryTypes>[K]>;
        return objs.filter((obj): obj is ToDigital<Circuit.ObjQueryTypes>[K] => (kind.includes(obj.baseKind)));
    }

    return extend(base, {
        find<K extends keyof Circuit.ObjQueryTypes>(type: K): DigitalObjQuery<K> {
            return ObjQueryImpl(state, getObjsByKind(type)) as DigitalObjQuery<K>;
        },
        findAll<K extends keyof Circuit.ObjQueryTypes>(type: K): DigitalMultiObjQuery<K> {
            return MultiObjQueryImpl(state, getObjsByKind(type)) as DigitalMultiObjQuery<K>;
        },

        set propagationTime(val: number) {
            throw new Error("Unimplemented!");
        },
        get propagationTime(): number {
            throw new Error("Unimplemented!");
        },
    } as const) satisfies DigitalCircuit;
}
