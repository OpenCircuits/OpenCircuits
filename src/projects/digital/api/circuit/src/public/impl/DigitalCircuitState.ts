import {CircuitContext, CircuitTypes} from "shared/api/circuit/public/impl/CircuitContext";

import {DigitalCircuit, DigitalICInfo, DigitalIntegratedCircuit, DigitalObjContainer, DigitalSelections, ReadonlyDigitalCircuit, ReadonlyDigitalObjContainer, ReadonlyDigitalSelections} from "../DigitalCircuit";
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
    ReadonlyDigitalObjContainer,
    DigitalSelections,
    ReadonlyDigitalSelections
>;

export interface DigitalCircuitState extends CircuitContext<DigitalTypes> {
    sim: DigitalSim;
    simRunner?: DigitalSimRunner;
}
