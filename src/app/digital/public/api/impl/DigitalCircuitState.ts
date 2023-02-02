import {CircuitInternal}   from "core/internal";
import {SelectionsManager} from "core/internal/impl/SelectionsManager";
import {CircuitView}       from "core/internal/view/CircuitView";

import {DigitalCircuit}   from "../DigitalCircuit";
import {DigitalComponent} from "../DigitalComponent";
import {DigitalPort}      from "../DigitalPort";
import {DigitalWire}      from "../DigitalWire";


export interface DigitalCircuitState extends DigitalCircuit {
    circuit: CircuitInternal;
    view?: CircuitView;

    selections: SelectionsManager;

    isLocked: boolean;

    constructComponent(id: string): DigitalComponent;
    constructWire(id: string): DigitalWire;
    constructPort(id: string): DigitalPort;
}
