import {Vector} from "Vector";

import {Component} from "core/models/Component";
import {Wire}      from "core/models/Wire";
import {Port} from "core/models/ports/Port";

import {AnalogComponent} from "../AnalogComponent";
import {AnalogWire} from "../AnalogWire";
import {PortSet} from "core/models/ports/PortSets";
import {ClampedValue} from "math/ClampedValue";
import {Positioner} from "core/models/ports/positioners/Positioner";

export class AnalogPort extends Port {
    protected parent: AnalogComponent;

    private connections: AnalogWire[];

    private initialDir: Vector;

    public constructor(parent: Component, dir?: Vector) {
        super(parent);
        this.connections = [];
        this.initialDir = dir;
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

export class AnalogPortSet extends PortSet<AnalogPort> {
    public constructor(parent: AnalogComponent, count: ClampedValue, positioner?: Positioner<AnalogPort>) {
        super(parent, AnalogPort, count, positioner);
    }
}