import {Component} from "core/public";
import {V, Vector} from "Vector";


const WIRE_SNAP_THRESHOLD = 0.2;

/**
 * Utility used for calculating positions of ports and wires when a component
 * gets moved.
 *
 * @param oPos The origin position to snap.
 * @param comp The component to consider snapping the connections for.
 * @returns    The snapped position for `obj`.
 */
export function SnapToConnections(oPos: Vector, comp: Component): Vector {
    // if x-c is less than the wire snap threshold,
    // DoSnap is set to c, if greater it's set to x
    const DoSnap = (x: Vector, c: Vector) => V(
        (Math.abs(x.x - c.x) <= WIRE_SNAP_THRESHOLD) ? c.x : x.x,
        (Math.abs(x.y - c.y) <= WIRE_SNAP_THRESHOLD) ? c.y : x.y,
    );

    // Snaps the wires to the ports they're connected to.
    let v = V(oPos);
    for (const port of comp.allPorts) {
        const pos = port.targetPos.sub(oPos);

        // Calculate new position (v).
        for (const port2 of port.connectedPorts)
            v = DoSnap(v.add(pos), port2.targetPos).sub(pos);
    }
    return v;
}

// Snap the vector to the grid
export function SnapToGrid(p: Vector): Vector {
    const GRID_SIZE = 1; // Use grid size from circuit view ?
    return V(Math.floor(p.x/GRID_SIZE + 0.5) * GRID_SIZE,
             Math.floor(p.y/GRID_SIZE + 0.5) * GRID_SIZE);
}
