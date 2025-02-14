import {GUID} from "shared/api/circuit/schema/GUID";
import {BaseObj} from "./BaseObj";


export interface Wire extends BaseObj {
    baseKind: "Wire";

    p1: GUID;
    p2: GUID;

    props: BaseObj["props"] & {
        color?: string;
    };
}
