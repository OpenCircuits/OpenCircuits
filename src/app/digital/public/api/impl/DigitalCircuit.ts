import {CircuitImpl} from "core/public/api/impl/Circuit";

import {extend} from "core/utils/Functions";

import {DigitalCircuit}                    from "../DigitalCircuit";
import {DigitalCircuitState, DigitalTypes} from "./DigitalCircuitState";


export function DigitalCircuitImpl(state: DigitalCircuitState) {
    const base = CircuitImpl<DigitalCircuit, DigitalTypes>(state);

    return extend(base, {
        set propagationTime(val: number) {
            throw new Error("Unimplemented!");
        },
        get propagationTime(): number {
            throw new Error("Unimplemented!");
        },
    } as const) satisfies DigitalCircuit;
}
