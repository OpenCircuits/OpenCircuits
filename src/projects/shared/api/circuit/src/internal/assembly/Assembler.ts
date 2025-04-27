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

export abstract class Assembler<Obj extends Schema.Obj = Schema.Obj> {
    protected readonly circuit: CircuitInternal;
    protected readonly cache: AssemblyCache;
    protected readonly options: RenderOptions;

    public constructor({ circuit, cache, options }: AssemblerParams) {
        this.circuit = circuit;
        this.cache = cache;
        this.options = options;
    }

    protected isSelected(id: GUID): boolean {
        return this.circuit.getObjByID(id)
            .map((o) => (o.props["isSelected"] ?? false))
            .unwrapOr(false);
    }

    public abstract assemble(obj: Obj, reasons: Set<AssemblyReason>): void;
}
