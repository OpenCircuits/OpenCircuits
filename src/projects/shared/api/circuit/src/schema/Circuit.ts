import {Camera}          from "./Camera";
import {CircuitMetadata} from "./CircuitMetadata";
import {GUID, uuid}      from "./GUID";
import {Obj}             from "./Obj";


export interface Circuit {
    metadata: CircuitMetadata;

    camera: Camera;

    objects: Obj[];
}

export interface IntegratedCircuit extends Circuit {
    metadata: CircuitMetadata & {
        displayWidth: number;
        displayHeight: number;

        pins: Array<{ id: GUID, group: string, x: number, y: number }>;
    };
}

export interface RootCircuit extends Circuit {
    ics: IntegratedCircuit[];
}

