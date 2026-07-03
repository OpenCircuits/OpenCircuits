import type {
    Circuit,
    ICInfo,
    IntegratedCircuit,
    ReadonlyCircuit,
    ReadonlyIntegratedCircuit,
    ReadonlySelections,
    Selections,
} from "shared/api/circuit/public";

import type {DigitalComponentInfo}          from "./DigitalComponentInfo";
import type {DigitalComponent, DigitalNode, ReadonlyDigitalComponent, ReadonlyDigitalNode} from "./DigitalComponent";
import type {DigitalWire, ReadonlyDigitalWire}                   from "./DigitalWire";
import type {DigitalPort, ReadonlyDigitalPort}                   from "./DigitalPort";
import type {DigitalSchema} from "digital/api/circuit/schema";
import type {ObjContainer, ReadonlyObjContainer} from "shared/api/circuit/public/ObjContainer";
import type {ReplaceAPITypes} from "shared/api/circuit/public/impl/Types";
import type {DigitalSim, ReadonlyDigitalSim, ReadonlySimState} from "./DigitalSim";


export type DigitalTypes = {
    CircuitT: DigitalCircuit;
    ReadonlyCircuitT: ReadonlyDigitalCircuit;

    IntegratedCircuitT: DigitalIntegratedCircuit;
    ReadonlyIntegratedCircuitT: ReadonlyDigitalIntegratedCircuit;

    NodeT: DigitalNode;
    ReadonlyNodeT: ReadonlyDigitalNode;

    ComponentT: DigitalComponent;
    ReadonlyComponentT: ReadonlyDigitalComponent;

    WireT: DigitalWire;
    ReadonlyWireT: ReadonlyDigitalWire;

    PortT: DigitalPort;
    ReadonlyPortT: ReadonlyDigitalPort;

    ObjContainerT: DigitalObjContainer;
    ReadonlyObjContainerT: ReadonlyDigitalObjContainer;

    SelectionsT: DigitalSelections;
    ReadonlySelectionsT: ReadonlyDigitalSelections;

    ComponentInfoT: DigitalComponentInfo;
    ICInfoT: DigitalICInfo;
}

export type ToDigital<T> = ReplaceAPITypes<T, DigitalTypes>;

export type APIToDigital<T> = {
    [key in keyof T]: ToDigital<T[key]>;
}

export type ReadonlyDigitalObjContainer = APIToDigital<ReadonlyObjContainer> & {
    readonly simState: ReadonlySimState;
}
export type DigitalObjContainer = APIToDigital<ObjContainer> & ReadonlyDigitalObjContainer;

export type ReadonlyDigitalSelections = APIToDigital<ReadonlySelections> & ReadonlyDigitalObjContainer;
export type DigitalSelections = APIToDigital<Selections> &  APIToDigital<Omit<ObjContainer, "select">> & ReadonlyDigitalObjContainer;

export type ReadonlyDigitalCircuit = APIToDigital<ReadonlyCircuit> & {
    readonly sim: ReadonlyDigitalSim;
}

export type DigitalCircuit = APIToDigital<Circuit> & ReadonlyDigitalCircuit & {
    readonly sim: DigitalSim;
};

export type ReadonlyDigitalIntegratedCircuit = APIToDigital<ReadonlyIntegratedCircuit> & {
    readonly initialSimState: Readonly<DigitalSchema.DigitalSimState>;
}
export type DigitalIntegratedCircuit = APIToDigital<IntegratedCircuit> & {
    readonly initialSimState: DigitalSchema.DigitalSimState;
}
export type DigitalICInfo = APIToDigital<ICInfo>;
