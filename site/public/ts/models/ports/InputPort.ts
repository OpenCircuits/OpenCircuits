import {Vector,V} from "../../utils/math/Vector";

import {Component} from "../ioobjects/Component";
import {Wire}      from "../ioobjects/Wire";

import {Port}	   from "./Port";

export class InputPort extends Port {
    private input?: Wire;

    public constructor(parent: Component) {
        super(parent);
        this.input = undefined;
    }

    public activate(signal: boolean): void {
        // Don't do anything if signal is same as current state
        if (signal == this.isOn)
            return;
        this.isOn = signal;

        // Get designer to propagate signal, exit if undefined
        const designer = this.parent.getDesigner();
        if (designer == undefined)
            return;

        designer.propagate(this.parent, this.isOn);
    }

    public disconnect(): void {
        // remove input and propagate false signal
        this.input = undefined;
        this.activate(false);
    }

    public setInput(input: Wire): void {
        this.input = input;
    }

    public getInput(): Wire {
        return this.input;
    }

    public getInitialDir(): Vector {
        return V(-1, 0);
    }

}
