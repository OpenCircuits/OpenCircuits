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
    };
}

export interface RootCircuit extends Circuit {
    ics: IntegratedCircuit[];
}

export const DefaultCircuit = (): RootCircuit => ({
    metadata: {
        id:      uuid(),
        name:    "",
        desc:    "",
        thumb:   "",
        version: "/",
    },
    camera: {
        x:    0,
        y:    0,
        zoom: 0.1,
    },
    objects: [],
    ics:     [],
});
