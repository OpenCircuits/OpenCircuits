import {Prim} from "core/internal/assembly/Prim";


export abstract class PrimRenderer<P extends Prim = Prim> {
    public abstract render(ctx: CanvasRenderingContext2D, prim: P): void;
}
