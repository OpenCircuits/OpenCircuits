import {CircuitInternal, GUID}   from "shared/api/circuit/internal";
import {CircuitAssembler}  from "shared/api/circuit/internal/assembly/CircuitAssembler";
import {RenderOptions}     from "shared/api/circuit/internal/assembly/RenderOptions";

import {Component, Node}   from "../Component";
import {Port}              from "../Port";
import {Wire}              from "../Wire";
import {Circuit, ICInfo, IntegratedCircuit} from "../Circuit";


// Utility interface to hold utility types for the templated Circuit API.
export type CircuitTypes<
    CircuitT extends Circuit = Circuit,
    ComponentT extends Component = Component,
    WireT extends Wire = Wire,
    PortT extends Port = Port,
    NodeT extends Node = Node,
    ICT extends IntegratedCircuit = IntegratedCircuit,
    ICInfoT extends ICInfo = ICInfo,
> = {
    "Circuit": CircuitT;

    "Component": ComponentT;
    "Wire": WireT;
    "Port": PortT;
    "Obj": ComponentT | WireT | PortT;

    "IC": ICT;

    "ComponentInfo": ComponentT["info"];

    "Node": NodeT;
    "Path": Array<NodeT | WireT>;

    "Component[]": ComponentT[];
    "Wire[]": WireT[];
    "Port[]": PortT[];
    "Obj[]": Array<ComponentT | WireT | PortT>;
    "IC[]": ICT[];

    "ICInfo": ICInfoT;
}

export interface CircuitState<T extends CircuitTypes> {
    internal: CircuitInternal;
    assembler: CircuitAssembler;

    // TODO: Remove this, only Viewport references it
    // -> find options that can be extracted and put in separately that relate to rendering rather than assembly
    renderOptions: RenderOptions;

    constructComponent(id: string): T["Component"];
    constructWire(id: string): T["Wire"];
    constructPort(id: string): T["Port"];
    constructIC(id: string): T["IC"];
    constructComponentInfo(kind: string): T["ComponentInfo"];
}
