import {CircuitInternal}   from "shared/api/circuit/internal";
import {CircuitAssembler}  from "shared/api/circuit/internal/assembly/CircuitAssembler";
import {RenderOptions}     from "shared/api/circuit/internal/assembly/RenderOptions";

import {Component, Node}   from "../Component";
import {Port, ReadonlyPort}              from "../Port";
import {Wire}              from "../Wire";
import {Circuit, ICInfo, IntegratedCircuit} from "../Circuit";
import {ObjContainer, ReadonlyObjContainer} from "../ObjContainer";


// Utility interface to hold utility types for the templated Circuit API.
export type CircuitTypes<
    CircuitT extends Circuit = Circuit,
    ComponentT extends Component = Component,
    WireT extends Wire = Wire,
    PortT extends Port = Port,
    RPortT extends ReadonlyPort = ReadonlyPort,
    NodeT extends Node = Node,
    ICT extends IntegratedCircuit = IntegratedCircuit,
    ICInfoT extends ICInfo = ICInfo,
    ObjContainerT extends ObjContainer = ObjContainer,
    RObjContainerT extends ReadonlyObjContainer = ReadonlyObjContainer,
> = {
    "Circuit": CircuitT;

    "Component": ComponentT;
    "Wire": WireT;
    "ReadonlyPort": RPortT;
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
    "ObjContainerT": ObjContainerT;
    "ReadonlyObjContainerT": RObjContainerT;
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
