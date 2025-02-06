import {Schema} from "core/schema";

import {CircuitInternal}   from "../impl/CircuitInternal";
import {SelectionsManager} from "../impl/SelectionsManager";

import {AssemblyCache} from "./AssemblyCache";
import {RenderOptions} from "./RenderOptions";

export interface AssemblerParams {
    circuit: CircuitInternal;
    cache: AssemblyCache;
    selections: SelectionsManager;
    options: RenderOptions;
}

export enum AssemblyReason {
    Added = 0,
    Removed = 1,
    TransformChanged = 2,
    PortsChanged = 3,
    PropChanged = 4,
    SelectionChanged = 5,
}

export abstract class Assembler<Obj extends Schema.Obj = Schema.Obj> {
    protected readonly circuit: CircuitInternal;
    protected readonly cache: AssemblyCache;
    protected readonly selections: SelectionsManager;
    protected readonly options: RenderOptions;

    public constructor({ circuit, cache, selections, options }: AssemblerParams) {
        this.circuit = circuit;
        this.cache = cache;
        this.selections = selections;
        this.options = options;
    }

    public abstract assemble(obj: Obj, reasons: Set<AssemblyReason>): void;
}
