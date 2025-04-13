import {Circuit, IntegratedCircuit} from "shared/api/circuit/schema/Circuit";
import {DigitalSimState} from "./DigitalSimState";


export interface DigitalIntegratedCircuit extends IntegratedCircuit {
    initialSimState: DigitalSimState;
}

export interface DigitalCircuit extends Circuit {
    // Override
    ics: DigitalIntegratedCircuit[];

    propagationTime: number;

    // icSimStates: Record<GUID, DigitalSimState>;
    simState: DigitalSimState;
}
