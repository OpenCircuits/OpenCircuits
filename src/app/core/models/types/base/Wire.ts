import {GUID} from "core/utils/GUID";

import {BaseObject, DefaultBaseObject} from "./BaseObject";


export type Wire = BaseObject & {
    baseKind: "Wire";

    p1: GUID;
    p2: GUID;

    color: string;
}

export type WireFactory<W extends Wire> = (id: GUID, p1: GUID, p2: GUID) => W;

export const DefaultWire: WireFactory<Wire> =
    (id, p1, p2) => ({ ...DefaultBaseObject(id), baseKind: "Wire", p1, p2, color: "#ffffff" });
