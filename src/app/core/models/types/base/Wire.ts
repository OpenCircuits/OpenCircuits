import {GUID} from "core/utils/GUID";

import {BaseObject, DefaultBaseObject} from "./BaseObject";


export type Wire = BaseObject & {
    baseKind: "Wire";

    p1: GUID;
    p2: GUID;

    color: string;
}

export const DefaultWire =
    (id: GUID, p1: GUID, p2: GUID): Wire =>
        ({ baseKind: "Wire", p1, p2, color: "#ffffff", ...DefaultBaseObject(id) });
