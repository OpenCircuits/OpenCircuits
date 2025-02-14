import {Component} from "./Component";
import {Port}      from "./Port";
import {Wire}      from "./Wire";


export const isObjComponent = <
    ComponentT extends Component = Component,
    WireT extends Wire = Wire,
    PortT extends Port = Port,
>(obj: ComponentT | WireT | PortT): obj is ComponentT => (obj.baseKind === "Component");


export const isObjWire = <
    ComponentT extends Component = Component,
    WireT extends Wire = Wire,
    PortT extends Port = Port,
>(obj: ComponentT | WireT | PortT): obj is WireT => (obj.baseKind === "Wire");


export const isObjPort = <
    ComponentT extends Component = Component,
    WireT extends Wire = Wire,
    PortT extends Port = Port,
>(obj: ComponentT | WireT | PortT): obj is PortT => (obj.baseKind === "Port");
