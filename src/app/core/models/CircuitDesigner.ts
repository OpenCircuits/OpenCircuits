import {Component} from "./Component";
import {Wire} from "./Wire";
import {IOObjectSet} from "core/utils/ComponentUtils";
import {Port} from "./ports/Port";
import {IOObject} from "./IOObject";
import {Distinguishable} from "core/utils/Distinguishable";
import {serialize} from "serialeazy";


export abstract class CircuitDesigner {
    protected refs: Map<string, Distinguishable> = new Map<string, Distinguishable>();

    public abstract addCallback(callback: (ev: {type: string}) => void): void;
    public abstract removeCallback(callback: (ev: {type: string}) => void): void;

    public abstract addObject(obj: Component): void;
    public abstract addWire(wire: Wire): void;
    public abstract addGroup(group: IOObjectSet): void;

    public abstract createWire(p1: Port, p2: Port): Wire;

    public abstract removeObject(obj: Component): void;
    public abstract removeWire(wire: Wire): void;

    public replace(designer: CircuitDesigner): void {
        this.reset();

        for (const obj of designer.getObjects())
            this.addObject(obj);
        for (const wire of designer.getWires())
            this.addWire(wire);
    }

    public abstract shift(obj: Component | Wire, i?: number): number;

    public abstract reset(): void;

    public abstract getObjects(): Component[];
    public abstract getWires(): Wire[];

    public getAll(): IOObject[] {
        return (this.getObjects() as IOObject[]).concat(this.getWires());
    }

    protected addRef(r: Distinguishable): void {
        this.refs.set(r.getGuid(), r);
    }
    protected removeRef(r: Distinguishable): void {
        this.refs.delete(r.getGuid());
    }
    public lookupRef(guid: string): Distinguishable | undefined {
        return this.refs.get(guid)
    }
}
