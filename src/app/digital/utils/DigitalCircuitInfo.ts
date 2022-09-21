import {CircuitInfo} from "core/utils/CircuitInfo";

import {DigitalObj} from "core/models/types/digital";

import {CircuitController} from "core/controllers/CircuitController";
import {ViewManager}       from "core/views/ViewManager";


export type DigitalCircuitInfo = CircuitInfo<DigitalObj> & {
    viewManager: ViewManager<DigitalObj, CircuitController<DigitalObj>>;
};
