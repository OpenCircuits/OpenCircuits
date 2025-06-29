import {GUID, Schema} from "shared/api/circuit/schema";

import {CircuitInternal}   from "../impl/CircuitInternal";

import {AssemblyCache} from "./AssemblyCache";
import {RenderOptions} from "./RenderOptions";

export interface AssemblerParams {
    circuit: CircuitInternal;
    cache: AssemblyCache;
    options: RenderOptions;
}

export enum AssemblyReason {
    Added = 0,
    Removed = 1,
    TransformChanged = 2,
    PortsChanged = 3,
    PropChanged = 4,
    SelectionChanged = 5,
    StateUpdated = 6, // Used for digital simulation state
    SignalsChanged = 7, // Used for digital simulation signals
}

export type AssemblyReasonPropMapping = Record<string, AssemblyReason>;

export abstract class Assembler<Obj extends Schema.Obj = Schema.Obj> {
    protected readonly circuit: CircuitInternal;
    protected readonly cache: AssemblyCache;
    protected readonly options: RenderOptions;
    protected readonly propMapping: AssemblyReasonPropMapping;

    public constructor({ circuit, cache, options }: AssemblerParams, propMapping?: AssemblyReasonPropMapping) {
        this.circuit = circuit;
        this.cache = cache;
        this.options = options;
        this.propMapping = {
            "isSelected": AssemblyReason.SelectionChanged,
            ...propMapping,
        };
    }

    protected isSelected(id: GUID): boolean {
        return this.circuit.getObjByID(id)
            .map((o) => (o.props["isSelected"] ?? false))
            .unwrapOr(false);
    }

    public abstract assemble(obj: Obj, reasons: Set<AssemblyReason>): void;

    // Provides a mapping of obj-specific properties, to more specific AssemblyReasons.
    // i.e. isSelected changing -> AssemblyReason.SelectionsChanged
    //      x/y/angle changing -> AssemblyReason.TransformChanged
    // as opposed to the generic Assembly.PropChanged which has little information
    public getPropMappings(): AssemblyReasonPropMapping {
        return this.propMapping;
    }
}
