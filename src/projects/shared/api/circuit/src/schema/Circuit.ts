import {Camera}          from "./Camera";
import {CircuitMetadata} from "./CircuitMetadata";
import {Component} from "./Component";
import {GUID}      from "./GUID";
import {Obj}             from "./Obj";
import {Port} from "./Port";
import {Wire} from "./Wire";


export interface IntegratedCircuitPin {
    id: GUID;  // ID of the internal PORT that this pin corresponds to.
    group: string;
    name: string;

    x: number;
    y: number;
    dx: number;
    dy: number;
}

export interface IntegratedCircuitMetadata extends CircuitMetadata {
    displayWidth: number;
    displayHeight: number;

    pins: IntegratedCircuitPin[];
}

export interface IntegratedCircuit {
    metadata: IntegratedCircuitMetadata;

    comps: Component[];
    wires: Wire[];
    ports: Port[];
}

export interface Circuit {
    metadata: CircuitMetadata;

    camera: Camera;

    ics: IntegratedCircuit[];
    comps: Component[];
    wires: Wire[];
    ports: Port[];
}
