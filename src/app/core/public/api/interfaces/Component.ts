import {Vector} from "core/public/utils/math/Vector";
import {IBaseObject} from "./BaseObject";
import {IComponentInfo} from "./ComponentInfo";
import {IPort} from "./Port";


export interface IComponent extends IBaseObject {
    readonly baseKind: "Component";
    readonly info: IComponentInfo;

    pos: Vector;
    angle: number;

    readonly ports: IPort[];
}
