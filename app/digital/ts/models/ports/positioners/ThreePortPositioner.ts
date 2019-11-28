import {V} from "Vector";

import {InputPort} from "../InputPort";
import {Positioner} from "core/models/ports/positioners/Positioner";
import {serializable} from "core/utils/Serializer";

@serializable("ThreePortPositioner")
export class ThreePortPositioner extends Positioner<InputPort> {

    /**
     * Port positiong SR Latch/JK + SR Flipflop inputs
     *  It nudges the endpoints closer together slightly
     *
     * @param arr The array of ports (either in or out ports)
     */
    public updatePortPositions(ports: Array<InputPort>): void {
        super.updatePortPositions(ports);

        const height = ports[0].getParent().getSize().y;

        // @TODO fix this because it looks awfully like the default one but with a * 3/4,
        //         so maybe make it a parameter or something
        {
            const port = ports[0];
            const l = (-height/2*(0 - ports.length/2 + 0.5) - 1) * 3/4;
            port.setOriginPos(V(port.getOriginPos().x, l));
            port.setTargetPos(V(port.getTargetPos().x, l));
        }
        {
            const port = ports[2];
            const l = (-height/2*(2 - ports.length/2 + 0.5) + 1) * 3/4;
            port.setOriginPos(V(port.getOriginPos().x, l));
            port.setTargetPos(V(port.getTargetPos().x, l));
        }
    }

}
