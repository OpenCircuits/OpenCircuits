import {IntegratedCircuitImpl, RootCircuitImpl} from "core/public/api/impl/Circuit";

import {extend} from "core/utils/Functions";

import {APIToDigital, DigitalCircuit, DigitalIntegratedCircuit} from "../DigitalCircuit";
import {DigitalCircuitState, DigitalTypes} from "./DigitalCircuitState";
import {Circuit} from "core/public";


function DigitalCircuitImpl<T extends (APIToDigital<Circuit> & Record<string | number | symbol, unknown>)>(base: T) {
    return extend(base, {
        set propagationTime(val: number) {
            throw new Error("Unimplemented!");
        },
        get propagationTime(): number {
            throw new Error("Unimplemented!");
        },
    } as const) satisfies DigitalCircuit;
}

export function DigitalRootCircuitImpl(state: DigitalCircuitState) {
    return DigitalCircuitImpl(RootCircuitImpl<DigitalIntegratedCircuit, DigitalCircuit, DigitalTypes>(state));
}

export function DigitalIntegratedCircuitImpl(state: DigitalCircuitState) {
    return DigitalCircuitImpl(IntegratedCircuitImpl<DigitalCircuit, DigitalTypes>(state));
}
