import {serializable} from "serialeazy";

import {IO_PORT_RADIUS} from "core/utils/Constants";

import {V} from "Vector";

import {Positioner} from "core/models/ports/positioners/Positioner";

import {InputPort} from "../InputPort";


@serializable("SegmentDisplayPositioner")
export class SegmentDisplayPositioner extends Positioner<InputPort> {

    /**
     * Port positioning for segment displays for different inputs.
     *
     * @param ports The array of ports (either in or out ports).
     */
    public override updatePortPositions(ports: InputPort[]): void {
        ports.forEach((port, i) => {
            // Calculate y position of port
            const size = port.getParent().getSize();
            const l = -(2*IO_PORT_RADIUS+1)*(i - ports.length/2 + 0.5);

            // Set y positions
            port.setOriginPos(V(-(size.x - 2)/2, l));
            port.setTargetPos(V(port.getTargetPos().x, l));
        });
    }
}
