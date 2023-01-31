import {Port, Wire}  from "core/public";
import {CircuitImpl} from "core/public/api/impl/Circuit";

import {DigitalCircuit} from "../DigitalCircuit";


export class DigitalCircuitImpl extends CircuitImpl implements DigitalCircuit {
    public connectWire(p1: Port, p2: Port): Wire | undefined {
        // TODO(chuh4)
        //  Connect the ports using a "DigitalWire"
        //  See `placeComponentAt` for a similar method
        //  Note: `circuit.connectWire` CAN throw an exception, i.e.
        //         if you try to connect a port to itself or something
        //         and we should handle this HERE and return undefined
        //         in that case
        throw new Error("Unimplemented");
    }

    public set propagationTime(val: number) {
        throw new Error("Unimplemented");
    }
    public get propagationTime(): number {
        throw new Error("Unimplemented");
    }

}
