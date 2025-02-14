import {CircuitInternal}   from "shared/api/circuit/internal";
import {CircuitLog}        from "shared/api/circuit/internal/impl/CircuitLog";
import {CircuitDocument}   from "shared/api/circuit/internal/impl/CircuitDocument";
import {SelectionsManager} from "shared/api/circuit/internal/impl/SelectionsManager";
import {CircuitAssembler}  from "shared/api/circuit/internal/assembly/CircuitAssembler";
import {RenderOptions}     from "shared/api/circuit/internal/assembly/RenderOptions";

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
    log: CircuitLog;
    doc: CircuitDocument;
    internal: CircuitInternal;
    assembler: CircuitAssembler;
    selectionsManager: SelectionsManager;
    renderOptions: RenderOptions;

    constructComponent(id: string): T["Component"];
    constructWire(id: string): T["Wire"];
    constructPort(id: string): T["Port"];
}
