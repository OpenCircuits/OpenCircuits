import "reflect-metadata";

const VERBOSE = false;

export const propsKey = Symbol("__SERIALIZE_PROPS");
const uuidKey = Symbol("__UUID__");
const typeKey = "type";
const dataKey = "data";

type serializeProperties = [new () => Object, [(obj: any, refs: Map<Object, string>, root: any) => any,
                                               (data: any, refs: Map<string, Object>, root: any) => any]];

const serializableObjects = new Map<string, serializeProperties>();

// /** Add built-in objects as serializable */
serializable("Array", [
    (obj: Array<any>, refs: Map<Object, string>, root: any) => {
        return obj.map((v) => serializeProp(v, refs, root));
    },
    (data: Array<any>, refs: Map<string, Object>, root: any) => {
        return data.map((v) => deserializeProp(v, refs, root));
    }
])(Array);
serializable("Set", [
    (obj: Set<any>, refs: Map<Object, string>, root: any) => {
        return Array.from(obj).map((v) => serializeProp(v, refs, root));
    },
    (data: Array<any>, refs: Map<string, Object>, root: any) => {
        return new Set(data.map((v) => deserializeProp(v, refs, root)));
    }
])(Set);
serializable("Function", [
    (obj: Function, _: Map<Object, string>, __: any) => {
        const uuid = Reflect.getMetadata(uuidKey, obj.prototype);
        if (!uuid)
            throw new Error("Attempted to serialize function that is not serializable! " + obj.name);
        return uuid;
    },
    (data: string, refs: Map<string, Object>, root: any) => {
        return serializableObjects.get(data)[0];
    }
])(Function);
// /*****************************************/

export function Serialize(obj: Object): string {
    const root = {};
    serial(obj, new Map<Object, string>(), root);

    if (VERBOSE)
        console.log("Serialized: ", JSON.stringify(root));

    return JSON.stringify(root);
}

function serializeProp(prop: any, refs: Map<Object, string>, root: any): any {
    // primitives should be trivially saved
    if (!(prop instanceof Object))
        return prop;

    // if object is a known type then save it as a reference
    if (serial(prop, refs, root))
        return { "ref": refs.get(prop) }

    // TODO: add check for maps/sets/other built-ins
    throw new Error("Unknown property! " + prop);
}

function serial(obj: Object, refs: Map<Object, string>, root: any): boolean {
    const uuid = Reflect.getMetadata(uuidKey, obj.constructor.prototype);
    // if it's an unknown type, then we can't serialize it
    if (!uuid)
        return false;
    // if we've already serialized the object then ignore
    if (refs.has(obj))
        return true;
    refs.set(obj, ""+refs.size);

    const newObj = {};
    newObj[typeKey] = uuid;
    newObj[dataKey] = {};

    // if custom serialization then use that
    if (serializableObjects.get(uuid)[1]) {
        newObj[dataKey] = serializableObjects.get(uuid)[1][0](obj, refs, root);
    } else { // otherwise go through each key and serialize it
        // get metadata-defined keys or all keys
        let keys = Reflect.getMetadataKeys(obj).filter(key => key != uuidKey);
        if (keys.length == 0)
            keys = Object.keys(obj);
        keys.forEach((key: string) => {
            newObj[dataKey][key] = serializeProp(obj[key], refs, root);
        });
    }

    root[refs.get(obj)] = newObj;
    return true;
}

function deserializeProp(prop: any, refs: Map<string, Object>, root: any): any {
    if (!(prop instanceof Object))
        return prop;

    // reference
    const refNum = prop["ref"];
    if (deserial(refNum, refs, root))
        return refs.get(refNum);

    // TODO: add check for sets/other built-ins
    throw new Error("Unknown property! " + prop);
}

function construct(uuid: string): Object {
    return new (serializableObjects.get(uuid)[0])();
}

function deserial(num: string, refs: Map<string, Object>, root: any): boolean {
    // check if we already deserialized the given obj
    if (refs.has(num))
        return true;

    // if it's an unknown type, then we can't deserialize it
    const uuid = root[num][typeKey];
    if (!serializableObjects.has(uuid))
        return false;

    // custom deserialization
    if (serializableObjects.get(uuid)[1]) {
        const obj = serializableObjects.get(uuid)[1][1](root[num][dataKey], refs, root);
        refs.set(num, obj);
    } else {
        // construct object and set it in map
        const obj = construct(uuid);
        refs.set(num, obj);

        const data = root[num][dataKey];
        for (const key in data) {
            if (key == typeKey)
                continue;
            obj[key] = deserializeProp(data[key], refs, root);
        }
    }

    return true;
}

export function Deserialize<T>(str: string): T {
    const root = JSON.parse(str);
    const map = new Map<string, Object>();

    deserial('0', map, root);

    if (VERBOSE)
        console.log("Deserialized map: ", map);

    return map.get('0') as T;
}

export function serialize(target: any, propertyKey: string): void {
    Reflect.defineMetadata(propertyKey, true, target);
}

export function serializable(uuid: string, customSerialization: [(obj: any, refs: Map<Object, string>, root: any) => any,
                                                                 (obj: any, refs: Map<string, Object>, root: any) => any] = undefined): (c: new () => Object) => void {
    return function(constructor: new () => Object): any {
        if (serializableObjects.has(uuid))
            throw new Error("Object with UUID " + uuid + " already exists! Cannot have duplicates!");
        // define uuid in prototype
        Reflect.defineMetadata(uuidKey, uuid, constructor.prototype);
        serializableObjects.set(uuid, [constructor, customSerialization]);
    }
}