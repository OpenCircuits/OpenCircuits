import {CircuitState} from "core/public/api/impl/CircuitState";
import {DigitalSim} from "digital/internal/sim/DigitalSim";

import {DigitalCircuit}   from "../DigitalCircuit";
import {DigitalComponent} from "../DigitalComponent";
import {DigitalPort}      from "../DigitalPort";
import {DigitalWire}      from "../DigitalWire";


export type DigitalCircuitState = CircuitState<
    DigitalComponent,
    DigitalWire,
    DigitalPort,
    DigitalCircuit
> & {
    sim: DigitalSim;
};
