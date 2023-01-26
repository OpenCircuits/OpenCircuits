import {GUID} from "core/schema/GUID";
import {BaseObj} from "./BaseObj";


export interface Port extends BaseObj {
    baseKind: "Port";

    parent: GUID;
    group: string;
    index: number;
}
