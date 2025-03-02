import {IntegratedCircuitImpl, RootCircuitImpl} from "shared/api/circuit/public/impl/Circuit";

import {extend} from "shared/api/circuit/utils/Functions";

import {APIToDigital, DigitalCircuit, DigitalIntegratedCircuit} from "../DigitalCircuit";
import {DigitalCircuitState, DigitalTypes} from "./DigitalCircuitState";
import {Circuit} from "shared/api/circuit/public";


function DigitalCircuitImpl<T extends (APIToDigital<Circuit> & Record<string | number | symbol, unknown>)>(base: T) {
    return extend(base, {
        set propagationTime(val: number) {
            throw new Error("DigitalCircuitImpl.set propagationTime: Unimplemented!");
        },
        get propagationTime(): number {
            throw new Error("DigitalCircuitImpl.get propagationTime: Unimplemented!");
        },
    } as const) satisfies DigitalCircuit;
}

export function DigitalRootCircuitImpl(state: DigitalCircuitState) {
    return DigitalCircuitImpl(RootCircuitImpl<DigitalCircuit, DigitalTypes>(state));
}

// export function DigitalIntegratedCircuitImpl(state: DigitalCircuitState) {
//     return DigitalCircuitImpl(IntegratedCircuitImpl<DigitalCircuit, DigitalTypes>(state));
// }
