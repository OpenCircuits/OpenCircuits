import {GUID} from "core/utils/GUID";

import {PropInfo}                               from "../PropInfo";
import {AnyComponent, AnyObj, AnyPort, AnyWire} from "../types";


export type ComponentInfo<C extends AnyComponent> = {
    Default: (id: GUID) => C;

    PortInfo: {
        Default: (id: GUID, parent: GUID, group: number, index: number) => AnyPort;
        InitialConfig: string;
        AllowChanges: boolean;
         // The group that should dictate the changes
         //  i.e. Input count, Select count, Output count
        ChangeGroup?: number;
    };

    // Why can't I re-use????
    PropInfo: Partial<Record<keyof C, PropInfo>>;
}

export type WireInfo<W extends AnyWire> = {
    Default: (id: GUID, p1: GUID, p2: GUID) => W;

    // Why can't I re-use????
    PropInfo: Partial<Record<keyof W, PropInfo>>;
}
export type PortInfo<P extends AnyPort> = {
    Default: (id: GUID, parent: GUID, group: number, index: number) => P;

    // Why can't I re-use????
    PropInfo: Partial<Record<keyof P, PropInfo>>;
}

export type ComponentInfoRecord<Comps extends AnyComponent> = {
    [K in Comps as K["kind"]]: ComponentInfo<K>;
}

export type ObjInfoRecord<Objs extends AnyObj> = {
    [O in Objs as O["kind"]]: (
        O extends AnyComponent
        ? ComponentInfo<O>
        : O extends AnyPort
        ? PortInfo<O>
        : O extends AnyWire
        ? WireInfo<O>
        : never
    );
}
