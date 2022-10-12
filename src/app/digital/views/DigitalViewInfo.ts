import {PropagationManager} from "digital/models/sim/PropagationManager";

import {ViewCircuitInfo}          from "core/views/BaseView";
import {DigitalCircuitController} from "digital/controllers/DigitalCircuitController";


export type DigitalViewInfo = ViewCircuitInfo<DigitalCircuitController> & {
    propagationManager: PropagationManager;
}
