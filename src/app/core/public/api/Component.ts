import {Vector} from "Vector";

import {BaseObject}    from "./BaseObject";
import {ComponentInfo} from "./ComponentInfo";
import {Port}          from "./Port";


export interface Component extends BaseObject {
    readonly baseKind: "Component";
    readonly info: ComponentInfo;

    x: number;
    y: number;
    pos: Vector;
    angle: number;

    readonly ports: Record<string, Port[]>;

    setNumPorts(group: string, amt: number): boolean;
    firstAvailable(group: string): Port | undefined;
}