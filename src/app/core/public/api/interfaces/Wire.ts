import {IBaseObject} from "./BaseObject";
import {IPort} from "./Port";


export interface IWire extends IBaseObject {
    readonly baseKind: "Wire";

    readonly p1: IPort;
    readonly p2: IPort;
}
