import {AnyObj} from "core/models/types";

import {GUID} from "./GUID";


export function GetShortenedID(id: GUID): string {
    return id.slice(0, 8);
}

export function GetDebugInfo(obj: AnyObj): string {
    const id = GetShortenedID(obj.id);
    switch (obj.baseKind) {
        case "Component":
            return `Component ${obj.kind}[${id}]{${obj.name ?? ""}}`;
        case "Wire":
            return `Wire ${obj.kind}[${id}]{${obj.name ?? ""}}`;
        case "Port":
            return `Port ${obj.kind}[${id}:${GetShortenedID(obj.parent)}:${obj.group}:${obj.index}]{${obj.name ?? ""}}`;
    }
}
