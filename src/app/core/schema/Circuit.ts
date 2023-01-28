import {Camera}          from "./Camera";
import {CircuitMetadata} from "./CircuitMetadata";
import {uuid}            from "./GUID";
import {Obj}             from "./Obj";


export interface Circuit {
    metadata: CircuitMetadata;

    camera: Camera;

    objects: Obj[];

    ics: Circuit[]; // ignored except on root circuits
}

export const DefaultCircuit = (): Circuit => ({
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
