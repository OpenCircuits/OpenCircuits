import {CircuitState, CircuitTypes} from "shared/api/circuit/impl/CircuitState";

import {DigitalComponent, DigitalNode} from "../DigitalComponent";
import {DigitalPort}                   from "../DigitalPort";
import {DigitalWire}                   from "../DigitalWire";

import {DigitalSim} from "digital/internal/sim/DigitalSim";


export type DigitalTypes = CircuitTypes<
    DigitalComponent,
    DigitalWire,
    DigitalPort,
    DigitalNode
>;

export interface DigitalCircuitState extends CircuitState<DigitalTypes> {
    sim: DigitalSim;
}
