import {GUID} from "core/schema/GUID";
import {Prop} from "core/schema/Prop";


export interface BaseObj {
    kind: string;
    id: GUID;
    props: Record<string, Prop> & {
        name?: string;
        zIndex?: number;
    };
}
