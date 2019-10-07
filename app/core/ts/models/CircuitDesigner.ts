import {Component} from "./Component";
import {Wire} from "./Wire";
import {IOObjectSet} from "core/utils/ComponentUtils";
import {Port} from "./ports/Port";

export abstract class CircuitDesigner {
    abstract addObject(obj: Component): void;
    abstract addGroup(group: IOObjectSet): void;

    abstract createWire(p1: Port, p2: Port): Wire;
    
    abstract removeObject(obj: Component): void;

    abstract removeWire(wire: Wire): void;
 
    abstract getObjects(): Component[];
    abstract getWires(): Wire[];
}