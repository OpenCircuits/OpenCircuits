import {Vector,V} from "../../utils/math/Vector";

import {Component} from "../ioobjects/Component";
import {Wire}      from "../ioobjects/Wire";

import {Port}	   from "./Port";

export class OutputPort extends Port {
    private connections: Array<Wire>;

    public constructor(parent: Component) {
        super(parent);
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
        if (signal == this.isOn)
            return;
        this.isOn = signal;

        // Get designer to propagate signal, exit if undefined
        const designer = this.parent.getDesigner();
        if (designer == undefined)
            return;

        for (const w of this.connections)
            designer.propagate(w, this.isOn);
    }

    public connect(w: Wire): void {
        this.connections.push(w);
        w.activate(this.isOn);
    }

    public disconnect(w: Wire): void {
        // find index and splice
        const i = this.connections.indexOf(w);
        if (i != -1)
            this.connections.splice(i, 1);
    }

    public getConnections(): Array<Wire> {
        return this.connections.slice(); // Shallow copy array
    }

    public getInitialDir(): Vector {
        return V(1, 0);
    }

}
