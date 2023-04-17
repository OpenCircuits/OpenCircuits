import {Vector} from "Vector";

import {BaseObject}    from "./BaseObject";
import {ComponentInfo} from "./ComponentInfo";
import {Port}          from "./Port";
import {Wire}          from "./Wire";


export interface Component extends BaseObject {
    readonly baseKind: "Component";
    readonly info: ComponentInfo;

    x: number;
    y: number;
    pos: Vector;
    angle: number;

    isNode(): this is Node;

    readonly ports: Record<string, Port[]>;
    readonly allPorts: Port[];

    readonly connectedComponents: Component[];

    setNumPorts(group: string, amt: number): boolean;
    firstAvailable(group: string): Port | undefined;

    delete(): void;
}

export interface Node extends Component {
    snip(): Wire;
}
