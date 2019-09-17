import {V} from "Vector";

import {EEComponent} from "./EEComponent";
import {EEPort}	     from "./EEPort";
import {EEWire}      from "./EEWire";

export class OutputPort extends EEPort {
    private connections: Array<EEWire>;

	public constructor(parent: EEComponent) {
		super(parent, V(1, 0));
		this.connections = [];
	}

	public connect(w: EEWire): void {
		this.connections.push(w);
	}

    public disconnect(w: EEWire): void {
        // find index and splice
        const i = this.connections.indexOf(w);
        if (i != -1)
            this.connections.splice(i, 1);
    }

	public getConnections(): Array<EEWire> {
		return this.connections.slice(); // Shallow copy array
	}

}
