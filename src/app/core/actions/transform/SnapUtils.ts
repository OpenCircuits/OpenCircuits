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

export function SnapMidpoint(obj: Component, objs: Component[]): void {
    const DoSnap = (x: number, c: number, s: number) =>
        (Math.abs(x - c) <= s) ? c : x;

    const v = obj.getPos()
    
    for (const obj2 of objs) {
        if (obj2 == obj) {
            continue
        }
        const pos = obj2.getPos();
        const scale = WIRE_SNAP_THRESHOLD/(Math.abs(v.x-pos.x))
        v.x = DoSnap(v.x, pos.x, scale);
        v.y = DoSnap(v.y, pos.y, scale);
    }

    obj.setPos(v);
}
/* WORK IN PROGRESS
function SnapEdges(obj: Component, ignored: Component[]): void {
    const DoSnap = (x: number, c: number) =>
        (Math.abs(x - c) <= WIRE_SNAP_THRESHOLD) ? c : x;

    const v = obj.getPos();
    const s = obj.getSize();

    const objs = obj.getDesigner().getObjects();
    for (const obj2 of objs) {
        if (obj2 == obj || ignored.includes(obj2))
            continue;
        const pos = obj2.getPos();
        const size = obj2.getSize();

        v.x = DoSnap(v.x + s.x/2, pos.x - size.x/2) - s.x/2; // Left -> Right edge
        v.x = DoSnap(v.x - s.x/2, pos.x - size.x/2) + s.x/2; // Left -> Left edge
        v.x = DoSnap(v.x - s.x/2, pos.x + size.x/2) + s.x/2; // Right -> Left edge
        v.x = DoSnap(v.x + s.x/2, pos.x + size.x/2) - s.x/2; // Right -> Right edge

        v.y = DoSnap(v.y + s.y/2, pos.y - size.y/2) - s.y/2; // Top -> Bottom edge
        v.y = DoSnap(v.y - s.y/2, pos.y - size.y/2) + s.y/2; // Top -> Top edge
        v.y = DoSnap(v.y - s.y/2, pos.y + size.y/2) + s.y/2; // Bottom -> Top edge
        v.y = DoSnap(v.y + s.y/2, pos.y + size.y/2) - s.y/2; // Bottom -> Bottom edge
    }*/
