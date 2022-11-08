import type {GUID} from "core/utils/GUID";


export type BaseObject = {
    id: GUID;
    zIndex: number;
    name?: string;
}

export const DefaultBaseObject = (id: GUID): BaseObject => ({ id, zIndex: 0, name: undefined });
