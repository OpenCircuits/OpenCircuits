import {GUID} from "./GUID";


export interface CircuitMetadata {
    id: GUID;
    name: string;
    desc: string;
    thumb: string;
    version: `${string}/${string}`; // i.e. "digital/v0"
}
