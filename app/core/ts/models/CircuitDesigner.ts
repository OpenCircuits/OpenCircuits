import {Component} from "./Component";
import {Wire} from "./Wire";
import {IOObjectSet} from "core/utils/ComponentUtils";

export interface CircuitDesigner {
    addObject(obj: Component): void;
    addGroup(group: IOObjectSet): void;

    connect(c1: Component, i1: number, c2: Component, i2: number);

    removeObject(obj: Component): void;
    removeWire(wire: Wire): void;

    getObjects(): Component[];
    getWires(): Wire[];
}