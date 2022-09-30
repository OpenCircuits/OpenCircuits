import {AnyObj} from "core/models/types";


export function GetDebugInfo(obj: AnyObj): string {
    switch (obj.baseKind) {
        case "Component":
            return `Component ${obj.kind}[${obj.id}]{${obj.name ?? ""}}`;
        case "Wire":
            return `Wire ${obj.kind}[${obj.id}]{${obj.name ?? ""}}`;
        case "Port":
            return `Port ${obj.kind}[${obj.id}:${obj.parent}:${obj.group}:${obj.index}]{${obj.name ?? ""}}`;
    }
}
