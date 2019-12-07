import {serializable} from "serialeazy";

import {Vector} from "Vector";

import {Component} from "core/models/Component";
import {Port} from "core/models/ports/Port";

import {AnalogComponent} from "../AnalogComponent";
import {AnalogWire} from "../AnalogWire";

@serializable("AnalogPort")
export class AnalogPort extends Port {
    protected parent: AnalogComponent;

    protected connections: AnalogWire[];

    public constructor(parent?: Component) {
        super(parent);
        this.connections = [];
    }

    public connect(w: AnalogWire): void {
        this.connections.push(w);
    }

    public disconnect(w: AnalogWire): void {
        // find index and splice
        const i = this.connections.indexOf(w);
        if (i != -1)
            this.connections.splice(i, 1);
    }

    public getInitialDir(): Vector {
        return new Vector(1, 0);
    }

    public getWires(): AnalogWire[] {
        return this.connections.slice(); // Shallow copy
    }

    public getParent(): AnalogComponent {
        return this.parent;
    }

}
