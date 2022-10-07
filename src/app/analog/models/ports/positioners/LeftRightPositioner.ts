import {serializable} from "serialeazy";

import {IO_PORT_LENGTH} from "core/utils/Constants";


import {V} from "Vector";

import {Positioner} from "core/models/ports/positioners/Positioner";

import {AnalogPort} from "analog/models";


@serializable("LeftRightPositioner")
export class LeftRightPositioner extends Positioner<AnalogPort> {

    public constructor() {
        super();
    }

    /**
     * Position ports with constant space but put blank space in the middle.
     *
     * @param arr     The array of input ports.
     * @param arr."0" The first port.
     * @param arr."1" The second port.
     */
    public override updatePortPositions([p1, p2]: AnalogPort[]): void {
        const width = p1.getParent().getSize().x;

        p1.setOriginPos(V(-width/2, 0));
        p1.setTargetPos(V(-(width/2+IO_PORT_LENGTH), 0));

        p2.setOriginPos(V(width/2, 0));
        p2.setTargetPos(V(width/2+IO_PORT_LENGTH, 0));
    }

}
