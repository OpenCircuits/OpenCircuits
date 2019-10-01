import {XMLable} from "core/utils/io/xml/XMLable";
import {XMLNode} from "core/utils/io/xml/XMLNode";

import {DigitalObjectSet,
        CreateWire,
        SaveGroup,
        LoadGroup,
        IOObjectSet} from "../../../core/ts/utils/ComponentUtils";

import {Propagation} from "./Propagation";

import {CircuitDesigner} from "core/models/CircuitDesigner";
import {IOObject}  from "core/models/IOObject";
import {Wire}      from "core/models/Wire";
import {ICData}    from "./ioobjects/other/ICData";

import {InputPort}  from "./ports/InputPort";
import {OutputPort} from "./ports/OutputPort";
import {DigitalComponent} from "./DigitalComponent";

export class DigitalCircuitDesigner implements CircuitDesigner, XMLable {
    private ics: ICData[];

    private objects: DigitalComponent[];
    private wires: Wire[];
    private propagationQueue: Propagation[];
    private updateRequests: number;
    private propagationTime: number;

    private updateCallback: () => void;

    public constructor(propagationTime: number = 1, callback: () => void = () => {}) {
        this.propagationTime = propagationTime;
        this.updateCallback  = callback;

        this.reset();
    }

    public reset(): void {
        this.ics     = [];
        this.objects = [];
        this.wires   = [];
        this.propagationQueue = [];
        this.updateRequests = 0;
    }

    /**
     * Method to call when you want to force an update
     * 	Used when something changed but isn't propagated
     * 	(i.e. Clock updated but wasn't connected to anything)
     */
    public forceUpdate(): void {
        this.updateCallback();
    }

    /**
     * Add a propagation request to the queue.
     * Also checks if there are currently no requests and starts the cycle if
     *  there aren't
     *
     * @param sender
     * @param receiver
     * @param signal
     */
    public propagate(receiver: IOObject, signal: boolean): void {
        this.propagationQueue.push(new Propagation(receiver, signal));

        if (this.updateRequests > 0)
            return;

        this.updateRequests++;

        // instant propagation
        if (this.propagationTime == 0)
            this.update();
        else if (this.propagationTime > 0)
            setTimeout(() => this.update(), this.propagationTime);
        // Else if propagation time is < 0 then don't propagate at all
    }

    /**
     * @return True if the updated component(s) require rendering
     */
    private update(): boolean {
        // Create temp queue before sending, in the case that sending them triggers
        //   more propagations to occur
        const tempQueue = [];
        while (this.propagationQueue.length > 0)
            tempQueue.push(this.propagationQueue.pop());

        while (tempQueue.length > 0)
            tempQueue.pop().send();

        // If something else was added during the sending, add request
        if (this.propagationQueue.length > 0)
            this.updateRequests++;


        this.updateRequests--;

        this.updateCallback();

        if (this.updateRequests > 0) {
            if (this.propagationTime == 0)
                this.update();
            else
                setTimeout(() => this.update(), this.propagationTime);
        }

        return true;
    }

    public addGroup(group: DigitalObjectSet): void {
        for (const a of group.getComponents())
            this.addObject(a);

        for (const b of group.getWires()) {
            this.wires.push(b);
            b.setDesigner(this);
        }
    }

    public addICData(data: ICData): void {
        this.ics.push(data);
    }

    public removeICData(data: ICData): void {
        const i = this.ics.indexOf(data);
        this.ics.splice(i, 1);
    }

    public addObjects(objects: DigitalComponent[]): void {
        for (const object of objects)
            this.addObject(object);
    }

    public addObject(obj: DigitalComponent): void {
        if (this.objects.includes(obj))
            throw new Error("Attempted to add object that already existed!");

        obj.setDesigner(this);
        this.objects.push(obj);
    }

