import {Schema} from "core/schema";

import {CircuitInternal}   from "../impl/CircuitInternal";
import {SelectionsManager} from "../impl/SelectionsManager";

import {RenderOptions} from "./rendering/RenderOptions";
import {AssemblyCache} from "./AssemblyCache";

export interface AssemblerParams {
    circuit: CircuitInternal;
    cache: AssemblyCache;
    selections: SelectionsManager;
    options: RenderOptions;
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

    public abstract assemble(obj: Obj, ev: unknown): void;
}
