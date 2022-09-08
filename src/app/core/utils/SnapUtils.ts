import {WIRE_SNAP_THRESHOLD} from "core/utils/Constants";

import {Component} from "core/models";


/**
 * Utility used for calculating positions of ports and wires when a component
 * gets moved.
 *
 * @param obj The component that will be snapped.
 */
export function SnapPos(obj: Component): void {
    // if x-c is less than the wire snap threshold,
    // DoSnap is set to c, if greater it's set to x
    const DoSnap = (x: number, c: number) =>
        (Math.abs(x - c) <= WIRE_SNAP_THRESHOLD) ? c : x;

    const v = obj.getPos();

    // Snaps the wires to the ports they're connected to.
    for (const port of obj.getPorts()) {
        const pos = port.getWorldTargetPos().sub(obj.getPos());
        const wires = port.getWires();
        for (const w of wires) {
            // Gets the port that isn't the current port, calculates new position (v).
            const port2 = (w.getP1() === port ? w.getP2() : w.getP1());
            v.x = DoSnap(v.x + pos.x, port2.getWorldTargetPos().x) - pos.x;
            v.y = DoSnap(v.y + pos.y, port2.getWorldTargetPos().y) - pos.y;
        }
    }
    obj.setPos(v);
}
