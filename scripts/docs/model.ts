export type AccessModifier = "private" | "protected" | "public";


// export type Types = {
//     isArray: boolean;
//     unions: {
//         intersections: {
//             name: string;
//             args?: Types[]; // For generics
//             link?: string;
//         }[];
//     }[];
// }
export type Types = Array<Array<{
    type: string | Types;
    args?: Types[]; // For generics
    link?: string;
}>>; // Union of intersections of types

export type Parameter = {
    docs?: string;
    name: string;
    type: Types;
}
export type Property = Parameter & {
    access: AccessModifier;
}

export type MethodSignature = {
    docs?: string;
    parameters: Parameter[];
    returns: Array<{
        docs?: string;
        type: Types;
    }>;
};
export type Method = {
    docs?: string;
    access: AccessModifier;
    name: string;
    implementation: MethodSignature;
    overloads: MethodSignature[];
}
export type Constructor = {
    docs?: string;
    access: AccessModifier;
    overloads: Array<{
        docs?: string;
        parameters: Parameter[];
    }>;
}

export type Class = {
    docs?: string;
    generics: Array<{
        docs?: string;
        constraint?: Types;
        name: string;
    }>;
    name: string;
    constructor?: Constructor;
    properties: Property[];
    methods: Method[];
    staticMethods: Method[];
}

export type TSDoc = {
    file: string;
    fileName: string;
    classes: Class[];
    functions: Method[]; // ik methods are functions for classes and i should rename `Method` to `Func` but whatever
}
