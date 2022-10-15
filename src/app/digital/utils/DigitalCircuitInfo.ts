import {CircuitInfo} from "core/utils/CircuitInfo";

import {DigitalObj} from "core/models/types/digital";

import {DigitalSim} from "digital/models/sim/DigitalSim";

import {PropagationController} from "digital/controllers/PropagationController";


export type DigitalCircuitInfo = CircuitInfo<DigitalObj> & {
    sim: DigitalSim;
    propagationController: PropagationController;
}
