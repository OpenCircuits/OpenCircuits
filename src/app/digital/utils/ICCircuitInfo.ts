import {CircuitInfo} from "core/utils/CircuitInfo";
import {IC} from "digital/models/ioobjects";


export type ICCircuitInfo = CircuitInfo & {
    ic: IC;
}
