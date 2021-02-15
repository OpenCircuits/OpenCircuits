import {HistoryManager} from "core/actions/HistoryManager";
import {CircuitInfo} from "core/utils/CircuitInfo";
import {DigitalCircuitDesigner} from "digital/models";


export type DigitalCircuitInfo = Omit<CircuitInfo, "designer"> & {
    designer: DigitalCircuitDesigner;
}
