import {GUID} from "./GUID";
import {Prop} from "./Prop";


export interface CircuitMetadata {
    id: GUID;
    name: string;
    desc: string;
    thumb: string;
    version: `${string}/${string}`; // i.e. "digital/v0"
}
