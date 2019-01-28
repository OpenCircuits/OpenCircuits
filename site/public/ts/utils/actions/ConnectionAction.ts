import {Action} from "./Action";
import {CircuitDesigner} from "../../models/CircuitDesigner";
import {Component} from "../../models/ioobjects/Component";
import {Wire} from "../../models/ioobjects/Wire";

export class ConnectionAction implements Action {
    private designer: CircuitDesigner;
    private c1: Component;
    private i1: number;
    private c2: Component;
    private i2: number;
    private wire: Wire;

    public constructor(c1: Component, i1: number, c2: Component, i2: number) {
        this.designer = c1.getDesigner();
        this.c1 = c1;
        this.i1 = i1;
        this.c2 = c2;
        this.i2 = i2;
    }

    public execute(): void {
        this.wire = this.designer.connect(this.c1, this.i1,  this.c2, this.i2);
    }
    
    public undo(): void {
        this.designer.removeWire(this.wire);
    }

}
