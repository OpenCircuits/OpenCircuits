import {GetIDFor, serializable, serialize} from "serialeazy";

import {CircuitDesigner} from "core/models/CircuitDesigner";
import {IOObject}        from "core/models/IOObject";

import {ICData} from "./ioobjects/other/ICData";

import {DigitalComponent, DigitalObjectSet, DigitalWire, InputPort, OutputPort, Propagation} from "./index";


export type PropagationEvent = {
    type: "propagation";
}
export type ForcedEvent = {
    type: "forced";
}
export type ObjEvent = {
    type: "obj";
    op: "added" | "removed";
    obj: DigitalComponent;
}
export type WireEvent = {
    type: "wire";
    op: "added" | "removed";
    wire: DigitalWire;
}
export type ICDataEvent = {
    type: "ic";
    op: "added" | "removed";
    data: ICData;
}
export type DigitalEvent =
    PropagationEvent | ForcedEvent | ObjEvent | WireEvent | ICDataEvent;


@serializable("DigitalCircuitDesigner")
export class DigitalCircuitDesigner extends CircuitDesigner {
    @serialize
    private readonly ics: ICData[];

    @serialize
    private readonly objects: DigitalComponent[];

    @serialize
    private readonly wires: DigitalWire[];

    @serialize
    private propagationQueue: Propagation[];

    @serialize
    private updateRequests: number;

    @serialize
    private propagationTime: number;

    private paused: boolean;

    private readonly updateCallbacks: Array<(ev: DigitalEvent) => void>;

    private timeout?: number;

    public constructor(propagationTime = 1) {
        super();

        this.propagationTime = propagationTime;
        this.updateCallbacks = [];

        this.ics = [];
        this.objects = [];
        this.wires = [];

        this.paused = false;

        this.propagationQueue = [];
        this.updateRequests = 0;
    }

    public reset(): void {
        // Remove ics, objects, and wires 1-by-1
        //  (so that the proper callbacks get called)
        for (let i = this.ics.length-1; i >= 0; i--)
            this.removeICData(this.ics[i]);
        for (let i = this.objects.length-1; i >= 0; i--)
            this.removeObject(this.objects[i]);
        for (let i = this.wires.length-1; i >= 0; i--)
            this.removeWire(this.wires[i]);

        this.paused = false;
        this.propagationQueue = [];
        this.updateRequests = 0;
    }

    public addCallback(callback: (ev: DigitalEvent) => void): void {
        this.updateCallbacks.push(callback);
    }

    public removeCallback(callback: (ev: DigitalEvent) => void): void {
        this.updateCallbacks.splice(this.updateCallbacks.indexOf(callback), 1);
    }

    private callback(ev: DigitalEvent): void {
        this.updateCallbacks.forEach((c) => c(ev));
    }

    /**
     * Method to call when you want to force an update
     *  Used when something changed but isn't propagated
     *  (i.e. Clock updated but wasn't connected to anything).
     */
    public forceUpdate(): void {
        this.callback({ type: "forced" });
    }

    /**
     * Add a propagation request to the queue.
     * Also checks if there are currently no requests and starts the cycle if
     *  there aren't.
     *
     * @param receiver The propagating component.
     * @param signal   The signal to propagate.
     */
    public propagate(receiver: DigitalComponent | DigitalWire, signal: boolean): void {
        if (this.paused)
            return;

        this.propagationQueue.push(new Propagation(receiver, signal));

        if (this.updateRequests > 0)
            return;

        this.updateRequests++;

        // instant propagation
        if (this.propagationTime === 0)
            this.update();
        else if (this.propagationTime > 0)
            this.timeout = window.setTimeout(() => this.update(), this.propagationTime);
        // Else if propagation time is < 0 then don't propagate at all
    }

    // Returns true if the updated component(s) require rendering.
    private update(): boolean {
        if (this.paused)
            return false;

        // Create temp queue before sending, in the case that sending them triggers
        //   more propagations to occur
        const tempQueue = [];
        while (this.propagationQueue.length > 0)
            tempQueue.push(this.propagationQueue.pop());

        while (tempQueue.length > 0)
            tempQueue.pop()?.send();

        // If something else was added during the sending, add request
        if (this.propagationQueue.length > 0)
            this.updateRequests++;


        this.updateRequests--;

        this.callback({ type: "propagation" });

        if (this.updateRequests > 0) {
            if (this.propagationTime === 0)
                this.update();
            else
                this.timeout = window.setTimeout(() => this.update(), this.propagationTime);
        }

        return true;
    }

