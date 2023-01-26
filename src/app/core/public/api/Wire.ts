import {BaseObject} from "./BaseObject";
import {Port}       from "./Port";


export interface Wire extends BaseObject {
    readonly baseKind: "Wire";

    readonly p1: Port;
    readonly p2: Port;
}
