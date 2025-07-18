import type {Circuit, Component, ComponentInfo, ICInfo, IntegratedCircuit, Node, ObjContainer, Port, ReadonlyComponent, ReadonlyIntegratedCircuit, ReadonlyNode, ReadonlyObjContainer, ReadonlyPort, ReadonlySelections, ReadonlyWire, Selections, Wire} from "shared/api/circuit/public";
import type {AnalogSim} from "./AnalogSim";


export type AnalogTypes = {
    CircuitT: AnalogCircuit;
    ReadonlyCircuitT: AnalogCircuit;

    IntegratedCircuitT: IntegratedCircuit;
    ReadonlyIntegratedCircuitT: ReadonlyIntegratedCircuit;

    NodeT: Node;
    ReadonlyNodeT: ReadonlyNode;

    ComponentT: Component;
    ReadonlyComponentT: ReadonlyComponent;

    WireT: Wire;
    ReadonlyWireT: ReadonlyWire;

    PortT: Port;
    ReadonlyPortT: ReadonlyPort;

    ObjContainerT: ObjContainer;
    ReadonlyObjContainerT: ReadonlyObjContainer;

    SelectionsT: Selections;
    ReadonlySelectionsT: ReadonlySelections;

    ComponentInfoT: ComponentInfo;
    ICInfoT: ICInfo;
}

export type AnalogCircuit = Circuit & {
    sim: AnalogSim;
}
