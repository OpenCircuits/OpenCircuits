import {GUID} from "shared/api/circuit/schema";
import {Signal} from "./Signal";


export interface DigitalSimState {
    // PortID -> Signal
    signals: Record<GUID, Signal>;

    // CompID -> number[]
    // States are arbitrary numbers (usually signals).
    states: Record<GUID, number[]>;

    // ICInstance(Comp)ID -> DigitalSimState
    icStates: Record<GUID, DigitalSimState>;
}
