import {Schema} from "shared/api/circuit/schema";
import {GUID} from "../../schema/GUID";


export function GetShortenedID(id: GUID): string {
    return id.slice(0, 8);
}

export function GetDebugInfo(obj: Schema.Obj): string {
    const id = GetShortenedID(obj.id);
    switch (obj.baseKind) {
        case "Component":
            return `Component ${obj.kind}[${id}]{${obj.props["name"] ?? ""}}`;
        case "Wire":
            return `Wire ${obj.kind}[${id}]{${obj.props["name"] ?? ""}}`;
        case "Port":
            return `Port ${obj.kind}[${id}:${GetShortenedID(obj.parent)}:${obj.group}:${obj.index}]{${obj.props["name"] ?? ""}}`;
    }
}
