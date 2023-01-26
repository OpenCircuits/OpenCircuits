import {Prop} from "core/public/Prop";
import {GUID} from "core/schema/GUID";


export interface BaseObj {
    kind: string;
    id: GUID;
    props: Record<string, Prop> & {
        name?: string;
        zIndex?: number;
    };
}
