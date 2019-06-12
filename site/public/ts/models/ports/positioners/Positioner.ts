import {V} from "../../../utils/math/Vector";

import {Port} from "../Port";

export class Positioner<T extends Port> {

    /**
     * Default behavior for port positioning to
     *  be evenly spaced along the height of this
     *  component.
     * @param arr The array of ports (either in or out ports)
     */
    public updatePortPositions(ports: Array<T>): void {
        ports.forEach((port, i) => {
            const parent = port.getParent();

            // Calculate y position of port
            let l = -parent.getSize().y/2*(i - ports.length/2 + 0.5);
            if (i === 0) l--;
            if (i === ports.length-1) l++;

            port.setOriginPos(V(port.getOriginPos().x, l));
            port.setTargetPos(V(port.getTargetPos().x, l));
        });
    }

}
