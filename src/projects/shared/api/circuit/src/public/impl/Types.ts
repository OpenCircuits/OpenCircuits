import type {Vector} from "Vector";
import type {Rect} from "math/Rect";

import type {Component, Node, ReadonlyComponent, ReadonlyNode}     from "../Component";
import type {Port, ReadonlyPort}                                   from "../Port";
import type {ReadonlyWire, Wire}                                   from "../Wire";
import type {Circuit, ReadonlyCircuit}                             from "../Circuit";
import type {ObjContainer, ReadonlyObjContainer}                   from "../ObjContainer";
import type {ReadonlySelections, Selections}                       from "../Selections";
import type {ComponentInfo}                                        from "../ComponentInfo";
import type {ICInfo, IntegratedCircuit, ReadonlyIntegratedCircuit} from "../IntegratedCircuit";


export type CircuitTypes = {
    CircuitT: Circuit;
    ReadonlyCircuitT: ReadonlyCircuit;

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

// Utility interface to hold types for the templated Circuit API.
// Includes more than what `CircuitTypes` provides, like `Obj`, and array types.
export type CircuitAPITypes<Types extends CircuitTypes = CircuitTypes> = {
    "Circuit": Types["CircuitT"];
    "ReadonlyCircuit": Types["ReadonlyCircuitT"];

    "Component": Types["ComponentT"];
    "Node": Types["NodeT"];
    "Wire": Types["WireT"];
    "Port": Types["PortT"];
    "Obj": Types["ComponentT"] | Types["WireT"] | Types["PortT"];

    "ReadonlyComponent": Types["ReadonlyComponentT"];
    "ReadonlyNode": Types["ReadonlyNodeT"];
    "ReadonlyWire": Types["ReadonlyWireT"];
    "ReadonlyPort": Types["ReadonlyPortT"];
    "ReadonlyObj": Types["ReadonlyComponentT"] | Types["ReadonlyWireT"] | Types["ReadonlyPortT"];

    "Component[]": Array<Types["ComponentT"]>;
    "Wire[]": Array<Types["WireT"]>;
    "Port[]": Array<Types["PortT"]>;
    "Obj[]": Array<Types["ComponentT"] | Types["WireT"] | Types["PortT"]>;

    "ReadonlyComponent[]": Array<Types["ReadonlyComponentT"]>;
    "ReadonlyWire[]": Array<Types["ReadonlyWireT"]>;
    "ReadonlyPort[]": Array<Types["ReadonlyPortT"]>;
    "ReadonlyObj[]": Array<Types["ReadonlyComponentT"] | Types["ReadonlyWireT"] | Types["ReadonlyPortT"]>;

    "IC": Types["IntegratedCircuitT"];
    "ReadonlyIC": Types["ReadonlyIntegratedCircuitT"];
    "IC[]": Array<Types["IntegratedCircuitT"]>;
    "ReadonlyIC[]": Array<Types["ReadonlyIntegratedCircuitT"]>;

    "Path": Array<Types["NodeT"] | Types["WireT"]>;

    "ICInfo": Types["ICInfoT"];
    "ComponentInfo": Types["ComponentInfoT"];

    "ObjContainerT": Types["ObjContainerT"];
    "ReadonlyObjContainerT": Types["ReadonlyObjContainerT"];

    "SelectionsT": Types["SelectionsT"];
    "ReadonlySelectionsT": Types["ReadonlySelectionsT"];
}

export type ReplaceAPITypes<T, Types extends CircuitTypes> = (
    // Core types to keep the same and return early on (and prevent infinite recursion)
    T extends Vector ? Vector :
    T extends Rect   ? Rect   :
    // Base-type replacements
    T extends IntegratedCircuit ? Types["IntegratedCircuitT"] :
    T extends Circuit           ? Types["CircuitT"]           :
    T extends Node              ? Types["NodeT"]              :
    T extends Component         ? Types["ComponentT"]         :
    T extends Wire              ? Types["WireT"]              :
    T extends Port              ? Types["PortT"]              :
    T extends ObjContainer      ? Types["ObjContainerT"]      :
    T extends Selections        ? Types["SelectionsT"]        :
    T extends ComponentInfo     ? Types["ComponentInfoT"]     :
    T extends ICInfo            ? Types["ICInfoT"]            :
    // Base-Readonly-type replacements
    T extends ReadonlyIntegratedCircuit ? Types["ReadonlyIntegratedCircuitT"] :
    T extends ReadonlyCircuit           ? Types["ReadonlyCircuitT"]           :
    T extends ReadonlyNode              ? Types["ReadonlyNodeT"]              :
    T extends ReadonlyComponent         ? Types["ReadonlyComponentT"]         :
    T extends ReadonlyWire              ? Types["ReadonlyWireT"]              :
    T extends ReadonlyPort              ? Types["ReadonlyPortT"]              :
    T extends ReadonlyObjContainer      ? Types["ReadonlyObjContainerT"]      :
    T extends ReadonlySelections        ? Types["ReadonlySelectionsT"]        :
    // Replace all method args/return types
    T extends (...a: infer Args) => infer R ? (...a: ReplaceAPITypes<Args, Types>) => ReplaceAPITypes<R, Types> :
    // Recursively replace records
    T extends Record<string | number, unknown> ? { [key in keyof T]: ReplaceAPITypes<T[key], Types>; } :
    // Replace arrays
    T extends unknown[] ? { [Index in keyof T]: ReplaceAPITypes<T[Index], Types>; } :
    // Else just keep the type as it is
    T
);
