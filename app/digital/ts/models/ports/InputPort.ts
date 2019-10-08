import {Vector,V} from "Vector";
import {ClampedValue} from "math/ClampedValue";

import {Wire}       from "core/models/Wire";
import {Port}	    from "core/models/ports/Port";
import {PortSet}    from "core/models/ports/PortSets";
import {Positioner} from "core/models/ports/positioners/Positioner";
import {DigitalComponent} from "../DigitalComponent";
import {DigitalWire} from "../DigitalWire";

export class InputPort extends Port {
    protected parent: DigitalComponent;
    private input?: DigitalWire;

    public constructor(parent: DigitalComponent) {
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
        if (!designer)
            return;

        designer.propagate(this.parent, this.isOn);
    }

    public connect(wire: DigitalWire): void {
        if (this.input)
            throw new Error("Cannot connect to Input Port! Connection already exists!");
        this.input = wire;
        this.activate(wire.getIsOn());
    }

    public disconnect(): void {
        // remove input and propagate false signal
        this.input = undefined;
        this.activate(false);
    }

    public setInput(input: DigitalWire): void {
        this.input = input;
    }

    public getInput(): DigitalWire {
        return this.input;
    }

    public getInitialDir(): Vector {
        return V(-1, 0);
    }

    public getWires(): DigitalWire[] {
        return this.getInput() ? [this.getInput()] : [];
    }

    public getParent(): DigitalComponent {
        return this.parent;
    }

}

export class InputPortSet extends PortSet<InputPort> {
    public constructor(parent: DigitalComponent, count: ClampedValue, positioner?: Positioner<InputPort>) {
        super(parent, InputPort, count, positioner);
    }
}
