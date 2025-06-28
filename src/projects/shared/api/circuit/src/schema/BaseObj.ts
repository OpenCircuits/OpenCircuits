import {GUID} from "./GUID";
import {Prop} from "./Prop";


export interface BaseObj {
    kind: string;
    id: GUID;
    props: Record<string, Prop> & {
        name?: string;
        isSelected?: boolean;
    };
}
