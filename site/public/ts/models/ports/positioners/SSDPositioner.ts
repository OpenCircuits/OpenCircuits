import {IO_PORT_RADIUS} from "../../../utils/Constants";

import {V} from "../../../utils/math/Vector";

import {InputPort} from "../InputPort";

import {Positioner} from "./Positioner";

export class SSDPositioner extends Positioner<InputPort> {

    /**
     * Port positiong for Seven Display Segment
     *
     * @param arr The array of input ports
     */
    public updatePortPositions(ports: Array<InputPort>): void {
        ports.forEach((port, i) => {
            // Calculate y position of port
            let l = -(2*IO_PORT_RADIUS+1)*(i - ports.length/2 + 0.5);
            if (i === 0) l--;
            if (i === ports.length-1) l++;

            // Set y positions
            port.setOriginPos(V(port.getOriginPos().x, l));
            port.setTargetPos(V(port.getTargetPos().x, l));
        });
    }

}
