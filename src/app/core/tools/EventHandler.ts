import {CircuitInfo}       from "core/utils/CircuitInfo";
import {InputManagerEvent} from "core/utils/InputManager";


export type EventHandler = {
    conditions: (event: InputManagerEvent, info: CircuitInfo) => boolean;
    getResponse: (info: CircuitInfo, ev?: InputManagerEvent) => void;
}
