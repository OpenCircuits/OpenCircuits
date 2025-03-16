import {CircuitImpl, IntegratedCircuitImpl} from "shared/api/circuit/public/impl/Circuit";

import {DigitalCircuit, DigitalIntegratedCircuit} from "../DigitalCircuit";
import {DigitalTypes} from "./DigitalCircuitState";


export class DigitalCircuitImpl extends CircuitImpl<DigitalTypes> implements DigitalCircuit {
    public set propagationTime(val: number) {
        throw new Error("DigitalCircuitImpl.set propagationTime: Unimplemented!");
    }
    public get propagationTime(): number {
        throw new Error("DigitalCircuitImpl.get propagationTime: Unimplemented!");
    }
}

export class DigitalIntegratedCircuitImpl extends IntegratedCircuitImpl
                                          implements DigitalIntegratedCircuit {
}
