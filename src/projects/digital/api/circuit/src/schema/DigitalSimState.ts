import {GUID} from "shared/api/circuit/schema";
import {Signal} from "./Signal";


export interface DigitalSimState {
    signals: Record<GUID, Signal>;  // PortID -> Signal
    states: Record<GUID, Signal[]>; // CompID -> Signal[]
    icStates: Record<GUID, DigitalSimState>; // ICInstance(Comp)ID -> DigitalSimState
}
