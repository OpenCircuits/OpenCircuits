import {DigitalSim} from "digital/models/sim/DigitalSim";

import {ViewCircuitInfo}          from "core/views/BaseView";
import {DigitalCircuitController} from "digital/controllers/DigitalCircuitController";


export type DigitalViewInfo = ViewCircuitInfo<DigitalCircuitController> & {
    sim: DigitalSim;
}
