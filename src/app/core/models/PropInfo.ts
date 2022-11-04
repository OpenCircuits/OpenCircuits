import {AnyObj} from "./types";


export type Prop = number | string | boolean;
export type Props = Record<string, Prop>;

export type BasePropInfo<Obj extends AnyObj> = {
    id: string;
    label?: string;
    isActive?: (props: Partial<{ [K in (keyof Obj & string)]: Array<Obj[K]> }>) => boolean;
}
export type BaseFieldPropInfo<Obj extends AnyObj> = BasePropInfo<Obj> & {
    key: keyof Obj & string;
}

export type NumberPropInfo<Obj extends AnyObj> = BaseFieldPropInfo<Obj> & {
    type: "int" | "float";
    min?: number;
    max?: number;
    step?: number;
    transform?: [
        (v: number) => number, // Forward transform
        (v: number) => number, // Inverse transform
    ];
}
export type StringPropInfo<Obj extends AnyObj> = BaseFieldPropInfo<Obj> & {
    type: "string";
    // TODO: Add a RegEx constraint option if this gets used
}
export type StringSelectPropInfo<Obj extends AnyObj> = BaseFieldPropInfo<Obj> & {
    type: "string[]";
    options: Array<[
        string, // Display value
        string, // Option value
    ]>;
}
export type ColorPropInfo<Obj extends AnyObj> = BaseFieldPropInfo<Obj> & {
    type: "color";
}

export type GroupPropInfo<Obj extends AnyObj> = BasePropInfo<Obj> & {
    type: "group";
    info: PropInfo<Obj>;
}

export type PropInfoEntry<Obj extends AnyObj> =
    | NumberPropInfo<Obj> | StringSelectPropInfo<Obj> | ColorPropInfo<Obj>
    | StringPropInfo<Obj> | GroupPropInfo<Obj>;

export type PropInfo<Obj extends AnyObj> = Array<PropInfoEntry<Obj>>;

export type PropInfoRecord<Obj extends AnyObj> = {
    [O in Obj as O["kind"]]: PropInfo<O>;
}
