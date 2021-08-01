export type AccessModifier = "private" | "protected" | "public";

export type Types = {
    name: string;
    link?: string;
}[][]; // Union of intersections of types

export type Parameter = {
    docs?: string;
    name: string;
    type: Types;
}
export type Property = Parameter & {
    access: AccessModifier;
}

export type Method = {
    docs?: string;
    access: AccessModifier;
    name: string;
    overloads: {
        docs?: string;
        parameters: Parameter[];
        returns: {
            docs?: string;
            type: Types;
        }[];
    }[];
}
export type Constructor = {
    docs?: string;
    access: AccessModifier;
    overloads: {
        docs?: string;
        parameters: Parameter[];
    }[];
}

export type Class = {
    docs?: string;
    fileName: string;
    name: string;
    constructor: Constructor,
    properties: Property[]
    methods: Method[],
    staticMethods: Method[]
}
