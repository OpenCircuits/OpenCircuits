import {CircuitInternal}   from "core/internal";
import {SelectionsManager} from "core/internal/impl/SelectionsManager";
import {CircuitView}       from "core/internal/view/CircuitView";

import {Component, Node} from "../Component";
import {Port}            from "../Port";
import {Wire}            from "../Wire";


// Utility interface to hold utility types for the templated Circuit API.
export type CircuitTypes<
    ComponentT extends Component = Component,
    WireT extends Wire = Wire,
    PortT extends Port = Port,
    NodeT extends Node = Node,
> = {
    "Component": ComponentT;
    "Wire": WireT;
    "Port": PortT;
    "Obj": ComponentT | WireT | PortT;

    "ComponentInfo": ComponentT["info"];

    "Node": NodeT;
    "Path": Array<NodeT | WireT>;

    "Component[]": ComponentT[];
    "Wire[]": WireT[];
    "Port[]": PortT[];
    "Obj[]": Array<ComponentT | WireT | PortT>;
}

export interface CircuitState<T extends CircuitTypes> {
    internal: CircuitInternal;
    view: CircuitView;
    selectionsManager: SelectionsManager;

    isLocked: boolean;

    constructComponent(id: string): T["Component"];
    constructWire(id: string): T["Wire"];
    constructPort(id: string): T["Port"];
    constructObj(id: string): T["Obj"];
}
