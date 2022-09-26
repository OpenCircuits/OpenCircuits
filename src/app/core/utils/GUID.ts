import {v4} from "uuid";


export type GUID = string;

export const uuid = (): GUID => (v4());
