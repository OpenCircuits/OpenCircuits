import {Circuit} from "shared/api/circuit/public";
import {CircuitDesigner} from "shared/api/circuitdesigner/public/CircuitDesigner";


declare global {
    interface Window {
        Circuit: Circuit;
        CircuitDesigner: CircuitDesigner;
    }
}

export {};