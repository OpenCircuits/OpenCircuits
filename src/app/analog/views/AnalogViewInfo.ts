import {AnalogSim} from "analog/models/sim/AnalogSim";

import {AnalogCircuitController} from "analog/controllers/AnalogCircuitController";
import {ViewCircuitInfo}         from "core/views/BaseView";


export type AnalogViewInfo = ViewCircuitInfo<AnalogCircuitController> & {
    sim?: AnalogSim;
}
