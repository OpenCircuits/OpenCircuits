import {Vector} from "Vector";

import {Transform} from "math/Transform";

import {Component} from "core/models/Component";


export interface Pressable extends Component {
    press(): void;
    click(): void;
    release(): void;
    isWithinPressBounds(v: Vector): boolean;
    getPressableBox(): Transform;
}

export function isPressable(p: unknown): p is Pressable {
    if (!(p instanceof Component))
        return false;
    return (p as Pressable).press   !== undefined &&
           (p as Pressable).click   !== undefined &&
           (p as Pressable).release !== undefined;
}
