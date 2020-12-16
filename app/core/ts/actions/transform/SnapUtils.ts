import {WIRE_SNAP_THRESHOLD} from "core/utils/Constants";
import {Component} from "core/models";

export function SnapPos(obj: Component): void {
    const DoSnap = (x: number, c: number) =>
        (Math.abs(x - c) <= WIRE_SNAP_THRESHOLD) ? c : x;

    const v = obj.getPos();

    // Snap to connections
    for (const port of obj.getPorts()) {
        const pos = port.getWorldTargetPos().sub(obj.getPos());
        const wires = port.getWires();
        for (const w of wires) {
            // Get the port that isn't the current port
            const port2 = (w.getP1() == port ? w.getP2() : w.getP1());
            v.x = DoSnap(v.x + pos.x, port2.getWorldTargetPos().x) - pos.x;
            v.y = DoSnap(v.y + pos.y, port2.getWorldTargetPos().y) - pos.y;
        }
    }
    obj.setPos(v);
}
