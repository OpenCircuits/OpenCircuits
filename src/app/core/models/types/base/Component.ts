import {GUID} from "core/utils/GUID";

import {BaseObject, DefaultBaseObject} from "./BaseObject";


export type Component = BaseObject & {
    baseKind: "Component";

    x: number;
    y: number;
    angle: number;
}

export type ComponentFactory<C extends Component> = (id: GUID) => C;

export const DefaultComponent: ComponentFactory<Component> =
    (id) => ({ ...DefaultBaseObject(id), baseKind: "Component", x: 0, y: 0, angle: 0 });
