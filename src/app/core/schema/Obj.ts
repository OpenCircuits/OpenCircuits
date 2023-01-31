import {Component} from "./Component";
import {Port}      from "./Port";
import {Wire}      from "./Wire";


export type Obj = Component | Wire | Port;

export function CloneObj<O extends Obj>(o: O): O {
    return { ...o, props: { ...o.props } };
}
