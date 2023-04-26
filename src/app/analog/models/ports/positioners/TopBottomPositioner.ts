import {serializable} from "serialeazy";

import {IO_PORT_LENGTH} from "core/utils/Constants";


import {V} from "Vector";

import {Positioner} from "core/models/ports/positioners/Positioner";

import {AnalogPort} from "analog/models";


@serializable("TopBottomPositioner")
export class TopBottomPositioner extends Positioner<AnalogPort> {

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
        const height = p1.getParent().getSize().y;

        p1.setOriginPos(V(0,  height/2));
        p1.setTargetPos(V(0,  (height/2+IO_PORT_LENGTH)));

        p2.setOriginPos(V(0, -height/2));
        p2.setTargetPos(V(0, -(height/2+IO_PORT_LENGTH)));
    }

}
