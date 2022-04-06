import {CircuitInfo} from "core/utils/CircuitInfo";

import {AnalogCircuitDesigner} from "analog/models";
import {AnalogSim} from "analog/models/sim/AnalogSim";


export type AnalogCircuitInfo = Omit<CircuitInfo, "designer"> & {
    designer: AnalogCircuitDesigner;
    sim?: AnalogSim;
}
