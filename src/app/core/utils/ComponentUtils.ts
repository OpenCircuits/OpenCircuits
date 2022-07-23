import {Deserialize, Serialize, serializable} from "serialeazy";

import {GRID_SIZE,
        IO_PORT_LINE_WIDTH} from "./Constants";

import {V, Vector} from "Vector";

import {BoundingBox}  from "math/BoundingBox";
import {Camera}       from "math/Camera";
import {Graph}        from "math/Graph";
import {RectContains} from "math/MathUtils";
import {Transform}    from "math/Transform";

import {isPressable} from "core/utils/Pressable";

import {Component}      from "core/models/Component";
import {CullableObject} from "core/models/CullableObject";
import {IOObject}       from "core/models/IOObject";
import {Node, isNode}   from "core/models/Node";
import {Wire}           from "core/models/Wire";

import {Port} from "core/models/ports/Port";


/**
 * Helper class to hold different groups of components.
 *
 * The groups are:
 *  Input components  (anything with 0 output ports and >0  input ports)
 *  Output components (anything with 0 input ports  and >0 output ports)
 *  Wires             (wires)
 *  Components        (anything else).
 *
 * Note that .getComponents() does NOT contain wires
 *  A helper method to get all the components including them
 *  is included as toList().
 */
@serializable("IOObjectSet")
export class IOObjectSet {
    protected components: Set<Component>;
    protected wires: Set<Wire>;

    public constructor(set: IOObject[] = []) {
        this.components = new Set<Component>(set.filter((o) => o instanceof Component) as Component[]);
        this.wires      = new Set<Wire>     (set.filter((o) => o instanceof Wire)      as Wire[]);
    }

    public getComponents(): Component[] {
        return [...this.components];
    }

    public getWires(): Wire[] {
        return [...this.wires];
    }

    public toList(): IOObject[] {
        return [...this.getComponents(), ...this.getWires()];
    }
}

/**
 * Helper function to retrieve a list of all the Input/Output ports
 *  from the given list of objects/wires.
 *
 * @param objs The list of objects to get ports from.
 * @returns      All the ports attached to the given list of objects.
 */
export function GetAllPorts(objs: Component[]): Port[] {
    return objs.flatMap((o) => o.getPorts());
}

/**
 * Creates a Separated group from the given list of objects
 *  and also retrieves all IMMEDIATELY connected wires that
 *  connect to other objects in `objects`.
 *
 * Note that this method assumes all the components you want in the group are
 *  provided in `objects` INCLUDING WirePorts, this will not trace down the paths
 *  to get all wires ports. Use GatherGroup(objects) to do this.
 *
 * @param objects The list of objects to separate.
 * @returns         A SeparatedComponentCollection of the objects.
 */
export function CreateGroup(objects: IOObject[]): IOObjectSet {
    const group = new IOObjectSet(objects);

    const objs = group.getComponents();
    const wires = [
            ...group.getWires(),
            // Add all connections from every object
            ...objs.flatMap((o) => o.getConnections()),
         // Filter out any connection that isn't connected
         //  to two objects in the objects list
        ].filter((w) => objs.includes(w.getP1Component()) &&
                        objs.includes(w.getP2Component()));

    return new IOObjectSet([...objs, ...wires]);
}


/**
 * Gets all the wires/WirePorts going out from this wire
 *  Note: this path is UN-ORDERED!
 *
 * @param w    The wire to start from.
 * @param full True if you want to return everything in the circuit otherwise returns
 *       only the wires/nodes connected to the wire.
 * @returns      The array of wires/WirePorts in this path (including w).
 */
export function GetPath(w: Wire | Node, full = true): Array<Wire | Node> {
    const path: Array<Wire | Node> = [];

    // Breadth First Search
    const queue = new Array<Wire | Node>(w);
    const visited = new Set<Wire | Node>();

    while (queue.length > 0) {
        const q = queue.shift()!;

        visited.add(q);
        path.push(q);
        if (q instanceof Wire) {
            if (full) {
                const p1 = q.getP1Component();

                if (isNode(p1) && !visited.has(p1))
                    queue.push(p1);

                const p2 = q.getP2Component();
                if (isNode(p2) && !visited.has(p2))
                    queue.push(p2);
            }
            else {
                const p2 = q.getP2Component();
                if (isNode(p2) && !visited.has(p2))
                    queue.push(p2);
            }

        } else {
            // Push all of the Node's connecting wires, filtered by if they've been visited
            queue.push(...q.getConnections().filter((w) => !visited.has(w)));
        }
    }

    return path;
}

