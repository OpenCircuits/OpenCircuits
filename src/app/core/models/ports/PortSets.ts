import {serializable} from "serialeazy";

import {ClampedValue} from "math/ClampedValue";

import {Component} from "core/models/Component";

import {Port} from "core/models/ports/Port";

import {Positioner} from "./positioners/Positioner";


@serializable("PortSet")
export class PortSet<T extends Port> {
    private readonly parent: Component;

    // Keep track of old ports so that we can keep references intact
    //  for wire connections and such when we change the port count
    private readonly oldPorts: T[];
    private readonly currentPorts: T[];

    private readonly count: ClampedValue;

    private readonly type: new(c: Component | undefined) => T;

    private readonly positioner: Positioner<T>;

    public constructor();
    public constructor(parent: Component, count: ClampedValue, positioner: Positioner<T>,
                       type: new(c: Component | undefined) => T);
    public constructor(parent?: Component, count?: ClampedValue,
                       positioner: Positioner<T> = new Positioner<T>(), type?: new(c: Component | undefined) => T) {
        this.parent = parent!;
        this.type = type!;
        this.count = count!;
        this.positioner = positioner;

        this.oldPorts = [];
        this.currentPorts = [];

        if (count)
            this.setPortCount(count.getValue());
    }

    /**
     * Set the number of Ports of this set.
     *  The value will be clamped and positions of ports
     *  will be updated.
     *
     * @param newVal The new number of ports.
     */
    public setPortCount(newVal: number): void {
        // no need to update if value is already
        //  the current amount
        if (newVal === this.currentPorts.length)
            return;

        // set count (will auto-clamp)
        this.count.setValue(newVal);

        // add or remove ports to meet target
        while (this.currentPorts.length > this.count.getValue())
            this.oldPorts.push(this.currentPorts.pop()!);
        while (this.currentPorts.length < this.count.getValue())
            this.currentPorts.push(this.oldPorts.pop() || new this.type(this.parent));

        // update positions
        this.positioner.updatePortPositions(this.currentPorts);
    }

    /**
     * Updates the positions of the ports in the set. Allows for
     * position updating even when the size does not change.
     */
    public updatePortPositions(): void {
        this.positioner.updatePortPositions(this.currentPorts);
    }

    public get(i: number): T {
        return this.currentPorts[i];
    }

    public getPorts(): T[] {
        return [...this.currentPorts];
    }

    public getPositioner(): Positioner<T> {
        return this.positioner;
    }

    public getCount(): ClampedValue {
        return this.count.copy();
    }

    public get length(): number {
        return this.currentPorts.length;
    }

    public get first(): T {
        return this.currentPorts[0];
    }

    public get last(): T {
        return this.currentPorts.at(-1)!;
    }

    public isEmpty(): boolean {
        return this.currentPorts.length === 0;
    }
}
