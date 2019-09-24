import {Component} from "./Component";
import {Wire} from "./Wire";

export interface CircuitDesigner {
    getObjects(): Component[];
    getWires(): Wire[];
}