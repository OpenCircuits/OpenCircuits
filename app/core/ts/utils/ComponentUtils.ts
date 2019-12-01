import {Graph} from "math/Graph";

import {IOObject} from "core/models/IOObject";
import {Component} from "core/models/Component";
import {Node, isNode} from "core/models/Node";
import {Wire} from "core/models/Wire";
import {Port} from "core/models/ports/Port";
import {Vector} from "Vector";
import {CullableObject} from "core/models/CullableObject";
import {BoundingBox} from "math/BoundingBox";
import {serializable, Serialize, Deserialize} from "serialeazy";
import {CircuitDesigner} from "core/models/CircuitDesigner";

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
@serializable("IOObjectSet")
export class IOObjectSet {
    protected components: Set<Component>;
    protected wires: Set<Wire>;

    public constructor(set: IOObject[] = []) {
        this.components = new Set<Component>(set.filter(o => o instanceof Component) as Component[]);
        this.wires      = new Set<Wire>     (set.filter(o => o instanceof Wire)      as Wire[]);
    }

    public getComponents(): Component[] {
        return Array.from(this.components);
    }

    public getWires(): Wire[] {
        return Array.from(this.wires);
    }

    public toList(): IOObject[] {
        return (<IOObject[]>this.getComponents()).concat(this.getWires());
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
    return objs.flatMap((o) => o.getPorts());
}

/**
 * Creates a Separated group from the given list of objects
 *  and also retrieves all IMMEDIATELY connected wires that
 *  connect to other objects in `objects`
 *
 * Note that this method assumes all the components you want in the group are
 *  provided in `objects` INCLUDING WirePorts, this will not trace down the paths
 *  to get all wires ports. Use GatherGroup(objects) to do this.
 *
 * @param  objects The list of objects to separate
 * @return         A SeparatedComponentCollection of the objects
 */
export function CreateGroup(objects: IOObject[]): IOObjectSet {
    const group = new IOObjectSet(objects);

    const objs = group.getComponents();
    const wires = group.getWires()
            // Add all connections from every object
            .concat(objs.flatMap((o) => o.getConnections()))
            // Filter out any connection that isn't connected
            //  to two objects in the objects list
            .filter((w) => objs.includes(w.getP1Component()) &&
                           objs.includes(w.getP2Component()));

    return new IOObjectSet((<IOObject[]>objs).concat(wires));
}


/**
 * Get's all the wires/WirePorts going out from this wire
 *  Note: this path is UN-ORDERED!
 *
 * @param  w The wire to start from
 * @return   The array of wires/WirePorts in this path (incuding w)
 */
export function GetPath(w: Wire): Array<Wire | Node> {
    const path: Array<Wire | Node> = [];

    // Breadth First Search
    const queue = new Array<Wire | Node>(w);
    const visited = new Set<Wire | Node>();

    while(queue.length > 0) {
        const q = queue.shift();

        visited.add(q);
        path.push(q);
        if (q instanceof Wire) {
            const p1 = q.getP1Component();
            const p2 = q.getP2Component();
            if (isNode(p1) && !visited.has(p1))
                queue.push(p1);
            if (isNode(p2) && !visited.has(p2))
                queue.push(p2);
        } else {
            // Push all of the Node's connecting wires, filted by if they've been visited
            queue.push(...q.getConnections().filter((w) => !visited.has(w)));
        }
    }

    return path;
}

/**
 * Gathers all wires + wireports in the path from the inputs/outputs
 *  of the given component.
 *
 * @param  obj  The component
 * @return      An array of connections + WirePorts
 */
export function GetAllPaths(obj: Component): Array<Wire | Node> {
    // Get all distinct connections
    const wires = [...new Set(obj.getConnections())];

    // Get all distinct paths
    return [...new Set(wires.flatMap((w) => GetPath(w)))];
}

/**
 * Creates a Separated group from the given list of objects.
 *  It also retrieves all "paths" going out from each object.
 *
 * @param  objects The list of objects
 * @return         A SeparatedComponentCollection of the objects
 */
export function GatherGroup(objects: IOObject[]): IOObjectSet {
    const group = new IOObjectSet(objects);

    // Gather all connecting paths
    const wires = group.getWires();
    const components = group.getComponents();

    const paths = [...new Set(wires.flatMap((w) => GetPath(w))
            .concat(components.flatMap((c) => GetAllPaths(c))))];

    return new IOObjectSet((components as IOObject[]).concat(wires, paths));
}

/**
 * Helper function to create a directed graph from a given
 *  collection of components
 *
 * The Graph stores Nodes as indices from the
 * groups.getAllComponents() array
 *
 * The edge weights are stored as pairs representing
 * the input index (i1) and the output index (i2) respectively
 *
 * @param  groups The SeparatedComponentCollection of components
 * @return        A graph corresponding to the given circuit
 */
export function CreateGraph(groups: IOObjectSet): Graph<number, number> {
    const graph = new Graph<number, number>();

    const objs = groups.getComponents();
    const wires = groups.getWires();
    const map = new Map<Component, number>();

    // Create nodes and map
    for (let i = 0; i < objs.length; i++) {
        graph.createNode(i);
        map.set(objs[i], i);
    }

    // Create edges
    for (let j = 0; j < wires.length; j++) {
        const wire = wires[j];
        const c1 = map.get(wire.getP1Component());
        const c2 = map.get(wire.getP2Component());
        graph.createEdge(c1, c2, j);
    }

    return graph;
}

/**
 * Copies a group of objects including connections that are
 *  present within the objects
 *
 * @param  objects [description]
 * @return         [description]
 */
export function CopyGroup(objects: IOObject[]): IOObjectSet {
    if (objects.length == 0)
        return new IOObjectSet();

    // Make sure to get all immediate connections
    objects = CreateGroup(objects).toList();

    const designer = objects[0].getDesigner();
    if (!objects.every(o => o.getDesigner() == designer))
        throw new Error("Can't copy group with mismatched circuit designers!");

    const str = Serialize(objects, (o) => {
        // don't serialize the circuit designer
        if (o instanceof CircuitDesigner)
            return false;
        // don't serialize objects outside of the list
        if (o instanceof IOObject && !objects.includes(o))
            return false;
        return true;
    });
    const copies = Deserialize<IOObject[]>(str);

    copies.forEach(c => c.setDesigner(designer));

    return new IOObjectSet(copies);
}

// Find a minimal bounding box enclosing all cullable objects in a given array
// Note that if the array is empty, min and max will both be (0, 0)
export function CircuitBoundingBox(all: CullableObject[]): BoundingBox {
    const min = Vector.min(...all.map(o => o.getMinPos()));
    const max = Vector.max(...all.map(o => o.getMaxPos()));

    return new BoundingBox(min, max);
}
