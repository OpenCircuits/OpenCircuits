import {CircuitInfo} from "core/utils/CircuitInfo";

import {DigitalObj} from "core/models/types/digital";

import {DigitalSim} from "digital/models/sim/DigitalSim";


export type DigitalCircuitInfo = CircuitInfo<DigitalObj> & {
    sim: DigitalSim;
}
