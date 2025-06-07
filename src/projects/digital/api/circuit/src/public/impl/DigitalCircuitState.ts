import {CircuitState, CircuitTypes} from "shared/api/circuit/public/impl/CircuitState";

import {DigitalCircuit, DigitalICInfo, DigitalIntegratedCircuit, DigitalObjContainer, ReadonlyDigitalObjContainer} from "../DigitalCircuit";
import {DigitalComponent, DigitalNode} from "../DigitalComponent";
import {DigitalPort, ReadonlyDigitalPort}                   from "../DigitalPort";
import {DigitalWire}                   from "../DigitalWire";

import {DigitalSim} from "digital/api/circuit/internal/sim/DigitalSim";
import {DigitalSimRunner} from "digital/api/circuit/internal/sim/DigitalSimRunner";


export type DigitalTypes = CircuitTypes<
    DigitalCircuit,
    DigitalComponent,
    DigitalWire,
    DigitalPort,
    ReadonlyDigitalPort,
    DigitalNode,
    DigitalIntegratedCircuit,
    DigitalICInfo,
    DigitalObjContainer,
    ReadonlyDigitalObjContainer
>;

export interface DigitalCircuitState extends CircuitState<DigitalTypes> {
    sim: DigitalSim;
    simRunner?: DigitalSimRunner;
}
