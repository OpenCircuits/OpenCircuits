import {Circuit} from "core/models/Circuit";

import {DigitalObj} from "core/models/types/digital";


export type DigitalCircuit = Circuit<DigitalObj> & {
    propagationTime: number;
}
