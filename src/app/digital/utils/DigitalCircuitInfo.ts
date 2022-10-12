import {CircuitInfo} from "core/utils/CircuitInfo";

import {DigitalObj} from "core/models/types/digital";

import {PropagationManager} from "digital/models/sim/PropagationManager";


export type DigitalCircuitInfo = CircuitInfo<DigitalObj> & {
    propagationManager: PropagationManager;
}
