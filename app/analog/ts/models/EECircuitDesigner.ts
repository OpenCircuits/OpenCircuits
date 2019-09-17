import {XMLable} from "core/utils/io/xml/XMLable";
import {XMLNode} from "core/utils/io/xml/XMLNode";

import {SeparatedComponentCollection,
        CreateWire,
        SaveGroup,
        LoadGroup} from "../utils/ComponentUtils";

import {EEObject} from "./eeobjects/EEObject";
import {EEComponent} from "./eeobjects/EEComponent";
import {EEWire} from "./eeobjects/EEWire";

import {Battery} from "./eeobjects/Battery";

import {InputPort}  from "./eeobjects/InputPort";
import {OutputPort} from "./eeobjects/OutputPort";

export class EECircuitDesigner {
    private objects: Array<EEComponent>;
    private wires: Array<EEWire>;
    private updateRequests: number;

    private updateCallback: () => void;

    public constructor(callback: () => void = function(){}) {
        this.updateCallback = callback;

        this.reset();
    }

    public reset(): void {
        this.objects = [];
        this.wires   = [];
        this.updateRequests = 0;
    }

    /**
     * Method to call when you want to force an update
     *     Used when something changed but isn't propagated
     *     (i.e. Clock updated but wasn't connected to anything)
     */
    public forceUpdate(): void {
        this.updateCallback();
    }

    public simulate(): void { //ASSUMING SERIES, THIS IS BAD IF NOT
        const batteries = this.objects.filter(c => c instanceof Battery);
        if (batteries.length > 1)
            throw new Error("Only 1 battery allowed for simulation currently!");

        const battery = batteries[0];

        const totalVoltage = battery.getVoltage();

        // Calculate total resistance
        let totalResistance = 0;
        {
            let obj = battery.getOutputs()[0].getOutput().getParent();
            while (obj != battery) {
                totalResistance += obj.getResistance();

                if (obj.getOutputs().length <= 0)
                    throw new Error("Disconnected circuit!");
                if (obj.getOutputs().length > 1)
                    throw new Error("Circuit is not in series!");

                obj = obj.getOutputs()[0].getOutput().getParent();
            }
        }

        const current = totalVoltage / totalResistance;

        // Set currents
        this.objects.forEach(c => c.setCurrent(current));
        this.wires.forEach(w => w.setCurrent(current));

        // Set voltages
        let voltage = totalVoltage;
        {
            battery.getOutputs()[0].setVoltage(voltage);
            let obj = battery.getOutputs()[0].getOutput().getParent();
            while (obj != battery) {
                const voltageDrop = current * obj.getResistance();

                obj.setVoltage(voltageDrop > 0 ? voltageDrop : voltage);
                voltage -= voltageDrop;

                obj.getOutputs()[0].setVoltage(voltage);

                obj = obj.getOutputs()[0].getOutput().getParent();
            }
        }
    }

    public addGroup(group: SeparatedComponentCollection): void {
        for (const a of group.getAllComponents())
            this.addObject(a)

        for (const b of group.wires) {
            this.wires.push(b);
            b.setDesigner(this);
        }
    }

    public addObjects(objects: Array<EEComponent>): void {
        for (let i = 0; i < objects.length; i++)
            this.addObject(objects[i]);
    }

    public addObject(obj: EEComponent): void {
        if (this.objects.includes(obj))
            throw new Error("Attempted to add object that already existed!");

        obj.setDesigner(this);
        this.objects.push(obj);
    }

    public createWire(p1: OutputPort, p2: InputPort): EEWire {
        const wire = CreateWire(p1, p2);
        this.wires.push(wire);
        wire.setDesigner(this);
        return wire;
    }

    public connect(c1: EEComponent, c2: EEComponent): EEWire;
    public connect(c1: EEComponent, i1: number, c2: EEComponent, i2: number): EEWire;
    public connect(c1: EEComponent, i1: EEComponent | number, c2?: EEComponent, i2?: number): EEWire {
        if (i1 instanceof EEComponent)
            return this.connect(c1, 0, i1, 0);
        return this.createWire(c1.getOutputPort(i1), c2.getInputPort(i2));
    }

    public removeObject(obj: EEComponent): void {
        if (!this.objects.includes(obj))
            throw new Error("Attempted to remove object that doesn't exist!");

        // Remove all input and output wires
        const inputs = obj.getInputs();
        const outputs = obj.getOutputs();
        const wires = inputs.concat(outputs);
        for (const wire of wires)
            this.removeWire(wire);

        this.objects.splice(this.objects.indexOf(obj), 1);
        obj.setDesigner(undefined);
    }

    public removeWire(wire: EEWire): void {
        if (!this.wires.includes(wire))
            throw new Error("Attempted to remove wire that doesn't exist!");

        // Completely disconnect from the circuit
        wire.getInput().disconnect(wire);
        wire.getOutput().disconnect();

        this.wires.splice(this.wires.indexOf(wire), 1);
        wire.setDesigner(undefined);
    }

    public save(node: XMLNode): void {
        SaveGroup(node, this.objects, this.wires);
    }


    public load(node: XMLNode): void {
        const group = LoadGroup(node);

        // Add all objects/wires
        group.getAllComponents().forEach((c) => this.addObject(c));
        group.wires.forEach((w) => {
            this.wires.push(w);
            w.setDesigner(this);
        });

        // Update since the circuit has changed
        this.updateCallback();
    }

    // Shift an object to a certain position
    //  within it's list
    public shift(obj: EEObject, i?: number): number {
        // Find initial position in list
        const arr: Array<EEObject> =
                (obj instanceof EEComponent) ? (this.objects) : (this.wires);
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

    public getObjects(): Array<EEComponent> {
        return this.objects.slice(); // Shallow copy array
    }

    public getWires(): Array<EEWire> {
        return this.wires.slice(); // Shallow copy array
    }

    public getXMLName(): string {
        return "circuit";
    }

}
