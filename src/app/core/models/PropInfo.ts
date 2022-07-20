import {Vector} from "Vector";


export type Prop = number | string | Vector | boolean;

export type Props = Record<string, Prop>;


export type UnitInfo = Record<string, {
    name: string;
    display: string;
    val: number;
}>;

export type BasePropInfo = {
    readonly?: boolean;
    label?: string | ((states: Props[]) => string);

    isActive?: (states: Props[]) => boolean;
}
export type BooleanPropInfo = BasePropInfo & {
    type: "boolean";
}
export type ButtonPropInfo = BasePropInfo & {
    type: "button";
    getText: (states: Prop[]) => string;
    getNewState: (states: Prop[]) => Prop;
}
export type NumberPropInfo = BasePropInfo & {
    type: "int" | "float";
    unit?: UnitInfo;
    min?: number;
    max?: number;
    step?: number;
}
export type VectorPropInfo = BasePropInfo & {
    type: "veci" | "vecf";
    min?: Vector;
    max?: Vector;
    step?: Vector;
}
export type StringPropInfo = BasePropInfo & {
    type: "string";
    constraint?: RegExp; // TODO: use this
}
export type ColorPropInfo = BasePropInfo & {
    type: "color";
}
export type StringSelectPropInfo = BasePropInfo & {
    type: "string[]";
    options: Array<[
        string, // Display value
        string, // Option value
    ]>;
}
export type NumberSelectPropInfo = BasePropInfo & {
    type: "number[]";
    options: Array<[
        string, // Display value
        number, // Option value
    ]>;
}

export type PropInfo =
    | BooleanPropInfo | ButtonPropInfo | NumberPropInfo | StringPropInfo
    | ColorPropInfo | StringSelectPropInfo | NumberSelectPropInfo | VectorPropInfo;
