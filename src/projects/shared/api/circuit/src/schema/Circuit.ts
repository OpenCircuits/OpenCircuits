import {Camera}          from "./Camera";
import {CircuitMetadata} from "./CircuitMetadata";
import {GUID}      from "./GUID";
import {Obj}             from "./Obj";


export interface IntegratedCircuitMetadata extends CircuitMetadata {
    displayWidth: number;
    displayHeight: number;

    pins: Array<{ id: GUID, group: string, x: number, y: number }>;
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
