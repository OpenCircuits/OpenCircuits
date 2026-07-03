import type {
    Circuit,
    Component,
    ComponentInfo,
    ICInfo,
    IntegratedCircuit,
    Node,
    ObjContainer,
    Port,
    ReadonlyComponent,
    ReadonlyIntegratedCircuit,
    ReadonlyNode,
    ReadonlyObjContainer,
    ReadonlyPort,
    ReadonlySelections,
    ReadonlyWire,
    Selections,
    Wire,
} from "shared/api/circuit/public";
import type { AnalogSim } from "./AnalogSim";
import { CircuitInternal } from "shared/api/circuit/internal";

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
};

export type AnalogCircuit = Circuit & {
    readonly sim?: AnalogSim;

    // TODO: Maybe make this factory not depend on CircuitInternal by having the sim library only
    // run on a Netlist, and expose Netlists publically.
    // I.e. instead of sim being Circuit -> Analysis
    // it becomes Netlist -> Analysis and we have an AnalogSim impl here that converts to a netlist and feeds it.
    attachSim(makeSim: (circuit: CircuitInternal) => AnalogSim): void;
};
