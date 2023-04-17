import {BaseObject} from "./BaseObject";
import {Component}  from "./Component";
import {Port}       from "./Port";


export interface Wire extends BaseObject {
    readonly baseKind: "Wire";

    readonly p1: Port;
    readonly p2: Port;

    // TODO[model_refactor_api](leon): Maybe make some Path API object? Could be 'walkable'
    readonly path: Array<Component | Wire>;

    split(): { node: Component, wire1: Wire, wire2: Wire };

    delete(): void;
}
