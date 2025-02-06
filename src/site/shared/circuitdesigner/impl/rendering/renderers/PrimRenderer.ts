import {Prim} from "core/internal/assembly/Prim";
// import {RenderInfoCache} from "./RenderInfoCache";


export interface PrimRendererParams {
    // circuit: CircuitInternal;
    // cache: RenderInfoCache;
    // selections: SelectionsManager;
    // options: AssemblyOptions;
}

export abstract class PrimRenderer<P extends Prim = Prim> {
    // protected readonly circuit: CircuitInternal;
    // protected readonly cache: RenderInfoCache;
    // protected readonly selections: SelectionsManager;
    // protected readonly options: AssemblyOptions;

    public constructor({ }: PrimRendererParams) {
        // this.circuit = circuit;
        // this.cache = cache;
        // this.selections = selections;
        // this.options = options;
    }

    public abstract render(ctx: CanvasRenderingContext2D, prim: P): void;
}
