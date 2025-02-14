import {GUID} from "shared/api/circuit/schema/GUID";
import {Prop} from "shared/api/circuit/schema/Prop";


export interface BaseObj {
    kind: string;
    id: GUID;
    props: Record<string, Prop> & {
        name?: string;
        zIndex?: number;
    };
}
