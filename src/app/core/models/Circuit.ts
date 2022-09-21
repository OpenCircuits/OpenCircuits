import {SAVE_VERSION} from "core/utils/Constants";

import {GUID} from "core/utils/GUID";

import {AnyObj} from "./types";


export type Circuit<Obj extends AnyObj> = {
    objects: Map<GUID, Obj>;

    ics: Map<GUID, Circuit<Obj>>;

    metadata: {
        id: GUID;
        name: string;
        thumbnail: string;
        version: string;
    };
}

export const DefaultCircuit =
    <Obj extends AnyObj>(): Circuit<Obj> => ({
        objects:  new Map(),
        ics:      new Map(),
        metadata: {
            id:        "", // TODO: generate
            name:      "",
            thumbnail: "",
            version:   SAVE_VERSION,
        },
    });
