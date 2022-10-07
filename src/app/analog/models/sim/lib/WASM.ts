/* eslint-disable @typescript-eslint/naming-convention */

export type WASMModule = {
    _malloc: (length: number) => number;
    _free: (array: number) => void;

    HEAP8:   Int8Array;
    HEAPU8:  Uint8Array;
    HEAP16:  Int16Array;
    HEAPU16: Uint16Array;
    HEAP32:  Int32Array;
    HEAPU32: Uint32Array;

    HEAPF32: Float32Array;
    HEAPF64: Float64Array;
}
export type TypedArray = Int8Array | Uint8Array | Int16Array | Uint16Array | Int32Array
                        | Uint32Array | Float32Array | Float64Array;


type CreateArrayParams = ([
    "float64",
    number[],
]) | ([
    "string",
    string,
]);

function CreateArray(module: WASMModule, ...params: CreateArrayParams) {
    let res: TypedArray;
    let heap: TypedArray;

    if (params[0] === "float64") {
        res = new Float64Array(params[1]);
        heap = module.HEAPF64;
    } else if (params[0] === "string") {
        const str = params[1];
        // Need to explicitly put null terminator at end
        res = new TextEncoder().encode(str + "\0");
        heap = module.HEAPU8;
    } else {
        throw new Error(`Unknown type ${params[0]}!`);
    }

    const arrPointer = module._malloc(res.byteLength);
    heap.set(res, arrPointer / res.BYTES_PER_ELEMENT);

    return arrPointer;
}
function CreateStringArray(module: WASMModule, strs: string[]): [number, ...number[]] {
    const ptrs = strs.map((s) => CreateArray(module, "string", s));
    const res = new Uint32Array(ptrs);

    const arrPointer = module._malloc(res.byteLength);
    module.HEAPU32.set(res, arrPointer / res.BYTES_PER_ELEMENT);

    return [arrPointer, ...ptrs];
}


// I've never hated TypeScript more in my entire fucking existence fucking jesus christ fuck off
type GetArrayParams = {
    type: "char";
    len?: number;
} | {
    type: "string";
    len?: number;
} | {
    type: "string*";
    len?: number;
} | {
    type: "int";
    len: number;
} | {
    type: "double";
    len: number;
};
type GetArrayReturn<T> =
    T extends { type: "char" }
    ? string :
    T extends { type: "string" }
    ? string[] :
    T extends { type: "int"| "double" | "string*" }
    ? number[] : never;
function GetArray<T extends GetArrayParams>(
    module: WASMModule,
    ptr: number,
    o: GetArrayParams,
): GetArrayReturn<T> {
    if (o.type === "char") {
        ptr = ptr / module.HEAPU8.BYTES_PER_ELEMENT;
        let len = o.len;
        if (!len) {
            let pos = ptr;
            while (module.HEAPU8[pos++] !== 0);
            len = pos - ptr - 1;
        }
        const arr = module.HEAPU8.subarray(ptr, ptr + len);
        return new TextDecoder().decode(arr) as GetArrayReturn<T>;
    }
    if (o.type === "string" || o.type === "string*") {
        ptr = ptr / module.HEAPU32.BYTES_PER_ELEMENT;
        let len = o.len;
        if (!len) {
            let pos = ptr;
            while (module.HEAPU32[pos++] !== 0);
            len = pos - ptr - 1;
        }
        const arr = module.HEAPU32.subarray(ptr, ptr + len);
        if (o.type === "string*")
            return [...arr] as GetArrayReturn<T>;
        return [...arr].map((ptr) => GetArray(module, ptr, { type: "char" })) as GetArrayReturn<T>;
    }
    if (o.type === "int") {
        ptr = ptr / module.HEAP32.BYTES_PER_ELEMENT;
        return [...module.HEAP32.subarray(ptr, ptr + o.len)] as GetArrayReturn<T>;
    }
    if (o.type === "double") {
        ptr = ptr / module.HEAPF64.BYTES_PER_ELEMENT;
        return [...module.HEAPF64.subarray(ptr, ptr + o.len)] as GetArrayReturn<T>;
    }
    assertNever(o);
}

function assertNever(x: never): never {
    throw new Error("Unexpected object: " + x);
}

export const CreateWASMInstance = <T extends WASMModule>(module: T) => ({
    create_array:     (...params: CreateArrayParams) => CreateArray(module, ...params),
    create_str_array: (strs: string[]) => CreateStringArray(module, strs),
    free_array:       (arr: number) => module._free(arr),
    get_array:        <T extends GetArrayParams>(arr: number, o: T) => GetArray<T>(module, arr,  o),
    ...module,
});
