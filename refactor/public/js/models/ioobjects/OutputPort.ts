import {V} from "../../utils/math/Vector";

import {Component} from "./Component";
import {Port}	   from "./Port";
import {Wire}      from "./Wire";

export class OutputPort extends Port {
    private connections: Array<Wire>;

	public constructor(parent: Component) {
		super(parent, V(1, 0));
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
		var designer = this.parent.getDesigner();
		if (designer == undefined)
			return;

		for (var w of this.connections)
			designer.propogate(w, this.isOn);
	}

	public connect(w: Wire): void {
		this.connections.push(w);
		w.activate(this.isOn);
	}

    public disconnect(w: Wire): void {
        // find index and splice
        var i = this.connections.indexOf(w);
        if (i != -1)
            this.connections.splice(i, 1);
    }

	public getConnections(): Array<Wire> {
		return this.connections.slice(); // Shallow copy array
	}

}
