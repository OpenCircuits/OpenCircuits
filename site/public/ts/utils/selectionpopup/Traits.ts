import { Vector } from "../math/Vector";

export interface Positionable {
    setPos(v: Vector): void;
    getPos(): Vector;
}

//===========
// DECORATORS
//===========

// const pushKey = Symbol("push");
// const pullKey = Symbol("pull");

// function push(property: string) {
//     return function (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor)
// }