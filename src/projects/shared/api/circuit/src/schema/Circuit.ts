import {Camera}          from "./Camera";
import {CircuitMetadata} from "./CircuitMetadata";
import {GUID}      from "./GUID";
import {Obj}             from "./Obj";


export interface IntegratedCircuitPin {
    id: GUID;  // ID of the internal PORT that this pin corresponds to.
    group: string;

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
    objects: Obj[];
}

export interface Circuit {
    metadata: CircuitMetadata;

    camera: Camera;

    ics: IntegratedCircuit[];
    objects: Obj[];
}
