import type {Vector} from "Vector";
import type {Rect}   from "math/Rect";

import type {
    Circuit,
    Component,
    ComponentInfo,
    ICInfo,
    IntegratedCircuit,
    Node,
    Port,
    ReadonlyCircuit,
    ReadonlyComponent,
    ReadonlyNode,
    ReadonlyPort,
    ReadonlyWire,
    Selections,
    Wire,
} from "shared/api/circuit/public";
import type {Schema} from "shared/api/circuit/schema";

import type {DigitalComponentInfo}          from "./DigitalComponentInfo";
import type {DigitalComponent, DigitalNode, ReadonlyDigitalComponent, ReadonlyDigitalNode} from "./DigitalComponent";
import type {DigitalWire, ReadonlyDigitalWire}                   from "./DigitalWire";
import type {DigitalPort, ReadonlyDigitalPort}                   from "./DigitalPort";
import type {DigitalSchema} from "digital/api/circuit/schema";
import type {ObjContainer, ReadonlyObjContainer} from "shared/api/circuit/public/ObjContainer";


export type ToDigital<T> = (
    // Core types to keep the same and return early on (and prevent infinite recursion)
    T extends Vector ? Vector :
    T extends Rect   ? Rect   :
    // Schema-type
    T extends Schema.Circuit ? DigitalSchema.DigitalCircuit :
    // Base-type replacements
    T extends IntegratedCircuit ? DigitalIntegratedCircuit :
    T extends Circuit           ? DigitalCircuit :
    T extends Node              ? DigitalNode :
    T extends Component         ? DigitalComponent :
    T extends Wire              ? DigitalWire :
    T extends Port              ? DigitalPort :
    T extends ComponentInfo     ? DigitalComponentInfo :
    T extends ICInfo            ? DigitalICInfo :
    T extends Selections        ? APIToDigital<Selections> :
    T extends ObjContainer      ? DigitalObjContainer :
    // Base-Readonly-type replacements
    T extends ReadonlyCircuit      ? ReadonlyDigitalCircuit :
    T extends ReadonlyNode         ? ReadonlyDigitalNode :
    T extends ReadonlyComponent    ? ReadonlyDigitalComponent :
    T extends ReadonlyWire         ? ReadonlyDigitalWire :
    T extends ReadonlyPort         ? ReadonlyDigitalPort :
    T extends ReadonlyObjContainer ? ReadonlyDigitalObjContainer :
    // Replace all method args/return types
    T extends (...a: infer Args) => infer R ? (...a: ToDigital<Args>) => ToDigital<R> :
    // Recursively replace records
    T extends Record<string | number, unknown> ? { [key in keyof T]: ToDigital<T[key]>; } :
    // Replace arrays
    T extends unknown[] ? { [Index in keyof T]: ToDigital<T[Index]>; } :
    // Else just keep the type as it is
    T
);

export type APIToDigital<T> = {
    [key in keyof T]: ToDigital<T[key]>;
}

export type ReadonlyDigitalObjContainer = APIToDigital<ReadonlyObjContainer>;
export type DigitalObjContainer = APIToDigital<ObjContainer>;

export type ReadonlyDigitalCircuit = APIToDigital<ReadonlyCircuit> & {
    readonly propagationTime: number;

    // TODO[model_refactor_api]: Make an API-specific wrapper for this
    readonly simState: DigitalSchema.DigitalSimState;
}
export type DigitalCircuit = APIToDigital<Circuit> & ReadonlyDigitalCircuit & {
    propagationTime: number;

    step(): void;
};

export type DigitalIntegratedCircuit = APIToDigital<IntegratedCircuit> & {
    readonly initialSimState: DigitalSchema.DigitalSimState;
}
export type DigitalICInfo = APIToDigital<ICInfo>;
