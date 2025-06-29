import {CircuitInternal, GUID}   from "shared/api/circuit/internal";
import {CircuitAssembler}  from "shared/api/circuit/internal/assembly/CircuitAssembler";
import {RenderOptions}     from "shared/api/circuit/internal/assembly/RenderOptions";

import {Component, Node, ReadonlyComponent}   from "../Component";
import {Port, ReadonlyPort}              from "../Port";
import {ReadonlyWire, Wire}              from "../Wire";
import {Circuit, ICInfo, IntegratedCircuit, ReadonlyCircuit} from "../Circuit";
import {ObjContainer, ReadonlyObjContainer} from "../ObjContainer";
import {ReadonlySelections, Selections} from "../Selections";


// Utility interface to hold utility types for the templated Circuit API.
export type CircuitTypes<
    CircuitT extends Circuit = Circuit,
    RCircuitT extends ReadonlyCircuit = ReadonlyCircuit,

    ComponentT extends Component = Component,
    WireT extends Wire = Wire,
    PortT extends Port = Port,

    RComponentT extends ReadonlyComponent = ReadonlyComponent,
    RWireT extends ReadonlyWire = ReadonlyWire,
    RPortT extends ReadonlyPort = ReadonlyPort,

    NodeT extends Node = Node,

    ICT extends IntegratedCircuit = IntegratedCircuit,
    ICInfoT extends ICInfo = ICInfo,

    ObjContainerT extends ObjContainer = ObjContainer,
    RObjContainerT extends ReadonlyObjContainer = ReadonlyObjContainer,

    SelectionsT extends Selections = Selections,
    RSelectionsT extends ReadonlySelections = ReadonlySelections,
> = {
    "Circuit": CircuitT;
    "ReadonlyCircuit": RCircuitT;

    "Component": ComponentT;
    "Wire": WireT;
    "Port": PortT;
    "Obj": ComponentT | WireT | PortT;

    "ReadonlyComponent": RComponentT;
    "ReadonlyWire": RWireT;
    "ReadonlyPort": RPortT;
    "ReadonlyObj": RComponentT | RWireT | RPortT;

    "Component[]": ComponentT[];
    "Wire[]": WireT[];
    "Port[]": PortT[];
    "Obj[]": Array<ComponentT | WireT | PortT>;

    "ReadonlyComponent[]": RComponentT[];
    "ReadonlyWire[]": RWireT[];
    "ReadonlyPort[]": RPortT[];
    "ReadonlyObj[]": Array<RComponentT | RWireT | RPortT>;

    "IC": ICT;

    "ComponentInfo": ComponentT["info"];

    "Node": NodeT;
    "Path": Array<NodeT | WireT>;
    "IC[]": ICT[];

    "ICInfo": ICInfoT;
    "ObjContainerT": ObjContainerT;
    "ReadonlyObjContainerT": RObjContainerT;

    "SelectionsT": SelectionsT;
    "ReadonlySelectionsT": RSelectionsT;
}

export interface CircuitState<T extends CircuitTypes> {
    internal: CircuitInternal;
    assembler: CircuitAssembler;

    // TODO: Remove this, only Viewport references it
    // -> find options that can be extracted and put in separately that relate to rendering rather than assembly
    renderOptions: RenderOptions;

    constructComponent(id: string, icId?: GUID): T["Component"];
    constructWire(id: string, icId?: GUID): T["Wire"];
    constructPort(id: string, icId?: GUID): T["Port"];
    constructIC(id: string): T["IC"];
    constructComponentInfo(kind: string): T["ComponentInfo"];
    constructObjContainer(objs: Set<GUID>, icId?: GUID): T["ObjContainerT"];
}
