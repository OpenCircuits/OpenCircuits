import {CircuitState, CircuitTypes} from "shared/api/circuit/public/impl/CircuitState";

import {DigitalComponent, DigitalNode} from "../DigitalComponent";
import {DigitalPort}                   from "../DigitalPort";
import {DigitalWire}                   from "../DigitalWire";

import {DigitalSim} from "digital/api/circuit/internal/sim/DigitalSim";
import {DigitalICInfo, DigitalIntegratedCircuit} from "../DigitalCircuit";


export type DigitalTypes = CircuitTypes<
    DigitalComponent,
    DigitalWire,
    DigitalPort,
    DigitalNode,
    DigitalIntegratedCircuit,
    DigitalICInfo
>;

export interface DigitalCircuitState extends CircuitState<DigitalTypes> {
    sim: DigitalSim;
}
