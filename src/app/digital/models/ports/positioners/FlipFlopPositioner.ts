import {serializable} from "serialeazy";

import {IO_PORT_LENGTH} from "core/utils/Constants";

import {V} from "Vector";

import {Positioner} from "core/models/ports/positioners/Positioner";

import {FlipFlop} from "digital/models/ioobjects/flipflops/FlipFlop";

import {InputPort} from "../InputPort";


@serializable("FlipFlopPositioner")
export class FlipFlopPositioner extends Positioner<InputPort> {

    public constructor(numInputs?: number) {
        super("left", (numInputs === 3 ? 3/4 : 1));
    }

    /**
     * Port positioning for D Flip Flop.
     *  It sets the Set and Reset on top and bottom.
     *
     * @param ports The array of input ports.
     */
    public override updatePortPositions(ports: InputPort[]): void {
        super.updatePortPositions(ports.slice(2)); // Position ports after PRE/CLR (index 2)

        const height = ports[0].getParent().getSize().y;

        {
            const PRE = ports[FlipFlop.PRE_PORT];
            PRE.setOriginPos(V(0, height/2));
            PRE.setTargetPos(V(0, height/2 + IO_PORT_LENGTH));
        }
        {
            const CLR = ports[FlipFlop.CLR_PORT];
            CLR.setOriginPos(V(0, -height/2));
            CLR.setTargetPos(V(0, -height/2 - IO_PORT_LENGTH));
        }
    }

}
