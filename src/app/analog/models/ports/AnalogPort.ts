import {serializable} from "serialeazy";

import {Vector,V} from "Vector";

import {Port} from "core/models/ports/Port";

import {AnalogComponent, AnalogWire} from "../index";


@serializable("AnalogPort")
export class AnalogPort extends Port {
    protected parent: AnalogComponent;
    protected connections: AnalogWire[];

    public constructor(parent?: AnalogComponent) {
        super(parent!);
        this.parent = parent!;
        this.connections = [];
    }

    public connect(wire: AnalogWire): void {
        this.connections.push(wire);
    }

    public disconnect(w: AnalogWire): void {
        // find index and splice
        const i = this.connections.indexOf(w);
        if (i !== -1)
            this.connections.splice(i, 1);
    }

    public getInitialDir(): Vector {
        return V(-1, 0);
    }

    public getParent(): AnalogComponent {
        return this.parent;
    }

    public getWires(): AnalogWire[] {
        return this.connections;
    }

}
