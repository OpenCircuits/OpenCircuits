import {Component} from "./Component";
import {Wire} from "./Wire";
import {IOObjectSet} from "core/utils/ComponentUtils";
import {Port} from "./ports/Port";

export abstract class CircuitDesigner {
    public abstract addObject(obj: Component): void;
    public abstract addWire(wire: Wire): void;
    public abstract addGroup(group: IOObjectSet): void;

    public abstract createWire(p1: Port, p2: Port): Wire;

    public abstract removeObject(obj: Component): void;

    public abstract removeWire(wire: Wire): void;

    public abstract shift(obj: Component | Wire, i?: number): number;

    public abstract getObjects(): Component[];
    public abstract getWires(): Wire[];
}
