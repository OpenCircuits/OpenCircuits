import {GUID} from "core/utils/GUID";

import {BaseObject, DefaultBaseObject} from "./BaseObject";


export type Port = BaseObject & {
    baseKind: "Port";

    parent: GUID;
    group: number; // The group for the port would be like input/output/select port
    index: number;
}

export const DefaultPort =
    (id: GUID, parent: GUID, group: number, index: number): Port =>
        ({ baseKind: "Port", parent, group, index, ...DefaultBaseObject(id) });
