import {V} from "../../../utils/math/Vector";

import {InputPort} from "../InputPort";
import {Positioner} from "./Positioner";

export class SRLatchPositioner extends Positioner<InputPort> {

    /**
     * Port positiong SR Latch inputs
     *
     * @param arr The array of ports (either in or out ports)
     */
    public updatePortPositions(ports: Array<InputPort>): void {
        super.updatePortPositions(ports);

        const height = ports[0].getParent().getSize().y;

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
