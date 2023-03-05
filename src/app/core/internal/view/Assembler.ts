import {Schema}            from "core/schema";
import {CircuitInternal}   from "../impl/CircuitInternal";
import {SelectionsManager} from "../impl/SelectionsManager";
import {CircuitView}       from "./CircuitView";


export abstract class Assembler<Obj extends Schema.Obj = Schema.Obj> {
    protected readonly circuit: CircuitInternal;
    protected readonly view: CircuitView;
    protected readonly selections: SelectionsManager;

    protected constructor(circuit: CircuitInternal, view: CircuitView, selections: SelectionsManager) {
        this.circuit = circuit;
        this.view = view;
        this.selections = selections;
    }

    protected get options() {
        return this.view.options;
    }

    public abstract assemble(obj: Obj, ev: unknown): void;
}
