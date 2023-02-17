import {Port, Wire}  from "core/public";
import {CircuitImpl} from "core/public/api/impl/Circuit";
import {WireImpl}    from "core/public/api/impl/Wire";

import {DigitalCircuit}       from "../DigitalCircuit";
import {DigitalComponentInfo} from "../DigitalComponentInfo";


export class DigitalCircuitImpl extends CircuitImpl implements DigitalCircuit {
    public connectWire(p1: Port, p2: Port): Wire | undefined {
        try {
            this.circuit.beginTransaction();
            
            // Create a new raw Wire
            const id = this.circuit.connectWire("DigitalWire", p1.id, p2.id, {});
            
            this.circuit.commitTransaction();
    
            return new WireImpl(this.state, id);
        } catch (error) {
            this.circuit.cancelTransaction(); 
            return undefined;
        }
    }

    public set propagationTime(val: number) {
        throw new Error("Unimplemented");
    }
    public get propagationTime(): number {
        throw new Error("Unimplemented");
    }

    public override getComponentInfo(kind: string): DigitalComponentInfo | undefined {
        throw new Error("Unimplmeneted");
    }
}
