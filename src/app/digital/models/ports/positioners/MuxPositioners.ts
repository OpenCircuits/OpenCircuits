import {serializable} from "serialeazy";

import {DEFAULT_SIZE, IO_PORT_LENGTH, MULTIPLEXER_HEIGHT_OFFSET} from "core/utils/Constants";

import {V} from "Vector";

import {Positioner} from "core/models/ports/positioners/Positioner";

import {InputPort} from "../InputPort";
import {OutputPort} from "../OutputPort";


@serializable("MuxSelectPositioner")
export class MuxSelectPositioner extends Positioner<InputPort> {
    // Multiplier for slope, since Multiplexer and Demultiplexer angle on the
    // lower edge are different, so the offsets are opposite of each other
    private slopeMultiplier: number;

    public constructor(isMultiplexer: boolean = true) {
        super();
        this.slopeMultiplier = isMultiplexer ? -1 : 1;
    }

    /**
     * Port positioning for Multiplexer/Demultiplexer select lines
     *
     * @param arr The array of input ports
     */
    public updatePortPositions(ports: Array<InputPort>): void {
        // Calculations for parameters to use in determining origin positions
        const size = ports[0].getParent().getSize();
        const width = size.x;
        const height = size.y;
        const slope = this.slopeMultiplier * MULTIPLEXER_HEIGHT_OFFSET / width;
        const midPortOriginOffset = height/2 - MULTIPLEXER_HEIGHT_OFFSET/2;

        ports.forEach((port, i) => {
            const x = this.calcSpacingPos(i, ports.length, DEFAULT_SIZE);
            const y = midPortOriginOffset + slope * x;
            port.setOriginPos(V(x, y));
            port.setTargetPos(V(x, IO_PORT_LENGTH + height/2));
        });
    }
}


@serializable("MultiplexerInputPositioner")
export class MultiplexerInputPositioner extends Positioner<InputPort> {
    public updatePortPositions(ports: InputPort[]): void {
        const x = -ports[0].getParent().getSize().x / 2;
        ports.forEach((port, i) => {
            const y = this.calcSpacingPos(i, ports.length, DEFAULT_SIZE) - DEFAULT_SIZE/4;
            port.setOriginPos(V(x, y));
            port.setTargetPos(V(x - IO_PORT_LENGTH, y));
        });
    }
}


@serializable("DemultiplexerOutputPositioner")
export class DemultiplexerOutputPositioner extends Positioner<OutputPort> {
    public updatePortPositions(ports: OutputPort[]): void {
        const x = ports[0].getParent().getSize().x / 2;
        ports.forEach((port, i) => {
            const y = this.calcSpacingPos(i, ports.length, DEFAULT_SIZE) - DEFAULT_SIZE/4;
            port.setOriginPos(V(x, y));
            port.setTargetPos(V(x + IO_PORT_LENGTH, y));
        });
    }
}
