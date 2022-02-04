import {serializable} from "serialeazy";

import {Vector,V} from "Vector";

import {Port} from "core/models/ports/Port";

import {DigitalComponent, DigitalWire} from "../index";


@serializable("DigitalInputPort")
export class InputPort extends Port {
    protected parent: DigitalComponent;
    protected connections: DigitalWire[];

    public constructor(parent?: DigitalComponent) {
        super(parent!);
        this.parent = parent!;
        this.connections = [];
    }

    public activate(signal: boolean): void {
        // Don't do anything if signal is same as current state
        if (signal === this.isOn)
            return;
        this.isOn = signal;

        // Get designer to propagate signal, exit if undefined
        const designer = this.parent.getDesigner();
        if (!designer)
            return;

        designer.propagate(this.parent, this.isOn);
    }

    public connect(wire: DigitalWire): void {
        if (this.connections.length === 1)
            throw new Error("Cannot connect to Input Port! Connection already exists!");
        this.connections = [wire];
        this.activate(wire.getIsOn());
    }

    public disconnect(): void {
        // remove input and propagate false signal
        this.connections = [];
        this.activate(false);
    }

    public getInput(): DigitalWire {
        return this.connections[0];
    }

    public getInitialDir(): Vector {
        return V(-1, 0);
    }

    public getParent(): DigitalComponent {
        return this.parent;
    }

    public getWires(): DigitalWire[] {
        return this.connections;
    }

}
