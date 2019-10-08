import {IOObject} from "core/models/IOObject";
import {Component} from "core/models/Component";

import {Port} from "../models/ports/Port";
import {Wire} from "../models/Wire";
/**
 * Helper class to hold different groups of components.
 *
 * The groups are:
 *  Input components  (anything with 0 output ports and >0  input ports)
 *  Output components (anything with 0 input ports  and >0 output ports)
 *  Wires             (wires)
 *  Components        (anything else)
 *
 * Note that .components does NOT contain inputs and outputs
 *  A helper method to get all the components including them
 *  is included as getAllComponents()
 */
export abstract class IOObjectSet {
    protected wires: Wire[];

    public constructor(set: IOObject[]) {
        this.wires = set.filter(o => o instanceof Wire) as Wire[];
    }

    public abstract getComponents(): Component[];

    public getWires(): Wire[] {
        return this.wires.slice(); // Shallow copy
    }

    public toList(): IOObject[] {
        return (<IOObject[]>this.getComponents()).concat(this.wires);
    }
}
// export class AnalogObjectSet extends IOObjectSet<AnalogComponent> {

// }

// /**
//  * Helper function to connect two components at the given
//  *  port indices
//  *
//  * @param  c1 The "output" component
//  * @param  i1 The index relating to the output ports of c1
//  * @param  c2 The "input" component
//  * @param  i2 The index relating to the input ports of c2
//  * @return    The wire connecting the two components
//  */
// export function Connect(c1: Component, i1: number, c2: Component, i2: number): Wire {
//     return CreateWire(c1.getOutputPort(i1), c2.getInputPort(i2));
// }

/**
 * Helper function to retrieve a list of all the Input/Output ports
 *  from the given list of objects/wires
 *
 * @param  objects The list of objects to get ports from
 * @return    All the ports attached to the given list of objects
 */
export function GetAllPorts(objs: Component[]): Port[] {
    return objs.map((o) => o.getPorts()).reduce((acc, ports) => acc = acc.concat(ports), []);
}