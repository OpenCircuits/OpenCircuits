import {GUID} from "core/schema/GUID";
import {Signal} from "../public/utils/Signal";


export interface DigitalSimState {
    signals: Record<GUID, Signal>;
    states: Record<GUID, Signal[]>;
}
