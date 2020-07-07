import {serializable} from "serialeazy";

import {DEFAULT_SIZE,
        IO_PORT_LENGTH} from "core/utils/Constants";

import {V} from "Vector";

import {Positioner} from "core/models/ports/positioners/Positioner";
import {InputPort} from "../InputPort";

@serializable("MuxSelectPositioner")
export class MuxSelectPositioner extends Positioner<InputPort> {

    /**
     * Port positioning for Multiplexer/Demultiplexer select lines
     *
     * @param arr The array of input ports
     */
    public updatePortPositions(ports: Array<InputPort>): void {
        ports.forEach((port, i) => {
            const height = port.getParent().getSize().y;

            // Calculate x position of port
            const l = this.calcSpacingPos(i, ports.length, DEFAULT_SIZE);

            // Sets position
            port.setOriginPos(V(l, 0));
            port.setTargetPos(V(l, IO_PORT_LENGTH+height/2));
        });
    }
}
