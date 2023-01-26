import {BaseObject} from "./BaseObject";
import {Component}  from "./Component";


export interface Port extends BaseObject {
    readonly baseKind: "Port";

    readonly parent: Component;
    readonly group: string;
    readonly index: number;
}
