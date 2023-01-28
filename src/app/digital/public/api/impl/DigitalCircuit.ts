import {CircuitImpl} from "core/public/api/impl/Circuit";

import {DigitalCircuit} from "../DigitalCircuit";


export class DigitalCircuitImpl extends CircuitImpl implements DigitalCircuit {

    public set propagationTime(val: number) {
        throw new Error("Unimplemented");
    }
    public get propagationTime(): number {
        throw new Error("Unimplemented");
    }

}
