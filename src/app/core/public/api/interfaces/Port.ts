import {IBaseObject} from "./BaseObject";
import {IComponent} from "./Component";


export interface IPort extends IBaseObject {
    readonly baseKind: "Port";

    readonly parent: IComponent;
    readonly group: string;
    readonly index: number;
}
