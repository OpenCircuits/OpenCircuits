import {GUID} from "core/utils/GUID";

import {DefaultTransform, Transformable} from "../../Transformable";

import {BaseObject, DefaultBaseObject} from "./BaseObject";


export type Component = BaseObject & Transformable & {
    baseKind: "Component";
}

export const DefaultComponent =
    (id: GUID): Component =>
        ({ baseKind: "Component", ...DefaultBaseObject(id), ...DefaultTransform() });
