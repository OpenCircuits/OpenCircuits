import {Vector} from "Vector";


export type Prop = number | string | Vector | boolean;


export type UnitInfo = Record<string, {
    name: string;
    display: string;
    val: number;
}>;
export type BasePropInfo = {
    readonly?: boolean;
    display: string | ((state: Record<string, Prop>) => string);

    isActive?: (state: Record<string, Prop>) => boolean;
}
export type NumberPropInfo = BasePropInfo & {
    type: "int" | "float";
    initial: number;
    unit?: UnitInfo;
    min?: number;
    max?: number;
    step?: number;
}
export type VectorPropInfo = BasePropInfo & {
    type: "veci" | "vecf";
    initial: Vector;
    min?: Vector;
    max?: Vector;
    step?: Vector;
}
export type StringPropInfo = BasePropInfo & {
    type: "string";
    initial: string;
    constraint?: RegExp; // TODO: use this
}
export type ColorPropInfo = BasePropInfo & {
    type: "color";
    initial: string;
}
export type StringSelectPropInfo = BasePropInfo & {
    type: "string[]";
    initial: string;
    options: Array<[
        string, // Display value
        string, // Option value
    ]>;
}
export type NumberSelectPropInfo = BasePropInfo & {
    type: "number[]";
    initial: number;
    options: Array<[
        string, // Display value
        number, // Option value
    ]>;
}
export type PropInfo =
    | NumberPropInfo | StringPropInfo | ColorPropInfo
    | StringSelectPropInfo | NumberSelectPropInfo | VectorPropInfo;

export type GroupPropInfo = {
    type: "group";

    readonly?: boolean;
    isActive?: (state: Record<string, Prop>) => boolean;

    infos: Record<string, PropInfo>;
    subgroups?: GroupPropInfo[];
}
