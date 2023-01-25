import {GUID} from "core/utils/GUID";

import {BaseObject, DefaultBaseObject} from "./BaseObject";


export type Port = BaseObject & {
    baseKind: "Port";

    parent: GUID;
    group: string; // The group for the port would be like input/output/select port (ex: "inputs", outputs", or "selects")
    index: number;
}

export type PortFactory<P extends Port> = (id: GUID, parent: GUID, group: string, index: number) => P;

export const DefaultPort: PortFactory<Port> =
    (id, parent, group, index) => ({ ...DefaultBaseObject(id), baseKind: "Port", parent, group, index });
