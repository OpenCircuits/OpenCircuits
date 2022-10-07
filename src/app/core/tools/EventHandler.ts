import {CircuitInfo} from "core/utils/CircuitInfo";
import {Event}       from "core/utils/Events";


export type EventHandler = {
    conditions: (event: Event, info: CircuitInfo) => boolean;
    getResponse: (info: CircuitInfo, ev?: Event) => void;
}
