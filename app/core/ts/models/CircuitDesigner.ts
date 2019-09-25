import {Component} from "./Component";
import {Wire} from "./Wire";

export interface CircuitDesigner {
    addObject(obj: Component): void;
    addGroup(group: SeparatedComponentCollection): void;

    removeObject(obj: Component): void;
    removeWire(wire: Wire): void;

    getObjects(): Component[];
    getWires(): Wire[];
}