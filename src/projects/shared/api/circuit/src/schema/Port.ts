import { BaseObj } from "./BaseObj";
import { GUID } from "./GUID";

export interface Port extends BaseObj {
    baseKind: "Port";

    parent: GUID;
    group: string;
    index: number;
}
