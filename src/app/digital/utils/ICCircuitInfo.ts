import {IC} from "digital/models/ioobjects";

import {DigitalCircuitInfo} from "./DigitalCircuitInfo";


export type ICCircuitInfo = DigitalCircuitInfo & {
    ic?: IC;
}
