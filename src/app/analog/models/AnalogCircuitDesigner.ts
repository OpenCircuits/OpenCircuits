import {serializable, serialize} from "serialeazy";

import {IOObjectSet} from "core/utils/ComponentUtils";

import {CircuitDesigner} from "core/models/CircuitDesigner";
import {IOObject}        from "core/models/IOObject";

import {AnalogComponent, AnalogPort, AnalogWire} from "./index";



export type ForcedEvent = {
    type: "forced";
}
export type ObjEvent = {
    type: "obj";
    op: "added" | "removed";
    obj: AnalogComponent;
}
export type WireEvent = {
    type: "wire";
    op: "added" | "removed";
    wire: AnalogWire;
}
export type AnalogEvent =
    ForcedEvent | ObjEvent | WireEvent;


@serializable("AnalogCircuitDesigner")
export class AnalogCircuitDesigner extends CircuitDesigner {
    @serialize
    private readonly objects: AnalogComponent[];

    @serialize
    private readonly wires: AnalogWire[];

    private readonly updateCallbacks: Array<(ev: AnalogEvent) => void>;

    public constructor() {
        super();

        this.updateCallbacks = [];

        this.objects = [];
        this.wires = [];
    }

    public reset(): void {
        // Remove objects, and wires 1-by-1
        //  (so that the proper callbacks get called)
        for (let i = this.objects.length-1; i >= 0; i--)
            this.removeObject(this.objects[i]);
        for (let i = this.wires.length-1; i >= 0; i--)
            this.removeWire(this.wires[i]);
    }

    public addCallback(callback: (ev: AnalogEvent) => void): void {
        this.updateCallbacks.push(callback);
    }

    public removeCallback(callback: (ev: AnalogEvent) => void): void {
        this.updateCallbacks.splice(this.updateCallbacks.indexOf(callback), 1);
    }

    private callback(ev: AnalogEvent): void {
        this.updateCallbacks.forEach((c) => c(ev));
    }

    /**
     * Method to call when you want to force an update.
     *  Used when something changed but isn't propagated
     *  (i.e. Clock updated but wasn't connected to anything).
     */
    public forceUpdate(): void {
        this.callback({ type: "forced" });
    }

    public createWire(p1: AnalogPort, p2?: AnalogPort): AnalogWire {
        return new AnalogWire(p1, p2);
    }

    public addObjects(objects: AnalogComponent[]): void {
        for (const object of objects)
            this.addObject(object);
    }

    public addObject(obj: AnalogComponent): void {
        if (this.objects.includes(obj))
            throw new Error("Attempted to add an object that already existed!");

        obj.setDesigner(this);
        this.objects.push(obj);

        this.callback({ type: "obj", op: "added", obj });
    }

    public addWire(wire: AnalogWire): void {
        if (this.wires.includes(wire))
            throw new Error("Attempted to add a wire that already existed!");

        this.wires.push(wire);

        this.callback({ type: "wire", op: "added", wire });
    }

    public remove(o: AnalogComponent | AnalogWire): void {
        if (o instanceof AnalogComponent)
            this.removeObject(o);
        else
            this.removeWire(o);
    }

    public removeObject(obj: AnalogComponent): void {
        if (!this.objects.includes(obj))
            throw new Error("Attempted to remove object that doesn't exist!");

        this.objects.splice(this.objects.indexOf(obj), 1);
        obj.setDesigner(undefined);

        this.callback({ type: "obj", op: "removed", obj });
    }

    public removeWire(wire: AnalogWire): void {
        if (!this.wires.includes(wire))
            throw new Error("Attempted to remove wire that doesn't exist!");

        this.wires.splice(this.wires.indexOf(wire), 1);

        this.callback({ type: "wire", op: "removed", wire });
    }

    public override replace(designer: AnalogCircuitDesigner): void {
        super.replace(designer);
    }

    // Shift an object to a certain position
    //  within it's list
    public shift(obj: AnalogComponent | AnalogWire, i?: number): number {
        // Find initial position in list
        const arr: IOObject[] =
                (obj instanceof AnalogComponent) ? (this.objects) : (this.wires);
        const i0 = arr.indexOf(obj);
        if (i0 === -1)
            throw new Error("Can't move object! Object doesn't exist!");

        // Shift object to position
        i = (i === undefined ? arr.length : i);
        arr.splice(i0, 1);
        arr.splice(i, 0, obj);

        // Return initial position
        return i0;
    }

    public getGroup(): IOObjectSet {
        return new IOObjectSet([...this.objects, ...this.wires]);
    }

    public getObjects(): AnalogComponent[] {
        return [...this.objects]; // Shallow copy array
    }

    public getWires(): AnalogWire[] {
        return [...this.wires]; // Shallow copy array
    }
}
