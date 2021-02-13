import {serializable, serialize} from "serialeazy";

import {IOObjectSet} from "core/utils/ComponentUtils";

import {IOObject} from "core/models/IOObject";
import {CircuitDesigner} from "core/models/CircuitDesigner";

import {AnalogObjectSet} from "analog/utils/ComponentUtils";

import {AnalogComponent} from "./AnalogComponent";
import {AnalogWire} from "./AnalogWire";
import {AnalogPort} from "./ports/AnalogPort";

@serializable("AnalogCircuitDesigner")
export class AnalogCircuitDesigner extends CircuitDesigner {
    @serialize
    private objects: AnalogComponent[];
    @serialize
    private wires: AnalogWire[];

    private updateCallback: () => void;

    public constructor(callback: () => void = () => {}) {
        super();

        this.updateCallback = callback;

        this.reset();
    }

    public reset(): void {
        this.objects = [];
        this.wires   = [];
    }

    /**
     * Method to call when you want to force an update
     *     Used when something changed but isn't propagated
     *     (i.e. Clock updated but wasn't connected to anything)
     */
    public forceUpdate(): void {
        this.updateCallback();
    }

    // public simulate(): void { //ASSUMING SERIES, THIS IS BAD IF NOT
    //     const batteries = this.objects.filter(c => c instanceof Battery);
    //     if (batteries.length > 1)
    //         throw new Error("Only 1 battery allowed for simulation currently!");

    //     const battery = batteries[0];

    //     const totalVoltage = battery.voltage;

    //     // Calculate total resistance
    //     let totalResistance = 0;
    //     {
    //         let obj = battery.getOutputs()[0].getOutput().getParent();
    //         while (obj != battery) {
    //             totalResistance += obj.getResistance();

    //             if (obj.getOutputs().length <= 0)
    //                 throw new Error("Disconnected circuit!");
    //             if (obj.getOutputs().length > 1)
    //                 throw new Error("Circuit is not in series!");

    //             obj = obj.getOutputs()[0].getOutput().getParent();
    //         }
    //     }

    //     const current = totalVoltage / totalResistance;

    //     // Set currents
    //     this.objects.forEach(c => c.current = current);
    //     this.wires.forEach(w => w.current = current);

    //     // Set voltages
    //     let voltage = totalVoltage;
    //     {
    //         battery.getOutputs()[0].setVoltage(voltage);
    //         let obj = battery.getOutputs()[0].getOutput().getParent();
    //         while (obj != battery) {
    //             const voltageDrop = current * obj.getResistance();

    //             obj.setVoltage(voltageDrop > 0 ? voltageDrop : voltage);
    //             voltage -= voltageDrop;

    //             obj.getOutputs()[0].setVoltage(voltage);

    //             obj = obj.getOutputs()[0].getOutput().getParent();
    //         }
    //     }
    // }

    public createWire(p1: AnalogPort, p2: AnalogPort): AnalogWire {
        return new AnalogWire(p1, p2);
    }

    public addGroup(group: IOObjectSet): void {
        for (const c of group.getComponents())
            this.addObject(c as AnalogComponent);

        for (const w of group.getWires())
            this.addWire(w as AnalogWire);
    }

    public addObjects(objects: AnalogComponent[]): void {
        for (const object of objects)
            this.addObject(object);
    }

    public addObject(obj: AnalogComponent): void {
        if (this.objects.includes(obj))
            throw new Error("Attempted to add object that already existed!");

        obj.setDesigner(this);
        this.objects.push(obj);
    }

    public addWire(wire: AnalogWire): void {
        if (this.wires.includes(wire))
            throw new Error("Attempted to add a wire that already existed!");

        wire.setDesigner(this);
        this.wires.push(wire);
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
    }

    public removeWire(wire: AnalogWire): void {
        if (!this.wires.includes(wire))
            throw new Error("Attempted to remove wire that doesn't exist!");

        this.wires.splice(this.wires.indexOf(wire), 1);
        wire.setDesigner(undefined);
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
        i = (i == undefined ? arr.length : i);
        arr.splice(i0, 1);
        arr.splice(i, 0, obj);

        // Return initial position
        return i0;
    }

    public getGroup(): AnalogObjectSet {
        return new AnalogObjectSet((<IOObject[]>this.objects).concat(this.wires));
    }

    public getObjects(): AnalogComponent[] {
        return this.objects.slice(); // Shallow copy array
    }

    public getWires(): AnalogWire[] {
        return this.wires.slice(); // Shallow copy array
    }

    public getXMLName(): string {
        return "circuit";
    }

}
