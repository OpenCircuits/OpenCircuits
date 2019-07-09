import {WIRE_SNAP_THRESHOLD} from "../../Constants";

import {Vector} from "../../math/Vector";

import {Wire} from "../../../models/ioobjects/Wire";
import {WirePort} from "../../../models/ioobjects/other/WirePort";

export function Snap(wire: Wire, x: number, c: number): number {
    if (Math.abs(x - c) <= WIRE_SNAP_THRESHOLD) {
        wire.setIsStraight(true);
        return c;
    }
    return x;
}

export function MoveAndSnap(port: WirePort, dPos: Vector): void {
    // Snap wire port to the grid lines of its neighbor ports (if it is close enough)
    const portPos = port.getPos();
    const newPos = portPos.add(dPos);

    // getInputs() and getOutputs() have 1 and only 1 element each because WirePorts are specialized
    const iw = port.getInputs()[0];
    const ow = port.getOutputs()[0];
    const ip = iw.getInput().getWorldTargetPos();
    const op = ow.getOutput().getWorldTargetPos();

    iw.setIsStraight(false);
    ow.setIsStraight(false);

    newPos.x = this.snap(iw, newPos.x, ip.x);
    newPos.y = this.snap(iw, newPos.y, ip.y);
    newPos.x = this.snap(ow, newPos.x, op.x);
    newPos.y = this.snap(ow, newPos.y, op.y);

    // Only one position to set (the wire port)
    port.setPos(newPos);
}
