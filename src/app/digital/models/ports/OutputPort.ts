import {serializable} from "serialeazy";

import {Vector,V} from "Vector";

import {Port} from "core/models/ports/Port";

import {DigitalComponent, DigitalWire} from "../index";


@serializable("DigitalOutputPort")
export class OutputPort extends Port {
    protected parent: DigitalComponent;
    protected connections: DigitalWire[];

    public constructor(parent?: DigitalComponent) {
        super(parent!);
        this.parent = parent!;
        this.connections = [];
    }

    /**
     * Active this port and propagate the signal
     * 	to all active connections
     *
     * @param  {boolean} signal 	The signal to send
     */
    public activate(signal: boolean): void {
        // Don't do anything if signal is same as current state
        if (signal === this.isOn)
            return;
        this.isOn = signal;

        // Get designer to propagate signal, exit if undefined
        const designer = this.parent.getDesigner();
        if (!designer)
            return;

        for (const w of this.connections)
            designer.propagate(w, this.isOn);
    }

    public connect(w: DigitalWire): void {
        this.connections.push(w);
        w.activate(this.isOn);
    }

    public disconnect(w: DigitalWire): void {
        // find index and splice
        const i = this.connections.indexOf(w);
        if (i !== -1)
            this.connections.splice(i, 1);
    }

    public getConnections(): DigitalWire[] {
        return this.connections.slice(); // Shallow copy array
    }

    public getInitialDir(): Vector {
        return V(1, 0);
    }

    public getWires(): DigitalWire[] {
        return this.connections;
    }

    public getParent(): DigitalComponent {
        return this.parent;
    }
}
