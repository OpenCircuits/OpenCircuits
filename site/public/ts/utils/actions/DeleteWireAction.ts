import {Action} from "./Action";
import {CircuitDesigner} from "../../models/CircuitDesigner";
import {Component} from "../../models/ioobjects/Component";
import {Wire} from "../../models/ioobjects/Wire";

export class DeleteWireAction implements Action {
    private designer: CircuitDesigner;

    private c1: Component;
    private i1: number;
    private c2: Component;
    private i2: number;

    private wire: Wire;

    public constructor(w: Wire) {
        this.designer = w.getDesigner();

        // Get components of wire
        this.c1 = w.getInputComponent();
        this.c2 = w.getOutputComponent();

        // Find indices of ports on components
        this.i1 = this.c1.getOutputPorts().indexOf(w.getInput());
        this.i2 = this.c2.getInputPorts().indexOf(w.getOutput());

        this.wire = w;
    }

    public execute(): void {
        this.designer.removeWire(this.wire);
    }

    public undo(): void {
        this.wire = this.designer.connect(this.c1, this.i1,  this.c2, this.i2);
    }

}
