import {CircuitInfo} from "core/utils/CircuitInfo";

import {AnalogObj} from "core/models/types/analog";

import {AnalogSim}       from "analog/models/sim/AnalogSim";
import {SimDataMappings} from "analog/models/sim/NetlistGenerator";


export type AnalogCircuitInfo = CircuitInfo<AnalogObj> & {
    sim?: AnalogSim;
    simDataMappings?: SimDataMappings;
}
