import {HistoryManager} from "core/actions/HistoryManager";
import {CircuitInfo} from "core/utils/CircuitInfo";
import {DigitalCircuitDesigner} from "digital/models";


export type DigitalCircuitInfo = CircuitInfo & {
    designer: DigitalCircuitDesigner;
}
