import {GUID} from "shared/api/circuit/schema/GUID";
import {Signal} from "digital/api/circuit/internal/sim/Signal";


export interface DigitalSimState {
    signals: Record<GUID, Signal>;
    states: Record<GUID, Signal[]>;
    icStates: Record<GUID, DigitalSimState>;
}
