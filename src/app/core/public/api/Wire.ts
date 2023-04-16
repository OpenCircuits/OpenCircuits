import {BaseObject} from "./BaseObject";
import {Component}  from "./Component";
import {Port}       from "./Port";


export interface Wire extends BaseObject {
    readonly baseKind: "Wire";

    readonly p1: Port;
    readonly p2: Port;

    split(): { node: Component, wire1: Wire, wire2: Wire };

    delete(): void;
}
