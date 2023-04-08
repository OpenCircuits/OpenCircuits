import {Vector} from "Vector";

import {BaseObject} from "./BaseObject";
import {Component}  from "./Component";
import {Wire}       from "./Wire";


export interface Port extends BaseObject {
    readonly baseKind: "Port";

    readonly parent: Component;
    readonly group: string;
    readonly index: number;

    readonly originPos: Vector;
    readonly targetPos: Vector;

    readonly connections: Wire[];
    // TODO[model_refactor_api]: What about nodes? Should this be endpoint non-node components?
    readonly connectedPorts: Port[];
    // TODO[model_refactor_api]: connectedComponents?

    connectTo(other: Port): void;
}
