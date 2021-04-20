import {MID_SNAP_CONST, WIRE_SNAP_THRESHOLD, EDGE_SNAP_CONST} from "core/utils/Constants";
import {Component} from "core/models";
import { posix } from "node:path";

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
        //calculate scaling constants for x and y direction
        const scale = MID_SNAP_CONST * WIRE_SNAP_THRESHOLD/(Math.abs(v.x-pos.x))
        const scale2 = MID_SNAP_CONST * WIRE_SNAP_THRESHOLD/(Math.abs(v.y-pos.y))
        
        if (scale < MID_SNAP_CONST * WIRE_SNAP_THRESHOLD) {
            v.x = DoSnap(v.x, pos.x, scale);
        }
        if (scale2 < MID_SNAP_CONST * WIRE_SNAP_THRESHOLD) {
            v.y = DoSnap(v.y, pos.y, scale2);
        }
    }

    obj.setPos(v);
}

export function SnapEdges(obj: Component, objs: Component[]): void {
    const DoSnap = (x: number, c: number, s: number) =>
        (Math.abs(x - c) <= s) ? c : x;

    const v = obj.getPos();
    const s = obj.getSize();

    for (const obj2 of objs) {
        if (obj2 == obj)
            continue;
        const pos = obj2.getPos();
        const size = obj2.getSize();

        //Calculate distance between components to scale snapping
        const temp = Math.pow(Math.abs(v.x - pos.x), 2) + Math.pow(Math.abs(v.y - pos.y), 2)
        const scale = EDGE_SNAP_CONST * WIRE_SNAP_THRESHOLD/(Math.sqrt(temp))

        v.x = DoSnap(v.x + s.x/2, pos.x - size.x/2, scale) - s.x/2; // Left -> Right edge
        v.x = DoSnap(v.x - s.x/2, pos.x - size.x/2, scale) + s.x/2; // Left -> Left edge
        v.x = DoSnap(v.x - s.x/2, pos.x + size.x/2, scale) + s.x/2; // Right -> Left edge
        v.x = DoSnap(v.x + s.x/2, pos.x + size.x/2, scale) - s.x/2; // Right -> Right edge

        v.y = DoSnap(v.y + s.y/2, pos.y - size.y/2, scale) - s.y/2; // Top -> Bottom edge
        v.y = DoSnap(v.y - s.y/2, pos.y - size.y/2, scale) + s.y/2; // Top -> Top edge
        v.y = DoSnap(v.y - s.y/2, pos.y + size.y/2, scale) + s.y/2; // Bottom -> Top edge
        v.y = DoSnap(v.y + s.y/2, pos.y + size.y/2, scale) - s.y/2; // Bottom -> Bottom edge
    }
    obj.setPos(v)
}