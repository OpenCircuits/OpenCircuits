import {CircuitInfo} from "core/utils/CircuitInfo";
import {AnalogCircuitDesigner} from "analog/models";


export type AnalogCircuitInfo = Omit<CircuitInfo, "designer"> & {
    designer: AnalogCircuitDesigner;
}
