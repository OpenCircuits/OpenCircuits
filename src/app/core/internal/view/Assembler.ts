import {Schema} from "core/schema";


export abstract class Assembler<Obj extends Schema.Obj = Schema.Obj> {

    public abstract assemble(obj: Obj, ev: unknown): void;
}
