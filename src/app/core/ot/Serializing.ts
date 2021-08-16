import 'reflect-metadata'

export const uuidKey = Symbol("__UUID__");

export type SerializeProperties<T> = {
    constructor: new () => T
};

export const SerializableObjects = (() => {
    const serializableObjects = new Map<string, SerializeProperties<any>>();
    return {
        add(uuid: string, props: SerializeProperties<any>): void {
            serializableObjects.set(uuid, props);
        },
        create(uuid: string) {
            return new (serializableObjects.get(uuid).constructor)();
        },
        construct(uuid: string) {
            return this.create(uuid);
        },
        has(uuid: string): boolean {
            return serializableObjects.has(uuid);
        },
        get(uuid: string): SerializeProperties<any> {
            return serializableObjects.get(uuid);
        }
    };
})();

export function message<T>(uuid: string): (c: new () => T) => void {
    return function (constructor: new () => T): any {
        if (SerializableObjects.has(uuid))
            throw new Error("Object with UUID " + uuid + " already exists! Cannot have duplicates!");
        // define uuid in prototype
        Reflect.defineMetadata(uuidKey, uuid, constructor.prototype);
        SerializableObjects.add(uuid, {constructor});
    }
}

export function deserialize<T>(tgt: T, s: string): T | undefined {
    let src: any = JSON.parse(s);
    if (typeof src != typeof tgt) {
        console.log(`type mismatch between target (${typeof tgt}) and source (${typeof src})`);
        return undefined;
    }
    if (!(src instanceof Object)) {
        return src;
    }

    return rebuild_poly_types(tgt, src) ? tgt : undefined;
}

export function deserialize_poly<T>(s: string): T | undefined {
    let src: any = JSON.parse(s);
    if (!(src instanceof Object)) {
        return src;
    }
    const uuid = src["_type_"];
    if (uuid === undefined) {
        console.log("cannot deserialize anonymous type");
        return undefined;
    }
    if (!SerializableObjects.has(uuid)) {
        console.log("cannot deserialize non-polymorphic object");
        return undefined;
    }
    const pObj = SerializableObjects.construct(uuid);

    return rebuild_poly_types(pObj, src) ? pObj : undefined;
}

function rebuild_poly_types(tgt: any, src: any): boolean {
    // go through each property of "src"
    for (const key of Object.keys(src)) {
        if (key === "_type_")
            continue;
        const src_prop = src[key];
        if (tgt[key] == undefined) {
            if (!(tgt instanceof Array || tgt instanceof Map)) {
                console.log(`erroneous property ${key} on fixed-size type`);
                return false;
            }
        } else if (typeof src_prop != typeof tgt[key]) {
            console.log("property type mismatch");
            return false;
        }
        if (src_prop instanceof Object) {
            // The property is polymorphic
            const uuid = src_prop["_type_"];
            if (uuid != undefined) {
                if (!SerializableObjects.has(uuid)) {
                    console.log("property type not found");
                    return false;
                }
                const pObj = SerializableObjects.construct(uuid);
                tgt[key] = pObj;
            } else {
                // No type annotation, so believe remote
                tgt[key] = src_prop;
            }

            if (!rebuild_poly_types(tgt[key], src_prop))
                return false;
        } else {
            tgt[key] = src_prop;
        }
    }
    return true;
}

export function serialize(o: any): string | undefined {
    if (!(o instanceof Object)) {
        return JSON.stringify(o);
    } else {
        const r = type_annotate(o);
        if (r == undefined)
            return undefined;
        return JSON.stringify(r);
    }
}
export function type_annotate(o: Object): Object | undefined {
    let obj: any = o;

    const uuid = Reflect.getMetadata(uuidKey, o.constructor.prototype);
    if (uuid != undefined) {
        obj["_type_"] = uuid;
    }

    // go through each key and serialize it
    const data: any = {};
    for (const key of Object.keys(o)) {
        const prop = obj[key];
        if (!(prop instanceof Object)) {
            // primitives should be trivially saved
            data[key] = obj[key];
        } else {
            const v = type_annotate(obj[key]);
            if (v === undefined)
                return undefined;
        }
    }
    return o;
}