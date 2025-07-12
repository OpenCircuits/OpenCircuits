import {Obj, Prop} from "shared/api/circuit/public";

import {DEFAULT_COMPONENT_PROP_INFO, DEFAULT_PORT_PROP_INFO, DEFAULT_WIRE_PROP_INFO} from "./DefaultPropInfo";


export type Props = Record<string, Prop>;

export type BasePropInfo = {
    id: string; // a unique ID for the prop or group, doesn't need to correspond to anything
    label?: string;
    isActive?: (props: Record<string, Prop[]>) => boolean;
}
export type BaseFieldPropInfo = BasePropInfo & {
    key: string; // the key of the actual prop on the component
}

export type UnitInfo = {
    key: string;
    default: string;
    entries: Record<string, {
        display: string;
        scale: number;
    }>;
};
export type NumberPropInfo = BaseFieldPropInfo & {
    type: "int" | "float";
    min?: number;
    max?: number;
    step?: number;
    default?: number;
    transform?: [
        (v: number) => number, // Forward transform
        (v: number) => number, // Inverse transform
    ];
    unit?: UnitInfo;
}
export type NumberSelectPropInfo = BaseFieldPropInfo & {
    type: "number[]";
    options: Array<[
        string, // Display value
        number, // Option value
    ]>;
    default?: number;
}
export type StringPropInfo = BaseFieldPropInfo & {
    type: "string";
    default?: string;
    // TODO: Add a RegEx constraint option if this gets used
}
export type StringSelectPropInfo = BaseFieldPropInfo & {
    type: "string[]";
    options: Array<[
        string, // Display value
        string, // Option value
    ]>;
    default?: string;
}
export type ColorPropInfo = BaseFieldPropInfo & {
    type: "color";
    default?: string;
}

export type GroupPropInfo = BasePropInfo & {
    type: "group";
    info: PropInfo;
}

export type PropInfoEntryField =
    | NumberPropInfo
    | NumberSelectPropInfo
    | StringSelectPropInfo
    | ColorPropInfo
    | StringPropInfo

export type PropInfoEntry = PropInfoEntryField | GroupPropInfo;

export type PropInfo = PropInfoEntry[];

export type PropInfoGetter = (obj: Obj) => PropInfo | undefined;

export function MakeDefaultPropInfoGetter(specificObjInfo: Record<string, PropInfo>): PropInfoGetter {
    return (obj: Obj) => (
        obj.kind in specificObjInfo ? specificObjInfo[obj.kind]
        : obj.baseKind === "Component" ? DEFAULT_COMPONENT_PROP_INFO
        : obj.baseKind === "Wire" ? DEFAULT_WIRE_PROP_INFO
        : obj.baseKind === "Port" ? DEFAULT_PORT_PROP_INFO
        : undefined
    );
}
