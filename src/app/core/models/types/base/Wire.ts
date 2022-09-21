import {GUID} from "core/utils/GUID";

import {BaseObject} from "./BaseObject";


export type Wire = BaseObject & {
    baseKind: "Wire";

    p1: GUID;
    p2: GUID;

    color: string;
}