    public createWire(p1: OutputPort, p2: InputPort): Wire {
        if (p1.getParent().getDesigner() != this)
            throw new Error("Cannot create wire! The provided input is not apart of this circuit!");
        if (p2.getParent().getDesigner() != this)
            throw new Error("Cannot create wire! The provided output is not apart of this circuit!");

        const wire = CreateWire(p1, p2);
        this.wires.push(wire);
        wire.setDesigner(this);
        return wire;
    }

    public connect(c1: DigitalComponent, i1: number, c2: DigitalComponent, i2: number): Wire {
        return this.createWire(c1.getOutputPort(i1), c2.getInputPort(i2));
    }

    public remove(o: DigitalComponent | Wire): void {
        if (o instanceof DigitalComponent)
            this.removeObject(o);
        else
            this.removeWire(o);
    }

    public removeObject(obj: DigitalComponent): void {
        if (!this.objects.includes(obj))
            throw new Error("Attempted to remove object that doesn't exist!");

        // Remove all input and output wires
        const wires = obj.getInputs().concat(obj.getOutputs());
        for (const wire of wires)
            this.removeWire(wire);

        this.objects.splice(this.objects.indexOf(obj), 1);
        obj.setDesigner(undefined);
    }

    public removeWire(wire: Wire): void {
        if (!this.wires.includes(wire))
            throw new Error("Attempted to remove wire that doesn't exist!");

        // Completely disconnect from the circuit
        wire.getInput().disconnect(wire);
        wire.getOutput().disconnect();

        this.wires.splice(this.wires.indexOf(wire), 1);
        wire.setDesigner(undefined);
    }

    public save(node: XMLNode): void {
        const icDataNode  = node.createChild("icdata");

        const icIdMap = new Map<ICData, number>();

        // Create ICData map
        let icId = 0;
        for (const ic of this.ics)
            icIdMap.set(ic, icId++);

        // Save ICs
        for (const ic of this.ics) {
            const icNode = icDataNode.createChild("icdata");
            const icid = icIdMap.get(ic);

            icNode.addAttribute("icid", icid);
            ic.save(icNode, icIdMap);
        }

        SaveGroup(node, this.objects, this.wires, icIdMap);
    }

    public load(node: XMLNode): void {
        const icDataNode  = node.findChild("icdata");

        const icIdMap = new Map<number, ICData>();
        const ics = icDataNode.getChildren();

        // Create ICData map
        for (const ic of ics) {
            const icid = ic.getIntAttribute("icid");
            icIdMap.set(icid, new ICData())
        }

        // Load ICs
        for (const ic of ics) {
            const icid = ic.getIntAttribute("icid");
            icIdMap.get(icid).load(ic, icIdMap);
        }

        const group = LoadGroup(node, icIdMap);

        // Add all objects/wires
        group.getComponents().forEach((c) => this.addObject(c));
        group.getWires().forEach((w) => {
            this.wires.push(w);
            w.setDesigner(this);
        });

        // Update since the circuit has changed
        this.updateCallback();
    }

    // Shift an object to a certain position
    //  within it's list
    public shift(obj: IOObject, i?: number): number {
        // Find initial position in list
        const arr: Array<IOObject> =
                (obj instanceof DigitalComponent) ? (this.objects) : (this.wires);
        const i0 = arr.indexOf(obj);
        if (i0 === -1)
            throw new Error("Can't move object! Object doesn't exist!");

        // Shift object to position
        i = (i == undefined ? arr.length : i);
        arr.splice(i0, 1);
        arr.splice(i, 0, obj);

        // Return initial position
        return i0;
    }

    public getGroup(): DigitalObjectSet {
        return new DigitalObjectSet((<IOObject[]>this.objects).concat(this.wires));
    }

    public getObjects(): DigitalComponent[] {
        return this.objects.slice(); // Shallow copy array
    }

    public getWires(): Wire[] {
        return this.wires.slice(); // Shallow copy array
    }

    public getICData(): ICData[] {
        return this.ics.slice(); // Shallow copy array
    }

    public getXMLName(): string {
        return "circuit";
    }

}
