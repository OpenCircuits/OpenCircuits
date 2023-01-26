import {Camera}     from "./Camera";
import {GUID, uuid} from "./GUID";
import {Obj}        from "./Obj";
import {Prop}       from "./Prop";


export interface Circuit {
    id: GUID;

    metadata: Record<string, Prop> & {
        name: string;
        desc: string;
        thumb: string;
        version: `${string}/${string}`; // i.e. "digital/v0"
    };

    camera: Camera;

    objects: Obj[];

    ics: Circuit[]; // ignored except on root circuits
}

export const DefaultCircuit = (): Circuit => ({
    id:       uuid(),
    metadata: {
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