/**
 * Gets all the components connected to this component
 *  Note: this path is UN-ORDERED!
 *
 * @param c The component to start from.
 * @returns   The array of components in the same circuit (including c).
 */
export function GetComponentPath(c: Component): Component[] {
    const path: Component[] = [];

    // Breadth First Search
    const queue = new Array<Component>(c);
    const visited = new Set<Component>();

    while (queue.length > 0) {
        const q = queue.shift()!;

        visited.add(q);
        path.push(q);
        for (const w of q.getConnections()) {
            if (!visited.has(w.getP1Component()))
                queue.push(w.getP1Component());
            if (!visited.has(w.getP2Component()))
                queue.push(w.getP2Component());
        }
    }

    return path;
}

/**
 * Gathers all wires + wireports in the path from the inputs/outputs
 *  of the given component.
 *
 * @param obj  The component.
 * @param full True if you want to return everything in the circuit otherwise
 *       returns only the wires/nodes connected to the selected wire.
 * @returns      An array of connections + WirePorts.
 */
export function GetAllPaths(obj: Component, full = true): Array<Wire | Node> {
    // Get all distinct connections
    const wires = [...new Set(obj.getConnections())];

    // Get all distinct paths

    return [...new Set(wires.flatMap((w) => GetPath(w,full)))];

}

/**
 * Creates a Separated group from the given list of objects.
 *  It also retrieves all "paths" going out from each object.
 *
 * @param objects The list of objects.
 * @param full    True if you want to return everything in the circuit otherwise
 *          returns only the wires/nodes connected to the selected wire.
 * @returns         A SeparatedComponentCollection of the objects.
 */
export function GatherGroup(objects: IOObject[], full = true): IOObjectSet {
    const group = new IOObjectSet(objects);

    // Gather all connecting paths
    const wires = group.getWires();
    const components = group.getComponents();

    const paths = [...new Set([
        ...wires.flatMap((w) => GetPath(w, full)),
        ...components.flatMap((c) => GetAllPaths(c, full)),
    ])];

    return new IOObjectSet([...components, ...wires, ...paths]);
}

/**
 * Helper function to create a directed graph from a given
 *  collection of components.
 *
 * The Graph stores Nodes as indices from the
 *  groups.getAllComponents() array.
 *
 * The edge weights are stored as pairs representing
 * the input index (i1) and the output index (i2) respectively.
 *
 * @param groups The SeparatedComponentCollection of components.
 * @returns        A graph corresponding to the given circuit.
 */
export function CreateGraph(groups: IOObjectSet): Graph<number, number> {
    const graph = new Graph<number, number>();

    const objs = groups.getComponents();
    const wires = groups.getWires();
    const map = new Map<Component, number>();

    // Create nodes and map
    for (const [i, obj] of objs.entries()) {
        graph.createNode(i);
        map.set(obj, i);
    }

    // Create edges
    for (const [j, wire] of wires.entries()) {
        const c1 = map.get(wire.getP1Component())!;
        const c2 = map.get(wire.getP2Component())!;
        graph.createEdge(c1, c2, j);
    }

    return graph;
}

export function SerializeForCopy(objects: IOObject[]): string {
    // Make sure to get all immediate connections
    const group = CreateGroup(objects);

    // Remove floating paths in the list
    //  This is to prevent individual (floating) Nodes from be pasted
    //  Do this by getting all nodes marked as "end nodes" in a graph and then if
    //  any of the end nodes are actually Nodes, remove the paths with them since
    //  being end nodes would imply they only have 0/1 connections
    const components = group.getComponents();
    const graph = CreateGraph(group);
    const ends = graph.getEndNodes();
    const badBoys = ends
            .filter((i) => isNode(components[i]))
            .flatMap((i) => GetPath(components[i] as Node)) as IOObject[];

    objects = group.toList().filter((obj) => !badBoys.includes(obj));

    // Serialize with custom functionality
    //  The idea is to serialize just the objects and connections in `objects`
    //  So we filter out any connections that are not part of the list so that
    //  nothing else connected to those connections (that aren't in the list)
    //  get serialized.
    //  Also ignore serializing the CircuitDesigner from any IOObjects so that
    //  the entire circuit doesn't get serialized
    return Serialize(objects, [
        {
            type:           Port,
            customBehavior: {
                customSerialization: (serializer, port: Port) => {
                    const parent = port.getParent();
                    const data = serializer.defaultSerialization(port);

                    // check if we're serializing an object that isn't an IC
                    //  (since it's in our original list and any objects outside
                    //   that list should either not be serialized [which we're
                    //   about to prevent] or be in an IC)
                    let connections = port.getWires();
                    if (objects.includes(parent)) {
                        // prevent connections not in our list from being serialized
                        connections = connections.filter((wire) => (objects.includes(wire)));
                    }

                    data["connections"] = serializer.serializeProperty(connections);

                    return data;
                },
                customKeyFilter: (_: Port, key: string) =>
                     (key !== "connections") // don't serialize connections (handle them above)
                ,
            },
        },
        {
            type:           IOObject,
            customBehavior: {
                customKeyFilter: (_: IOObject, key: string) =>
                     (key !== "designer") // don't serialize designer
                ,
            },
        },
    ]);
}