    public pause(): void {
        this.paused = true;
        if (this.timeout !== undefined) {
            window.clearTimeout(this.timeout);
            this.timeout = undefined;
        }
    }

    public resume(): void {
        if (!this.paused) // Already not paused
            return;
        this.paused = false;
        if (this.updateRequests > 0)
            this.update();
    }

    public createWire(p1: OutputPort, p2?: InputPort): DigitalWire;
    public createWire(p2: InputPort, p1?: OutputPort): DigitalWire;
    public createWire(p1: InputPort | OutputPort, p2?: InputPort | OutputPort): DigitalWire | undefined {
        const input  = (p1 instanceof InputPort  ? p1 : p2) as InputPort;
        const output = (p1 instanceof OutputPort ? p1 : p2) as OutputPort;

        // Return undefined if InputPort already has a connection
        if (input && input.getWires().length > 0)
            return;
        return new DigitalWire(output, input);
    }

    public addICData(data: ICData): void {
        this.ics.push(data);
        this.callback({ type: "ic", op: "added", data });
    }

    public removeICData(data: ICData): void {
        const i = this.ics.indexOf(data);
        this.ics.splice(i, 1);
        this.callback({ type: "ic", op: "removed", data });
    }

    public addObjects(objects: DigitalComponent[]): void {
        for (const object of objects)
            this.addObject(object);
    }

    public addObject(obj: DigitalComponent): void {
        if (this.objects.includes(obj))
            throw new Error(`Attempted to add an object with id "${GetIDFor(obj)}" that already existed!`);

        obj.setDesigner(this);
        this.objects.push(obj);

        this.callback({ type: "obj", op: "added", obj });

        // Checking all ports (issue #613)
        for (const p of obj.getPorts().filter((r) => r instanceof InputPort) as InputPort[])
            p.activate(p.getInput() !== undefined && p.getInput().getIsOn());
    }

    public addWire(wire: DigitalWire): void {
        if (this.wires.includes(wire))
            throw new Error("Attempted to add a wire that already existed!");

        this.wires.push(wire);

        this.callback({ type: "wire", op: "added", wire });
    }

    public remove(o: DigitalComponent | DigitalWire): void {
        if (o instanceof DigitalComponent)
            this.removeObject(o);
        else
            this.removeWire(o);
    }

    public removeObject(obj: DigitalComponent): void {
        if (!this.objects.includes(obj))
            throw new Error("Attempted to remove object that doesn't exist!");

        this.objects.splice(this.objects.indexOf(obj), 1);
        obj.setDesigner(undefined);

        this.callback({ type: "obj", op: "removed", obj });
    }

    public removeWire(wire: DigitalWire): void {
        if (!this.wires.includes(wire))
            throw new Error("Attempted to remove wire that doesn't exist!");

        this.wires.splice(this.wires.indexOf(wire), 1);

        this.callback({ type: "wire", op: "removed", wire });
    }

    public override replace(designer: DigitalCircuitDesigner): void {
        super.replace(designer);

        for (const ic of designer.getICData())
            this.addICData(ic);

        this.propagationTime = designer.propagationTime;

        // Copy propagations so that circuit will continue
        //  propagating if it was previously doing so
        this.propagationQueue = [...designer.propagationQueue];
        this.updateRequests = designer.updateRequests;

        this.update();
    }

    // Shift an object to a certain position
    //  within it's list
    public shift(obj: DigitalComponent | DigitalWire, i?: number): number {
        // Find initial position in list
        const arr: IOObject[] =
                (obj instanceof DigitalComponent) ? (this.objects) : (this.wires);
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

    public getGroup(): DigitalObjectSet {
        return DigitalObjectSet.From([...this.objects, ...this.wires]);
    }

    public getObjects(): DigitalComponent[] {
        return [...this.objects]; // Shallow copy array
    }

    public getWires(): DigitalWire[] {
        return [...this.wires]; // Shallow copy array
    }

    public getICData(): ICData[] {
        return [...this.ics]; // Shallow copy array
    }
}
