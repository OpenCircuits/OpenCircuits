import {DEFAULT_SIZE,
        IO_PORT_LENGTH} from "../../../utils/Constants";

import {V} from "../../../utils/math/Vector";

import {InputPort} from "../InputPort";

import {Positioner} from "./Positioner";

export class MuxSelectPositioner extends Positioner<InputPort> {

    /**
     * Port positiong for Multiplexer/Demultiplexer select lines
     *
     * @param arr The array of input ports
     */
    public updatePortPositions(ports: Array<InputPort>): void {
        ports.forEach((port, i) => {
            const height = port.getParent().getSize().y;

            // Calculate x position of port
            let l = -DEFAULT_SIZE/2*(i - ports.length/2 + 0.5);
            if (i === 0) l--;
            if (i === ports.length-1) l++;

			// Sets postition
            port.setOriginPos(V(l, 0));
            port.setTargetPos(V(l, IO_PORT_LENGTH+height/2-DEFAULT_SIZE/2));
        });
    }

}
