import {CircuitState, CircuitTypes} from "shared/api/circuit/public/impl/CircuitState";

import {DigitalCircuit, DigitalICInfo, DigitalIntegratedCircuit} from "../DigitalCircuit";
import {DigitalComponent, DigitalNode} from "../DigitalComponent";
import {DigitalPort}                   from "../DigitalPort";
import {DigitalWire}                   from "../DigitalWire";

import {DigitalSim} from "digital/api/circuit/internal/sim/DigitalSim";
import {DigitalSimRunner} from "digital/api/circuit/internal/sim/DigitalSimRunner";


export type DigitalTypes = CircuitTypes<
    DigitalCircuit,
    DigitalComponent,
    DigitalWire,
    DigitalPort,
    DigitalNode,
    DigitalIntegratedCircuit,
    DigitalICInfo
>;

export interface DigitalCircuitState extends CircuitState<DigitalTypes> {
    sim: DigitalSim;
    simRunner: DigitalSimRunner;
}
