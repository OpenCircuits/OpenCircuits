import {Prop} from "shared/api/circuit/public";


export type Props = Record<string, Prop>;

export type BasePropInfo = {
    id: string;
    label?: string;
    isActive?: (props: Record<string, Prop[]>) => boolean;
}
export type BaseFieldPropInfo = BasePropInfo & {
    key: string;
}

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

// Key'd by the an Object's `kind`, to its corresponding prop info
export type PropInfoRecord = Record<string, PropInfo>;
