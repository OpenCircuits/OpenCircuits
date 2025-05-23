import {uuid} from "shared/api/circuit/public";

export interface Ref {
    ref: string;
}
export interface SerializationEntry {
    type: string;
    data: Record<string, string | number | boolean | Ref>;
}
export interface SerializationArrayEntry {
    // Sets are stored as arrays so they are functionally the same here
    type: "Array" | "Set";
    data: Array<string | number | boolean | Ref>;
}

export function isRef(o: unknown): o is Ref {
    if (!o || typeof o !== "object")
        return false;
    return ("ref" in o);
}
export function isEntry(o: unknown): o is SerializationEntry {
    if (!o || typeof o !== "object")
        return false;
    return ("type" in o && "data" in o);
}
export function isArrayEntry(o: unknown): o is SerializationArrayEntry {
    return (isEntry(o) && (o.type === "Array" || o.type === "Set") && Array.isArray(o.data));
}


export type WithAdditionalProperty<T, O> = T extends any[] ?
    { [P in keyof T]: WithAdditionalProperty<T[P], O> }
    : T extends object
    ? { [P in keyof T]: WithAdditionalProperty<T[P], O> } & O
    : T;

export type Entry<T> = WithAdditionalProperty<T, { "type": string, "ref": string }>;
export function MakeEntry<T>(contents: Record<string, SerializationEntry>, curRef: string): Readonly<Entry<T>> {
    const curEntry = contents[curRef];
    if (isArrayEntry(curEntry)) {
        const obj = curEntry.data.map((val) => {
            if (isRef(val))
                return MakeEntry(contents, val.ref);
            return val;
        });
        Object.defineProperty(obj, "type", { value: curEntry.type });
        Object.defineProperty(obj, "ref", { value: curRef });
        return obj as Entry<T>;
    }

    const obj = {};
    for (const [key, val] of Object.entries(curEntry.data)) {
        if (key === "type")  // PortSet has a type property we can skip since we're setting `type` below.
            continue;

        if (isRef(val))
            Object.defineProperty(obj, key, { get: () => MakeEntry(contents, val.ref) });
        else
            Object.defineProperty(obj, key,  { value: val });
    }
    Object.defineProperty(obj, "type", { value: curEntry.type });
    Object.defineProperty(obj, "ref", { value: curRef });
    return obj as Entry<T>;
}

// "Decompress" the Serialeazy map so that there are no inlined SerializationEntries
export function Decompress(contents: Record<string, SerializationEntry>) {
    const keysToIterate = Object.keys(contents);

    while (keysToIterate.length > 0) {
        const key = keysToIterate.pop()!;
        const { data } = contents[key];

        for (const [key, val] of Object.entries(data)) {
            if (isEntry(val)) {
                const id = uuid();
                data[key] = { ref: id };
                contents[id] = val;
                keysToIterate.push(id);
            }
        }
    }

    return contents;
}
