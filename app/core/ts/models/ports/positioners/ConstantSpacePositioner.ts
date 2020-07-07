import {serializable} from "serialeazy";

import {Port} from "core/models/ports/Port";
import {Positioner, Dir} from "core/models/ports/positioners/Positioner";

@serializable("ConstantSpacePositioner")
export class ConstantSpacePositioner<T extends Port> extends Positioner<T> {
    private spacing: number;

    public constructor(dir?: Dir, spacing?: number, shortenEdges: boolean = true) {
        super(dir, undefined, undefined, shortenEdges);
        this.spacing = spacing;
    }

    /**
     * Port positioning for constant spacing that doesn't
     *  depend on the parent's size
     *
     * @param arr The array of input ports
     */
    public updatePortPositions(ports: Array<T>): void {
        ports.forEach((port, i) => {
            const width = port.getParent().getSize().x;
            const height = port.getParent().getSize().y;

            const sY = this.calcSpacingPos(i, ports.length, this.spacing);
            const sX = this.calcSpacingPos(i, ports.length, this.spacing);

            const p0 = this.calcOriginPos(sX, sY, width, height);
            const p1 = this.calcTargetPos(sX, sY, width, height);

            port.setOriginPos(p0);
            port.setTargetPos(p1);
        });
    }

}
