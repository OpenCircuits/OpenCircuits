import {GRID_SIZE, WIRE_SNAP_THRESHOLD} from "core/utils/Constants";

import {V, Vector} from "Vector";

import {AnyObj, AnyPort} from "core/models/types";

import {CircuitController} from "core/controllers/CircuitController";
import {GetPortWorldPos}   from "core/views/portinfo/utils";


/**
 * Utility used for calculating positions of ports and wires when a component
 * gets moved.
 *
 * @param circuit The circuit that `obj` is apart of.
 * @param obj     The component that will be snapped.
 * @param pos
 * @param ports
 * @returns       The snapped position for `obj`.
 */
export function SnapToConnections(circuit: CircuitController<AnyObj>, pos: Vector, ports: AnyPort[]): Vector {
    // if x-c is less than the wire snap threshold,
    // DoSnap is set to c, if greater it's set to x
    const DoSnap = (x: number, c: number) =>
        (Math.abs(x - c) <= WIRE_SNAP_THRESHOLD) ? c : x;

    const oPos = pos;

    // Snaps the wires to the ports they're connected to.
    const v = V(pos);
    for (const port of ports) {
        const pos = GetPortWorldPos(circuit, port).target.sub(oPos);
        const wires = circuit.getWiresFor(port);
        for (const w of wires) {
            // Gets the port that isn't the current port, calculates new position (v).
            const port2 = circuit.getObj((w.p1 === port.id ? w.p2 : w.p1)) as AnyPort;
            const portPos = GetPortWorldPos(circuit, port2).target;
            v.x = DoSnap(v.x + pos.x, portPos.x) - pos.x;
            v.y = DoSnap(v.y + pos.y, portPos.y) - pos.y;
        }
    }
    return v;
}

// Snap the vector to the grid
export function SnapToGrid(p: Vector): Vector {
    return V(Math.floor(p.x/GRID_SIZE + 0.5) * GRID_SIZE,
             Math.floor(p.y/GRID_SIZE + 0.5) * GRID_SIZE);
}
