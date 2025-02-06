import {CircuitInternal}   from "core/internal";
import {SelectionsManager} from "core/internal/impl/SelectionsManager";
import {CircuitAssembler}  from "core/internal/assembly/CircuitAssembler";
import {RenderOptions}     from "core/internal/assembly/RenderOptions";

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
    assembler: CircuitAssembler;
    selectionsManager: SelectionsManager;
    renderOptions: RenderOptions;

    isLocked: boolean;

    constructComponent(id: string): T["Component"];
    constructWire(id: string): T["Wire"];
    constructPort(id: string): T["Port"];
}
