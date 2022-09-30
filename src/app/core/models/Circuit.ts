import {SAVE_VERSION} from "core/utils/Constants";

import {GUID} from "core/utils/GUID";

import {AnyObj} from "./types";


export type CircuitMetadata = {
    id: GUID;
    name: string;
    desc: string;
    thumbnail: string;
    version: string;
}

export type Circuit<Obj extends AnyObj> = {
    objects: Record<GUID, Obj>;

    ics: Record<GUID, Circuit<Obj>>;

    metadata: CircuitMetadata;
}

export const DefaultCircuit =
    <Obj extends AnyObj>(): Circuit<Obj> => ({
        objects:  {},
        ics:      {},
        metadata: {
            id:        "", // TODO: generate
            name:      "",
            desc:      "",
            thumbnail: "",
            version:   SAVE_VERSION,
        },
    });
