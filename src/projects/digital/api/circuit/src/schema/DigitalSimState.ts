import {GUID} from "shared/api/circuit/schema/GUID";
import {Signal} from "../public/utils/Signal";


export interface DigitalSimState {
    signals: Record<GUID, Signal>;
    states: Record<GUID, Signal[]>;
}
