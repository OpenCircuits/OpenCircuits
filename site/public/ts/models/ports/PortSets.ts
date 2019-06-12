import {ClampedValue} from "../../utils/ClampedValue";

import {Component} from "../ioobjects/Component";

import {Port}       from "./Port";
import {InputPort}  from "./InputPort";
import {OutputPort} from "./OutputPort";

import {Positioner} from "./positioners/Positioner";

class PortSet<T extends Port> {
    private parent: Component;

    private ports: T[];
    private count: ClampedValue;

    private type: new(c: Component) => T;

    private positioner: Positioner<T>;

    public constructor(parent: Component, type: new(c: Component) => T,
                        count: ClampedValue, positioner: Positioner<T> = new Positioner<T>()) {
        this.parent = parent;
        this.type = type;
        this.count = count;
        this.positioner = positioner;

        this.setPortCount(count.getValue());
    }

    public setPortCount(newVal: number): void {
        // no need to update if value is already
        //  the current amount
        if (newVal == this.ports.length)
            return;

        // set count (will auto-clamp)
        this.count.setValue(newVal);

        // add or remove ports to meet target
        while (this.ports.length > newVal)
            this.ports.pop();
        while (this.ports.length < newVal)
            this.ports.push(new this.type(this.parent));

        // update positions
        this.positioner.updatePortPositions(this.ports);
    }

    public get(i: number): T {
        return this.ports[i];
    }

    public getPorts(): T[] {
        return this.ports.slice();
    }

    public get length(): number {
        return this.ports.length;
    }

    public get first(): T {
        return this.ports[0];
    }

    public get last(): T {
        return this.ports[this.ports.length - 1];
    }

    public isEmpty() {
        return this.ports.length == 0;
    }

    public copy(newParent: Component): PortSet<T> {
        let copy = new PortSet<T>(newParent, this.type, this.count.copy());

        // Copy port positions
        copy.ports.forEach((p, i) => {
            p.setOriginPos(this.ports[i].getOriginPos());
            p.setTargetPos(this.ports[i].getTargetPos());
        });

        return copy;
    }

}

export class InputPortSet extends PortSet<InputPort> {
    public constructor(parent: Component, count: ClampedValue) {
        super(parent, InputPort, count);
    }
}

export class OutputPortSet extends PortSet<OutputPort> {
    public constructor(parent: Component, count: ClampedValue) {
        super(parent, OutputPort, count);
    }
}
