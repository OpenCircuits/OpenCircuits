import {BaseObject} from "./BaseObject";
import {Component}  from "./Component";
import {Wire}      from "./Wire";


export interface Port extends BaseObject {
    readonly baseKind: "Port";

    readonly parent: Component;
    readonly group: string;
    readonly index: number;

    connectTo(other: Port): Wire | undefined;
}
