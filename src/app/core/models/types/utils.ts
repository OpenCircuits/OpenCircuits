import {Component} from "./base/Component";
import {Port}      from "./base/Port";
import {Wire}      from "./base/Wire";

import {AnyObj} from ".";

// These are utility types that can help get a certain base type from a set of any object.
// This is needed instead of `AnyComponent`, because if we have a generic "Objs" that is
//  a subtype of "AnyObj", we could have something like
//  `Objs = ANDGate | ORGate | DigitalWire | DigitalPort`
// If we used `AnyComponent`, then there would be the option of things like Resistor | Inductor.
// But with this type, `AnyComponentFrom<Objs>` would become `ANDGate | ORGate` only.
export type AnyComponentFrom<Obj extends AnyObj> = (Obj extends Component ? Obj : never);
export type AnyWireFrom     <Obj extends AnyObj> = (Obj extends Wire      ? Obj : never);
export type AnyPortFrom     <Obj extends AnyObj> = (Obj extends Port      ? Obj : never);
