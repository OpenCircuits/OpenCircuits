import {IntegratedCircuitImpl, RootCircuitImpl} from "shared/api/circuit/public/impl/Circuit";

import {DigitalIntegratedCircuit, DigitalRootCircuit} from "../DigitalCircuit";
import {DigitalTypes} from "./DigitalCircuitState";


export class DigitalRootCircuitImpl extends RootCircuitImpl<DigitalTypes> implements DigitalRootCircuit {
    public set propagationTime(val: number) {
        throw new Error("DigitalCircuitImpl.set propagationTime: Unimplemented!");
    }
    public get propagationTime(): number {
        throw new Error("DigitalCircuitImpl.get propagationTime: Unimplemented!");
    }
}

export class DigitalIntegratedCircuitImpl extends IntegratedCircuitImpl<DigitalTypes>
                                          implements DigitalIntegratedCircuit {
}
