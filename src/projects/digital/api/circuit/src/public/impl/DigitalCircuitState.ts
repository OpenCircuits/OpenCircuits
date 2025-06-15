import {CircuitState, CircuitTypes} from "shared/api/circuit/public/impl/CircuitState";

import {DigitalCircuit, DigitalICInfo, DigitalIntegratedCircuit, DigitalObjContainer, ReadonlyDigitalCircuit, ReadonlyDigitalObjContainer} from "../DigitalCircuit";
import {DigitalComponent, DigitalNode, ReadonlyDigitalComponent} from "../DigitalComponent";
import {DigitalPort, ReadonlyDigitalPort}                   from "../DigitalPort";
import {DigitalWire, ReadonlyDigitalWire}                   from "../DigitalWire";

import {DigitalSim} from "digital/api/circuit/internal/sim/DigitalSim";
import {DigitalSimRunner} from "digital/api/circuit/internal/sim/DigitalSimRunner";


export type DigitalTypes = CircuitTypes<
    DigitalCircuit,
    ReadonlyDigitalCircuit,
    DigitalComponent,
    DigitalWire,
    DigitalPort,
    ReadonlyDigitalComponent,
    ReadonlyDigitalWire,
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
