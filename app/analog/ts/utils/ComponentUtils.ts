import {IOObjectSet} from "core/utils/ComponentUtils";
import {AnalogWire} from "analog/models/AnalogWire";
import {AnalogComponent} from "analog/models/AnalogComponent";
import {IOObject} from "core/models/IOObject";

export class AnalogObjectSet extends IOObjectSet {
    protected wires: AnalogWire[];

    private sources: AnalogComponent[];
    private grounds: AnalogComponent[];
    private others:  AnalogComponent[];

    public constructor(set: IOObject[]) {
        super(set);

        this.sources = [];
        this.grounds = [];
        this.others  = [];

        // Filter out inputs and outputs
        const objs = set.filter(o => o instanceof AnalogComponent) as AnalogComponent[];
        for (const obj of objs) {
            this.others.push(obj);
        }
    }

    public getWires(): AnalogWire[] {
        return this.wires.slice(); // Shallow copy
    }

    public getSources(): AnalogComponent[] {
        return this.sources.slice(); // Shallow Copy
    }

    public getGrounds(): AnalogComponent[] {
        return this.grounds.slice(); // Shallow Copy
    }

    public getOthers(): AnalogComponent[] {
        return this.others.slice(); // Shallow Copy
    }

    public getComponents(): AnalogComponent[] {
        return this.sources.concat(this.grounds, this.others);
    }
}