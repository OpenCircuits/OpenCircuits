import {serializable} from "serialeazy";

import {IO_PORT_LENGTH} from "core/utils/Constants";


import {V} from "Vector";

import {Positioner} from "core/models/ports/positioners/Positioner";

import {AnalogPort} from "analog/models";


@serializable("SidePositioner")
export class SidePositioner extends Positioner<AnalogPort> {
    private readonly side: "left" | "right" | "top" | "bottom";

    public constructor(side: "left" | "right" | "top" | "bottom" = "left") {
        super();
        this.side = side;
    }

    /**
     * Position ports with constant space but put blank space in the middle.
     *
     * @param arr     The array of input ports.
     * @param arr."0" The input port.
     */
    public override updatePortPositions([p1]: AnalogPort[]): void {
        const size = (
            this.side === "left" || this.side === "right"
            ? p1.getParent().getSize().x
            : p1.getParent().getSize().y
        );

        const dir = (
            this.side === "left"
            ? V(-1, 0)
            : this.side === "right"
            ? V(1, 0)
            : this.side === "top"
            ? V(0, 1)
            : V(0, -1)
        );

        p1.setOriginPos(dir.scale(size/2));
        p1.setTargetPos(dir.scale(size/2 + IO_PORT_LENGTH));
    }

}
