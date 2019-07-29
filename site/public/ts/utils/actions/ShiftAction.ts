import {Action} from "./Action";

import {Component} from "../../models/ioobjects/Component";
import {Wire} from "../../models/ioobjects/Wire";

export class ShiftAction implements Action {
    private obj: Component;
    private i: number;

    public constructor(obj: Component) {
        this.obj = obj;
    }

    public execute(): Action {
        const designer = this.obj.getDesigner();
        this.i = designer.shift(this.obj);

        return this;
    }

    public undo(): Action {
        const designer = this.obj.getDesigner();
        designer.shift(this.obj, this.i);

        return this;
    }

}

export class ShiftWireAction implements Action {
    private parent: Component;
    private parentIndx: number;

    private i: number;

    public constructor(wire: Wire) {
        // Get Input Port connected to this wire so that if this wire is deleted
        //  and put back, we can still reference it
        this.parent = wire.getOutputComponent();
        this.parentIndx = this.parent.getInputPorts().indexOf(wire.getOutput());
    }

    public execute(): Action {
        const designer = this.parent.getDesigner();
        const wire = this.parent.getInputPort(this.parentIndx).getInput();
        this.i = designer.shift(wire);

        return this;
    }

    public undo(): Action {
        const designer = this.parent.getDesigner();
        const wire = this.parent.getInputPort(this.parentIndx).getInput();
        designer.shift(wire, this.i);

        return this;
    }

}
