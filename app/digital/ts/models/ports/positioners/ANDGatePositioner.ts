import {V} from "../../../utils/math/Vector";

import {InputPort} from "../InputPort";

import {Positioner} from "./Positioner";

export class ANDGatePositioner extends Positioner<InputPort> {

    /**
     * Port positiong for AND gates along the
     *
     * @param arr The array of ports (either in or out ports)
     */
    public updatePortPositions(ports: Array<InputPort>): void {
        super.updatePortPositions(ports);

        ports.forEach((port) => {
            const size = port.getParent().getSize();
            port.setOriginPos(V(-(size.x - 2)/2, port.getOriginPos().y));
        });
    }

}
