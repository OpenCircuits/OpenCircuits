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
    initial: boolean;
}
export type ButtonPropInfo = BasePropInfo & {
    type: "button";
    initial: Prop;
    getText: (states: Prop[]) => string;
    getNewState: (states: Prop[]) => Prop;
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
    | BooleanPropInfo | ButtonPropInfo | NumberPropInfo | StringPropInfo
    | ColorPropInfo | StringSelectPropInfo | NumberSelectPropInfo | VectorPropInfo;



export type PropInfoLayout = {
    isActive?: (states: Props[]) => boolean;

    infos: Record<string, PropInfo>;
    sublayouts?: PropInfoLayout[];
}
