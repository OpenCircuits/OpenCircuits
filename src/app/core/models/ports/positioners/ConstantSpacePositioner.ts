import {serializable} from "serialeazy";

import {Port} from "core/models/ports/Port";

import type {Dir}   from "core/models/ports/positioners/Positioner";
import {Positioner} from "core/models/ports/positioners/Positioner";


@serializable("ConstantSpacePositioner")
export class ConstantSpacePositioner<T extends Port> extends Positioner<T> {
    public spacing: number;

    public constructor(dir?: Dir, spacing?: number, shortenEdges = true) {
        super(dir, undefined, undefined, shortenEdges);
        this.spacing = spacing!;
    }

    /**
     * Port positioning for constant spacing that doesn't
     *  depend on the parent's size.
     *
     * @param ports The array of input ports.
     */
    public override updatePortPositions(ports: Array<T | undefined>): void {
        ports.forEach((port, i) => {
            if (!port) // Ignore undefined ports for 'blank spaces' in the positioning
                return;

            const width = port.getParent().getSize().x;
            const height = port.getParent().getSize().y;

            // Flip around y-axis since numbering from top -> down is standard for ports
            const sY = -this.calcSpacingPos(i, ports.length, this.spacing);
            const sX =  this.calcSpacingPos(i, ports.length, this.spacing);

            const p0 = this.calcOriginPos(sX, sY, width, height);
            const p1 = this.calcTargetPos(sX, sY, width, height);

            port.setOriginPos(p0);
            port.setTargetPos(p1);
        });
    }

}
