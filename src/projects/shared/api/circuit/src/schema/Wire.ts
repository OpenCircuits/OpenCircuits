import { BaseObj } from "./BaseObj";
import { GUID } from "./GUID";

export interface Wire extends BaseObj {
    baseKind: "Wire";

    p1: GUID;
    p2: GUID;

    props: BaseObj["props"] & {
        zIndex?: number;
        color?: string;
    };
}
