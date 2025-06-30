import {BaseObj} from "./BaseObj";
import {GUID} from "./GUID";


export interface Component extends BaseObj {
    baseKind: "Component";

    icId?: GUID;

    props: BaseObj["props"] & {
        x?: number;
        y?: number;
        angle?: number;
        zIndex?: number;
    };
}