/**
 * Copies a group of objects including connections that are
 *  present within the objects.
 *
 * @param objects The object to copy.
 * @returns         The copied set of objects.
 */
export function CopyGroup(objects: IOObject[]): IOObjectSet {
    if (objects.length === 0)
        return new IOObjectSet();

    const copies = Deserialize<IOObject[]>(SerializeForCopy(objects));

    // CAREFUL THIS MIGHT BE NECESSARY SOMEWHERE
    // // It's assumed that every object has the same designer
    // copies.forEach(c => c.setDesigner(objects[0].getDesigner()));

    // Unpresses button of newly placed copy
    //  See: https://github.com/OpenCircuits/OpenCircuits/issues/545
    for (const object of copies) {
        if (isPressable(object))
            object.release();
    }

    return new IOObjectSet(copies);
}

// Find a minimal bounding box enclosing all cullable objects in a given array
// Note that if the array is empty, min and max will both be (0, 0)
export function CircuitBoundingBox(all: CullableObject[]): BoundingBox {
    const min = Vector.Min(...all.map((o) => o.getMinPos()));
    const max = Vector.Max(...all.map((o) => o.getMaxPos()));

    return new BoundingBox(min, max);
}

/**
 * Calculates camera position and zoom to fit objs to
 * the camera's view with adjustable padding. If objs
 * is empty, uses a default size.
 *
 * @param camera  The camera to fit within.
 * @param objs    The objects to fit within the camera.
 * @param padding The amount of padding for the fit.
 * @returns         Tuple of desired camera position and zoom.
 */
export function GetCameraFit(camera: Camera, objs: CullableObject[], padding: number): [Vector, number] {
    // If no objects return to default zoom
    if (objs.length === 0)
        return [V(), 1];

    const { left, right, bottom, top } = camera.getMargin();

    const marginSize = V(left - right, top - bottom);

    const bbox = CircuitBoundingBox(objs);

    const screenSize = camera.getSize().sub(V(left, bottom)); // Bottom right corner of screen
    const worldSize = camera.getWorldPos(screenSize).sub(camera.getWorldPos(V(0,0))); // World size of camera view

    // Determine which bbox dimension will limit zoom level
    const ratio = V(bbox.getWidth() / worldSize.x, bbox.getHeight() / worldSize.y);
    const finalZoom = camera.getZoom()*Math.max(ratio.x, ratio.y)*padding;

    // Only subtract off 0.5 of the margin offset since currently it's centered on the margin'd
    //  screen size so only half of the margin on the top/left need to be contributed
    const finalPos = bbox.getCenter().sub(marginSize.scale(0.5 * finalZoom));

    return [finalPos, finalZoom];
}

// Creates a rectangle for the collision box for a port on the IC
//  and determines if the given 'mousePos' is within it
export function PortContains(port: Port, mousePos: Vector): boolean {
    const origin = port.getOriginPos();
    const target = port.getTargetPos();

    // Get properties of collision box
    const pos   = target.add(origin).scale(0.5);
    const size  = V(target.sub(origin).len(), IO_PORT_LINE_WIDTH*2);
    const angle = target.sub(origin).angle();

    const rect  = new Transform(pos, size, angle);
    rect.setParent(port.getParent().getTransform());

    return RectContains(rect, mousePos);
}

// Snap the vector to the grid
export function Snap(p: Vector): Vector {
    return V(Math.floor(p.x/GRID_SIZE + 0.5) * GRID_SIZE,
             Math.floor(p.y/GRID_SIZE + 0.5) * GRID_SIZE);
}
