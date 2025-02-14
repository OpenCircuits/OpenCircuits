import {BaseObj} from "./BaseObj";


export interface Component extends BaseObj {
    baseKind: "Component";

    props: BaseObj["props"] & {
        x?: number;
        y?: number;
        angle?: number;
    };
}
