import {Vector} from "core/public/utils/math/Vector";

import {BaseObject}    from "./BaseObject";
import {ComponentInfo} from "./ComponentInfo";
import {Port}          from "./Port";


export interface Component extends BaseObject {
    readonly baseKind: "Component";
    readonly info: ComponentInfo;

    pos: Vector;
    angle: number;

    readonly ports: Port[];
}
