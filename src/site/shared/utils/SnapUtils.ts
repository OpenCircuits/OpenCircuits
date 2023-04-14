import {Port}      from "core/public";
import {V, Vector} from "Vector";


const WIRE_SNAP_THRESHOLD = 0.2;

/**
 * Utility to adjust a given position for a component to be axis-aligned with the given set of ports
 *  when within a certain snap threshold to them.
 *
 * @param pos   The position to snap to the given ports.
 * @param ports The ports to consider snapping to.
 * @returns     The snapped position.
 */
export function SnapToConnections(pos: Vector, ports: Port[]): Vector {
    // if x-c is less than the wire snap threshold,
    // DoSnap is set to c, if greater it's set to x
    const DoSnap = (x: Vector, c: Vector) => V(
        (Math.abs(x.x - c.x) <= WIRE_SNAP_THRESHOLD) ? c.x : x.x,
        (Math.abs(x.y - c.y) <= WIRE_SNAP_THRESHOLD) ? c.y : x.y,
    );

    // Snaps the wires to the ports they're connected to.
    let v = V(pos);
    for (const port of ports) {
        const p = port.targetPos.sub(pos);

        // Calculate new position (v).
        for (const port2 of port.connectedPorts)
            v = DoSnap(v.add(p), port2.targetPos).sub(p);
    }
    return v;
}

// Snap the vector to the grid
export function SnapToGrid(p: Vector): Vector {
    const GRID_SIZE = 1; // Use grid size from circuit view ?
    return V(Math.floor(p.x/GRID_SIZE + 0.5) * GRID_SIZE,
             Math.floor(p.y/GRID_SIZE + 0.5) * GRID_SIZE);
}
