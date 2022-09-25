import type {GUID} from "core/utils/GUID";


export type BaseObject = {
    id: GUID;
    name?: string;
}

export const DefaultBaseObject = (id: GUID): BaseObject => ({ id, name: undefined });
