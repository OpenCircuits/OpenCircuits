import {GUID} from "./GUID";
import {BaseObj} from "./BaseObj";


export interface Wire extends BaseObj {
    baseKind: "Wire";

    p1: GUID;
    p2: GUID;

    props: BaseObj["props"] & {
        zIndex?: number;
        color?: string;
    };
}
